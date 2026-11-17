export const CATEGORIES = [
  { key: 'Todos' },
  { key: 'Cocina' },
  { key: 'Dormitorio' },
  { key: 'Baño' },
  { key: 'Living' },
  { key: 'Hogar' },
  { key: 'Herramientas' },
];

// Agrupa por ambiente, en el orden de CATEGORIES (lo que no esté, al final).
export function groupByCategory(gifts) {
  const order = CATEGORIES.map((c) => c.key);
  const groups = new Map();
  for (const gift of gifts) {
    if (!groups.has(gift.categoria)) groups.set(gift.categoria, []);
    groups.get(gift.categoria).push(gift);
  }
  const rank = (name) => (order.includes(name) ? order.indexOf(name) : order.length);
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b));
}

export const LEVELS = [
  { key: '$', label: 'Económico' },
  { key: '$$', label: 'Medio' },
  { key: '$$$', label: 'Alto' },
];

export function levelLabel(nivel) {
  return LEVELS.find((l) => l.key === nivel)?.label ?? '';
}

const ars = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function formatPrice(precio) {
  return typeof precio === 'number' && precio > 0 ? ars.format(precio) : null;
}

export const DEFAULT_FILTERS = { category: 'Todos', levels: [], query: '', onlyAvailable: true };

const fold = (text) =>
  (text || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function filterGifts(gifts, { category, levels, query, onlyAvailable }) {
  const q = fold(query).trim();
  return gifts.filter(
    (g) =>
      (category === 'Todos' || g.categoria === category) &&
      (levels.length === 0 || levels.includes(g.nivel)) &&
      // Lo que reservaste vos sigue visible, así podés liberarlo.
      (!onlyAvailable || !g.reservado || g.mine) &&
      (!q || fold(`${g.item} ${g.detalle} ${g.categoria}`).includes(q))
  );
}
