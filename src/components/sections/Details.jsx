import { Calendar, CalendarPlus, Clock, MapPin } from 'lucide-react';
import { m } from 'framer-motion';
import { fadeUp, revealViewport } from '../../lib/motion';
import { downloadICS } from '../../utils/date';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import Button from '../ui/Button';
import site from '../../config/site';

const eventItems = [
  { key: 'civil', icon: Calendar, description: '' },
  { key: 'reception', icon: Clock, description: '' },
  {
    key: 'sealing',
    icon: MapPin,
    description: 'No podemos asegurarles el ingreso a la sesión, ¡pero los esperamos en los jardines del Templo!',
  },
].map(({ key, ...rest }) => ({ key, ...site.events[key], ...rest }));

// Convierte "HH:MM" del día de la boda en una fecha con la zona horaria de Argentina.
function eventStart(time) {
  const offset = site.wedding.isoString.slice(-6); // ej: "-03:00"
  return new Date(`${site.wedding.date}T${time}:00${offset}`);
}

// "2027-02-12" → "12/02/2027"
const weddingDate = site.wedding.date.split('-').reverse().join('/');

function handleAddToCalendar() {
  const events = eventItems.map((event) => {
    const start = eventStart(event.time);
    const end = new Date(start.getTime() + (event.durationMinutes ?? 60) * 60 * 1000);
    return {
      uid: `${site.wedding.date}-${event.key}@sofyynico`,
      title: `${event.label} · Boda ${site.couple.names}`,
      description: `${event.label} de la boda de ${site.couple.names}.\n${site.seo.url}`,
      location: event.address,
      startDate: start,
      endDate: end,
    };
  });
  downloadICS(events);
}

export default function Details() {
  return (
    <section className="section" aria-labelledby="details-title">
      <Container size="lg">
        <SectionTitle id="details-title" subtitle="Detalles del evento" dividerColor="accent">
          Cuándo y Dónde
        </SectionTitle>

        <m.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} className="grid md:grid-cols-3 gap-8">
          {eventItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <m.article
                key={item.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={revealViewport}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              >
                <Card variant="outlined" padding="lg" className="h-full">
                  <div className="text-center">
                    <Icon className="mx-auto text-accent mb-4" size={42} aria-hidden="true" />
                    <h3 className="font-title text-2xl text-blue mb-2">{item.label}</h3>
                    <p className="text-accent font-semibold mb-1">
                      {weddingDate}
                      <span className="mx-2 text-accent/50" aria-hidden="true">·</span>
                      {item.time} hs
                    </p>
                    <p className="text-gray-600 mb-2">{item.location}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500 italic mb-4">{item.description}</p>
                    )}
                    {item.mapsUrl && (
                      <a
                        href={item.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-accent hover:text-coral transition-colors mt-2"
                        aria-label={`Ver ${item.label} en Google Maps`}
                      >
                        <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                        Ver en mapa
                      </a>
                    )}
                  </div>
                </Card>
              </m.article>
            );
          })}
        </m.div>

        <m.div {...fadeUp} transition={{ delay: 0.4, duration: 0.5 }} className="mt-10 text-center">
          <Button variant="secondary" size="md" onClick={handleAddToCalendar}>
            <CalendarPlus className="w-4 h-4 mr-2" aria-hidden="true" />
            Agregar al calendario
          </Button>
        </m.div>
      </Container>
    </section>
  );
}
