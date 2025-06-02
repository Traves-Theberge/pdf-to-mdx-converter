// src/utils/pdfToMdxConverter.js
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const extractLayoutInfo = async (page) => {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });

  return textContent.items.map(item => ({
    text: item.str,
    x: item.transform[4],
    y: viewport.height - item.transform[5],
    width: item.width,
    height: item.height,
    fontName: item.fontName,
    fontSize: item.transform[0],
    fontWeight: item.fontWeight || 'normal',
    isItalic: item.fontName?.toLowerCase().includes('italic'),
    isBold: item.fontName?.toLowerCase().includes('bold')
  }));
};

const isListItem = (text, x) => {
  const listMarkers = ['•', '-', '*', '○', '►', '⁃', '⁌', '⁍'];
  const numberPattern = /^\d+\./;
  
  const trimmedText = text.trim();
  return listMarkers.some(marker => trimmedText.startsWith(marker)) || 
         numberPattern.test(trimmedText) ||
         x > 40; // Indentation check for list items
};

const classifyElements = (layout) => {
  let prevY = null;
  let lineElements = [];
  const classifiedLines = [];

  // Sort elements by Y position (top to bottom) and X position (left to right)
  layout.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 5) { // Elements on the same line
      return a.x - b.x;
    }
    return b.y - a.y;
  });

  // Group elements by line
  layout.forEach(item => {
    if (prevY === null || Math.abs(item.y - prevY) < 5) {
      lineElements.push(item);
    } else {
      if (lineElements.length > 0) {
        classifiedLines.push(processLine(lineElements));
      }
      lineElements = [item];
    }
    prevY = item.y;
  });

  if (lineElements.length > 0) {
    classifiedLines.push(processLine(lineElements));
  }

  return classifiedLines;
};

const processLine = (elements) => {
  const combinedText = elements.map(e => e.text).join(' ').trim();
  const firstElement = elements[0];
  const maxFontSize = Math.max(...elements.map(e => e.fontSize));

  // Determine element type
  let type = 'paragraph';
  if (maxFontSize > 20) type = 'h1';
  else if (maxFontSize > 16) type = 'h2';
  else if (maxFontSize > 14) type = 'h3';
  else if (isListItem(combinedText, firstElement.x)) type = 'listItem';

  // Format text with markdown syntax
  const formattedText = elements.reduce((text, element) => {
    let formatted = element.text;
    if (element.isBold) formatted = `**${formatted}**`;
    if (element.isItalic) formatted = `*${formatted}*`;
    return text + (text ? ' ' : '') + formatted;
  }, '');

  return {
    type,
    content: formattedText,
    fontSize: maxFontSize,
    x: firstElement.x,
    y: firstElement.y
  };
};

const generateStructuredContent = (classifiedElements) => {
  let structure = [];
  let currentList = null;

  classifiedElements.forEach(element => {
    if (element.type === 'listItem') {
      if (!currentList) {
        currentList = { type: 'list', items: [] };
        structure.push(currentList);
      }
      currentList.items.push(element.content);
    } else {
      currentList = null;
      structure.push({
        type: element.type,
        content: element.content
      });
    }
  });

  return structure;
};

const generateMdxFromStructure = (structure) => {
  return structure.map(element => {
    switch(element.type) {
      case 'h1':
        return `# ${element.content}\n\n`;
      case 'h2':
        return `## ${element.content}\n\n`;
      case 'h3':
        return `### ${element.content}\n\n`;
      case 'list':
        return element.items.map(item => `- ${item}\n`).join('') + '\n';
      case 'paragraph':
        return `${element.content}\n\n`;
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

  // Clean up the MDX content
  mdxContent = mdxContent
    .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    .replace(/\*\*\s*\*\*/g, '') // Remove empty bold tags
    .replace(/\*\s*\*/g, '') // Remove empty italic tags
    .trim();

  return mdxContent;
};

export { convertPdfToMdx };