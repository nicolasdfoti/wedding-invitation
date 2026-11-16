import { m } from 'framer-motion';
import { useCountdown } from '../../hooks/useCountdown';
import { fadeUp, revealViewport } from '../../lib/motion';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import site from '../../config/site';

const timeUnits = [
  { key: 'days', label: 'Días', singular: 'Día' },
  { key: 'hours', label: 'Horas', singular: 'Hora' },
  { key: 'minutes', label: 'Minutos', singular: 'Minuto' },
  { key: 'seconds', label: 'Segundos', singular: 'Segundo' },
];

export default function Countdown() {
  const time = useCountdown(site.wedding.isoString);
  const { expired } = time;

  return (
    <section className="section bg-white" aria-labelledby="countdown-title">
      <Container size="md">
        <SectionTitle id="countdown-title" subtitle="Cuenta regresiva" dividerColor="accent">
          {expired ? '¡Llegó el día!' : 'Faltan'}
        </SectionTitle>

        {/* Resumen para lectores de pantalla: sin aria-live para no anunciar cada segundo */}
        {!expired && (
          <p className="sr-only">
            Faltan {time.days} {time.days === 1 ? 'día' : 'días'} para la boda.
          </p>
        )}

        <m.div
          {...fadeUp}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          aria-hidden="true"
        >
          {timeUnits.map(({ key, label, singular }, index) => {
            const value = time[key] ?? 0;
            return (
              <m.div
                key={key}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={revealViewport}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                className="p-6 rounded-3xl bg-fondo shadow-soft text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2 tabular-nums">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="uppercase text-sm tracking-widest text-gray-500">
                  {value === 1 ? singular : label}
                </div>
              </m.div>
            );
          })}
        </m.div>

        {expired && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center font-title text-3xl text-coral italic"
          >
            ¡Hoy celebramos su amor!
          </m.p>
        )}
      </Container>
    </section>
  );
}
