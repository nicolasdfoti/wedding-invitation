import Container from '../../components/ui/Container';
import WhatsAppButtons from './WhatsAppButtons';
import site from '../../config/site';

export default function Contact() {
  return (
    <section className="py-20 bg-fondo border-t border-gray-100" aria-labelledby="contact-title">
      <Container size="sm" className="text-center">
        <h2 id="contact-title" className="font-title text-4xl text-gray-700">
          Entregas y consultas
        </h2>
        <p className="mt-3 mb-8 text-gray-600">
          Para coordinar la entrega o si tenés alguna duda, escribinos por WhatsApp.
        </p>
        <WhatsAppButtons text={site.giftsPage.whatsappText} />
        <p className="mt-10 text-xs text-gray-500">{site.giftsPage.priceNote}</p>
      </Container>
    </section>
  );
}
