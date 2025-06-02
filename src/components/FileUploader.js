import React from 'react';
import { Button } from '@/components/ui/button';

const FileUploader = ({ onPdfUpload, fileInputRef }) => {
  const handlePdfChange = (event) => {
    const file = event.target.files[0];
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

  return (
    <div className="relative">
      <input
        type="file"
        accept="application/pdf"
        onChange={handlePdfChange}
        ref={fileInputRef}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <Button variant="outline" className="font-medium">
        Choose PDF file
      </Button>
    </div>
  );
};

export default FileUploader;