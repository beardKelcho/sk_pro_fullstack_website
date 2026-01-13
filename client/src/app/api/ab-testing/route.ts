import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get('experimentId');

    if (!experimentId) {
      return new NextResponse('Experiment ID is required', { status: 400 });
    }

    const experiment = await db.experiment.findUnique({
      where: { id: experimentId },
      include: {
        variants: true,
        results: {
          where: {
            userId: (session.user as any).id || session.user.email || '',
          },
        },
      },
    });

    if (!experiment) {
      return new NextResponse('Experiment not found', { status: 404 });
    }

    return NextResponse.json(experiment);
  } catch (error) {
    console.error('AB Testing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { experimentId, variantId, conversion, metadata } = body;

    if (!experimentId || !variantId) {
      return new NextResponse('Experiment ID and Variant ID are required', { status: 400 });
    }

    const result = await db.experimentResult.create({
      data: {
        experimentId,
        variantId,
        userId: (session.user as any).id || session.user.email || '',
        conversion,
        metadata,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('AB Testing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 