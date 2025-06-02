import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const FileUploader = ({ onPdfUpload, fileInputRef }) => {
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
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  return (
    <div className="relative">
      <div
        {...getRootProps()}
        className={`relative cursor-pointer transition-colors ${
          isDragActive ? 'opacity-70' : ''
        }`}
      >
        <input {...getInputProps({ ref: fileInputRef })} />
        <Button variant="outline" className="font-medium gap-2">
          <Upload size={16} />
          Choose PDF file
        </Button>
      </div>
    </div>
  );
};

export default FileUploader;