import { Gift, ArrowRight } from 'lucide-react';
import { m } from 'framer-motion';
import { fadeUp, revealViewport } from '../../lib/motion';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import Button from '../ui/Button';
import AccountCard from '../ui/AccountCard';
import site from '../../config/site';

export default function GiftList() {
  return (
    <section id="regalos" className="section bg-white scroll-mt-4" aria-labelledby="giftlist-title">
      <Container size="md">
        <SectionTitle id="giftlist-title" subtitle="Regalos" dividerColor="gold">
          {site.giftList.title}
        </SectionTitle>

        <m.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} className="space-y-8">
          <Card variant="elevated" padding="xl" className="text-center">
            <Gift className="mx-auto text-gold mb-4" size={48} aria-hidden="true" />
            <p className="font-title text-2xl text-gray-700 mb-3">{site.giftList.description}</p>
          </Card>

          {site.giftList.url && (
            <div className="text-center">
              <Button as="a" href={site.giftList.url} variant="secondary" size="lg">
                Ver lista completa de regalos
                <ArrowRight className="w-5 h-5 ml-2 shrink-0" aria-hidden="true" />
              </Button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {site.giftList.accounts.map((account, index) => (
              <m.article
                key={account.bank}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={revealViewport}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
              >
                <AccountCard account={account} />
              </m.article>
            ))}
          </div>
        </m.div>
      </Container>
    </section>
  );
}
