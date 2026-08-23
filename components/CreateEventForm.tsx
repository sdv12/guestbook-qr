'use client';

import { useState } from 'react';
import EventQRCode from './EventQRCode';
import shared from '@/app/shared.module.css';

interface CreatedEvent {
  id: string;
  slug: string;
  name: string;
  dashboard_token: string;
}

export default function CreateEventForm() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [event, setEvent] = useState<CreatedEvent | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? 'Error al crear el evento');
      }

      setEvent(json.event);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  if (event) {
    const url = `${window.location.origin}/e/${event.slug}`;
    const dashboardUrl = `${window.location.origin}/dashboard/${event.id}?token=${event.dashboard_token}`;

    async function copyDashboardLink() {
      await navigator.clipboard.writeText(dashboardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    return (
      <div className={shared.card} style={{ textAlign: 'center' }}>
        <h2>¡Evento creado!</h2>
        <p style={{ color: 'var(--sl-ink-soft)', marginTop: 8, marginBottom: 20 }}>
          Link de invitados:
          <br />
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--sl-blue)', fontWeight: 600 }}
          >
            {url}
          </a>
        </p>

        <EventQRCode url={url} fileName={event.slug} />

        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 10,
            border: '1.5px solid var(--sl-red)',
            background: '#fbf2f2',
            textAlign: 'left',
          }}
        >
          <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sl-red)' }}>
            Guardá este link ahora
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--sl-ink-soft)', marginTop: 4, marginBottom: 10 }}>
            Es la única forma de entrar al dashboard del evento. No hay cuenta ni forma de
            recuperarlo si lo perdés.
          </p>
          <button
            type="button"
            onClick={copyDashboardLink}
            className={`${shared.btn} ${shared.btnGhost}`}
          >
            {copied ? 'Copiado ✓' : 'Copiar link del dashboard'}
          </button>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href={dashboardUrl} className={`${shared.btn} ${shared.btnPrimary}`}>
            Ir al dashboard ahora
          </a>
          <button
            className={`${shared.btn} ${shared.btnGhost}`}
            onClick={() => {
              setEvent(null);
              setName('');
            }}
          >
            Crear otro evento
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={shared.card}>
      <label className={shared.fieldLabel} htmlFor="name">
        Nombre del evento
      </label>
      <input
        id="name"
        required
        maxLength={60}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Cumpleaños de Nahu"
        className={shared.input}
        style={{ marginBottom: 16 }}
      />
      <button
        type="submit"
        disabled={loading || !name.trim()}
        className={`${shared.btn} ${shared.btnPrimary}`}
      >
        {loading ? 'Creando...' : 'Crear evento y generar QR'}
      </button>
      {error && <p className={shared.errorText}>{error}</p>}
    </form>
  );
}
