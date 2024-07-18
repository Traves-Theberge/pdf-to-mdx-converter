// src/components/MdxPreview.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  h1: (props) => <h1 className="text-2xl font-bold my-4" {...props} />,
  h2: (props) => <h2 className="text-xl font-bold my-3" {...props} />,
  h3: (props) => <h3 className="text-lg font-bold my-2" {...props} />,
  h4: (props) => <h4 className="text-md font-bold my-1" {...props} />,
  h5: (props) => <h5 className="text-sm font-bold my-1" {...props} />,
  h6: (props) => <h6 className="text-xs font-bold my-1" {...props} />,
  p: (props) => <p className="my-2" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 my-2" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-2" {...props} />,
  li: (props) => <li className="my-1" {...props} />,
};

const MdxPreview = ({ content }) => (
  <div className="mt-4">
    <h2 className="text-xl font-bold mb-2">MDX Preview</h2>
    <div className="border p-4">
      <ReactMarkdown 
        components={components}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  </div>
);

export default MdxPreview;
