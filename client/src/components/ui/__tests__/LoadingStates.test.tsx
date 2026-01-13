import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  LoadingSpinner,
  LoadingSkeleton,
  LoadingOverlay,
  LoadingButton,
  LoadingCard,
} from '../LoadingStates';

describe('LoadingStates', () => {
  describe('LoadingSpinner', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-8 h-8', 'text-blue-600');
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />);
      expect(screen.getByRole('status')).toHaveClass('w-4 h-4');

      rerender(<LoadingSpinner size="lg" />);
      expect(screen.getByRole('status')).toHaveClass('w-12 h-12');
    });

    it('renders with different colors', () => {
      const { rerender } = render(<LoadingSpinner color="secondary" />);
      expect(screen.getByRole('status')).toHaveClass('text-gray-600');

      rerender(<LoadingSpinner color="white" />);
      expect(screen.getByRole('status')).toHaveClass('text-white');
    });
  });

  describe('LoadingSkeleton', () => {
    it('renders single skeleton by default', () => {
      render(<LoadingSkeleton className="h-4 w-4" />);
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(1);
    });

    it('renders multiple skeletons when count is specified', () => {
      render(<LoadingSkeleton className="h-4 w-4" count={3} />);
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('LoadingOverlay', () => {
    it('renders children when not loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div>Content</div>
        </LoadingOverlay>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renders spinner when loading', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div>Content</div>
        </LoadingOverlay>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('LoadingButton', () => {
    it('renders button with content when not loading', () => {
      render(
        <LoadingButton isLoading={false}>
          Click me
        </LoadingButton>
      );
      expect(screen.getByText('Click me')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renders loading state when loading', () => {
      render(
        <LoadingButton isLoading={true}>
          Click me
        </LoadingButton>
      );
      expect(screen.getByText('Click me')).toHaveClass('invisible');
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      render(
        <LoadingButton isLoading={true}>
          Click me
        </LoadingButton>
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('LoadingCard', () => {
    it('renders children when not loading', () => {
      render(
        <LoadingCard isLoading={false}>
          <div>Card Content</div>
        </LoadingCard>
      );
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('renders skeleton loading state when loading', () => {
      render(
        <LoadingCard isLoading={true}>
          <div>Card Content</div>
        </LoadingCard>
      );
      expect(screen.queryByText('Card Content')).not.toBeInTheDocument();
      const skeletons = screen.getAllByRole('status');
      expect(skeletons).toHaveLength(4);
    });
  });
}); 