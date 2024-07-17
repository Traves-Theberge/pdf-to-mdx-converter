"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MDXProvider } from '@mdx-js/react';

const MdxEditor = ({ mdxContent, setMdxContent }) => {
  return (
    <div className="mdx-editor">
      <textarea
        value={mdxContent}
        onChange={(e) => setMdxContent(e.target.value)}
        className="mdx-textarea"
        placeholder="Write your MDX here..."
      />
      <div className="mdx-preview">
        <MDXProvider>
          <ReactMarkdown>{mdxContent}</ReactMarkdown>
        </MDXProvider>
      </div>
    </div>
  );
};

export default MdxEditor;
