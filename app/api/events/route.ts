import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/slug';

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const supabase = await createClient();

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (!name || name.length > 60) {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const slug = generateSlug(name);

    const { data, error } = await supabase.rpc('create_event', {
      p_slug: slug,
      p_name: name,
    });

    if (!error) {
      return NextResponse.json({ event: data?.[0] }, { status: 201 });
    }

    if (error.code !== '23505') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // 23505 = unique_violation en slug, reintentamos con otro código random
  }

  return NextResponse.json(
    { error: 'No se pudo generar un slug único, intentá de nuevo' },
    { status: 500 }
  );
}
