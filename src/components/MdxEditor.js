// src/components/MdxEditor.js
import React from 'react';
import dynamic from 'next/dynamic';

const CodeMirror = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  { ssr: false }
);

const MdxEditor = ({ mdxContent, setMdxContent }) => {
  return (
    <CodeMirror
      value={mdxContent}
      height="100%"
      onChange={(value) => setMdxContent(value)}
      className="flex-grow border rounded mb-4"
    />
  );
};

export default MdxEditor;
