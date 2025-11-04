import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { markdown } from '@codemirror/lang-markdown';
import { indentWithTab } from '@codemirror/commands';
import { EditorView } from '@codemirror/view';
import { keymap } from '@codemirror/view';

const CodeMirror = dynamic(
  () => import('@uiw/react-codemirror').then((mod) => mod.default),
  { ssr: false }
);

interface MdxEditorProps {
  mdxContent: string;
  setMdxContent: (content: string) => void;
}

const MdxEditor: React.FC<MdxEditorProps> = ({ mdxContent, setMdxContent }) => {
  const { theme } = useTheme();

  return (
    <div className="h-full rounded-lg border bg-card overflow-hidden">
      <CodeMirror
        value={mdxContent}
        height="100%"
        theme={theme === 'dark' ? githubDark : githubLight}
        extensions={[
          markdown(),
          EditorView.lineWrapping,
          keymap.of([indentWithTab]),
          EditorView.theme({
            '&': {
              fontSize: '14px',
              height: '100%',
            },
            '.cm-gutters': {
              backgroundColor: 'transparent',
              border: 'none',
            },
            '.cm-activeLineGutter': {
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
            },
            '.cm-activeLine': {
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
            },
            '.cm-line': {
              padding: '4px 0',
            },
            '&.cm-focused': {
              outline: 'none',
            },
          }),
        ]}
        onChange={(value) => setMdxContent(value)}
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
