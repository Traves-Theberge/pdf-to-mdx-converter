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
    setMdxContent('');
    setProgress(0);
  };

  const handleConvert = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const content = await convertPdfToMdx(pdfFile, setProgress);
      setMdxContent(content);
      setShowPreview(false);
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
    setShowPreview(prev => !prev);
  };

  const handleClearEditor = () => {
    if (confirm('Are you sure you want to clear the editor content?')) {
      setMdxContent('');
    }
  };

  const handleClearPdf = () => {
    if (confirm('Are you sure you want to clear all content?')) {
      setPdfFile(null);
      setPdfFileName('');
      setMdxContent('');
      setShowPreview(false);
      setProgress(0);
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">PDF to MDX Converter</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="card p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <FileUploader onPdfUpload={handlePdfUpload} fileInputRef={fileInputRef} />
              <button
                onClick={handleClearPdf}
                className="btn btn-secondary"
                disabled={!pdfFile && !mdxContent}
              >
                Clear All
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConvert}
                className="btn btn-primary"
                disabled={!pdfFile || isProcessing}
              >
                {isProcessing ? 'Converting...' : 'Convert to MDX'}
              </button>
              <button
                onClick={handleTogglePreview}
                className="btn btn-warning"
                disabled={!mdxContent}
              >
                {showPreview ? 'Edit MDX' : 'Preview MDX'}
              </button>
              <button
                onClick={handleSaveMdx}
                className="btn btn-success"
                disabled={!mdxContent}
              >
                Save MDX
              </button>
              <button
                onClick={handleClearEditor}
                className="btn btn-danger"
                disabled={!mdxContent}
              >
                Clear Editor
              </button>
            </div>
          </div>
          {isProcessing && <ProgressBar progress={progress} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 min-h-[600px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">PDF Preview</h2>
            <div className="h-[calc(100%-2rem)] overflow-auto">
              {pdfFile ? (
                <PdfViewer pdfUrl={pdfFile} />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">Upload a PDF file to begin</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6 min-h-[600px]">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              {showPreview ? 'MDX Preview' : 'MDX Editor'}
            </h2>
            <div className="h-[calc(100%-2rem)]">
              {showPreview ? (
                <div className="h-full overflow-auto bg-gray-50 rounded-lg p-4">
                  <MdxPreview content={mdxContent} />
                </div>
              ) : (
                <MdxEditor mdxContent={mdxContent} setMdxContent={setMdxContent} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;