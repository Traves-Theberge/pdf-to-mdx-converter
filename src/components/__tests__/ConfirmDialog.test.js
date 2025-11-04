import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open is true', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Test Title"
        description="Test Description"
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders with custom button text', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Delete Item"
        onConfirm={mockOnConfirm}
        confirmText="Delete"
        cancelText="Keep"
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Confirm Action"
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders without description', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        title="Title Only"
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('Title Only')).toBeInTheDocument();
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });
});
