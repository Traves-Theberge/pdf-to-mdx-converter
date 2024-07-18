import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import ReactMarkdown from 'react-markdown';

const components = {
  h1: (props) => <h1 className="text-2xl font-bold my-4" {...props} />,
  h2: (props) => <h2 className="text-xl font-bold my-3" {...props} />,
  h3: (props) => <h3 className="text-lg font-bold my-2" {...props} />,
  h4: (props) => <h4 className="text-md font-bold my-1" {...props} />,
  h5: (props) => <h5 className="text-sm font-bold my-1" {...props} />,
  h6: (props) => <h6 className="text-xs font-bold my-1" {...props} />,
  p: (props) => <p className="my-2" {...props} />,
  blockquote: (props) => <blockquote className="border-l-4 pl-4 italic my-4" {...props} />,
  ul: (props) => <ul className="list-disc pl-6 my-2" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-2" {...props} />,
  code: (props) => <code className="bg-gray-100 p-1 rounded" {...props} />,
  pre: (props) => <pre className="bg-gray-800 text-white p-4 rounded" {...props} />,
  a: (props) => <a className="text-blue-600 hover:underline" {...props} />,
  img: (props) => <img className="max-w-full h-auto my-4" {...props} />,
};

const MdxPreview = ({ content }) => (
  <div className="mt-4">
    <h2 className="text-xl font-bold mb-2">MDX Preview</h2>
    <div className="border p-4">
      <MDXProvider components={components}>
        <ReactMarkdown
          children={content}
          remarkPlugins={[remarkGfm, remarkBreaks]}
        />
      </MDXProvider>
    </div>
  </div>
);

export default MdxPreview;
