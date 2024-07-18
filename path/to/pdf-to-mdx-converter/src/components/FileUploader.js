import React from 'react';

const FileUploader = ({ onPdfUpload, onMdxUpload }) => {
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

  const handleMdxChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/mdx') {
      const reader = new FileReader();
      reader.onload = (e) => {
        onMdxUpload(e.target.result);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid MDX file');
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handlePdfChange} className="mr-2" />
      <input type="file" accept="text/mdx" onChange={handleMdxChange} />
    </div>
  );
};

export default FileUploader;
