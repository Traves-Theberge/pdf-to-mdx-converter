import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  h1: props => <h1 className="text-3xl font-bold mb-6 text-foreground" {...props} />,
  h2: props => <h2 className="text-2xl font-bold mb-4 text-foreground" {...props} />,
  h3: props => <h3 className="text-xl font-bold mb-3 text-foreground" {...props} />,
  h4: props => <h4 className="text-lg font-bold mb-2 text-foreground" {...props} />,
  h5: props => <h5 className="text-base font-bold mb-2 text-foreground" {...props} />,
  h6: props => <h6 className="text-sm font-bold mb-2 text-foreground" {...props} />,
  p: props => <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />,
  ul: props => <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground" {...props} />,
  ol: props => <ol className="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground" {...props} />,
  li: props => <li className="mb-1" {...props} />,
  blockquote: props => (
    <blockquote className="border-l-4 border-border pl-4 mb-4 italic text-muted-foreground" {...props} />
  ),
  code: props => (
    <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm text-foreground" {...props} />
  ),
  pre: props => (
    <pre className="bg-muted rounded-lg p-4 mb-4 overflow-auto font-mono text-sm text-foreground" {...props} />
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

MdxPreview.propTypes = {
  content: PropTypes.string,
};

export default MdxPreview;