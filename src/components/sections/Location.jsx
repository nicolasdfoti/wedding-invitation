import { MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import Button from '../ui/Button';
import site from '../../config/site';

export default function Location() {
  const { ref, isVisible } = useScrollReveal({ triggerOnce: true });

  const handleOpenMaps = () => {
    window.open(site.location.mapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      ref={ref}
      className="section bg-white"
      aria-labelledby="location-title"
    >
      <Container size="md">
        <SectionTitle
          id="location-title"
          subtitle="Ubicación"
          dividerColor="blue"
        >
          {site.location.title}
        </SectionTitle>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isVisible ? 0.2 : 0, duration: 0.6 }}
          className="space-y-8"
        >
          <Card variant="outlined" padding="xl" className="text-center">
            <MapPin className="mx-auto text-accent mb-4" size={48} aria-hidden="true" />
            <h3 className="font-title text-3xl text-blue mb-3">{site.location.title}</h3>
            <address className="text-gray-600 leading-relaxed text-lg not-italic mb-6">
              {site.location.fullAddress.replace(/ · /g, '<br />')}
            </address>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleOpenMaps}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Navigation className="w-5 h-5 mr-2" aria-hidden="true" />
                Abrir en Google Maps
              </Button>
              <Button
                onClick={() => navigator.clipboard.writeText(site.location.fullAddress)}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Copiar dirección
              </Button>
            </div>
          </Card>

          <Card variant="flat" padding="lg" className="bg-fondo">
            <h4 className="font-title text-2xl text-blue mb-4 text-center">Eventos en este lugar</h4>
            <div className="space-y-4">
              {Object.entries(site.events).map(([key, event]) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-2xl shadow-soft"
                >
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <MapPin className="text-accent" size={20} aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-gray-800">{event.label}</p>
                      <p className="text-sm text-gray-500">{event.time} · {event.location}</p>
                    </div>
                  </div>
                  {event.mapsUrl && (
                    <a
                      href={event.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:text-coral transition-colors flex items-center gap-1 mt-2 sm:mt-0"
                    >
                      <Navigation className="w-4 h-4" aria-hidden="true" />
                      Ver mapa
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}