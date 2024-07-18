import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const extractTextContent = async (page) => {
  const textContent = await page.getTextContent();
  return textContent.items.map(item => ({
    str: item.str,
    transform: item.transform,
    fontName: item.fontName,
    fontSize: item.height
  }));
};

const classifyTextItems = (items) => {
  return items.map((item) => {
    let type = 'paragraph';
    if (item.fontSize >= 24) {
      type = 'h1';
    } else if (item.fontSize >= 20) {
      type = 'h2';
    } else if (item.fontSize >= 16) {
      type = 'h3';
    } else if (item.fontSize >= 14) {
      type = 'h4';
    } else if (item.fontSize >= 12) {
      type = 'h5';
    } else if (item.fontSize >= 10) {
      type = 'h6';
    } else if (item.str.match(/^[-*•]\s+/)) {
      type = 'listItem';
    } else if (item.str.match(/^\d+\./)) {
      type = 'listItem';
    }

    return {
      ...item,
      type,
    };
  });
};

const generateMarkdown = (items) => {
  let markdown = '';
  items.forEach((item) => {
    switch (item.type) {
      case 'h1':
        markdown += `# ${item.str}\n\n`;
        break;
      case 'h2':
        markdown += `## ${item.str}\n\n`;
        break;
      case 'h3':
        markdown += `### ${item.str}\n\n`;
        break;
      case 'h4':
        markdown += `#### ${item.str}\n\n`;
        break;
      case 'h5':
        markdown += `##### ${item.str}\n\n`;
        break;
      case 'h6':
        markdown += `###### ${item.str}\n\n`;
        break;
      case 'listItem':
        markdown += `* ${item.str}\n`;
        break;
      default:
        markdown += `${item.str} `;
        break;
    }
  });

  return markdown;
};

const convertPdfToMdx = async (pdfFile, setProgress) => {
  const loadingTask = pdfjsLib.getDocument(pdfFile);
  const pdf = await loadingTask.promise;
  let content = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textItems = await extractTextContent(page);
    const classifiedItems = classifyTextItems(textItems);
    const pageMarkdown = generateMarkdown(classifiedItems);
    
    content += `\n## Page ${i}\n\n${pageMarkdown}\n`;
    setProgress((i / pdf.numPages) * 100);
  }

  return content;
};

export { convertPdfToMdx };
