import { NextResponse } from 'next/server';

/**
 * AB Testing API
 * Not: AB Testing özelliği şu anda aktif değil
 * Gelecekte backend API'ye entegre edilebilir
 */
export async function GET(request: Request) {
  return NextResponse.json(
    { error: 'AB Testing özelliği şu anda aktif değil' },
    { status: 501 }
  );
}

export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'AB Testing özelliği şu anda aktif değil' },
    { status: 501 }
  );
} 