import { NextResponse } from 'next/server';
import { getLotsFromPostGIS } from '@/lib/lots';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inmobiliaria = searchParams.get('inmobiliaria') || undefined;
  const proyecto = searchParams.get('proyecto') || undefined;

  const result = await getLotsFromPostGIS({
    inmobiliariaSlug: inmobiliaria,
    proyectoSlug: proyecto,
  });

  return NextResponse.json(result);
}
