/**
 * Contact Form Component Testleri
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactForm from '@/components/common/ContactForm';

// Mock fetch
global.fetch = jest.fn();

describe('ContactForm Component Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('form render edilmeli', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/isim|name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta|email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mesaj|message/i)).toBeInTheDocument();
  });

  it('form validasyonu çalışmalı', async () => {
    render(<ContactForm />);
    
    // Buton text'i translation key'inden geliyor, type="submit" ile bul
    const submitButton = screen.getByRole('button', { name: /submit|gönder/i }) || 
                        screen.getByRole('button', { type: 'submit' });
    fireEvent.click(submitButton);

    // HTML5 validation çalışacak, hata mesajı görünmeyebilir ama form submit edilmeyecek
    await waitFor(() => {
      // Form submit edilmediğini kontrol et (fetch çağrılmamalı)
      expect(global.fetch).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('geçerli form gönderimi çalışmalı', async () => {
    render(<ContactForm />);
    
    const nameInput = screen.getByLabelText(/isim|name/i);
    const emailInput = screen.getByLabelText(/e-posta|email/i);
    const messageInput = screen.getByLabelText(/mesaj|message/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    // Buton text'i translation key'inden geliyor, type="submit" ile bul
    const submitButton = screen.getByRole('button', { name: /submit|gönder/i }) || 
                        screen.getByRole('button', { type: 'submit' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });
});

