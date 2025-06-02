import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { markdown } from '@codemirror/lang-markdown';

const CodeMirror = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  { ssr: false }
);

const MdxEditor = ({ mdxContent, setMdxContent }) => {
  const { theme } = useTheme();

  return (
    <div className="h-full rounded-lg border bg-card overflow-hidden">
      <CodeMirror
        value={mdxContent}
        height="100%"
        theme={theme === 'dark' ? githubDark : githubLight}
        extensions={[markdown()]}
        onChange={(value) => setMdxContent(value)}
        className="text-sm"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightSelectionMatches: true,
          foldKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          completionKeymap: true,
        }}
      />
    </div>
  );
};

export default MdxEditor;