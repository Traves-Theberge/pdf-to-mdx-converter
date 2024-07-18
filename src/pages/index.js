// src/pages/index.js
"use client";

import { useState, useRef } from 'react';
import PdfViewer from '../components/PdfViewer';
import MdxEditor from '../components/MdxEditor';
import FileUploader from '../components/FileUploader';
import ProgressBar from '../components/ProgressBar';
import MdxPreview from '../components/MdxPreview';
import { convertPdfToMdx } from '../utils/pdfToMdxConverter';
import { saveAs } from 'file-saver';

const HomePage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [mdxContent, setMdxContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const handlePdfUpload = (file, fileName) => {
    setPdfFile(file);
    setPdfFileName(fileName);
  };

  const handleConvert = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const content = await convertPdfToMdx(pdfFile, setProgress);
      setMdxContent(content);
      setShowPreview(false); // Ensure preview is closed
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('An error occurred while processing the PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveMdx = () => {
    const blob = new Blob([mdxContent], { type: 'text/mdx' });
    saveAs(blob, pdfFileName.replace('.pdf', '.mdx'));
  };

  const handleTogglePreview = () => {
    setShowPreview((prev) => !prev);
  };

  const handleClearEditor = () => {
    setMdxContent('');
  };

  const handleClearPdf = () => {
    setPdfFile(null);
    setPdfFileName('');
    setMdxContent('');
    setShowPreview(false);
    setProgress(0);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the file input element
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <FileUploader onPdfUpload={handlePdfUpload} fileInputRef={fileInputRef} />
          <button
            onClick={handleClearPdf}
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded"
            disabled={!pdfFile && !mdxContent}
          >
            Clear PDF
          </button>
        </div>
        <div>
          <button
            onClick={handleConvert}
            className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
            disabled={!pdfFile || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Convert to MDX'}
          </button>
          <button
            onClick={handleTogglePreview}
            className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded"
            disabled={!mdxContent}
          >
            {showPreview ? 'Hide Preview' : 'Preview MDX'}
          </button>
          <button
            onClick={handleSaveMdx}
            className="mr-2 px-4 py-2 bg-green-500 text-white rounded"
            disabled={!mdxContent}
          >
            Save MDX
          </button>
          <button
            onClick={handleClearEditor}
            className="px-4 py-2 bg-red-500 text-white rounded"
            disabled={!mdxContent}
          >
            Clear Editor
          </button>
        </div>
      </div>
      <div className="flex h-full">
        <div className="w-1/3 p-4 overflow-auto">
          {pdfFile ? <PdfViewer pdfUrl={pdfFile} /> : <p>Please upload a PDF file</p>}
          {isProcessing && <ProgressBar progress={progress} />}
        </div>
        <div className="w-2/3 p-4 flex flex-col overflow-auto">
          {showPreview ? (
            <MdxPreview content={mdxContent} />
          ) : (
            <MdxEditor mdxContent={mdxContent} setMdxContent={setMdxContent} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
