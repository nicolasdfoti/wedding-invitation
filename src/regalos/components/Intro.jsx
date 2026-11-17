import Container from '../../components/ui/Container';
import site from '../../config/site';

// La nota de los novios, como una carta corta, y los 3 pasos en una sola línea.
export default function Intro() {
  return (
    <section className="bg-white pt-16 pb-12 md:pt-24 md:pb-16" aria-label="Cómo funciona">
      <Container size="sm">
        <figure className="max-w-xl mx-auto text-center">
          <blockquote className="font-title italic text-2xl md:text-[1.9rem] leading-relaxed text-gray-700">
            {site.giftsPage.message}
          </blockquote>
          <figcaption className="mt-5 font-title text-xl text-gray-500">— {site.couple.names}</figcaption>
        </figure>

        <ol className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8 text-sm leading-relaxed text-gray-600">
          {site.giftsPage.steps.map((step, index) => (
            <li key={step} className="flex gap-4 md:block">
              <span
                className="shrink-0 font-title text-4xl leading-none text-accent md:block md:mb-3"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="pt-1 md:pt-0">
                <span className="sr-only">Paso {index + 1}: </span>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
