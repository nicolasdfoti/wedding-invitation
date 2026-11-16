import { Gift, Copy, Check, ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { fadeUp, revealViewport } from '../../lib/motion';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import Button from '../ui/Button';
import site from '../../config/site';

const ACCOUNT_FIELDS = [
  { key: 'alias', label: 'Alias' },
  { key: 'cbu', label: 'CBU' },
  { key: 'cvu', label: 'CVU' },
];

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para navegadores sin Clipboard API (o sin permisos)
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  }
}

function CopyRow({ label, value, copied, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-fondo rounded-xl">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
        <p className="font-mono text-sm text-gray-800 break-all">{value}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCopy}
        aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
        ) : (
          <Copy className="w-4 h-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}

export default function GiftList() {
  const [copied, setCopied] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = async (text, id) => {
    const ok = await copyToClipboard(text);
    if (!ok) return;
    setCopied(id);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className="section bg-white" aria-labelledby="giftlist-title">
      <Container size="md">
        <SectionTitle id="giftlist-title" subtitle="Regalos" dividerColor="gold">
          {site.giftList.title}
        </SectionTitle>

        <p className="sr-only" role="status" aria-live="polite">
          {copied ? 'Copiado al portapapeles' : ''}
        </p>

        <m.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} className="space-y-8">
          <Card variant="elevated" padding="xl" className="text-center">
            <Gift className="mx-auto text-gold mb-4" size={48} aria-hidden="true" />
            <p className="font-title text-2xl text-gray-700 mb-3">{site.giftList.description}</p>
          </Card>

          {site.giftList.url && (
            <div className="text-center">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.open(site.giftList.url, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="w-5 h-5 mr-2" aria-hidden="true" />
                Ver lista completa de regalos
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
                <Card variant="outlined" padding="lg" className="h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center" aria-hidden="true">
                      <Gift className="text-gold" size={24} />
                    </div>
                    <div>
                      <h3 className="font-title text-xl text-blue">{account.bank}</h3>
                      <p className="text-sm text-gray-500">Cuenta para transferencia</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ACCOUNT_FIELDS.filter(({ key }) => account[key]).map(({ key, label }) => {
                      const id = `${account.bank}-${key}`;
                      return (
                        <CopyRow
                          key={id}
                          label={label}
                          value={account[key]}
                          copied={copied === id}
                          onCopy={() => handleCopy(account[key], id)}
                        />
                      );
                    })}
                  </div>
                </Card>
              </m.article>
            ))}
          </div>
        </m.div>
      </Container>
    </section>
  );
}
