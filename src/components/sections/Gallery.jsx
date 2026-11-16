import { m } from 'framer-motion';
import { fadeUp, revealViewport } from '../../lib/motion';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import site from '../../config/site';

export default function Gallery() {
  return (
    <section
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

        <m.div
          {...fadeUp}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          role="list"
          aria-label="Galería de fotos de la pareja"
        >
          {site.gallery.photos.map((photo, index) => (
            <m.figure
              key={photo.src}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={revealViewport}
              transition={{ delay: 0.3 + index * 0.08, duration: 0.4 }}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-soft m-0"
              role="listitem"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              {/* En móvil el epígrafe se ve siempre; en pantallas con mouse aparece al pasar por encima */}
              <figcaption className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
                <span className="text-white text-sm font-medium text-center w-full">
                  {photo.caption}
                </span>
              </figcaption>
            </m.figure>
          ))}
        </m.div>
      </Container>
    </section>
  );
}