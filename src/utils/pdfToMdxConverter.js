// src/utils/pdfToMdxConverter.js
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const extractLayoutInfo = async (page) => {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });
  const annotations = await page.getAnnotations();

  const linkAnnotations = annotations.filter(ann => ann.subtype === 'Link' && ann.url);

  // Helper to check if a text item is within a link annotation's rectangle
  const isTextInRect = (textItemRect, linkRectCoords) => {
    // Link rect: [x1, y1, x2, y2] in PDF coordinates (bottom-left origin)
    // Transform to viewport coordinates (top-left origin)
    const linkViewportRect = {
      x1: linkRectCoords[0],
      y1: viewport.height - linkRectCoords[3], // PDF y2 is top
      x2: linkRectCoords[2],
      y2: viewport.height - linkRectCoords[1], // PDF y1 is bottom
    };

    // Check for overlap (AABB collision detection)
    return (
      textItemRect.x < linkViewportRect.x2 &&
      textItemRect.x + textItemRect.width > linkViewportRect.x1 &&
      textItemRect.y < linkViewportRect.y2 &&
      textItemRect.y + textItemRect.height > linkViewportRect.y1
    );
  };

  return textContent.items.map(item => {
    const textItemRect = {
      x: item.transform[4],
      y: viewport.height - item.transform[5],
      width: item.width,
      height: item.height,
    };

    let itemUrl = null;
    for (const linkAnn of linkAnnotations) {
      if (isTextInRect(textItemRect, linkAnn.rect)) {
        itemUrl = linkAnn.url;
        break; 
      }
    }

    return {
      text: item.str,
      x: textItemRect.x,
      y: textItemRect.y,
      width: textItemRect.width,
      height: textItemRect.height,
      fontName: item.fontName,
      fontSize: item.transform[0],
      url: itemUrl, // Add url if found
    };
  });
};

/**
 * Classifies each layout item into a specific type (header, listItem, paragraph, link)
 * based on its properties like font size, text content, and presence of a URL.
 * @param {Array<Object>} layout - An array of layout items from extractLayoutInfo.
 * @returns {Array<Object>} An array of classified elements.
 */
const classifyElements = (layout) => {
  return layout.map(item => {
    // If item has a URL, classify as link first.
    // This makes links take precedence over paragraph classification for text items that are links.
    if (item.url) {
      return { ...item, type: 'link', content: item.text.trim() }; // Link content is just its text for now
    }

    const fontSize = item.fontSize;
    if (fontSize >= 22) return { ...item, type: 'header', level: 1 };
    if (fontSize >= 18 && fontSize < 22) return { ...item, type: 'header', level: 2 };
    if (fontSize >= 15 && fontSize < 18) return { ...item, type: 'header', level: 3 };

    const listItemRegex = /^\s*(\d+\.|[a-zA-Z]\.)\s+|^\s*([•*-])\s+/;
    const match = listItemRegex.exec(item.text.trimStart());
    if (match) {
      const marker = match[1] || match[2] || '*';
      const content = item.text.trimStart().replace(listItemRegex, '');
      return { ...item, text: content, type: 'listItem', markerType: match[1] ? 'ordered' : 'bullet', marker: marker.trim() };
    }

    return { ...item, type: 'paragraph' }; // Default to paragraph if no other classification matches
  });
};

/**
 * Generates a structured representation of the content by grouping classified elements.
 * This function is crucial for handling paragraph breaks and ordering of elements, including nested lists.
 * @param {Array<Object>} classifiedElements - An array of elements classified by `classifyElements`.
 * @returns {Array<Object>} A new array representing the structured content.
 */
