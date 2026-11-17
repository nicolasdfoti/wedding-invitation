const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateGuest({ nombre, mensaje, email = '', link = '' }) {
  const errors = {};
  const name = nombre.trim();
  if (name.length < 2) errors.nombre = 'Contanos tu nombre (al menos 2 letras).';
  else if (name.length > 100) errors.nombre = 'El nombre no puede tener más de 100 caracteres.';
  const mail = email.trim();
  if (mail && (mail.length > 254 || !EMAIL_RE.test(mail))) errors.email = 'Revisá tu mail (ej.: nombre@gmail.com).';
  if (link.trim() && !normalizeLink(link)) errors.link = 'Revisá el link (ej.: https://www.mercadolibre.com.ar/…).';
  if (mensaje.trim().length > 500) errors.mensaje = 'El mensaje no puede tener más de 500 caracteres.';
  return errors;
}

// Link opcional de "dónde lo compro": le agrega https:// si falta.
// Devuelve '' si está vacío y null si no parece un link.
export function normalizeLink(value) {
  const raw = value.trim();
  if (!raw) return '';
  const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  if (url.length > 500 || !/^https?:\/\/\S+\.\S+$/i.test(url)) return null;
  return url;
}
