import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  h1: props => <h1 className="text-3xl font-bold mb-6 text-gray-900" {...props} />,
  h2: props => <h2 className="text-2xl font-bold mb-4 text-gray-900" {...props} />,
  h3: props => <h3 className="text-xl font-bold mb-3 text-gray-900" {...props} />,
  h4: props => <h4 className="text-lg font-bold mb-2 text-gray-900" {...props} />,
  h5: props => <h5 className="text-base font-bold mb-2 text-gray-900" {...props} />,
  h6: props => <h6 className="text-sm font-bold mb-2 text-gray-900" {...props} />,
  p: props => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
  ul: props => <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700" {...props} />,
  ol: props => <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700" {...props} />,
  li: props => <li className="mb-1" {...props} />,
  blockquote: props => (
    <blockquote className="border-l-4 border-gray-200 pl-4 mb-4 italic text-gray-600" {...props} />
  ),
  code: props => (
    <code className="bg-gray-50 rounded px-1.5 py-0.5 font-mono text-sm text-gray-800" {...props} />
  ),
  pre: props => (
    <pre className="bg-gray-50 rounded-lg p-4 mb-4 overflow-auto font-mono text-sm text-gray-800" {...props} />
  ),
};

const MdxPreview = ({ content }) => (
  <div className="prose max-w-none">
    <ReactMarkdown 
      components={components} 
      remarkPlugins={[remarkGfm]}
    >
      {content || '*No content to preview*'}
    </ReactMarkdown>
  </div>
);

export default MdxPreview;