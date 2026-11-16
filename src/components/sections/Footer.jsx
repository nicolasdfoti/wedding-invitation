import { Heart } from 'lucide-react';
import { m } from 'framer-motion';
import { fadeUp, revealViewport } from '../../lib/motion';
import Container from '../ui/Container';
import site from '../../config/site';

export default function Footer() {
  return (
    <footer
      className="py-16 bg-fondo border-t border-peach/30"
      role="contentinfo"
    >
      <Container size="md">
        <m.div
          {...fadeUp}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center"
        >
          <Heart
            className="mx-auto text-coral fill-current mb-4"
            size={32}
            aria-hidden="true"
          />

          <m.blockquote
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={revealViewport}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-title text-3xl italic text-gray-500 mb-6"
          >
            &ldquo;{site.couple.quote}&rdquo;
          </m.blockquote>

          <m.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={revealViewport}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-xs tracking-[0.3em] uppercase text-gray-400"
          >
            {site.couple.madeWithLoveBy}
          </m.p>
        </m.div>
      </Container>
    </footer>
  );
}