import CreateEventForm from '@/components/CreateEventForm';
import shared from '@/app/shared.module.css';

export default function NewEventPage() {
  return (
    <>
      <div className={shared.stripeBar} />
      <main className={shared.shell}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span className={shared.eyebrow}>Organizador</span>
          <h1>Crear nuevo evento</h1>
        </div>
        <CreateEventForm />
      </main>
    </>
  );
}
