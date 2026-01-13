import { NextResponse } from 'next/server';
import apiClient from '@/services/api/axios';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};
    
    if (searchParams.get('metric')) params.metric = searchParams.get('metric')!;
    if (searchParams.get('startDate')) params.startDate = searchParams.get('startDate')!;
    if (searchParams.get('endDate')) params.endDate = searchParams.get('endDate')!;

    // Backend API'ye gönder
    const response = await apiClient.get('/performance/metrics', { params });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || 'Performance metrics alınamadı' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Backend API'ye gönder
    const response = await apiClient.post('/performance/metrics', body);

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || 'Performance metric kaydedilemedi' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metricId = searchParams.get('id');

    if (!metricId) {
      return NextResponse.json(
        { error: 'Metric ID gereklidir' },
        { status: 400 }
      );
    }

    // Backend API'ye gönder
    const response = await apiClient.delete(`/performance/metrics/${metricId}`);

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.message || 'Performance metric silinemedi' },
      { status: error.response?.status || 500 }
    );
  }
} 