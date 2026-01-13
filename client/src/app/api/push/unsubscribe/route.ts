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

    // Kullanıcının subscription'ını sil
    await db.pushSubscription.deleteMany({
      where: {
        userId: (session.user as any)?.id || session.user?.email || '',
      },
    });

    return new NextResponse('Subscription deleted', { status: 200 });
  } catch (error) {
    console.error('Push unsubscription error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 