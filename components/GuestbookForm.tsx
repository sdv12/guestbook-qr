'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './GuestbookForm.module.css';
import shared from '@/app/shared.module.css';
import { CameraIcon, CheckIcon, StarIcon } from './icons';

interface GuestbookFormProps {
  eventId: string;
}

export default function GuestbookForm({ eventId }: GuestbookFormProps) {
  const [guestName, setGuestName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [birthdayMessage, setBirthdayMessage] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // object URL lifecycle (create/revoke) is a side effect on an external
  // API, not derived state, so it has to live in an effect
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setError('Elegí una calificación de 1 a 5 estrellas antes de enviar');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('event_id', eventId);
      formData.append('rating', String(rating));
      if (!isAnonymous && guestName.trim()) {
        formData.append('guest_name', guestName.trim());
      }
      if (feedback.trim()) formData.append('feedback', feedback.trim());
      if (birthdayMessage.trim()) {
        formData.append('birthday_message', birthdayMessage.trim());
      }
      if (photo) formData.append('photo', photo);

      const res = await fetch('/api/responses', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? 'No se pudo enviar tu respuesta');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={`${shared.card} ${styles.submittedCard}`}>
        <div className={styles.submittedIconWrap}>
          <CheckIcon className={styles.submittedIcon} />
        </div>
        <h2>¡Gracias por tu mensaje!</h2>
        <p style={{ color: 'var(--sl-ink-soft)', marginTop: 6 }}>
          Tu respuesta fue enviada correctamente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={shared.card}>
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        Quedar anónimo
      </label>

      {!isAnonymous && (
        <div className={styles.field}>
          <label className={shared.fieldLabel} htmlFor="guestName">
            Tu nombre <span className={shared.fieldHint}>(opcional)</span>
          </label>
          <input
            id="guestName"
            className={shared.input}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            maxLength={60}
            placeholder="¿Quién saluda?"
          />
        </div>
      )}

      <div className={styles.field}>
        <label className={shared.fieldLabel}>Calificación</label>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${star} estrellas`}
              aria-pressed={rating === star}
              className={styles.starBtn}
            >
              <StarIcon
                className={`${styles.starIcon} ${
                  star <= (hoverRating || rating) ? styles.starActive : ''
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label className={shared.fieldLabel} htmlFor="feedback">
          Feedback del evento{' '}
          <span className={shared.fieldHint}>(privado, solo lo ve el organizador)</span>
        </label>
        <textarea
          id="feedback"
          className={shared.textarea}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="¿Cómo la pasaste?"
        />
      </div>

      <div className={styles.field}>
        <label className={shared.fieldLabel} htmlFor="birthdayMessage">
          Saludo para el cumpleañero
        </label>
        <textarea
          id="birthdayMessage"
          className={shared.textarea}
          value={birthdayMessage}
          onChange={(e) => setBirthdayMessage(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Dejale un mensaje"
        />
      </div>

      <div className={styles.field}>
        <label className={shared.fieldLabel}>
          Foto <span className={shared.fieldHint}>(opcional)</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          style={{ display: 'none' }}
        />

        {photoPreview ? (
          <div className={styles.photoPreviewWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Foto seleccionada" className={styles.photoPreviewImg} />
            <button
              type="button"
              className={styles.photoRemoveBtn}
              onClick={() => setPhoto(null)}
              aria-label="Quitar foto"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className={styles.photoUpload} onClick={() => fileInputRef.current?.click()}>
            <CameraIcon className={styles.photoUploadIcon} />
            <span className={styles.photoUploadLabel}>Subir una foto</span>
          </div>
        )}
      </div>

      <button type="submit" disabled={submitting || rating === 0} className={`${shared.btn} ${shared.btnPrimary}`}>
        {submitting ? 'Enviando...' : 'Enviar'}
      </button>

      {error && <p className={shared.errorText}>{error}</p>}
    </form>
  );
}
