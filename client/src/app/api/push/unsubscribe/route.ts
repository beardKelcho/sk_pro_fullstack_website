import { NextResponse } from 'next/server';
import apiClient from '@/services/api/axios';

/**
 * Push subscription sil
 * Backend API'ye proxy eder
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || 'Push subscription silinemedi' },
      { status: error.response?.status || 500 }
    );
  }
} 