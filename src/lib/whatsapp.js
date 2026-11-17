export function waLink(phone, text = '') {
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${phone}${query}`;
}
