import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';

const MAX_PHOTO_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request: Request) {
  const supabase = await createClient();

  const formData = await request.formData();

  const eventId = formData.get('event_id');
  const ratingRaw = formData.get('rating');
  const guestName = formData.get('guest_name');
  const feedback = formData.get('feedback');
  const birthdayMessage = formData.get('birthday_message');
  const photo = formData.get('photo');

  if (typeof eventId !== 'string' || !eventId) {
    return NextResponse.json({ error: 'Falta el evento' }, { status: 400 });
  }

  const rating = Number(ratingRaw);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Calificación inválida' }, { status: 400 });
  }

  let photoUrl: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_PHOTO_SIZE) {
      return NextResponse.json(
        { error: 'La foto es demasiado grande (máx 8MB)' },
        { status: 400 }
      );
    }

    const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${eventId}/${randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(path, photo, { contentType: photo.type || 'image/jpeg' });

    if (uploadError) {
      return NextResponse.json({ error: 'No se pudo subir la foto' }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('photos').getPublicUrl(path);
    photoUrl = publicUrl;
  }

  const { error: insertError } = await supabase.from('responses').insert({
    event_id: eventId,
    guest_name: typeof guestName === 'string' && guestName.trim() ? guestName.trim() : null,
    rating,
    feedback: typeof feedback === 'string' && feedback.trim() ? feedback.trim() : null,
    birthday_message:
      typeof birthdayMessage === 'string' && birthdayMessage.trim()
        ? birthdayMessage.trim()
        : null,
    photo_url: photoUrl,
  });

  if (insertError) {
    return NextResponse.json({ error: 'No se pudo guardar tu respuesta' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
