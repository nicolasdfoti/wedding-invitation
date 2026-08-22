import { Shirt, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import site from '../../config/site';

export default function DressCode() {
  const { ref, isVisible } = useScrollReveal({ triggerOnce: true });

  return (
    <section
      ref={ref}
      className="section bg-peach/10"
      aria-labelledby="dresscode-title"
    >
      <Container size="md">
        <SectionTitle
          id="dresscode-title"
          subtitle="Vestimenta"
          dividerColor="peach"
        >
          {site.dressCode.title}
        </SectionTitle>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isVisible ? 0.2 : 0, duration: 0.6 }}
        >
          <Card variant="elevated" padding="xl" className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-peach/20 rounded-full mb-6" aria-hidden="true">
              <Shirt className="text-accent" size={32} />
            </div>
            <h3 className="font-title text-3xl text-blue mb-2">{site.dressCode.description}</h3>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">{site.dressCode.details[0]}</p>

            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {site.dressCode.details.slice(1).map((detail, index) => (
                <motion.div
                  key={detail}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: isVisible ? 0.4 + index * 0.1 : 0, duration: 0.4 }}
                  className="flex items-start gap-3 p-3 bg-fondo rounded-xl"
                >
                  <Sparkles className="text-accent mt-0.5 flex-shrink-0" size={18} aria-hidden="true" />
                  <p className="text-gray-700 text-sm">{detail}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}