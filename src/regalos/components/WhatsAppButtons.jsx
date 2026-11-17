import { MessageCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { waLink } from '../../lib/whatsapp';
import site from '../../config/site';

// Un botón de WhatsApp por cada contacto (Nico y Sofy) con el mensaje precargado.
export default function WhatsAppButtons({ text, size = 'md', className = '' }) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      {site.contacts.map((contact) => (
        <Button
          key={contact.phone}
          as="a"
          href={waLink(contact.phone, text)}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          size={size}
          fullWidth
          className="min-h-11"
        >
          <MessageCircle className="w-4 h-4 mr-2 shrink-0" aria-hidden="true" />
          Escribile a {contact.name}
        </Button>
      ))}
    </div>
  );
}
