import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FileUploader = ({ onPdfUpload, fileInputRef }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        onPdfUpload(e.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }
  }, [onPdfUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
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
          <p>Click to browse or drag and drop a PDF</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default FileUploader;