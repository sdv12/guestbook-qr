interface IconProps {
  className?: string;
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5l2.9 6.35 6.98.66-5.28 4.66 1.6 6.83L12 17.6l-6.2 3.4 1.6-6.83L2.12 9.5l6.98-.66L12 2.5z" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.4l1.1-1.7A1.5 1.5 0 0 1 10.26 4.6h3.48a1.5 1.5 0 0 1 1.26.68L16.1 7h2.4A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
      <circle cx="12" cy="13" r="3.4" />
      <circle cx="17.2" cy="9.6" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}
