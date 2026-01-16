import React, { useState } from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage, ErrorCard } from '../ErrorStates';
import ErrorBoundary from '@/components/common/ErrorBoundary';

describe('ErrorStates', () => {
  describe('ErrorMessage', () => {
    it('renders with default title', () => {
      render(<ErrorMessage message="Test error message" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Hata Oluştu')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<ErrorMessage title="Custom Title" message="Test error message" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided', async () => {
      const handleRetry = jest.fn();
      render(<ErrorMessage message="Test error" onRetry={handleRetry} />);
      
      const retryButton = screen.getByText('Tekrar Dene');
      await userEvent.click(retryButton);
      
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
      const { container } = render(
        <ErrorMessage message="Test error" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('ErrorCard', () => {
    it('renders with default title', () => {
      render(<ErrorCard message="Test error message" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Hata Oluştu')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<ErrorCard title="Custom Title" message="Test error message" />);
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided', async () => {
      const handleRetry = jest.fn();
      render(<ErrorCard message="Test error" onRetry={handleRetry} />);
      
      const retryButton = screen.getByText('Tekrar Dene');
      await userEvent.click(retryButton);
      
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('applies custom className', () => {
      const { container } = render(
        <ErrorCard message="Test error" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('ErrorBoundary', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('renders children when no error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <div>Test Content</div>
        </ErrorBoundary>
      );

      expect(getByText('Test Content')).toBeInTheDocument();
    });

    it('renders fallback UI when error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(getByText('Bir Hata Oluştu')).toBeInTheDocument();
      expect(getByText('Test error')).toBeInTheDocument();
    });

    it('renders reload button when error occurs', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /sayfayı yenile/i })).toBeInTheDocument();
    });
  });
}); 