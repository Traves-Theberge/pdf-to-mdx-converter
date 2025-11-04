import React from 'react';
import { render, screen } from '@testing-library/react';
import MdxPreview from '../MdxPreview';

// Mock remark-gfm to avoid ESM import issues in Jest
jest.mock('remark-gfm', () => {
  return () => {};
});

// Mock react-markdown to avoid ESM import issues in Jest
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children, components }) {
    // Simple markdown parser for testing
    const content = children || '';

    // Handle headings
    if (content.startsWith('# ')) {
      const Component = components?.h1 || 'h1';
      return <Component>{content.replace('# ', '')}</Component>;
    }

    // Handle code blocks
    if (content.includes('```')) {
      const codeMatch = content.match(/```\w*\n([\s\S]*?)\n```/);
      if (codeMatch) {
        const Component = components?.code || 'code';
        return <Component>{codeMatch[1]}</Component>;
      }
    }

    // Handle lists
    if (content.includes('\n- ')) {
      const items = content.split('\n').filter(line => line.startsWith('- '));
      const Li = components?.li || 'li';
      const Ul = components?.ul || 'ul';
      return (
        <Ul>
          {items.map((item, i) => (
            <Li key={i}>{item.replace('- ', '')}</Li>
          ))}
        </Ul>
      );
    }

    // Default paragraph
    const Component = components?.p || 'p';
    return <Component>{content}</Component>;
  };
});

describe('MdxPreview', () => {
  it('renders markdown content correctly', () => {
    const content: string = '# Hello World';
    render(<MdxPreview content={content} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Hello World');
  });

  it('renders default message when no content provided', () => {
    render(<MdxPreview content="" />);
    expect(screen.getByText(/No content to preview/i)).toBeInTheDocument();
  });

  it('renders null content with default message', () => {
    render(<MdxPreview content={null} />);
    expect(screen.getByText(/No content to preview/i)).toBeInTheDocument();
  });

  it('renders paragraph text', () => {
    const content: string = 'This is a paragraph.';
    render(<MdxPreview content={content} />);
    expect(screen.getByText('This is a paragraph.')).toBeInTheDocument();
  });

  it('renders lists correctly', () => {
    const content: string = '- Item 1\n- Item 2\n- Item 3';
    render(<MdxPreview content={content} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders code blocks', () => {
    const content: string = '```javascript\nconst x = 5;\n```';
    render(<MdxPreview content={content} />);
    expect(screen.getByText(/const x = 5/)).toBeInTheDocument();
  });
});
