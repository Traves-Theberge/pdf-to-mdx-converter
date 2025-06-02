import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const extractLayoutInfo = async (page) => {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });
  const operatorList = await page.getOperatorList();
  
  return textContent.items.map(item => {
    const fontSizeScale = Math.abs(item.transform[0]) || Math.abs(item.transform[3]);
    return {
      text: item.str,
      x: item.transform[4],
      y: viewport.height - item.transform[5], // Flip Y coordinate
      width: item.width,
      height: item.height,
      fontSize: fontSizeScale,
      fontName: item.fontName,
      fontWeight: item.fontWeight || 'normal',
      isItalic: item.fontName?.toLowerCase().includes('italic'),
      isBold: item.fontName?.toLowerCase().includes('bold') || fontSizeScale > 16,
      transform: item.transform,
      spaceWidth: item.spaceWidth,
    };
  });
};

const isListItem = (text) => {
  const listMarkers = /^[•\-\*]\s|^\d+\.\s|^[a-z]\)\s|^[A-Z]\)\s/;
  return listMarkers.test(text.trim());
};

const classifyElements = (layout) => {
  // Sort elements by vertical position (top to bottom) and then by horizontal position
  layout.sort((a, b) => {
    const yDiff = Math.abs(a.y - b.y);
    if (yDiff < 12) { // Elements within 12 units are considered on the same line
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  // Group elements into lines
  const lines = [];
  let currentLine = [];
  let prevY = null;

  layout.forEach(item => {
    if (prevY === null || Math.abs(item.y - prevY) < 12) {
      currentLine.push(item);
    } else {
      if (currentLine.length > 0) {
        lines.push([...currentLine]);
      }
      currentLine = [item];
    }
    prevY = item.y;
  });

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Classify each line
  return lines.map(line => {
    const text = line.map(item => item.text).join(' ').trim();
    const maxFontSize = Math.max(...line.map(item => item.fontSize));
    const firstItem = line[0];
    const indentLevel = Math.floor(firstItem.x / 20);

    // Determine element type
    let type = 'paragraph';
    if (maxFontSize >= 24) {
      type = 'h1';
    } else if (maxFontSize >= 20) {
      type = 'h2';
    } else if (maxFontSize >= 16) {
      type = 'h3';
    } else if (isListItem(text)) {
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
    };
  });
};

const formatContent = (elements) => {
  let mdx = '';
  let inList = false;
  let prevIndentLevel = 0;

  elements.forEach((element, index) => {
    const prevElement = elements[index - 1];
    const nextElement = elements[index + 1];
    const indent = '  '.repeat(element.indentLevel);

    // Add spacing between different sections
    if (prevElement && 
        (prevElement.type !== element.type || 
         Math.abs(prevElement.y - element.y) > 20)) {
      mdx += '\n';
    }

    // Format the content based on type
    let content = element.content;
    if (element.isBold) content = `**${content}**`;
    if (element.isItalic) content = `*${content}*`;

    switch (element.type) {
      case 'h1':
        mdx += `${indent}# ${content}\n\n`;
        break;
      case 'h2':
        mdx += `${indent}## ${content}\n\n`;
        break;
      case 'h3':
        mdx += `${indent}### ${content}\n\n`;
        break;
      case 'listItem':
        if (!inList || element.indentLevel !== prevIndentLevel) {
          mdx += '\n';
        }
        mdx += `${indent}- ${content}\n`;
        inList = true;
        prevIndentLevel = element.indentLevel;
        if (!nextElement || nextElement.type !== 'listItem') {
          mdx += '\n';
          inList = false;
        }
        break;
      default:
        if (content.trim()) {
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
    let mdxContent = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const layout = await extractLayoutInfo(page);
        const elements = classifyElements(layout);
        mdxContent += formatContent(elements) + '\n\n';
        setProgress((i / pdf.numPages) * 100);
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        continue; // Continue with next page if one fails
      }
    }

    // Clean up the output
    return mdxContent
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .replace(/\*\*\s*\*\*/g, '') // Remove empty bold tags
      .replace(/\*\s*\*/g, '') // Remove empty italic tags
      .trim();
  } catch (error) {
    console.error('Error converting PDF to MDX:', error);
    throw new Error('Failed to convert PDF to MDX');
  }
};