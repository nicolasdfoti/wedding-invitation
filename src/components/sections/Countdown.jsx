import { motion } from 'framer-motion';
import { useCountdown } from '../../hooks/useCountdown';
import { useScrollReveal } from '../../hooks/useScrollReveal';
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
  const { ref, isVisible } = useScrollReveal({ triggerOnce: true });
  const time = useCountdown(site.wedding.isoString);
  const expired = time.expired;

  return (
    <section
      ref={ref}
      className="section bg-white"
      aria-labelledby="countdown-title"
      role="timer"
      aria-live="polite"
    >
      <Container size="md">
        <SectionTitle
          id="countdown-title"
          subtitle="Cuenta regresiva"
          dividerColor="accent"
        >
          {expired ? '¡Llegó el día!' : 'Faltan'}
        </SectionTitle>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isVisible ? 0.2 : 0, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          role="list"
          aria-label="Tiempo restante para la boda"
        >
          {timeUnits.map(({ key, label, singular }) => {
            const value = time[key] ?? 0;
            return (
              <motion.div
                key={key}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: isVisible ? 0.3 + timeUnits.indexOf({ key, label, singular }) * 0.1 : 0, duration: 0.4 }}
                className="p-6 rounded-3xl bg-fondo shadow-soft text-center"
                role="listitem"
              >
                <div
                  className="text-4xl md:text-5xl font-bold text-accent mb-2 tabular-nums"
                  aria-label={`${value} ${value === 1 ? singular : label}`}
                >
                  {String(value).padStart(2, '0')}
                </div>
                <div className="uppercase text-sm tracking-widest text-gray-500">
                  {value === 1 ? singular : label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {expired && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center font-title text-3xl text-coral italic"
          >
            ¡Hoy celebramos su amor!
          </motion.p>
        )}
      </Container>
    </section>
  );
}