import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PushNotificationToggle } from '@/components/PushNotificationToggle';

const subscribeMock = jest.fn();
const unsubscribeMock = jest.fn();

jest.mock('@/hooks/usePushNotifications', () => ({
  usePushNotifications: () => ({
    isSupported: true,
    isSubscribed: false,
    isLoading: false,
    error: null,
    subscribe: subscribeMock,
    unsubscribe: unsubscribeMock,
  }),
}));

describe('PushNotificationToggle', () => {
  it('renders enable button when not subscribed', () => {
    render(<PushNotificationToggle />);
    expect(screen.getByRole('button', { name: /bildirimleri aç/i })).toBeInTheDocument();
  });

  it('calls subscribe on click', () => {
    render(<PushNotificationToggle />);
    fireEvent.click(screen.getByRole('button', { name: /bildirimleri aç/i }));
    expect(subscribeMock).toHaveBeenCalled();
  });
});

