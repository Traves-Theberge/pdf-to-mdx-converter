import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const extractLayoutInfo = async (page, pageNumber) => {
  try {
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    
    return textContent.items.map(item => {
      const fontSizeScale = Math.abs(item.transform[0]) || Math.abs(item.transform[3]);
      return {
        text: item.str,
        x: item.transform[4],
        y: viewport.height - item.transform[5],
        width: item.width || 0,
        height: item.height || 0,
        fontSize: fontSizeScale,
        fontName: item.fontName || '',
        fontWeight: item.fontWeight || 'normal',
        isItalic: item.fontName?.toLowerCase().includes('italic'),
        isBold: item.fontName?.toLowerCase().includes('bold') || (item.fontWeight && item.fontWeight >= 700),
        pageNumber,
        transform: item.transform,
      };
    });
  } catch (error) {
    console.error(`Error extracting layout from page ${pageNumber}:`, error);
    return [];
  }
};

const isListItem = (text, x) => {
  const bulletListMarkers = /^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/;
  const numberedListMarkers = /^\d+[.)]\s*/;
  const alphaListMarkers = /^[a-zA-Z][.)]\s*/;
  const romanNumeralMarkers = /^[ivxIVX]+[.)]\s*/;
  
  const isIndented = x > 20;
  const hasListMarker = bulletListMarkers.test(text) || 
                       numberedListMarkers.test(text) || 
                       alphaListMarkers.test(text) ||
                       romanNumeralMarkers.test(text);
  
  return hasListMarker || (isIndented && text.trim().length > 0);
};

const classifyElements = (layout) => {
  const lines = [];
  let currentLine = [];
  let prevY = null;
  let prevPageNumber = null;
  const LINE_HEIGHT_THRESHOLD = 5;

  // Sort by page number first, then by vertical position, then horizontal
  layout.sort((a, b) => {
    if (a.pageNumber !== b.pageNumber) {
      return a.pageNumber - b.pageNumber;
    }
    const yDiff = Math.abs(a.y - b.y);
    return yDiff < LINE_HEIGHT_THRESHOLD ? a.x - b.x : a.y - b.y;
  });

  layout.forEach(item => {
    if (prevPageNumber !== item.pageNumber) {
      if (currentLine.length > 0) {
        lines.push([...currentLine]);
      }
      currentLine = [item];
      prevY = item.y;
      prevPageNumber = item.pageNumber;
    } else if (prevY === null || Math.abs(item.y - prevY) < LINE_HEIGHT_THRESHOLD) {
      currentLine.push(item);
    } else {
      lines.push([...currentLine]);
      currentLine = [item];
      prevY = item.y;
    }
  });

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines.map(line => {
    const text = line.map(item => item.text).join(' ').trim();
    const maxFontSize = Math.max(...line.map(item => item.fontSize));
    const firstItem = line[0];
    const indentLevel = Math.floor(firstItem.x / 20);

    let type = 'paragraph';
    if (maxFontSize >= 24 || (maxFontSize >= 20 && line.every(item => item.isBold))) {
      type = 'h1';
    } else if (maxFontSize >= 20 || (maxFontSize >= 16 && line.every(item => item.isBold))) {
      type = 'h2';
    } else if (maxFontSize >= 16 || (maxFontSize >= 14 && line.every(item => item.isBold))) {
      type = 'h3';
    } else if (isListItem(text, firstItem.x)) {
      type = 'listItem';
    }

    return {
      type,
      content: text,
      fontSize: maxFontSize,
      x: firstItem.x,
      y: firstItem.y,
      indentLevel,
      isBold: line.some(item => item.isBold),
      isItalic: line.some(item => item.isItalic),
      pageNumber: firstItem.pageNumber
    };
  });
};

const formatContent = (elements) => {
  let mdx = '';
  let currentPage = null;
  let inList = false;
  let listIndentLevel = 0;

  elements.forEach((element, index) => {
    const nextElement = elements[index + 1];
    const indent = '  '.repeat(element.indentLevel);

    // Add page breaks between pages
    if (element.pageNumber !== currentPage) {
      if (currentPage !== null) {
        mdx += '\n\n---\n\n';
        inList = false;
      }
      currentPage = element.pageNumber;
    }

    let content = element.content;
    if (element.isBold && element.isItalic) {
      content = `***${content}***`;
    } else if (element.isBold) {
      content = `**${content}**`;
    } else if (element.isItalic) {
      content = `*${content}*`;
    }

    switch (element.type) {
      case 'h1':
        mdx += `${indent}# ${content}\n\n`;
        inList = false;
        break;
      case 'h2':
        mdx += `${indent}## ${content}\n\n`;
        inList = false;
        break;
      case 'h3':
        mdx += `${indent}### ${content}\n\n`;
        inList = false;
        break;
      case 'listItem':
        if (!inList || element.indentLevel !== listIndentLevel) {
          mdx += '\n';
        }
        mdx += `${indent}- ${content}\n`;
        inList = true;
        listIndentLevel = element.indentLevel;
        if (!nextElement || 
            nextElement.type !== 'listItem' || 
            nextElement.pageNumber !== element.pageNumber) {
          mdx += '\n';
          inList = false;
        }
        break;
      default:
        if (content.trim()) {
          if (inList) {
            mdx += '\n';
            inList = false;
          }
          mdx += `${indent}${content}\n\n`;
        }
    }
  });

  return mdx.trim();
};

export const convertPdfToMdx = async (pdfFile, setProgress) => {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfFile);
    const pdf = await loadingTask.promise;
    let allElements = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const layout = await extractLayoutInfo(page, i);
        allElements = allElements.concat(layout);
        setProgress((i / pdf.numPages) * 100);
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        continue;
      }
    }

    const classifiedElements = classifyElements(allElements);
    const mdxContent = formatContent(classifiedElements);

    return mdxContent
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\*\*\s*\*\*/g, '')
      .replace(/\*\s*\*/g, '')
      .trim();
  } catch (error) {
    console.error('Error converting PDF to MDX:', error);
    throw new Error('Failed to convert PDF to MDX');
  }
};