import { useState, useRef, useEffect } from 'react';
import PdfViewer from '../components/PdfViewer';
import MdxEditor from '../components/MdxEditor';
import FileUploader from '../components/FileUploader';
import ProgressBar from '../components/ProgressBar';
import MdxPreview from '../components/MdxPreview';
import { ThemeToggle } from '@/components/theme-toggle';
import { convertPdfToMdx } from '../utils/pdfToMdxConverter';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FadeIn from '@/components/animations/FadeIn';
import gsap from 'gsap';

const HomePage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [mdxContent, setMdxContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      '.header-content',
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  const handlePdfUpload = (file, fileName) => {
    setPdfFile(file);
    setPdfFileName(fileName);
    setMdxContent('');
    setProgress(0);
    
    gsap.fromTo(
      '.upload-feedback',
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out' }
    );
  };

  const handleConvert = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const content = await convertPdfToMdx(pdfFile, setProgress);
      setMdxContent(content);
      setShowPreview(false);
      
      gsap.fromTo(
        '.conversion-complete',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out' }
      );
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
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between header-content">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">PDF to MDX</h1>
              <span className="text-sm text-muted-foreground">Converter</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8" ref={mainRef}>
        <FadeIn delay={0.2}>
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileUploader onPdfUpload={handlePdfUpload} fileInputRef={fileInputRef} />
                  <Button
                    variant="outline"
                    onClick={handleClearPdf}
                    disabled={!pdfFile && !mdxContent}
                    className="transition-colors"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConvert}
                    disabled={!pdfFile || isProcessing}
                    className="relative overflow-hidden font-medium"
                  >
                    {isProcessing ? 'Converting...' : 'Convert to MDX'}
                    {isProcessing && (
                      <span className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleTogglePreview}
                    disabled={!mdxContent}
                    className="font-medium"
                  >
                    {showPreview ? 'Edit MDX' : 'Preview MDX'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveMdx}
                    disabled={!mdxContent}
                    className="font-medium"
                  >
                    Save MDX
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleClearEditor}
                    disabled={!mdxContent}
                    className="font-medium"
                  >
                    Clear Editor
                  </Button>
                </div>
              </div>
              {isProcessing && <ProgressBar progress={progress} />}
            </CardContent>
          </Card>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FadeIn delay={0.4}>
            <Card className="min-h-[600px] transition-all duration-200 hover:shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-semibold">PDF Preview</CardTitle>
                {pdfFileName && (
                  <p className="text-sm text-muted-foreground upload-feedback">{pdfFileName}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="h-[calc(100%-2rem)] overflow-auto rounded-lg">
                  {pdfFile ? (
                    <PdfViewer pdfUrl={pdfFile} />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted/50 rounded-lg border-2 border-dashed">
                      <p className="text-muted-foreground">Upload a PDF file to begin</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.6}>
            <Card className="min-h-[600px] transition-all duration-200 hover:shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-semibold conversion-complete">
                  {showPreview ? 'MDX Preview' : 'MDX Editor'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {showPreview ? 'Preview your MDX content' : 'Edit your MDX content'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[calc(100%-2rem)]">
                  {showPreview ? (
                    <div className="h-full overflow-auto bg-muted/50 rounded-lg p-6">
                      <MdxPreview content={mdxContent} />
                    </div>
                  ) : (
                    <MdxEditor mdxContent={mdxContent} setMdxContent={setMdxContent} />
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </main>
    </div>
  );
};

export default HomePage;