const generateStructuredContent = (classifiedElements) => {
  const structure = [];
  let currentParagraph = '';
  let prevElement = null;
  
  const activeListsStack = []; 
  const INDENTATION_THRESHOLD = 10;

  const flushParagraph = (isLinkContext = false) => {
    if (currentParagraph) {
      // If the paragraph content is actually part of a link that's being finalized,
      // this function might not be the right place to push it.
      // For now, assume if flushParagraph is called, it's a non-link paragraph.
      if (!isLinkContext) { // Avoid pushing if we are in the middle of link aggregation
          const lastElement = structure.length > 0 ? structure[structure.length -1] : null;
          // If the last element was a link and this paragraph is just a newline/space, skip it
          if (lastElement && lastElement.type === 'link' && currentParagraph.trim() === '') {
              currentParagraph = ''; // discard
              return;
          }
          structure.push({ type: 'paragraph', content: currentParagraph.trim() });
      }
      currentParagraph = '';
    }
  };
  
  const closeOpenLists = () => {
    while (activeListsStack.length > 0) {
      activeListsStack.pop();
    }
  };

  let currentLink = null; // To aggregate text for a link spanning multiple items

  classifiedElements.forEach((element, idx) => {
    // Handle link elements: try to merge consecutive link items with the same URL
    if (element.type === 'link') {
      flushParagraph(); // Finalize any preceding paragraph
      closeOpenLists();   // Links are not part of lists in this model

      if (currentLink && currentLink.url === element.url) {
        currentLink.content += ' ' + element.content; // Append text
      } else {
        if (currentLink) { // Finalize previous link
          structure.push(currentLink);
        }
        currentLink = { type: 'link', url: element.url, content: element.content };
      }
      // Check if next element is not part of the same link or end of elements
      const nextElement = classifiedElements[idx + 1];
      if (!nextElement || nextElement.type !== 'link' || nextElement.url !== element.url) {
        if (currentLink) {
          structure.push(currentLink);
          currentLink = null;
        }
      }
    } else { // Non-link elements
      if (currentLink) { // Finalize any pending link if current element is not a link
        structure.push(currentLink);
        currentLink = null;
      }

      if (prevElement && element.type === 'paragraph' && prevElement.type === 'paragraph') {
        const verticalSpace = element.y - (prevElement.y + prevElement.height);
        const paragraphBreakThreshold = prevElement.height * 0.5;
        if (verticalSpace > paragraphBreakThreshold) {
          flushParagraph();
        }
      }

      if (element.type === 'header') {
        flushParagraph();
        closeOpenLists();
        structure.push({ type: 'header', content: element.text, level: element.level });
      } else if (element.type === 'listItem') {
        if (prevElement && prevElement.type !== 'listItem') {
          flushParagraph();
        }
        const newItem = {
          type: 'listItem', content: element.text.trim(), markerType: element.markerType,
          marker: element.marker, x: element.x, children: [],
        };
        // (Nesting logic as before)
        while (activeListsStack.length > 0 && newItem.x < activeListsStack[activeListsStack.length - 1].x - INDENTATION_THRESHOLD) {
          activeListsStack.pop();
        }
        if (activeListsStack.length === 0) {
          structure.push(newItem); activeListsStack.push({ x: newItem.x, node: newItem });
        } else {
          let currentParentContext = activeListsStack[activeListsStack.length - 1];
          if (newItem.x > currentParentContext.x + INDENTATION_THRESHOLD) {
            currentParentContext.node.children.push(newItem); activeListsStack.push({ x: newItem.x, node: newItem });
          } else {
            activeListsStack.pop();
            if (activeListsStack.length === 0) { structure.push(newItem); } 
            else { activeListsStack[activeListsStack.length - 1].node.children.push(newItem); }
            activeListsStack.push({ x: newItem.x, node: newItem });
          }
        }
      } else if (element.type === 'paragraph') {
        currentParagraph += element.text + ' ';
      }
    }
    prevElement = element;
  });

  if (currentLink) { // Finalize any trailing link
    structure.push(currentLink);
  }
  flushParagraph(); // Finalize any trailing paragraph
  closeOpenLists();

  return structure;
};

const generateMdxFromStructureRecursive = (elements, depth = 0, parentMarkerType = null) => {
  let mdx = '';
  const indent = '  '.repeat(depth);

  elements.forEach((element, index) => {
    switch (element.type) {
      case 'header':
        mdx += '#'.repeat(element.level || 1) + ' ' + element.content + '\n\n';
        break;
      case 'link':
        // Links are formatted as [content](url). Ensure content is trimmed.
        // For now, links are block-level. If they need to be inline, this would need to change.
        mdx += `[${element.content.trim()}](${element.url})\n\n`;
        break;
      case 'listItem':
        let markerToUse;
        if (element.markerType === 'ordered') {
          const isNumericOriginalMarker = /^\d+[\.\)]?$/.test(element.marker);
          if (!isNumericOriginalMarker && element.marker) {
            markerToUse = element.marker;
          } else {
            markerToUse = `${index + 1}.`;
          }
        } else { 
          markerToUse = element.marker || '*';
        }
        mdx += `${indent}${markerToUse} ${element.content.trim()}\n`; // Trim list item content
        if (element.children && element.children.length > 0) {
          mdx += generateMdxFromStructureRecursive(element.children, depth + 1, element.markerType);
        }
        break;
      case 'paragraph':
        if (depth > 0) {
          const paragraphIndent = indent + '  ';
          mdx += paragraphIndent + element.content.trim().split('\n').join(`\n${paragraphIndent}`) + '\n\n';
        } else {
          mdx += element.content.trim() + '\n\n';
        }
        break;
      default:
        break;
    }
  });
  return mdx;
};

const generateMdxFromStructure = (structure) => {
  return generateMdxFromStructureRecursive(structure, 0);
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
