import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const FileUploader = ({ onPdfUpload, fileInputRef }) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        onPdfUpload(e.target.result, file.name);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  return (
    <div className="relative">
      <AnimatePresence>
        {(isDragActive || isDragging) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 -m-4 rounded-lg border-2 border-primary border-dashed bg-primary/5 z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>
      <div {...getRootProps()} className="relative">
        <input {...getInputProps()} ref={fileInputRef} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              className="font-medium gap-2 relative overflow-hidden"
              type="button"
            >
              <Upload size={16} className="text-muted-foreground" />
              Choose PDF file
              {(isDragActive || isDragging) && (
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
    </div>
  );
};

export default FileUploader;