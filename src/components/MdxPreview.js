import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  h1: (props) => <h1 className="text-3xl font-bold my-6" {...props} />,
  h2: (props) => <h2 className="text-2xl font-bold my-4" {...props} />,
  h3: (props) => <h3 className="text-xl font-bold my-3" {...props} />,
  h4: (props) => <h4 className="text-lg font-bold my-2" {...props} />,
  h5: (props) => <h5 className="text-base font-bold my-2" {...props} />,
  h6: (props) => <h6 className="text-sm font-bold my-2" {...props} />,
  p: (props) => <p className="my-4 leading-relaxed" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 my-4 space-y-2" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />,
  li: (props) => <li className="my-1" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-4 border-gray-200 pl-4 my-4 italic" {...props} />
  ),
  code: (props) => (
    <code className="bg-gray-100 rounded px-1 py-0.5 font-mono text-sm" {...props} />
  ),
  pre: (props) => (
    <pre className="bg-gray-100 rounded p-4 my-4 overflow-auto font-mono text-sm" {...props} />
  ),
};

const MdxPreview = ({ content }) => (
  <div className="prose max-w-none">
    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
      {content || '*No content to preview*'}
    </ReactMarkdown>
  </div>
);

export default MdxPreview;