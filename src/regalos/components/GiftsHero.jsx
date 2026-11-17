import { m } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Container from '../../components/ui/Container';
import { formatDate } from '../../utils/date';
import site from '../../config/site';

const weddingDate = formatDate(site.wedding.isoString, { timeZone: site.wedding.timezone });

export default function GiftsHero() {
  return (
    <header
      className="relative overflow-hidden bg-gradient-to-br from-peach via-fondo to-sky"
      aria-labelledby="gifts-hero-title"
    >
      <div className="absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute -top-10 left-0 w-64 h-64 bg-coral rounded-full blur-3xl" />
        <div className="absolute -bottom-16 right-0 w-64 h-64 bg-sky rounded-full blur-3xl" />
      </div>

      <Container size="md" className="relative pt-4 pb-16 md:pb-24">
        <a
          href="/#regalos"
          className="inline-flex items-center gap-2 min-h-11 -ml-2 px-2 rounded-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Volver a la invitación
        </a>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          className="text-center mt-8 md:mt-12"
        >
          <p className="uppercase tracking-[0.4em] text-sm mb-5 text-accent font-semibold">Lista de regalos</p>
          <h1 id="gifts-hero-title" className="font-title text-6xl md:text-8xl text-blue mb-4">
            {site.couple.firstName} &amp; {site.couple.secondName}
          </h1>
          <div className="w-24 h-px bg-gold mx-auto mb-5" aria-hidden="true" />
          <p className="font-title text-xl md:text-2xl italic text-gray-600">
            <time dateTime={site.wedding.date}>{weddingDate}</time>
          </p>
        </m.div>
      </Container>
    </header>
  );
}
