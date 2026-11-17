import { Gift } from 'lucide-react';
import CopyRow from './CopyRow';
import Card from './Card';
import site from '../../config/site';

const ACCOUNT_FIELDS = [
  { key: 'alias', label: 'Alias' },
  { key: 'cbu', label: 'CBU' },
  { key: 'cvu', label: 'CVU' },
];

// Tarjeta con los datos de una cuenta para transferir (cada dato con su botón de copiar).
export default function AccountCard({ account, compact = false, className = '' }) {
  return (
    <Card variant="outlined" padding={compact ? 'sm' : 'lg'} className={`h-full ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 shrink-0 bg-gold/20 rounded-xl flex items-center justify-center" aria-hidden="true">
          <Gift className="text-gold" size={24} />
        </div>
        <div>
          <h3 className="font-title text-xl text-gray-700">{account.bank}</h3>
          <p className="text-sm text-gray-500">Titular: {site.giftList.holder}</p>
        </div>
      </div>

      <div className="space-y-3">
        {ACCOUNT_FIELDS.filter(({ key }) => account[key]).map(({ key, label }) => (
          <CopyRow key={key} label={label} value={account[key]} />
        ))}
      </div>
    </Card>
  );
}
