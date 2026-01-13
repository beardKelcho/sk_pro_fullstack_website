import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const subscription = await request.json();

    // Subscription'ı veritabanına kaydet
    await db.pushSubscription.create({
      data: {
        userId: (session.user as any)?.id || session.user?.email || '',
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return new NextResponse('Subscription saved', { status: 200 });
  } catch (error) {
    console.error('Push subscription error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 