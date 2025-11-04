import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MdxPreviewProps {
  content?: string;
}

interface ComponentProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

const components = {
  h1: (props: ComponentProps) => <h1 className="text-3xl font-bold mb-6 text-foreground" {...props} />,
  h2: (props: ComponentProps) => <h2 className="text-2xl font-bold mb-4 text-foreground" {...props} />,
  h3: (props: ComponentProps) => <h3 className="text-xl font-bold mb-3 text-foreground" {...props} />,
  h4: (props: ComponentProps) => <h4 className="text-lg font-bold mb-2 text-foreground" {...props} />,
  h5: (props: ComponentProps) => <h5 className="text-base font-bold mb-2 text-foreground" {...props} />,
  h6: (props: ComponentProps) => <h6 className="text-sm font-bold mb-2 text-foreground" {...props} />,
  p: (props: ComponentProps) => <p className="mb-4 leading-relaxed text-muted-foreground" {...props} />,
  ul: (props: ComponentProps) => <ul className="list-disc pl-6 mb-4 space-y-2 text-muted-foreground" {...props} />,
  ol: (props: ComponentProps) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-muted-foreground" {...props} />,
  li: (props: ComponentProps) => <li className="mb-1" {...props} />,
  blockquote: (props: ComponentProps) => (
    <blockquote className="border-l-4 border-border pl-4 mb-4 italic text-muted-foreground" {...props} />
  ),
  code: (props: ComponentProps) => (
    <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm text-foreground" {...props} />
  ),
  pre: (props: ComponentProps) => (
    <pre className="bg-muted rounded-lg p-4 mb-4 overflow-auto font-mono text-sm text-foreground" {...props} />
  ),
};

const MdxPreview: React.FC<MdxPreviewProps> = ({ content }) => (
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
