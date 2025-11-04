import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders with the correct progress percentage', () => {
    render(<ProgressBar progress={50} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders with 0% progress', () => {
    render(<ProgressBar progress={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders with 100% progress', () => {
    render(<ProgressBar progress={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders "Converting PDF" text', () => {
    render(<ProgressBar progress={75} />);
    expect(screen.getByText('Converting PDF')).toBeInTheDocument();
  });

  it('rounds decimal progress to nearest integer', () => {
    render(<ProgressBar progress={45.7} />);
    expect(screen.getByText('46%')).toBeInTheDocument();
  });
});
