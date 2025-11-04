import { useState, useRef, useEffect } from 'react';
import PdfViewer from '../components/PdfViewer';
import MdxEditor from '../components/MdxEditor';
import FileUploader from '../components/FileUploader';
import ProgressBar from '../components/ProgressBar';
import MdxPreview from '../components/MdxPreview';
import ConfirmDialog from '../components/ConfirmDialog';
import { Toaster } from '../components/ErrorToast';
import { ThemeToggle } from '@/components/theme-toggle';
import { convertPdfToMdx } from '../utils/pdfToMdxConverter';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FadeIn from '@/components/animations/FadeIn';
import { TooltipProvider } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Save, FileX, Eye, Edit, RefreshCw } from 'lucide-react';

const HomePage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [mdxContent, setMdxContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null });
  const fileInputRef = useRef(null);
  const mainRef = useRef(null);
  const { toast } = useToast();

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

  const handleUploadError = (errorMessage) => {
    toast({
      variant: "destructive",
      title: "Upload Error",
      description: errorMessage,
    });
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
      toast({
        variant: "destructive",
        title: "Conversion Error",
        description: "An error occurred while processing the PDF. Please try again.",
      });
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
    setConfirmDialog({
      open: true,
      type: 'clearEditor',
      title: 'Clear Editor Content',
      description: 'Are you sure you want to clear the editor content? This action cannot be undone.',
    });
  };

  const handleClearPdf = () => {
    setConfirmDialog({
      open: true,
      type: 'clearAll',
      title: 'Clear All Content',
      description: 'Are you sure you want to clear all content? This will remove the PDF file and MDX content.',
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.type === 'clearEditor') {
      setMdxContent('');
    } else if (confirmDialog.type === 'clearAll') {
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
    setConfirmDialog({ open: false, type: null });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Toaster />
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={handleConfirmAction}
          confirmText="Yes, clear"
          variant="destructive"
        />
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
                    <FileUploader
                      onPdfUpload={handlePdfUpload}
                      fileInputRef={fileInputRef}
                      onError={handleUploadError}
                    />
                    <Button
                      variant="outline"
                      onClick={handleClearPdf}
                      disabled={!pdfFile && !mdxContent}
                      className="transition-colors gap-2"
                    >
                      <FileX size={16} className="text-muted-foreground" />
                      Clear All
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isProcessing ? 'processing' : 'convert'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Button
                          onClick={handleConvert}
                          disabled={!pdfFile || isProcessing}
                          className="relative overflow-hidden font-medium gap-2"
                        >
                          {isProcessing ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : null}
                          {isProcessing ? 'Converting...' : 'Convert to MDX'}
                        </Button>
                      </motion.div>
                    </AnimatePresence>
                    <Button
                      variant="secondary"
                      onClick={handleTogglePreview}
                      disabled={!mdxContent}
                      className="font-medium gap-2"
                    >
                      {showPreview ? (
                        <>
                          <Edit size={16} />
                          Edit MDX
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          Preview
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSaveMdx}
                      disabled={!mdxContent}
                      className="font-medium gap-2"
                    >
                      <Save size={16} className="text-muted-foreground" />
                      Save MDX
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleClearEditor}
                      disabled={!mdxContent}
                      className="font-medium gap-2"
                    >
                      <FileX size={16} />
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
                    <AnimatePresence mode="wait">
                      {showPreview ? (
                        <motion.div
                          key="preview"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="h-full overflow-auto bg-muted/50 rounded-lg p-6"
                        >
                          <MdxPreview content={mdxContent} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="editor"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <MdxEditor mdxContent={mdxContent} setMdxContent={setMdxContent} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

export default HomePage;