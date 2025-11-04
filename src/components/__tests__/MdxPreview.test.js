import React from 'react';
import { render, screen } from '@testing-library/react';
import MdxPreview from '../MdxPreview';

describe('MdxPreview', () => {
  it('renders markdown content correctly', () => {
    const content = '# Hello World';
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
    const content = 'This is a paragraph.';
    render(<MdxPreview content={content} />);
    expect(screen.getByText('This is a paragraph.')).toBeInTheDocument();
  });

  it('renders lists correctly', () => {
    const content = '- Item 1\n- Item 2\n- Item 3';
    render(<MdxPreview content={content} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it('renders code blocks', () => {
    const content = '```javascript\nconst x = 5;\n```';
    render(<MdxPreview content={content} />);
    expect(screen.getByText(/const x = 5/)).toBeInTheDocument();
  });
});
