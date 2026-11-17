// Compartido entre la página (/regalos) y la función de mails (notify-gift).
// Nombre de la tienda a partir del dominio del link.
const STORES = [
  [/(^|\.)mercadolibre\.|(^|\.)meli\./, 'Mercado Libre'],
  [/(^|\.)fravega\./, 'Frávega'],
  [/(^|\.)garbarino\./, 'Garbarino'],
  [/(^|\.)musimundo\./, 'Musimundo'],
  [/(^|\.)easy\.com\./, 'Easy'],
  [/(^|\.)sodimac\./, 'Sodimac'],
  [/(^|\.)falabella\./, 'Falabella'],
  [/(^|\.)cetrogar\./, 'Cetrogar'],
  [/(^|\.)carrefour\./, 'Carrefour'],
  [/(^|\.)cotodigital\d*\.|(^|\.)coto\./, 'Coto'],
  [/(^|\.)tiendamia\./, 'Tiendamia'],
  [/(^|\.)megatone\./, 'Megatone'],
  [/(^|\.)naldo\./, 'Naldo'],
  [/(^|\.)oncity\./, 'OnCity'],
  [/(^|\.)amazon\./, 'Amazon'],
  [/(^|\.)walmart\./, 'Walmart'],
  [/(^|\.)samsung\./, 'Samsung'],
  [/(^|\.)philips\./, 'Philips'],
  [/(^|\.)hendel\./, 'Hendel'],
  [/(^|\.)arredo\./, 'Arredo'],
  [/(^|\.)bgh\./, 'BGH'],
  [/(^|\.)estiloaustral\./, 'Estilo Austral'],
];

// Terminaciones de dominio que no son el nombre de la tienda.
const SUFFIXES = new Set(['com', 'ar', 'net', 'org', 'co', 'uy', 'cl', 'mx', 'br', 'es', 'us', 'io', 'app', 'shop', 'store', 'tienda', 'online', 'site', 'web']);

// Para tiendas que no están en la lista: "arredo.com.ar" → "Arredo".
function nameFromHost(host) {
  const labels = host.split('.');
  while (labels.length && SUFFIXES.has(labels[labels.length - 1])) labels.pop();
  const name = labels.pop();
  if (!name || name.length < 2 || /^\d+$/.test(name)) return null;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function storeName(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return STORES.find(([pattern]) => pattern.test(host))?.[1] ?? nameFromHost(host);
  } catch {
    return null;
  }
}

// Links de compra de un ítem:
// { key, url, store, name, option, label } → "Ver opción 2 en Frávega" (o "Ver opción 2" si no se reconoce la tienda).
export function buyLinks(gift) {
  return [gift.link1, gift.link2]
    .map((url, index) => ({ url: (url || '').trim(), index }))
    .filter(({ url }) => /^https?:\/\//i.test(url))
    .map(({ url, index }) => {
      const name = storeName(url);
      const option = `opción ${index + 1}`;
      return {
        key: `link${index + 1}`,
        url,
        name,
        option,
        store: name ?? `la ${option}`,
        label: name ? `Ver ${option} en ${name}` : `Ver ${option}`,
      };
    });
}
