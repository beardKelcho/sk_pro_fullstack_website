import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { validateInput, performanceMetricSchema, sanitizeSQL } from '@/utils/validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const metricName = searchParams.get('metric');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Input validasyonu
    if (metricName) {
      const sanitizedMetricName = sanitizeSQL(metricName);
      const validation = await validateInput(performanceMetricSchema, { name: sanitizedMetricName });
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('performance_metrics');

    const query: any = {};
    if (metricName) {
      query.name = sanitizeSQL(metricName);
    }
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const metrics = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Input validasyonu
    const validation = await validateInput(performanceMetricSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name, value, metadata } = validation.data!;

    const { db } = await connectToDatabase();
    const collection = db.collection('performance_metrics');

    const metric = {
      name: sanitizeSQL(name),
      value,
      timestamp: new Date(),
      metadata: metadata || {},
      userId: (session.user as any)?.id || session.user?.email || '', // Kullanıcı bilgisini ekle
    };

    const result = await collection.insertOne(metric);

    return NextResponse.json({
      message: 'Metric recorded successfully',
      metricId: result.insertedId,
    });
  } catch (error) {
    console.error('Error recording performance metric:', error);
    return NextResponse.json(
      { error: 'Failed to record performance metric' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const metricId = searchParams.get('id');

    if (!metricId) {
      return NextResponse.json(
        { error: 'Metric ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('performance_metrics');

    // Kullanıcının kendi metriklerini silebilmesi için kontrol
    const result = await collection.deleteOne({
      _id: new ObjectId(metricId),
      userId: (session.user as any)?.id || session.user?.email || '',
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Metric not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Metric deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting performance metric:', error);
    return NextResponse.json(
      { error: 'Failed to delete performance metric' },
      { status: 500 }
    );
  }
} 