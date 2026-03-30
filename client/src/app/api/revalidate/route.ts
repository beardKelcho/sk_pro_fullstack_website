import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const revalidateTagCompat = revalidateTag as unknown as (
  cacheTag: string,
  profile?: string
) => void;

export async function POST(request: Request) {
  try {
    const { tag } = await request.json();

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag is required' },
        { status: 400 }
      );
    }

    // Next.js 16 prefers a cache profile; older versions safely ignore extra args.
    revalidateTagCompat(tag, 'max');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    );
  }
} 
