import { Copy, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '../../lib/clipboard';

export default function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-fondo rounded-xl">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
        <p className="font-mono text-sm text-gray-800 break-all">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 inline-flex items-center gap-1.5 min-h-11 min-w-11 justify-center px-3 rounded-full text-xs font-semibold uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
        ) : (
          <Copy className="w-4 h-4" aria-hidden="true" />
        )}
        <span aria-live="polite" className={copied ? 'text-green-700' : 'sr-only'}>
          {copied ? '¡Copiado!' : ''}
        </span>
      </button>
    </div>
  );
}
