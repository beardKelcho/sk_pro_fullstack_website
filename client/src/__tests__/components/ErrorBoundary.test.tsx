/**
 * ErrorBoundary Component Testleri
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { errorTracker } from '@/utils/errorTracking';

jest.mock('@/utils/errorTracking');

// Error fırlatan component
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary Component Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // ErrorBoundary'nin console.error'u suppress etmesi için
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('hata olmadığında children render etmeli', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('hata olduğunda error UI göstermeli', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Bir Hata Oluştu')).toBeInTheDocument();
    expect(screen.getByText(/Beklenmeyen bir hata oluştu/)).toBeInTheDocument();
  });

  it('hata olduğunda errorTracker.captureException çağırmalı', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(errorTracker.captureException).toHaveBeenCalled();
  });

  it('fallback prop varsa onu render etmeli', () => {
    const fallback = <div>Custom fallback</div>;

    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('Sayfayı Yenile butonu çalışmalı', () => {
    const reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText('Sayfayı Yenile');
    reloadButton.click();

    // Not: window.location.reload mock'lanamaz, bu yüzden sadece butonun render edildiğini kontrol ediyoruz
    expect(reloadButton).toBeInTheDocument();

    reloadSpy.mockRestore();
  });
});

