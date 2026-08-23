import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import shared from '@/app/shared.module.css';
import styles from './page.module.css';
import { StarIcon } from '@/components/icons';

interface DashboardPageProps {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ token?: string }>;
}

interface ResponseRow {
  id: string;
  guest_name: string | null;
  rating: number | null;
  feedback: string | null;
  birthday_message: string | null;
  photo_url: string | null;
  created_at: string;
}

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
  const { eventId } = await params;
  const { token } = await searchParams;
  const supabase = await createClient();

  if (!token) {
    notFound();
  }

  const { data: eventRows } = await supabase.rpc('verify_dashboard_token', {
    p_event_id: eventId,
    p_token: token,
  });

  const event = eventRows?.[0];

  if (!event) {
    notFound();
  }

  const { data: responses } = await supabase.rpc('get_event_responses', {
    p_event_id: eventId,
    p_token: token,
  });

  const allResponses: ResponseRow[] = responses ?? [];
  const ratedResponses = allResponses.filter(
    (r): r is ResponseRow & { rating: number } => r.rating != null
  );
  const averageRating =
    ratedResponses.length > 0
      ? ratedResponses.reduce((sum, r) => sum + r.rating, 0) / ratedResponses.length
      : 0;

  const feedbackItems = allResponses.filter((r) => r.feedback);
  const birthdayItems = allResponses.filter((r) => r.birthday_message);
  const photoItems = allResponses.filter((r) => r.photo_url);

  return (
    <>
      <div className={shared.stripeBar} />
      <main className={shared.shell} style={{ maxWidth: 640 }}>
        <div className={styles.header}>
          <div>
            <span className={shared.eyebrow}>Dashboard</span>
            <h1>{event.name}</h1>
          </div>
          <a href={`/e/${event.slug}`} target="_blank" rel="noreferrer" className={shared.fieldLabel}>
            Ver landing →
          </a>
        </div>

        <div className={styles.statsRow}>
          <div className={`${shared.card} ${styles.statCard}`}>
            <div className={styles.statValue}>
              {ratedResponses.length > 0 ? averageRating.toFixed(1) : '–'}
            </div>
            <div className={styles.statStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`${styles.statStarIcon} ${
                    star <= Math.round(averageRating) ? styles.statStarActive : ''
                  }`}
                />
              ))}
            </div>
            <div className={styles.statLabel}>Calificación promedio</div>
          </div>

          <div className={`${shared.card} ${styles.statCard}`}>
            <div className={styles.statValue}>{allResponses.length}</div>
            <div className={styles.statLabel} style={{ marginTop: 26 }}>
              Respuestas totales
            </div>
          </div>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Feedback del evento</h2>
          <p className={styles.sectionHint}>Uso interno, solo vos lo ves.</p>
          {feedbackItems.length === 0 ? (
            <div className={`${shared.card} ${styles.emptyState}`}>Todavía no hay feedback.</div>
          ) : (
            <div className={styles.list}>
              {feedbackItems.map((r) => (
                <div key={r.id} className={`${shared.card} ${styles.listItem}`}>
                  <div className={styles.itemHeader}>
                    <span className={styles.guestName}>{r.guest_name || 'Anónimo'}</span>
                    <span className={styles.itemDate}>{dateFormatter.format(new Date(r.created_at))}</span>
                  </div>
                  <p className={styles.itemBody}>{r.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Saludos para el gorreado</h2>
          <p className={styles.sectionHint}>Mostrables aparte, para compartir con el homenajeado.</p>
          {birthdayItems.length === 0 ? (
            <div className={`${shared.card} ${styles.emptyState}`}>Todavía no hay saludos.</div>
          ) : (
            <div className={styles.list}>
              {birthdayItems.map((r) => (
                <div key={r.id} className={`${shared.card} ${styles.listItem}`}>
                  <div className={styles.itemHeader}>
                    <span className={styles.guestName}>{r.guest_name || 'Anónimo'}</span>
                    <span className={styles.itemDate}>{dateFormatter.format(new Date(r.created_at))}</span>
                  </div>
                  <p className={styles.itemBody}>{r.birthday_message}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Fotos</h2>
          <p className={styles.sectionHint}>{photoItems.length} foto(s) subidas por los invitados.</p>
          {photoItems.length === 0 ? (
            <div className={`${shared.card} ${styles.emptyState}`}>Todavía no hay fotos.</div>
          ) : (
            <div className={styles.gallery}>
              {photoItems.map((r) => (
                <a
                  key={r.id}
                  href={r.photo_url!}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.galleryItem}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.photo_url!}
                    alt={`Foto de ${r.guest_name || 'un invitado'}`}
                    className={styles.galleryImg}
                  />
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
