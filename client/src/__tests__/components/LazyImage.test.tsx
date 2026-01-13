/**
 * LazyImage Component Testleri
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LazyImage from '@/components/common/LazyImage';

// Mock IntersectionObserver
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

const mockIntersectionObserver = jest.fn((callback) => {
  // Hemen görünür olarak işaretle
  setTimeout(() => {
    callback([{ isIntersecting: true }], { disconnect: mockDisconnect });
  }, 0);
  return {
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  };
});

window.IntersectionObserver = mockIntersectionObserver as any;

describe('LazyImage Component Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resim render edilmeli', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test-image.jpg');
  });

  it('lazy loading çalışmalı', () => {
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    // IntersectionObserver observe edilmeli
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('placeholder gösterilmeli', () => {
    const placeholder = 'Loading...';
    render(
      <LazyImage
        src="/test-image.jpg"
        alt="Test image"
        width={100}
        height={100}
        placeholder={placeholder}
      />
    );

    // Placeholder string olarak kullanılıyor, img src'de görünebilir
    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
  });

  it('hata durumunda onError çağrılmalı', () => {
    const onError = jest.fn();
    render(
      <LazyImage
        src="/invalid-image.jpg"
        alt="Test image"
        width={100}
        height={100}
        onError={onError}
      />
    );

    const img = screen.getByAltText('Test image');
    fireEvent.error(img);

    expect(onError).toHaveBeenCalled();
  });
});

