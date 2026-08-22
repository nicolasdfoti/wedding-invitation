import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import site from '../../config/site';

export default function Gallery() {
  const { ref, isVisible } = useScrollReveal({ triggerOnce: true });

  return (
    <section
      ref={ref}
      className="section bg-fondo"
      aria-labelledby="gallery-title"
    >
      <Container size="xl">
        <SectionTitle
          id="gallery-title"
          subtitle="Momentos"
          dividerColor="coral"
        >
          {site.gallery.title}
        </SectionTitle>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isVisible ? 0.2 : 0, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          role="list"
          aria-label="Galería de fotos de la pareja"
        >
          {site.gallery.photos.map((photo, index) => (
            <motion.article
              key={photo.src}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: isVisible ? 0.3 + index * 0.08 : 0, duration: 0.4 }}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-soft cursor-pointer"
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-sm font-medium text-center w-full">
                  {photo.caption}
                </p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}