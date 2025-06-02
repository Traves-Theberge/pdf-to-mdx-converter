// src/utils/pdfToMdxConverter.js
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const extractLayoutInfo = async (page) => {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });
  const operatorList = await page.getOperatorList();
  
  return textContent.items.map(item => ({
    text: item.str,
    x: item.transform[4],
    y: item.transform[5], // Fixed: Use Y coordinate directly
    width: item.width,
    height: item.height,
    fontName: item.fontName,
    fontSize: item.transform[0],
    fontWeight: item.fontWeight || 'normal',
    isItalic: item.fontName?.toLowerCase().includes('italic'),
    isBold: item.fontName?.toLowerCase().includes('bold'),
    color: item.color || '#000000',
    transform: item.transform,
    ascent: item.ascent,
    descent: item.descent,
    lineHeight: Math.abs(item.transform[3]) || item.height,
    spaceWidth: item.spaceWidth
  }));
};

const calculateLineMetrics = (elements) => {
  const lineHeights = elements
    .map(e => e.lineHeight)
    .filter(h => h > 0);
  
  return {
    averageLineHeight: lineHeights.reduce((a, b) => a + b, 0) / lineHeights.length,
    maxLineHeight: Math.max(...lineHeights),
    minLineHeight: Math.min(...lineHeights)
  };
};

const isListItem = (text, x, prevX) => {
  const listMarkers = ['•', '-', '*', '○', '►', '⁃', '⁌', '⁍'];
  const numberPattern = /^\d+[\.\)]/;
  const letterPattern = /^[a-z][\.\)]/i;
  
  const trimmedText = text.trim();
  return listMarkers.some(marker => trimmedText.startsWith(marker)) || 
         numberPattern.test(trimmedText) ||
         letterPattern.test(trimmedText) ||
         (x > prevX + 20 && x < prevX + 100); // Indentation check
};

const classifyElements = (layout) => {
  const metrics = calculateLineMetrics(layout);
  let prevY = null;
  let prevX = 0;
  let lineElements = [];
  const classifiedLines = [];
  let currentIndentLevel = 0;

  // Sort elements by Y position (top to bottom) and X position (left to right)
  layout.sort((a, b) => {
    const yDiff = Math.abs(a.y - b.y);
    if (yDiff < metrics.averageLineHeight / 2) {
      return a.x - b.x;
    }
    return a.y - b.y; // Fixed: Sort from top to bottom
  });

  // Group elements by line with precise positioning
  layout.forEach(item => {
    const yDiff = prevY !== null ? Math.abs(item.y - prevY) : 0;
    
    if (prevY === null || yDiff > metrics.averageLineHeight / 2) {
      if (lineElements.length > 0) {
        classifiedLines.push(processLine(lineElements, currentIndentLevel, metrics));
      }
      lineElements = [item];
      currentIndentLevel = Math.floor(item.x / 20); // Calculate indent level
      prevX = item.x;
    } else {
      lineElements.push(item);
    }
    prevY = item.y;
  });

  if (lineElements.length > 0) {
    classifiedLines.push(processLine(lineElements, currentIndentLevel, metrics));
  }

  return classifiedLines;
};

const processLine = (elements, indentLevel, metrics) => {
  const firstElement = elements[0];
  const maxFontSize = Math.max(...elements.map(e => e.fontSize));
  const minFontSize = Math.min(...elements.map(e => e.fontSize));
  const averageFontSize = elements.reduce((sum, e) => sum + e.fontSize, 0) / elements.length;
  
  // Preserve exact spacing between elements
  const formattedText = elements.reduce((acc, element, index) => {
    const prevElement = elements[index - 1];
    let spacing = '';
    
    if (prevElement) {
      const spacingWidth = element.x - (prevElement.x + prevElement.width);
      const spaceCount = Math.round(spacingWidth / (element.spaceWidth || 4));
      spacing = ' '.repeat(Math.max(1, spaceCount));
    }

    let formatted = element.text;
    if (element.isBold) formatted = `**${formatted}**`;
    if (element.isItalic) formatted = `*${formatted}*`;
    
    return acc + spacing + formatted;
  }, '');

  // Determine element type based on precise metrics
  let type = 'paragraph';
  if (maxFontSize >= averageFontSize * 1.5) {
    if (maxFontSize > 20) type = 'h1';
    else if (maxFontSize > 16) type = 'h2';
    else if (maxFontSize > 14) type = 'h3';
  } else if (isListItem(formattedText, firstElement.x, elements[0].x)) {
    type = 'listItem';
  }

  return {
    type,
    content: formattedText.trim(),
    fontSize: maxFontSize,
    x: firstElement.x,
    y: firstElement.y,
    indentLevel,
    metrics: {
      lineHeight: metrics.averageLineHeight,
      fontSizeRange: [minFontSize, maxFontSize],
      averageFontSize
    }
  };
};

const generateStructuredContent = (classifiedElements) => {
  let structure = [];
  let currentList = null;
  let prevElement = null;

  classifiedElements.forEach(element => {
    const spacing = prevElement ? 
      Math.abs(prevElement.y - element.y) / element.metrics.lineHeight : 
      1;

    if (element.type === 'listItem') {
      if (!currentList || spacing > 1.5) {
        currentList = { 
          type: 'list', 
          items: [],
          indentLevel: element.indentLevel 
        };
        structure.push(currentList);
      }
      currentList.items.push({
        content: element.content,
        indentLevel: element.indentLevel
      });
    } else {
      if (spacing > 1.5) {
        structure.push({ type: 'spacing' });
      }
      currentList = null;
      structure.push({
        type: element.type,
        content: element.content,
        indentLevel: element.indentLevel
      });
    }
    prevElement = element;
  });

  return structure;
};

const generateMdxFromStructure = (structure) => {
  return structure.map(element => {
    const indent = ' '.repeat(element.indentLevel * 2);
    switch(element.type) {
      case 'h1':
        return `${indent}# ${element.content}\n\n`;
      case 'h2':
        return `${indent}## ${element.content}\n\n`;
      case 'h3':
        return `${indent}### ${element.content}\n\n`;
      case 'list':
        return element.items
          .map(item => `${' '.repeat(item.indentLevel * 2)}- ${item.content}\n`)
          .join('') + '\n';
      case 'spacing':
        return '\n';
      case 'paragraph':
        return `${indent}${element.content}\n\n`;
      default:
        return '';
    }
  }).join('');
};

const convertPdfToMdx = async (pdfFile, setProgress) => {
  const loadingTask = pdfjsLib.getDocument(pdfFile);
  const pdf = await loadingTask.promise;
  let mdxContent = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const layout = await extractLayoutInfo(page);
    const classifiedElements = classifyElements(layout);
    const structuredContent = generateStructuredContent(classifiedElements);
    mdxContent += generateMdxFromStructure(structuredContent);
    setProgress((i / pdf.numPages) * 100);
  }

  // Clean up while preserving intentional formatting
  mdxContent = mdxContent
    .replace(/\n{4,}/g, '\n\n\n') // Preserve double line breaks
    .replace(/\*\*\s*\*\*/g, '') // Remove empty bold tags
    .replace(/\*\s*\*/g, '') // Remove empty italic tags
    .trim();

  return mdxContent;
};

export { convertPdfToMdx };