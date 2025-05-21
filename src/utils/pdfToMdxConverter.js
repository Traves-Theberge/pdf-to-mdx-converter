// src/utils/pdfToMdxConverter.js
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const extractLayoutInfo = async (page) => {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });

  // Maps over raw text items from PDF.js
  return textContent.items.map(item => ({
    text: item.str, // The actual text content of the item.
    x: item.transform[4], // X coordinate (horizontal position on page). item.transform is a matrix [scaleX, skewY, skewX, scaleY, x, y].
    y: viewport.height - item.transform[5], // Y coordinate (vertical position on page, adjusted for viewport origin at top-left).
    width: item.width, // Width of the text item.
    height: item.height, // Height of the text item.
    fontName: item.fontName, // Font name (e.g., "Times-Roman", "Helvetica-Bold").
    fontSize: item.transform[0] // Font size, derived from the scaling factor in the transform matrix.
  }));
};

/**
 * Classifies each layout item into a specific type (header, listItem, paragraph)
 * based on its properties like font size and text content.
 * @param {Array<Object>} layout - An array of layout items from extractLayoutInfo.
 * @returns {Array<Object>} An array of classified elements, each with an added 'type' and other relevant properties (e.g., 'level' for headers).
 */
const classifyElements = (layout) => {
  return layout.map(item => {
    const fontSize = item.fontSize;

    // Header detection based on font size ranges.
    // H1: Font size >= 22
    if (fontSize >= 22) return { ...item, type: 'header', level: 1 };
    // H2: Font size >= 18 and < 22
    if (fontSize >= 18 && fontSize < 22) return { ...item, type: 'header', level: 2 };
    // H3: Font size >= 15 and < 18
    if (fontSize >= 15 && fontSize < 18) return { ...item, type: 'header', level: 3 };

    // List item detection using regex.
    // This regex looks for:
    // 1. Numbered lists (e.g., "1.", "2.", "a.", "b.")
    // 2. Common bullet points (•, *, -)
    // It captures the marker (like "1." or "•") and the list item type (ordered or bullet).
    const listItemRegex = /^\s*(\d+\.|[a-zA-Z]\.)\s+|^\s*([•*-])\s+/;
    const match = listItemRegex.exec(item.text.trimStart());
    if (match) {
      // match[1] is for ordered list markers (e.g., "1.", "a.")
      // match[2] is for bullet list markers (e.g., "•", "*", "-")
      const marker = match[1] || match[2] || '*'; // Default to '*' if somehow a match occurs without capturing a specific marker.
      // Remove the detected marker from the beginning of the text.
      const content = item.text.trimStart().replace(listItemRegex, '');
      return { ...item, text: content, type: 'listItem', markerType: match[1] ? 'ordered' : 'bullet', marker: marker.trim() };
    }

    // Default to paragraph if no other classification matches.
    return { ...item, type: 'paragraph' };
  });
};

/**
 * Generates a structured representation of the content by grouping classified elements.
 * This function is crucial for handling paragraph breaks and ordering of elements.
 * @param {Array<Object>} classifiedElements - An array of elements classified by `classifyElements`.
 * @returns {Array<Object>} A new array representing the structured content (e.g., paragraphs are grouped).
 */
const generateStructuredContent = (classifiedElements) => {
  const structure = [];
  let currentParagraph = '';
  let prevElement = null;

  classifiedElements.forEach(element => {
    // Paragraph breaking logic:
    // A new paragraph is started if the current element is a paragraph,
    // the previous element was also a paragraph, and the vertical space
    // between them exceeds a threshold (50% of the previous element's height).
    if (prevElement && element.type === 'paragraph' && prevElement.type === 'paragraph') {
      const verticalSpace = element.y - (prevElement.y + prevElement.height);
      // Threshold: If the gap is more than half the height of the previous line, consider it a new paragraph.
      const paragraphBreakThreshold = prevElement.height * 0.5; 
      if (verticalSpace > paragraphBreakThreshold) {
        if (currentParagraph) {
          structure.push({ type: 'paragraph', content: currentParagraph.trim() });
        }
        currentParagraph = ''; // Reset for the new paragraph.
      }
    }

    switch(element.type) {
      case 'header':
        if (currentParagraph) {
          structure.push({ type: 'paragraph', content: currentParagraph.trim() });
          currentParagraph = '';
        }
        structure.push({ type: 'header', content: element.text, level: element.level, markerType: element.markerType, marker: element.marker });
        break;
      case 'listItem':
        if (currentParagraph) {
          structure.push({ type: 'paragraph', content: currentParagraph.trim() });
          currentParagraph = '';
        }
        // Pass markerType and marker for list items
        structure.push({ type: 'listItem', content: element.text.trim(), markerType: element.markerType, marker: element.marker });
        break;
      default: // paragraph
        currentParagraph += element.text + ' ';
    }
    prevElement = element;
  });

  if (currentParagraph) {
    structure.push({ type: 'paragraph', content: currentParagraph.trim() });
  }

  return structure;
};

const generateMdxFromStructure = (structure) => {
  return structure.map(element => {
    switch(element.type) {
      case 'header':
        return '#'.repeat(element.level || 1) + ' ' + element.content + '\n\n'; // Default to H1 if level is undefined
      case 'listItem':
        if (element.markerType === 'ordered') {
          return element.marker + ' ' + element.content + '\n';
        }
        return '* ' + element.content + '\n'; // Default to '*' for bullets
      case 'paragraph':
        return element.content + '\n\n';
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

  return mdxContent;
};

export { convertPdfToMdx };
