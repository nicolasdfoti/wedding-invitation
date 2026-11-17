import { Search } from 'lucide-react';
import { CATEGORIES, LEVELS } from '../catalog';

const chipBase =
  'inline-flex items-center gap-1 shrink-0 min-h-11 px-4 rounded-full border text-sm transition-colors';
const chipOn = 'bg-accent/15 border-accent text-gray-900 font-semibold';
const chipOff = 'bg-white border-gray-200 text-gray-600 hover:border-accent/60';

export default function Filters({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const toggleLevel = (key) =>
    set({ levels: filters.levels.includes(key) ? filters.levels.filter((l) => l !== key) : [...filters.levels, key] });

  return (
    <div
      role="search"
      aria-label="Filtrar regalos"
      className="sticky top-0 z-30 -mx-6 px-6 py-3 bg-white/95 backdrop-blur border-b border-gray-100 md:static md:mx-0 md:px-0 md:py-0 md:bg-transparent md:backdrop-blur-none md:border-0"
    >
      <div className="flex items-center gap-3">
        <label className="relative flex-1 min-w-0">
          <span className="sr-only">Buscar un regalo</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Buscar…"
            className="w-full min-h-11 pl-11 pr-4 rounded-full border border-gray-200 bg-white text-sm outline-none focus:border-accent transition-colors"
            enterKeyHint="search"
          />
        </label>

        <button
          type="button"
          role="switch"
          aria-checked={filters.onlyAvailable}
          onClick={() => set({ onlyAvailable: !filters.onlyAvailable })}
          className="shrink-0 inline-flex items-center gap-2 min-h-11 px-1 rounded-full text-sm text-gray-700"
        >
          <span
            className={`relative w-10 h-6 rounded-full transition-colors ${filters.onlyAvailable ? 'bg-accent' : 'bg-gray-300'}`}
            aria-hidden="true"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                filters.onlyAvailable ? 'translate-x-4' : ''
              }`}
            />
          </span>
          <span className="sm:hidden">Disponibles</span>
          <span className="hidden sm:inline">Mostrar solo disponibles</span>
        </button>
      </div>

      {/* Móvil: categorías y precio en dos filas (cada una con scroll horizontal). Desktop: una sola fila. */}
      <div className="mt-3 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
        <div className="-mx-6 px-6 flex gap-2 overflow-x-auto no-scrollbar md:mx-0 md:px-0 md:overflow-visible md:flex-wrap" role="group" aria-label="Ambiente">
          {CATEGORIES.map(({ key }) => {
            const active = filters.category === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => set({ category: key })}
                className={`${chipBase} ${active ? chipOn : chipOff}`}
              >
                {key}
              </button>
            );
          })}
        </div>

        <span className="hidden md:block shrink-0 w-px h-6 bg-gray-200 mx-1" aria-hidden="true" />

        <div className="-mx-6 px-6 flex gap-2 overflow-x-auto no-scrollbar md:mx-0 md:px-0 md:overflow-visible md:flex-wrap" role="group" aria-label="Precio">
          {LEVELS.map(({ key, label }) => {
            const active = filters.levels.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => toggleLevel(key)}
                className={`${chipBase} ${active ? chipOn : chipOff}`}
              >
                <span className="text-accent font-semibold">{key}</span> {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
