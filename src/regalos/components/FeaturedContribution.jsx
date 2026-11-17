import Container from '../../components/ui/Container';
import AccountCard from '../../components/ui/AccountCard';
import site from '../../config/site';

export default function FeaturedContribution({ gift }) {
  return (
    <section className="py-24 bg-white" aria-labelledby="aporte-title">
      <Container size="md">
        <div className="rounded-[2rem] p-[2px] bg-gradient-to-br from-peach via-cream to-sky shadow-soft">
          <div className="rounded-[calc(2rem-2px)] bg-white px-4 py-10 sm:px-6 md:p-12">
            <div className="text-center max-w-xl mx-auto">
              {/* Siempre en una línea: el tamaño se adapta al ancho de la pantalla. */}
              <h2
                id="aporte-title"
                className="font-title whitespace-nowrap text-[clamp(1.1rem,5.6vw,3rem)] leading-tight text-gray-700"
              >
                <span aria-hidden="true">💌 </span>
                {gift?.item ?? 'Aporte libre / Luna de miel'}
              </h2>
              <p className="mt-4 text-gray-600">
                Si preferís no elegir un regalo, podés transferirnos el monto que quieras. Lo vamos a usar para la luna
                de miel.
              </p>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {site.giftList.accounts.map((account) => (
                <AccountCard key={account.bank} account={account} compact className="md:p-6" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
