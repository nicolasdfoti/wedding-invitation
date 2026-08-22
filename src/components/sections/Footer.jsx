import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Container from '../ui/Container';
import site from '../../config/site';

export default function Footer() {
  const { ref, isVisible } = useScrollReveal({ triggerOnce: true });

  return (
    <footer
      ref={ref}
      className="py-16 bg-fondo border-t border-peach/30"
      role="contentinfo"
    >
      <Container size="md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isVisible ? 0.2 : 0, duration: 0.6 }}
          className="text-center"
        >
          <Heart
            className="mx-auto text-coral fill-current mb-4"
            size={32}
            aria-hidden="true"
          />

          <motion.blockquote
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isVisible ? 0.4 : 0, duration: 0.5 }}
            className="font-title text-3xl italic text-gray-500 mb-6"
          >
            &ldquo;{site.couple.quote}&rdquo;
          </motion.blockquote>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isVisible ? 0.6 : 0, duration: 0.5 }}
            className="text-xs tracking-[0.3em] uppercase text-gray-400"
          >
            {site.couple.madeWithLoveBy}
          </motion.p>
        </motion.div>
      </Container>
    </footer>
  );
}