const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateGuest({ nombre, mensaje, email = '' }) {
  const errors = {};
  const name = nombre.trim();
  if (name.length < 2) errors.nombre = 'Contanos tu nombre (al menos 2 letras).';
  else if (name.length > 100) errors.nombre = 'El nombre no puede tener más de 100 caracteres.';
  const mail = email.trim();
  if (mail && (mail.length > 254 || !EMAIL_RE.test(mail))) errors.email = 'Revisá tu mail (ej.: nombre@gmail.com).';
  if (mensaje.trim().length > 500) errors.mensaje = 'El mensaje no puede tener más de 500 caracteres.';
  return errors;
}
