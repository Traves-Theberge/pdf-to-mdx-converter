import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const extractLayoutInfo = async (page) => {
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });
  
  return textContent.items.map(item => ({
    text: item.str,
    x: item.transform[4],
    y: item.transform[5], // Use original y-coordinate
    width: item.width,
    height: item.height,
    fontSize: Math.abs(item.transform[0]) || item.height,
    fontName: item.fontName,
    fontWeight: item.fontWeight || 'normal',
    isItalic: item.fontName?.toLowerCase().includes('italic'),
    isBold: item.fontName?.toLowerCase().includes('bold'),
    transform: item.transform,
  }));
};

const classifyElements = (layout) => {
  // Sort elements by vertical position (top to bottom) and then by horizontal position
  layout.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 5) { // Group elements that are roughly on the same line
      return a.x - b.x;
    }
    return b.y - a.y; // Sort from top to bottom
  });

  // Group elements into lines
  const lines = [];
  let currentLine = [];
  let prevY = null;

  layout.forEach(item => {
    if (prevY === null || Math.abs(item.y - prevY) < 5) {
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

    // Determine element type
    let type = 'paragraph';
    if (maxFontSize >= 20) {
      type = 'h1';
    } else if (maxFontSize >= 16) {
      type = 'h2';
    } else if (maxFontSize >= 14) {
      type = 'h3';
    } else if (text.match(/^[•\-\*]\s/) || text.match(/^\d+\.\s/)) {
      type = 'listItem';
    }

    return {
      type,
      content: text,
      fontSize: maxFontSize,
      x: firstItem.x,
      y: firstItem.y,
      isBold: line.some(item => item.isBold),
      isItalic: line.some(item => item.isItalic),
    };
  });
};

const formatContent = (elements) => {
  let mdx = '';
  let inList = false;

  elements.forEach((element, index) => {
    const prevElement = elements[index - 1];
    const nextElement = elements[index + 1];

    // Add spacing between different sections
    if (prevElement && prevElement.type !== element.type) {
      mdx += '\n';
    }

    // Format the content based on type
    switch (element.type) {
      case 'h1':
        mdx += `# ${element.content}\n\n`;
        break;
      case 'h2':
        mdx += `## ${element.content}\n\n`;
        break;
      case 'h3':
        mdx += `### ${element.content}\n\n`;
        break;
      case 'listItem':
        if (!inList) {
          mdx += '\n';
          inList = true;
        }
        mdx += `- ${element.content}\n`;
        if (!nextElement || nextElement.type !== 'listItem') {
          mdx += '\n';
          inList = false;
        }
        break;
      default:
        if (element.content.trim()) {
          let content = element.content;
          if (element.isBold) content = `**${content}**`;
          if (element.isItalic) content = `*${content}*`;
          mdx += `${content}\n\n`;
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
      const page = await pdf.getPage(i);
      const layout = await extractLayoutInfo(page);
      const elements = classifyElements(layout);
      mdxContent += formatContent(elements) + '\n\n';
      
      setProgress((i / pdf.numPages) * 100);
    }

    return mdxContent.trim();
  } catch (error) {
    console.error('Error converting PDF to MDX:', error);
    throw new Error('Failed to convert PDF to MDX');
  }
};