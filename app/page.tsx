import Link from 'next/link';
import shared from '@/app/shared.module.css';

export default function Home() {
  return (
    <>
      <div className={shared.stripeBar} />
      <main className={shared.shell} style={{ textAlign: 'center', maxWidth: 420 }}>
        <span className={shared.eyebrow}>Guestbook QR</span>
        <h1>Un guestbook para tu evento</h1>
        <p style={{ color: 'var(--sl-ink-soft)', marginTop: 10, marginBottom: 24 }}>
          Creá un evento y generá el QR para que tus invitados dejen su saludo.
        </p>
        <Link href="/dashboard/new" className={`${shared.btn} ${shared.btnPrimary}`}>
          Crear evento
        </Link>
      </main>
    </>
  );
}
