import { NextResponse } from 'next/server';
import { getLotsFromPostGIS } from '@/lib/lots';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getLotsFromPostGIS();

  return NextResponse.json(result, { status: result.error ? 503 : 200 });
}
