import { Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import site from '../../config/site';

const eventItems = [
  {
    icon: Calendar,
    title: site.events.civil.label,
    time: site.events.civil.time,
    location: site.events.civil.location,
    mapsUrl: site.events.civil.mapsUrl,
    description: '',
  },
  {
    icon: Clock,
    title: site.events.reception.label,
    time: site.events.reception.time,
    location: site.events.reception.location,
    mapsUrl: site.events.reception.mapsUrl,
    description: 'Recepción',
  },
  {
    icon: MapPin,
    title: site.events.sealing.label,
    time: site.events.sealing.time,
    location: site.events.sealing.location,
    mapsUrl: site.events.sealing.mapsUrl,
    description: 'Opcional',
  },
];

export default function Details() {
  const { ref, isVisible } = useScrollReveal({ triggerOnce: true });

  return (
    <section
      ref={ref}
      className="section"
      aria-labelledby="details-title"
    >
      <Container size="lg">
        <SectionTitle
          id="details-title"
          subtitle="Detalles del evento"
          dividerColor="accent"
        >
          Cuándo y Dónde
        </SectionTitle>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isVisible ? 0.2 : 0, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8"
        >
          {eventItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isVisible ? 0.3 + index * 0.1 : 0, duration: 0.4 }}
              >
                <Card variant="outlined" padding="lg" className="h-full">
                  <div className="text-center">
                    <Icon className="mx-auto text-accent mb-4" size={42} aria-hidden="true" />
                    <h3 className="font-title text-2xl text-blue mb-2">{item.title}</h3>
                    <p className="text-accent font-semibold mb-1">{item.time}</p>
                    <p className="text-gray-600 mb-2">{item.location}</p>
                    <p className="text-sm text-gray-500 italic mb-4">{item.description}</p>
                    {item.mapsUrl && (
                      <a
                        href={item.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-accent hover:text-coral transition-colors"
                        aria-label={`Ver ${item.title} en Google Maps`}
                      >
                        <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                        Ver en mapa
                      </a>
                    )}
                  </div>
                </Card>
              </motion.article>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}