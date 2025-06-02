import { useState, useRef } from 'react';
import PdfViewer from '../components/PdfViewer';
import MdxEditor from '../components/MdxEditor';
import FileUploader from '../components/FileUploader';
import ProgressBar from '../components/ProgressBar';
import MdxPreview from '../components/MdxPreview';
import { convertPdfToMdx } from '../utils/pdfToMdxConverter';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-6">
          <h1 className="text-2xl font-bold">PDF to MDX Converter</h1>
        </div>
      </header>

      <main className="container py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <FileUploader onPdfUpload={handlePdfUpload} fileInputRef={fileInputRef} />
                <Button
                  variant="outline"
                  onClick={handleClearPdf}
                  disabled={!pdfFile && !mdxContent}
                >
                  Clear All
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleConvert}
                  disabled={!pdfFile || isProcessing}
                >
                  {isProcessing ? 'Converting...' : 'Convert to MDX'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleTogglePreview}
                  disabled={!mdxContent}
                >
                  {showPreview ? 'Edit MDX' : 'Preview MDX'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveMdx}
                  disabled={!mdxContent}
                >
                  Save MDX
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearEditor}
                  disabled={!mdxContent}
                >
                  Clear Editor
                </Button>
              </div>
            </div>
            {isProcessing && <ProgressBar progress={progress} />}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="min-h-[600px]">
            <CardHeader>
              <CardTitle>PDF Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[calc(100%-2rem)] overflow-auto">
                {pdfFile ? (
                  <PdfViewer pdfUrl={pdfFile} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">Upload a PDF file to begin</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[600px]">
            <CardHeader>
              <CardTitle>{showPreview ? 'MDX Preview' : 'MDX Editor'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[calc(100%-2rem)]">
                {showPreview ? (
                  <div className="h-full overflow-auto bg-muted rounded-lg p-4">
                    <MdxPreview content={mdxContent} />
                  </div>
                ) : (
                  <MdxEditor mdxContent={mdxContent} setMdxContent={setMdxContent} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HomePage;