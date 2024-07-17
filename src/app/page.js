"use client";

import { useState } from 'react';
import PdfViewer from '../components/PdfViewer';
import MdxEditor from '../components/MdxEditor';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';

const HomePage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [mdxContent, setMdxContent] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfFile(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const convertPdfToMdx = async () => {
    if (!pdfFile) return;

    const loadingTask = pdfjsLib.getDocument(pdfFile);
    const pdf = await loadingTask.promise;
    let content = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');

      const operatorList = await page.getOperatorList();
      const images = await extractImages(page, operatorList);

      let pageContent = `\n## Page ${i}\n\n${pageText}\n`;
      images.forEach(image => {
        pageContent += `\n![Image](${image})\n`;
      });

      content += pageContent;
    }

    setMdxContent(content);
  };

  const extractImages = async (page, operatorList) => {
    const images = [];
    for (let i = 0; i < operatorList.fnArray.length; i++) {
      if (operatorList.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
        const img = await page.objs.get(operatorList.argsArray[i][0]);
        const imgData = img.data;
        const imgBlob = new Blob([imgData], { type: 'image/jpeg' });
        const imgUrl = URL.createObjectURL(imgBlob);
        images.push(imgUrl);
      }
    }
    return images;
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>
      <div className="flex h-full">
        <div className="w-1/2 p-4">
          {pdfFile ? <PdfViewer pdfUrl={pdfFile} /> : <p>Please upload a PDF file</p>}
        </div>
        <div className="w-1/2 p-4 flex flex-col">
          <button onClick={convertPdfToMdx} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
            Render
          </button>
          <MdxEditor mdxContent={mdxContent} setMdxContent={setMdxContent} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
