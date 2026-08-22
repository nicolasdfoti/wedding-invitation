import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import site from '../../config/site';

export default function Story() {
  const { ref, isVisible } = useScrollReveal({ triggerOnce: true });

  return (
    <section
      ref={ref}
      className="section bg-white"
      aria-labelledby="story-title"
    >
      <Container size="md">
        <SectionTitle
          id="story-title"
          subtitle="Nuestra historia"
          dividerColor="gold"
        >
          {site.story.title}
        </SectionTitle>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isVisible ? 0.2 : 0, duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative mb-12">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-soft bg-fondo">
              {site.story.photoUrl && (
                <img
                  src={site.story.photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-24 h-24 bg-gold rounded-full flex items-center justify-center shadow-soft" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="text-white">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            {site.story.paragraphs.map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isVisible ? 0.4 + index * 0.15 : 0, duration: 0.5 }}
                className="font-body"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}