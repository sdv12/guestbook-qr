import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GuestbookForm from '@/components/GuestbookForm';
import shared from '@/app/shared.module.css';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <>
      <div className={shared.stripeBar} />
      <main className={shared.shell}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className={shared.eyebrow}>Guestbook</span>
          <h1>{event.name}</h1>
          <p style={{ color: 'var(--sl-ink-soft)', marginTop: 8 }}>
            Dejá tu mensaje para el cumpleañero
          </p>
        </div>
        <GuestbookForm eventId={event.id} />
      </main>
    </>
  );
}
