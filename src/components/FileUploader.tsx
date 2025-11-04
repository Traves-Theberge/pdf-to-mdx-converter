import React, { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileUploaderProps {
  onPdfUpload: (fileData: string, fileName: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onError?: (message: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onPdfUpload, fileInputRef, onError }) => {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        onError?.('File is too large. Maximum file size is 10MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        onError?.('Invalid file type. Please upload a PDF file.');
      } else {
        onError?.('File upload failed. Please try again.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      // Double-check file size (belt and suspenders approach)
      if (file.size > MAX_FILE_SIZE) {
        onError?.('File is too large. Maximum file size is 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          onPdfUpload(e.target.result as string, file.name);
        }
      };
      reader.onerror = () => {
        onError?.('Failed to read file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  }, [onPdfUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    noClick: true,
  });

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div {...getRootProps()} className="relative">
      <AnimatePresence>
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 -m-4 rounded-lg border-2 border-primary border-dashed bg-primary/5 z-50"
          />
        )}
      </AnimatePresence>

      <input
        {...getInputProps()}
        ref={fileInputRef}
        className="hidden"
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            className="relative font-medium gap-2"
          >
            <Upload className="w-4 h-4" />
            Choose PDF file
            {isDragActive && (
              <motion.div
                className="absolute inset-0 bg-primary/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to browse or drag and drop a PDF (max 10MB)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default FileUploader;
