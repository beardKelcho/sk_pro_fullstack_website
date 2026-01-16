import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportMenu from '@/components/admin/ExportMenu';
import apiClient from '@/services/api/axios';
import { toast } from 'react-toastify';

/**
 * @jest-environment jsdom
 */

// Mock dependencies
jest.mock('@/services/api/axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock window.URL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement (anchor element valid DOM olmalı, yoksa appendChild patlar)
const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName: string) => {
  const el = originalCreateElement(tagName) as any;
  if (tagName === 'a') {
    el.click = jest.fn();
    el.remove = jest.fn();
  }
  return el;
});

describe('ExportMenu Component', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
  const defaultProps = {
    baseEndpoint: '/api/export/equipment',
    baseFilename: 'equipment',
    label: 'Dışa Aktar',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render export button', () => {
    render(<ExportMenu {...defaultProps} />);
    expect(screen.getByText('Dışa Aktar')).toBeInTheDocument();
  });

  it('should open dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByText('Dışa Aktar');
    await user.click(button);

    expect(screen.getByText('CSV olarak dışa aktar')).toBeInTheDocument();
    expect(screen.getByText('Excel olarak dışa aktar')).toBeInTheDocument();
    expect(screen.getByText('PDF olarak dışa aktar')).toBeInTheDocument();
  });

  it('should export CSV when CSV option is clicked', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['test csv data']);
    mockApiClient.get.mockResolvedValue({
      data: mockBlob,
    } as any);

    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByText('Dışa Aktar');
    await user.click(button);

    const csvOption = screen.getByText('CSV olarak dışa aktar');
    await user.click(csvOption);

    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/export/equipment/csv',
        { responseType: 'blob' }
      );
      expect(toast.success).toHaveBeenCalledWith('CSV formatında dışa aktarma başarılı');
    });
  });

  it('should export Excel when Excel option is clicked', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['test excel data']);
    mockApiClient.get.mockResolvedValue({
      data: mockBlob,
    } as any);

    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByText('Dışa Aktar');
    await user.click(button);

    const excelOption = screen.getByText('Excel olarak dışa aktar');
    await user.click(excelOption);

    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/export/equipment/excel',
        { responseType: 'blob' }
      );
      expect(toast.success).toHaveBeenCalledWith('EXCEL formatında dışa aktarma başarılı');
    });
  });

  it('should export PDF when PDF option is clicked', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['test pdf data']);
    mockApiClient.get.mockResolvedValue({
      data: mockBlob,
    } as any);

    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByText('Dışa Aktar');
    await user.click(button);

    const pdfOption = screen.getByText('PDF olarak dışa aktar');
    await user.click(pdfOption);

    await waitFor(() => {
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/export/equipment/pdf',
        { responseType: 'blob' }
      );
      expect(toast.success).toHaveBeenCalledWith('PDF formatında dışa aktarma başarılı');
    });
  });

  it('should show loading state during export', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['test data']);
    
    // Delay the response to test loading state
    mockApiClient.get.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ data: mockBlob } as any);
          }, 100);
        })
    );

    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByText('Dışa Aktar');
    await user.click(button);

    const csvOption = screen.getByText('CSV olarak dışa aktar');
    await user.click(csvOption);

    // Check loading state
    expect(screen.getByText('Dışa Aktarılıyor...')).toBeInTheDocument();
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Dışa Aktarılıyor...')).not.toBeInTheDocument();
    });
  });

  it('should handle export errors', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Export failed';
    mockApiClient.get.mockRejectedValue({
      response: { data: { message: errorMessage } },
      message: errorMessage,
    });

    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByText('Dışa Aktar');
    await user.click(button);

    const csvOption = screen.getByText('CSV olarak dışa aktar');
    await user.click(csvOption);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should close dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(<ExportMenu {...defaultProps} />);

    const button = screen.getByText('Dışa Aktar');
    await user.click(button);

    expect(screen.getByText('CSV olarak dışa aktar')).toBeInTheDocument();

    // Click outside (on the backdrop)
    const backdrop = document.querySelector('.fixed.inset-0.z-10');
    if (backdrop) {
      await user.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByText('CSV olarak dışa aktar')).not.toBeInTheDocument();
    });
  });

  it('should use custom label when provided', () => {
    render(<ExportMenu {...defaultProps} label="Export Data" />);
    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });
});

