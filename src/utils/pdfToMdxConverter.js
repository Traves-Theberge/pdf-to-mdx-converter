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
        isBold: item.fontName?.toLowerCase().includes('bold') || fontSizeScale > 16,
        transform: item.transform,
        spaceWidth: item.spaceWidth,
      };
      
      log('Processed text element:', {
        text: element.text,
        fontSize: element.fontSize,
        position: { x: element.x, y: element.y }
      });
      
      return element;
    });
  } catch (error) {
    log('Error in extractLayoutInfo:', error);
    throw error;
  }
};

const isListItem = (text) => {
  const listMarkers = /^[•\-\*]\s|^\d+\.\s|^[a-z]\)\s|^[A-Z]\)\s/;
  const isListItem = listMarkers.test(text.trim());
  log('List item check:', { text, isListItem });
  return isListItem;
};

const classifyElements = (layout) => {
  log('Starting element classification');
  
  // Sort elements by vertical position (top to bottom) and then by horizontal position
  layout.sort((a, b) => {
    const yDiff = Math.abs(a.y - b.y);
    if (yDiff < 12) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  log('Sorted layout elements');

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

    const element = {
      type,
      content: text,
      fontSize: maxFontSize,
      x: firstItem.x,
      y: firstItem.y,
      indentLevel,
      isBold: line.some(item => item.isBold),
      isItalic: line.some(item => item.isItalic),
    };

    log('Classified element:', {
      type: element.type,
      content: element.content.substring(0, 50) + (element.content.length > 50 ? '...' : ''),
      fontSize: element.fontSize,
      indentLevel: element.indentLevel
    });

    return element;
  });
};

const formatContent = (elements) => {
  log('Starting content formatting');
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
      log('Added section spacing');
    }

    // Format the content based on type
    let content = element.content;
    if (element.isBold) {
      content = `**${content}**`;
      log('Applied bold formatting');
    }
    if (element.isItalic) {
      content = `*${content}*`;
      log('Applied italic formatting');
    }

    switch (element.type) {
      case 'h1':
        mdx += `${indent}# ${content}\n\n`;
        log('Formatted h1 heading');
        break;
      case 'h2':
        mdx += `${indent}## ${content}\n\n`;
        log('Formatted h2 heading');
        break;
      case 'h3':
        mdx += `${indent}### ${content}\n\n`;
        log('Formatted h3 heading');
        break;
      case 'listItem':
        if (!inList || element.indentLevel !== prevIndentLevel) {
          mdx += '\n';
          log('Started new list');
        }
        mdx += `${indent}- ${content}\n`;
        inList = true;
        prevIndentLevel = element.indentLevel;
        if (!nextElement || nextElement.type !== 'listItem') {
          mdx += '\n';
          inList = false;
          log('Ended list');
        }
        break;
      default:
        if (content.trim()) {
          mdx += `${indent}${content}\n\n`;
          log('Formatted paragraph');
        }
    }
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
    
    let mdxContent = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        log(`Processing page ${i}`);
        const page = await pdf.getPage(i);
        const layout = await extractLayoutInfo(page);
        log(`Extracted ${layout.length} elements from page ${i}`);
        
        const elements = classifyElements(layout);
        log(`Classified ${elements.length} elements on page ${i}`);
        
        mdxContent += formatContent(elements) + '\n\n';
        setProgress((i / pdf.numPages) * 100);
        log(`Completed page ${i}`);
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        log(`Failed to process page ${i}`, pageError);
        continue;
      }
    }

    log('Cleaning up MDX content');
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