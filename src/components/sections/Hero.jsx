import { m } from 'framer-motion';
import Container from '../ui/Container';
import { formatDate } from '../../utils/date';
import site from '../../config/site';

const weddingDate = formatDate(site.wedding.isoString, { timeZone: site.wedding.timezone });

export default function Hero() {
  return (
    <section
      className="relative min-h-[100vh] min-h-[100dvh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-peach via-fondo to-sky"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-coral rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-sky rounded-full blur-3xl" />
      </div>

      <m.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="relative text-center px-4"
      >
        <Container size="md">
          <p className="uppercase tracking-[0.4em] text-sm mb-6 text-accent font-semibold">
            Nuestra boda
          </p>

          <h1 id="hero-title" className="font-title text-7xl md:text-9xl text-blue mb-4">
            {site.couple.firstName} & {site.couple.secondName}
          </h1>

          <div className="w-24 h-px bg-gold mx-auto mb-6" aria-hidden="true" />

          <p className="font-title text-2xl italic text-gray-600">
            <time dateTime={site.wedding.date}>{weddingDate}</time>
          </p>
        </Container>
      </m.div>

      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 motion-safe:animate-bounce"
        aria-hidden="true"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-accent"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </m.div>
    </section>
  );
}
