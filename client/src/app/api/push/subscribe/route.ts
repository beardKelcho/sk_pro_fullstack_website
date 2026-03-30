import { NextResponse } from 'next/server';
import { isAxiosError } from 'axios';
import apiClient from '@/services/api/axios';

interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Push subscription kaydet
 * Backend API'ye proxy eder
 */
export async function POST(request: Request) {
  try {
    const subscription = await request.json() as Partial<PushSubscriptionPayload>;

    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { error: 'Endpoint ve subscription keys gereklidir' },
        { status: 400 }
      );
    }

    // Backend API'ye gönder
    const response = await apiClient.post('/push-subscriptions/subscribe', {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    const status = isAxiosError(error) ? error.response?.status || 500 : 500;
    const message = isAxiosError(error)
      ? error.response?.data?.message || 'Push subscription kaydedilemedi'
      : 'Push subscription kaydedilemedi';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
