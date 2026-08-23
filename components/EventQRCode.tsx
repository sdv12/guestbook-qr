'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import shared from '@/app/shared.module.css';

interface EventQRCodeProps {
  url: string;
  fileName: string;
}

export default function EventQRCode({ url, fileName }: EventQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      url,
      { width: 260, margin: 1, color: { dark: '#0a1e42', light: '#ffffff' } },
      (err) => {
        if (err) setError('No se pudo generar el QR');
      }
    );
  }, [url]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-block',
          padding: 14,
          border: '1.5px solid var(--sl-line)',
          borderRadius: 12,
          lineHeight: 0,
        }}
      >
        <canvas ref={canvasRef} />
      </div>
      {error && <p className={shared.errorText}>{error}</p>}
      <div style={{ marginTop: 14 }}>
        <button onClick={handleDownload} className={`${shared.btn} ${shared.btnGhost}`}>
          Descargar QR (PNG)
        </button>
      </div>
    </div>
  );
}
