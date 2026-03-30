import { NextResponse } from 'next/server';
import { isAxiosError } from 'axios';
import apiClient from '@/services/api/axios';

interface PushUnsubscribePayload {
  endpoint?: string;
}

/**
 * Push subscription sil
 * Backend API'ye proxy eder
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as PushUnsubscribePayload;
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint gereklidir' },
        { status: 400 }
      );
    }

    // Backend API'ye gönder
    const response = await apiClient.delete(`/push-subscriptions/unsubscribe`, {
      data: { endpoint },
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: unknown) {
    const status = isAxiosError(error) ? error.response?.status || 500 : 500;
    const message = isAxiosError(error)
      ? error.response?.data?.message || 'Push subscription silinemedi'
      : 'Push subscription silinemedi';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
