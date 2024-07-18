import React from 'react';

const FileUploader = ({ onPdfUpload, fileInputRef }) => {
  const handlePdfChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        onPdfUpload(e.target.result, file.name.replace('.pdf', '.mdx'));
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handlePdfChange} ref={fileInputRef} className="mr-2" />
    </div>
  );
};

export default FileUploader;
