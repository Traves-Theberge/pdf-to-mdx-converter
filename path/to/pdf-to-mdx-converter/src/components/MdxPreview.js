import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MDXProvider } from '@mdx-js/react';

const MdxPreview = ({ content }) => (
  <div className="mt-4">
    <h2 className="text-xl font-bold mb-2">MDX Preview</h2>
    <div className="border p-4">
      <MDXProvider>
        <ReactMarkdown>{content}</ReactMarkdown>
      </MDXProvider>
    </div>
  </div>
);

export default MdxPreview;
