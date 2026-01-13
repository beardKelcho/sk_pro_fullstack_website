import { NextResponse } from 'next/server';
import apiClient from '@/services/api/axios';

/**
 * Push subscription kaydet
 * Backend API'ye proxy eder
 */
export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    // Backend API'ye gönder
    const response = await apiClient.post('/push-subscriptions/subscribe', {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || 'Push subscription kaydedilemedi' },
      { status: error.response?.status || 500 }
    );
  }
} 