import React from 'react';

const MdxEditor = ({ mdxContent, setMdxContent }) => {
  const handleChange = (event) => {
    setMdxContent(event.target.value);
  };

  return (
    <textarea
      className="flex-grow p-2 border rounded mb-4"
      value={mdxContent}
      onChange={handleChange}
      placeholder="Edit MDX content here..."
    />
  );
};

export default MdxEditor;
