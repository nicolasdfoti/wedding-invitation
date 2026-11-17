import { Heart } from 'lucide-react';
import Button from '../../components/ui/Button';
import { buyLinks } from '../stores';
import { formatPrice, groupByCategory, levelLabel } from '../catalog';
import { waLink } from '../../lib/whatsapp';
import site from '../../config/site';

export function PriceLine({ gift }) {
  const price = formatPrice(gift.precio);
  const level = levelLabel(gift.nivel);
  if (price) {
    return (
      <span className="text-gray-800 tabular-nums">
        {price} <span className="text-gray-500">aprox.</span>
      </span>
    );
  }
  if (!level) return null;
  return (
    <span className="text-gray-600">
      <span className="text-accent font-semibold">{gift.nivel}</span> {level}
    </span>
  );
}

function GiftRow({ gift, releasing, onReserve, onTransfer, onRelease }) {
  const links = buyLinks(gift);
  const reserved = gift.reservado;
  const titleId = `gift-${gift.id}`;

  return (
    <li className="py-5 first:pt-0 last:pb-0" aria-labelledby={titleId}>
      <div className="flex items-start gap-4">
        {gift.imagen && (
          <img
            src={gift.imagen}
            alt=""
            loading="lazy"
            className={`w-16 h-16 shrink-0 rounded-2xl object-cover bg-fondo ${reserved ? 'opacity-50 grayscale' : ''}`}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className={reserved ? 'opacity-60' : ''}>
            <h4 id={titleId} className="font-title text-2xl leading-tight text-gray-800">
              {gift.item}
            </h4>
            {gift.detalle && <p className="mt-0.5 text-sm text-gray-500">{gift.detalle}</p>}
          </div>

          <div
            className={`mt-1 flex flex-wrap items-center justify-between gap-x-4 text-sm ${reserved ? 'opacity-60' : ''}`}
          >
            <p className="min-h-11 flex items-center">
              <PriceLine gift={gift} />
            </p>
            {reserved && (
              <p className="inline-flex items-center gap-1.5 min-h-11 text-gray-500">
                <Heart className="w-4 h-4 text-coral fill-current" aria-hidden="true" />
                Reservado
              </p>
            )}
          </div>

          {!reserved && links.length > 0 && (
            <p className="-mt-2 flex flex-wrap gap-x-4 text-sm">
              {links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center min-h-11 text-gray-600 underline decoration-accent/60 underline-offset-4 hover:text-gray-900 hover:decoration-accent"
                >
                  {link.label}
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </a>
              ))}
            </p>
          )}

          {!reserved && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <Button variant="outline" size="sm" className="min-h-11" onClick={onTransfer}>
                Prefiero transferir
              </Button>
              <Button size="sm" className="min-h-11" onClick={onReserve}>
                Lo regalo
              </Button>
            </div>
          )}
        </div>
      </div>

      {reserved && gift.mine && (
        <p className="mt-2 text-sm text-gray-600">
          Lo reservaste vos desde acá.{' '}
          <button
            type="button"
            onClick={onRelease}
            disabled={releasing}
            className="inline-flex items-center min-h-11 font-semibold text-gray-700 underline decoration-accent underline-offset-4 disabled:opacity-50"
          >
            {releasing ? 'Liberando…' : 'Liberar mi reserva'}
          </button>
        </p>
      )}
      {reserved && !gift.mine && (
        <p className="mt-1 text-xs text-gray-500">
          ¿Lo reservaste vos por error?{' '}
          <a
            href={waLink(
              site.contacts[0].phone,
              `Hola! Reservé "${gift.item}" en la lista de regalos por error, ¿lo pueden liberar?`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center min-h-11 font-semibold text-gray-700 underline decoration-accent underline-offset-4"
          >
            Escribinos
          </a>
        </p>
      )}
    </li>
  );
}

// La lista, agrupada por ambiente: un panel por ambiente, una fila por regalo.
export default function Registry({ gifts, releasingId, onReserve, onTransfer, onRelease }) {
  return (
    <div className="space-y-8 md:space-y-10">
      {groupByCategory(gifts).map(([categoria, items]) => {
        const available = items.filter((g) => !g.reservado).length;
        return (
          <section key={categoria} aria-labelledby={`room-${categoria}`}>
            <div className="flex items-baseline justify-between gap-4 mb-3 px-1">
              <h3 id={`room-${categoria}`} className="font-title text-3xl text-gray-700">
                {categoria}
              </h3>
              <p className="text-sm text-gray-500 tabular-nums">
                {available === 1 ? '1 disponible' : `${available} disponibles`}
              </p>
            </div>
            <ul className="bg-white rounded-3xl border border-gray-100 shadow-soft px-5 py-6 sm:px-8 divide-y divide-gray-100">
              {items.map((gift) => (
                <GiftRow
                  key={gift.id}
                  gift={gift}
                  releasing={releasingId === gift.id}
                  onReserve={() => onReserve(gift.id)}
                  onTransfer={() => onTransfer(gift.id)}
                  onRelease={() => onRelease(gift)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function RegistrySkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-8 w-32 rounded bg-gray-100 mb-4 mx-1" />
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft px-5 py-6 sm:px-8 divide-y divide-gray-100">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-start justify-between gap-4 py-5 first:pt-0 last:pb-0">
            <div className="flex-1">
              <div className="h-6 w-2/3 rounded bg-gray-100" />
              <div className="mt-2 h-4 w-1/3 rounded bg-gray-100" />
            </div>
            <div className="h-11 w-28 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
