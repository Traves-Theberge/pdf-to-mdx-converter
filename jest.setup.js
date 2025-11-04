// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import React from 'react'

// Mock react-markdown to avoid ESM import issues
// This mock provides basic markdown rendering for tests
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children, components }) {
    if (!children) return null;

    const content = children.toString();

    // Handle headings
    const h1Match = content.match(/^# (.+)$/m);
    if (h1Match && components?.h1) {
      return React.createElement(components.h1, {}, h1Match[1]);
    }
    if (h1Match) {
      return React.createElement('h1', {}, h1Match[1]);
    }

    const h2Match = content.match(/^## (.+)$/m);
    if (h2Match && components?.h2) {
      return React.createElement(components.h2, {}, h2Match[1]);
    }
    if (h2Match) {
      return React.createElement('h2', {}, h2Match[1]);
    }

    const h3Match = content.match(/^### (.+)$/m);
    if (h3Match && components?.h3) {
      return React.createElement(components.h3, {}, h3Match[1]);
    }
    if (h3Match) {
      return React.createElement('h3', {}, h3Match[1]);
    }

    // Handle lists
    const listItems = content.match(/^[•\-\*] (.+)$/gm);
    if (listItems) {
      const ListComponent = components?.ul || 'ul';
      const ItemComponent = components?.li || 'li';
      return React.createElement(
        ListComponent,
        {},
        listItems.map((item, i) => {
          const text = item.replace(/^[•\-\*] /, '');
          return React.createElement(ItemComponent, { key: i }, text);
        })
      );
    }

    // Handle code blocks
    const codeMatch = content.match(/```(?:\w+)?\n(.+?)\n```/s);
    if (codeMatch) {
      const PreComponent = components?.pre || 'pre';
      const CodeComponent = components?.code || 'code';
      return React.createElement(
        PreComponent,
        {},
        React.createElement(CodeComponent, {}, codeMatch[1])
      );
    }

    // Handle default message
    if (content === '*No content to preview*') {
      return React.createElement('em', {}, 'No content to preview');
    }

    // Handle paragraphs
    const ParagraphComponent = components?.p || 'p';
    return React.createElement(ParagraphComponent, {}, content);
  };
});

jest.mock('remark-gfm', () => {
  return function remarkGfm() {
    return () => {};
  };
});
