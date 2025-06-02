import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const DEBUG = true;

const log = (message, data = null) => {
  if (DEBUG) {
    console.log(`[PDF-MDX] ${message}`, data || '');
  }
};

const extractLayoutInfo = async (page) => {
  log('Extracting layout info from page');
  try {
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    const operatorList = await page.getOperatorList();
    
    log(`Found ${textContent.items.length} text items`);
    
    return textContent.items.map(item => {
      const fontSizeScale = Math.abs(item.transform[0]) || Math.abs(item.transform[3]);
      const element = {
        text: item.str,
        x: item.transform[4],
        y: viewport.height - item.transform[5],
        width: item.width,
        height: item.height,
        fontSize: fontSizeScale,
        fontName: item.fontName,
        fontWeight: item.fontWeight || 'normal',
        isItalic: item.fontName?.toLowerCase().includes('italic'),
        isBold: item.fontName?.toLowerCase().includes('bold') || (item.fontWeight && item.fontWeight >= 700),
        transform: item.transform,
        spaceWidth: item.spaceWidth,
        style: item.fontName?.toLowerCase().includes('italic') ? 'italic' : 
               item.fontName?.toLowerCase().includes('bold') ? 'bold' : 'normal'
      };
      
      log('Processed text element:', {
        text: element.text,
        fontSize: element.fontSize,
        style: element.style,
        position: { x: element.x, y: element.y }
      });
      
      return element;
    });
  } catch (error) {
    log('Error in extractLayoutInfo:', error);
    throw error;
  }
};

const isListItem = (text, x) => {
  // Enhanced list marker detection
  const bulletListMarkers = /^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/;
  const numberedListMarkers = /^\d+[.)]\s*/;
  const alphaListMarkers = /^[a-zA-Z][.)]\s*/;
  const romanNumeralMarkers = /^[ivxIVX]+[.)]\s*/;
  
  const isIndented = x > 20;
  const hasListMarker = bulletListMarkers.test(text) || 
                       numberedListMarkers.test(text) || 
                       alphaListMarkers.test(text) ||
                       romanNumeralMarkers.test(text);
  
  log('List item check:', { text, x, isIndented, hasListMarker });
  return hasListMarker || (isIndented && text.trim().length > 0);
};

const classifyElements = (layout) => {
  log('Starting element classification');
  
  // Sort elements by vertical position and then horizontal position
  layout.sort((a, b) => {
    const yDiff = Math.abs(a.y - b.y);
    const LINE_HEIGHT_THRESHOLD = 5;
    if (yDiff < LINE_HEIGHT_THRESHOLD) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  log('Sorted layout elements');

  // Group elements into lines with better line detection
  const lines = [];
  let currentLine = [];
  let prevY = null;
  const LINE_MERGE_THRESHOLD = 8;

  layout.forEach(item => {
    if (prevY === null || Math.abs(item.y - prevY) < LINE_MERGE_THRESHOLD) {
      currentLine.push(item);
    } else {
      if (currentLine.length > 0) {
        lines.push([...currentLine]);
        log('Created new line:', currentLine.map(el => el.text).join(' '));
      }
      currentLine = [item];
    }
    prevY = item.y;
  });

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  log(`Grouped elements into ${lines.length} lines`);

  // Classify each line with improved heading detection
  return lines.map(line => {
    const text = line.map(item => item.text).join(' ').trim();
    const maxFontSize = Math.max(...line.map(item => item.fontSize));
    const firstItem = line[0];
    const indentLevel = Math.floor(firstItem.x / 20);
    const averageY = line.reduce((sum, item) => sum + item.y, 0) / line.length;

    // Improved element type determination
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
      y: averageY,
      indentLevel,
      isBold: line.some(item => item.isBold),
      isItalic: line.some(item => item.isItalic),
      style: line.some(item => item.style === 'italic') ? 'italic' : 
             line.some(item => item.style === 'bold') ? 'bold' : 'normal',
      pageNumber: firstItem.pageNumber
    };

    log('Classified element:', {
      type: element.type,
      content: element.content.substring(0, 50) + (element.content.length > 50 ? '...' : ''),
      fontSize: element.fontSize,
      style: element.style,
      indentLevel: element.indentLevel,
      page: element.pageNumber
    });

    return element;
  });
};

const formatContent = (elements) => {
  log('Starting content formatting');
  let mdx = '';
  let inList = false;
  let listIndentLevel = 0;
  let prevType = null;
  let currentPage = null;

  elements.forEach((element, index) => {
    const prevElement = elements[index - 1];
    const nextElement = elements[index + 1];
    const indent = '  '.repeat(element.indentLevel);

    // Add page breaks
    if (element.pageNumber !== currentPage) {
      if (currentPage !== null) {
        mdx += '\n---\n\n';
      }
      currentPage = element.pageNumber;
    }

    // Improved spacing logic
    if (prevElement) {
      if (prevElement.type !== element.type || 
          Math.abs(prevElement.y - element.y) > 20 ||
          (prevElement.type === 'paragraph' && element.type === 'paragraph')) {
        mdx += '\n';
        log('Added section spacing');
      }
    }

    // Enhanced content formatting
    let content = element.content.trim();
    
    // Apply styling
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
        if (!nextElement || nextElement.type !== 'listItem') {
          mdx += '\n';
          inList = false;
        }
        break;
      default:
        if (content) {
          if (inList) {
            mdx += '\n';
            inList = false;
          }
          mdx += `${indent}${content}\n\n`;
        }
    }

    prevType = element.type;
  });

  log('Completed content formatting');
  return mdx.trim();
};

export const convertPdfToMdx = async (pdfFile, setProgress) => {
  log('Starting PDF to MDX conversion');
  try {
    const loadingTask = pdfjsLib.getDocument(pdfFile);
    const pdf = await loadingTask.promise;
    log(`PDF loaded successfully. Total pages: ${pdf.numPages}`);
    
    let allElements = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        log(`Processing page ${i}`);
        const page = await pdf.getPage(i);
        const layout = await extractLayoutInfo(page);
        
        // Add page number to each element
        layout.forEach(item => {
          item.pageNumber = i;
        });
        
        log(`Extracted ${layout.length} elements from page ${i}`);
        
        const elements = classifyElements(layout);
        log(`Classified ${elements.length} elements on page ${i}`);
        
        allElements = allElements.concat(elements);
        setProgress((i / pdf.numPages) * 100);
        log(`Completed page ${i}`);
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        log(`Failed to process page ${i}`, pageError);
        continue;
      }
    }

    const mdxContent = formatContent(allElements);

    log('Cleaning up MDX content');
    const cleanedContent = mdxContent
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\*\*\s*\*\*/g, '')
      .replace(/\*\s*\*/g, '')
      .replace(/^\s+|\s+$/gm, '')
      .trim();

    log('Conversion completed successfully');
    return cleanedContent;
  } catch (error) {
    console.error('Error converting PDF to MDX:', error);
    log('Conversion failed', error);
    throw new Error('Failed to convert PDF to MDX');
  }
};