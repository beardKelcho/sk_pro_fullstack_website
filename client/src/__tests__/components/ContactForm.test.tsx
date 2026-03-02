import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactForm from '@/components/common/ContactForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from '@/services/api/axios';

jest.mock('@/services/api/axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('ContactForm Component Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.post.mockResolvedValue({ data: { success: true } });
  });

  it('form render edilmeli', () => {
    renderWithClient(<ContactForm />);
    expect(screen.getByLabelText('İsim *')).toBeInTheDocument();
    expect(screen.getByLabelText('E-posta *')).toBeInTheDocument();
    expect(screen.getByLabelText('Konu *')).toBeInTheDocument();
    expect(screen.getByLabelText('Mesaj *')).toBeInTheDocument();
  });

  it('form validasyonu çalışmalı', async () => {
    renderWithClient(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: /gönder/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('geçerli form gönderimi çalışmalı', async () => {
    renderWithClient(<ContactForm />);

    // Fill out the form
    const nameInput = screen.getByLabelText('İsim *');
    const emailInput = screen.getByLabelText('E-posta *');
    const subjectInput = screen.getByLabelText('Konu *');
    const messageInput = screen.getByLabelText('Mesaj *');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    const submitButton = screen.getByRole('button', { name: /gönder/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/contact/send', {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message'
      });
    });
  });
});
