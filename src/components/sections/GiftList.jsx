import { Gift, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import Button from '../ui/Button';
import site from '../../config/site';

export default function GiftList() {
  const { ref, isVisible } = useScrollReveal({ triggerOnce: true });
  const [copied, setCopied] = useState(null);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section
      ref={ref}
      className="section bg-white"
      aria-labelledby="giftlist-title"
    >
      <Container size="md">
        <SectionTitle
          id="giftlist-title"
          subtitle="Regalos"
          dividerColor="gold"
        >
          {site.giftList.title}
        </SectionTitle>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isVisible ? 0.2 : 0, duration: 0.6 }}
          className="space-y-8"
        >
          <Card variant="elevated" padding="xl" className="text-center">
            <Gift className="mx-auto text-gold mb-4" size={48} aria-hidden="true" />
            <h3 className="font-title text-3xl text-blue mb-3">{site.giftList.description}</h3>
            <p className="text-gray-600 max-w-xl mx-auto">
              Su presencia es el mejor regalo, pero si desean obsequiarnos algo, aquí tienen nuestras opciones:
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {site.giftList.accounts.map((account, index) => (
              <motion.article
                key={account.bank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isVisible ? 0.3 + index * 0.1 : 0, duration: 0.4 }}
              >
                <Card variant="outlined" padding="lg" className="h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center" aria-hidden="true">
                      <Gift className="text-gold" size={24} />
                    </div>
                    <div>
                      <h4 className="font-title text-xl text-blue">{account.bank}</h4>
                      <p className="text-sm text-gray-500">Cuenta para transferencia</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {account.alias && (
                      <div className="flex items-center justify-between p-3 bg-fondo rounded-xl">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500">Alias / CVU</p>
                          <p className="font-mono text-sm text-gray-800 break-all">{account.alias}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(account.alias, 'alias')}
                          aria-label={copied === 'alias' ? 'Copiado' : `Copiar ${account.alias}`}
                        >
                          {copied === 'alias' ? (
                            <>
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span className="sr-only">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" aria-hidden="true" />
                              <span className="sr-only">Copiar</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {account.cbu && (
                      <div className="flex items-center justify-between p-3 bg-fondo rounded-xl">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500">CBU</p>
                          <p className="font-mono text-sm text-gray-800 break-all">{account.cbu}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(account.cbu, 'cbu')}
                          aria-label={copied === 'cbu' ? 'Copiado' : `Copiar CBU`}
                        >
                          {copied === 'cbu' ? (
                            <>
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span className="sr-only">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" aria-hidden="true" />
                              <span className="sr-only">Copiar</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.article>
            ))}
          </div>

          {site.giftList.url && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isVisible ? 0.5 : 0, duration: 0.4 }}
              className="text-center"
            >
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.open(site.giftList.url, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="w-5 h-5 mr-2" aria-hidden="true" />
                Ver lista completa de regalos
              </Button>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}