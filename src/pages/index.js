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
    setMdxContent(''); // Clear previous content
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
    setShowPreview((prev) => !prev);
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">PDF to MDX Converter</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <FileUploader onPdfUpload={handlePdfUpload} fileInputRef={fileInputRef} />
                <button
                  onClick={handleClearPdf}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={!pdfFile && !mdxContent}
                >
                  Clear All
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleConvert}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                    isProcessing || !pdfFile
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={!pdfFile || isProcessing}
                >
                  {isProcessing ? 'Converting...' : 'Convert to MDX'}
                </button>
                <button
                  onClick={handleTogglePreview}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    !mdxContent
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                  disabled={!mdxContent}
                >
                  {showPreview ? 'Edit MDX' : 'Preview MDX'}
                </button>
                <button
                  onClick={handleSaveMdx}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    !mdxContent
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  disabled={!mdxContent}
                >
                  Save MDX
                </button>
                <button
                  onClick={handleClearEditor}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    !mdxContent
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                  disabled={!mdxContent}
                >
                  Clear Editor
                </button>
              </div>
            </div>
            {isProcessing && <ProgressBar progress={progress} />}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 min-h-[600px]">
              <h2 className="text-lg font-semibold mb-4">PDF Preview</h2>
              <div className="h-[calc(100%-2rem)] overflow-auto">
                {pdfFile ? (
                  <PdfViewer pdfUrl={pdfFile} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">Upload a PDF file to begin</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 min-h-[600px]">
              <h2 className="text-lg font-semibold mb-4">
                {showPreview ? 'MDX Preview' : 'MDX Editor'}
              </h2>
              <div className="h-[calc(100%-2rem)]">
                {showPreview ? (
                  <div className="h-full overflow-auto bg-gray-50 rounded p-4">
                    <MdxPreview content={mdxContent} />
                  </div>
                ) : (
                  <MdxEditor mdxContent={mdxContent} setMdxContent={setMdxContent} />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;