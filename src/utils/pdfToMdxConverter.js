import * as pdfjsLib from 'pdfjs-dist/build/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const DEBUG = true;

const log = (message, data = null) => {
  if (DEBUG) {
    console.log(`[PDF-MDX] ${message}`, data || '');
  }
};

const extractLayoutInfo = async (page, pageNumber) => {
  log(`Extracting layout from page ${pageNumber}`);
  try {
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    
    log(`Found ${textContent.items.length} text items on page ${pageNumber}`);
    
    const items = textContent.items.map(item => {
      const fontSizeScale = Math.abs(item.transform[0]) || Math.abs(item.transform[3]);
      const element = {
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
      
      log(`Processed text element:`, {
        text: element.text.substring(0, 30),
        fontSize: element.fontSize,
        position: { x: element.x, y: element.y },
        page: pageNumber
      });
      
      return element;
    });

    log(`Successfully processed ${items.length} elements on page ${pageNumber}`);
    return items;
  } catch (error) {
    console.error(`Error extracting layout from page ${pageNumber}:`, error);
    log(`Failed to extract layout from page ${pageNumber}`, error);
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
  log('Starting element classification', { totalElements: layout.length });
  
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
    if (Math.abs(a.y - b.y) < LINE_HEIGHT_THRESHOLD) {
      return a.x - b.x;
    }
    return b.y - a.y; // Reverse Y order to handle top-to-bottom
  });

  log('Sorted layout elements');

  for (let i = 0; i < layout.length; i++) {
    const item = layout[i];
    const nextItem = layout[i + 1];

    // Start a new line if:
    // 1. First item
    // 2. New page
    // 3. Significant Y difference
    // 4. Last item
    if (
      prevPageNumber === null || // First item
      item.pageNumber !== prevPageNumber || // New page
      (prevY !== null && Math.abs(item.y - prevY) >= LINE_HEIGHT_THRESHOLD) || // Y difference
      i === layout.length - 1 // Last item
    ) {
      if (currentLine.length > 0) {
        lines.push([...currentLine]);
        log('Created new line:', {
          pageNumber: prevPageNumber,
          text: currentLine.map(el => el.text).join(' ').substring(0, 50)
        });
      }
      currentLine = [item];
      
      // If this is the last item, push it as a line
      if (i === layout.length - 1) {
        lines.push([item]);
      }
    } else {
      currentLine.push(item);
    }

    prevY = item.y;
    prevPageNumber = item.pageNumber;
  }

  log(`Grouped elements into ${lines.length} lines`);

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

    const element = {
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

    log('Classified element:', {
      type: element.type,
      content: element.content.substring(0, 50),
      pageNumber: element.pageNumber,
      fontSize: element.fontSize
    });

    return element;
  });
};

const formatContent = (elements) => {
  log('Starting content formatting', { totalElements: elements.length });
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
        log(`Added page break between pages ${currentPage} and ${element.pageNumber}`);
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

  log('Completed content formatting');
  return mdx.trim();
};

export const convertPdfToMdx = async (pdfFile, setProgress) => {
  log('Starting PDF to MDX conversion');
  try {
    const loadingTask = pdfjsLib.getDocument({
      url: pdfFile,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });
    
    const pdf = await loadingTask.promise;
    log(`PDF loaded successfully. Total pages: ${pdf.numPages}`);
    
    let allElements = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        log(`Processing page ${i} of ${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const layout = await extractLayoutInfo(page, i);
        allElements = allElements.concat(layout);
        setProgress((i / pdf.numPages) * 100);
        log(`Completed processing page ${i}`);
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        log(`Failed to process page ${i}`, pageError);
        continue;
      }
    }

    log(`Total elements extracted: ${allElements.length}`);
    const classifiedElements = classifyElements(allElements);
    log(`Elements classified: ${classifiedElements.length}`);
    const mdxContent = formatContent(classifiedElements);

    const cleanedContent = mdxContent
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\*\*\s*\*\*/g, '')
      .replace(/\*\s*\*/g, '')
      .trim();

    log('Conversion completed successfully');
    return cleanedContent;
  } catch (error) {
    console.error('Error converting PDF to MDX:', error);
    log('Conversion failed', error);
    throw new Error('Failed to convert PDF to MDX');
  }
};