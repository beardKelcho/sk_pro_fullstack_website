import { NextRequest, NextResponse } from 'next/server';
import { ApiLogger } from '@/utils/apiLogger';
import { ApiVersioning } from '@/utils/apiVersioning';
import { apiRateLimit } from './apiRateLimit';

export async function apiMiddleware(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting kontrolü
    const rateLimitResponse = await apiRateLimit(request);
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    // API versiyonlama
    const apiVersioning = ApiVersioning.getInstance();
    const response = await apiVersioning.handleRequest(request);

    // Response time hesaplama
    const responseTime = Date.now() - startTime;

    // API loglama
    const apiLogger = ApiLogger.getInstance();
    await apiLogger.logRequest(request, response, responseTime);

    return response;
  } catch (error) {
    console.error('API middleware error:', error);

    // Hata durumunda da loglama yap
    const apiLogger = ApiLogger.getInstance();
    const errorResponse = new NextResponse(JSON.stringify({
      success: false,
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });

    await apiLogger.logRequest(request, errorResponse, Date.now() - startTime);

    return errorResponse;
  }
}

// API route'ları için özel middleware
export function withApiMiddleware(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    return apiMiddleware(request);
  };
}

// API versiyonları için özel middleware
export function withApiVersion(version: string, options: {
  deprecated?: boolean;
  sunsetDate?: Date;
} = {}) {
  return (handler: (request: NextRequest) => Promise<NextResponse>) => {
    const apiVersioning = ApiVersioning.getInstance();
    apiVersioning.registerVersion(version, handler, options);
    return handler;
  };
}

// API route örneği:
/*
export const GET = withApiVersion('v1')(async (request: NextRequest) => {
  return new NextResponse(JSON.stringify({
    success: true,
    data: { message: 'Hello from v1' }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

export const POST = withApiVersion('v1', {
  deprecated: true,
  sunsetDate: new Date('2024-12-31')
})(async (request: NextRequest) => {
  const body = await request.json();
  return new NextResponse(JSON.stringify({
    success: true,
    data: body
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
*/ 