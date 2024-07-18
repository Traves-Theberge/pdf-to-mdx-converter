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
    fontSize: item.transform[0]
  }));
};

const classifyElements = (layout) => {
  return layout.map(item => {
    if (item.fontSize > 16) return { ...item, type: 'header' };
    if (item.text.trim().startsWith('•')) return { ...item, type: 'listItem' };
    return { ...item, type: 'paragraph' };
  });
};

const generateStructuredContent = (classifiedElements) => {
  const structure = [];
  let currentParagraph = '';

  classifiedElements.forEach(element => {
    switch(element.type) {
      case 'header':
        if (currentParagraph) {
          structure.push({ type: 'paragraph', content: currentParagraph.trim() });
          currentParagraph = '';
        }
        structure.push({ type: 'header', content: element.text, level: Math.floor(24 / element.fontSize) });
        break;
      case 'listItem':
        if (currentParagraph) {
          structure.push({ type: 'paragraph', content: currentParagraph.trim() });
          currentParagraph = '';
        }
        structure.push({ type: 'listItem', content: element.text.trim() });
        break;
      default:
        currentParagraph += element.text + ' ';
    }
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
        return '#'.repeat(element.level) + ' ' + element.content + '\n\n';
      case 'listItem':
        return '* ' + element.content + '\n';
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
