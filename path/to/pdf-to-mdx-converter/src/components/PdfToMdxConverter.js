import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const extractTextContent = (textContent) => {
  let text = '';
  let lastY;
  let lastFont;
  let lastFontSize;

  textContent.items.forEach((item, index) => {
    if (index === 0 || item.transform[5] !== lastY || item.fontName !== lastFont || item.fontSize !== lastFontSize) {
      if (index !== 0) {
        text += '\n';
      }
      lastY = item.transform[5];
      lastFont = item.fontName;
      lastFontSize = item.fontSize;
    }

    if (item.fontSize > 14) {
      text += ### \n;
    } else if (item.fontName.toLowerCase().includes('bold')) {
      text += **** ;
    } else {
      text += ${item.str} ;
    }
  });

  return text.trim();
};

const extractImages = async (page) => {
  const operatorList = await page.getOperatorList();
  const images = [];

  for (let i = 0; i < operatorList.fnArray.length; i++) {
    if (operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
      const imgData = operatorList.argsArray[i][0];
      const img = await page.objs.get(imgData);
      if (img) {
        const imgUrl = await getImageDataUrl(img);
        if (imgUrl) {
          images.push(imgUrl);
        }
      }
    }
  }

  return images;
};

const getImageDataUrl = async (img) => {
  const { width, height, kind, data } = img;
  if (data) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(width, height);

    if (kind === 1) {
      // Grayscale image
      for (let i = 0; i < data.length; i++) {
        imageData.data[i * 4] = data[i];
        imageData.data[i * 4 + 1] = data[i];
        imageData.data[i * 4 + 2] = data[i];
        imageData.data[i * 4 + 3] = 255;
      }
    } else {
      // RGB image
      imageData.data.set(new Uint8ClampedArray(data));
    }

    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }
  return null;
};

const convertPdfToMdx = async (pdfFile, setProgress) => {
  const loadingTask = pdfjsLib.getDocument(pdfFile);
  const pdf = await loadingTask.promise;
  let content = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = extractTextContent(textContent);
    const images = await extractImages(page);

    let pageContent = \n## Page \n\n\n;
    images.forEach((image, index) => {
      pageContent += \n![Image  on Page ]()\n;
    });

    content += pageContent;

    setProgress((i / pdf.numPages) * 100);
  }

  return content;
};

export { convertPdfToMdx };
