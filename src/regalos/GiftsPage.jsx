import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Container from '../components/ui/Container';
import SectionTitle from '../components/ui/SectionTitle';
import Button from '../components/ui/Button';
import Footer from '../components/sections/Footer';
import GiftsHero from './components/GiftsHero';
import Intro from './components/Intro';
import Progress from './components/Progress';
import Filters from './components/Filters';
import Registry, { RegistrySkeleton } from './components/Registry';
import ReserveModal from './components/ReserveModal';
import FeaturedContribution from './components/FeaturedContribution';
import Contact from './components/Contact';
import { fetchGifts, releaseGift } from './api';
import { DEFAULT_FILTERS, filterGifts } from './catalog';

// Cada cuánto se actualiza sola la lista mientras la pestaña está a la vista.
const REFRESH_MS = 30_000;

export default function GiftsPage() {
  const [gifts, setGifts] = useState([]);
  const [readOnly, setReadOnly] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [modal, setModal] = useState({ id: null, mode: 'compra', open: false });
  const [releasing, setReleasing] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  // Trae la lista. Si falla un refresco en segundo plano, mantenemos lo que ya se ve.
  const load = useCallback(async () => {
    try {
      const data = await fetchGifts();
      setGifts(data.gifts);
      setReadOnly(data.readOnly);
      setStatus('ready');
    } catch (error) {
      console.error('Error al cargar la lista de regalos:', error);
      setStatus((prev) => (prev === 'ready' ? 'ready' : 'error'));
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchGifts().then(
      (data) => {
        if (!active) return;
        setGifts(data.gifts);
        setReadOnly(data.readOnly);
        setStatus('ready');
      },
      (error) => {
        console.error('Error al cargar la lista de regalos:', error);
        if (active) setStatus('error');
      }
    );
    return () => {
      active = false;
    };
  }, []);

  // Actualización automática: cada 30 s con la pestaña visible, y al volver a la pestaña.
  // Así otros celulares ven las reservas nuevas sin recargar.
  const lastRefresh = useRef(0);
  useEffect(() => {
    if (readOnly || status !== 'ready') return undefined;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastRefresh.current < 5_000) return; // focus + visibilitychange llegan juntos
      lastRefresh.current = Date.now();
      load();
    };
    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [readOnly, status, load]);

  // Vaciamos y volvemos a escribir para que el lector de pantalla repita mensajes iguales.
  const announce = (text) => {
    setAnnouncement('');
    setTimeout(() => setAnnouncement(text), 50);
  };

  const reservable = useMemo(() => gifts.filter((g) => g.reservable), [gifts]);
  const featured = useMemo(() => gifts.find((g) => !g.reservable) ?? null, [gifts]);
  const visible = useMemo(() => filterGifts(reservable, filters), [reservable, filters]);
  const reservedCount = reservable.filter((g) => g.reservado).length;
  const modalGift = gifts.find((g) => g.id === modal.id) ?? null;

  const openModal = (id, mode = 'compra') => {
    setModal({ id, mode, open: true });
    if (!readOnly) load(); // Refrescamos el estado cada vez que se abre un modal.
  };
  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  const handleReserved = (id) => {
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, reservado: true, mine: true } : g)));
    announce('Reservado. ¡Gracias!');
  };

  const handleRelease = async (gift) => {
    setReleasing(gift.id);
    try {
      const result = await releaseGift(gift.id);
      if (result?.ok) {
        setGifts((prev) => prev.map((g) => (g.id === gift.id ? { ...g, reservado: false, mine: false } : g)));
        announce(`Liberaste la reserva de ${gift.item}.`);
      } else {
        announce('No pudimos liberar la reserva. Escribinos por WhatsApp.');
      }
      await load();
    } catch (error) {
      console.error('Error al liberar la reserva:', error);
      announce('No pudimos liberar la reserva, probá de nuevo.');
    } finally {
      setReleasing(null);
    }
  };

  const retry = () => {
    setStatus('loading');
    load();
  };

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <GiftsHero />

      <main>
        <Intro />

        <section className="pt-12 pb-24 bg-fondo border-t border-gray-100" aria-labelledby="list-title">
          <Container size="sm">
            <SectionTitle id="list-title" dividerColor="gold">
              Elegí tu regalo
            </SectionTitle>

            <div className="mt-6 mb-10 min-h-[2.75rem]">
              {status === 'ready' && <Progress reserved={reservedCount} total={reservable.length} />}
            </div>

            <Filters filters={filters} onChange={setFilters} />

            <div className="mt-8">
              {status === 'loading' && (
                <div aria-busy="true" aria-label="Cargando la lista">
                  <RegistrySkeleton />
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-16" role="alert">
                  <p className="font-title text-3xl text-gray-700 mb-2">No pudimos cargar la lista.</p>
                  <p className="text-sm text-gray-500 mb-6">Revisá tu conexión y probá de nuevo.</p>
                  <Button variant="secondary" onClick={retry} className="min-h-11">
                    <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                    Probar de nuevo
                  </Button>
                </div>
              )}

              {status === 'ready' && visible.length === 0 && (
                <div className="text-center py-16">
                  <p className="font-title text-3xl text-gray-700 mb-2">Ningún regalo coincide con esos filtros</p>
                  <p className="text-sm text-gray-500 mb-6">Probá con otro ambiente o buscá otra cosa.</p>
                  <Button variant="secondary" onClick={() => setFilters(DEFAULT_FILTERS)} className="min-h-11">
                    Ver toda la lista
                  </Button>
                </div>
              )}

              {status === 'ready' && visible.length > 0 && (
                <>
                  <p className="sr-only" aria-live="polite">
                    {visible.length} regalos en la lista
                  </p>
                  <Registry
                    gifts={visible}
                    releasingId={releasing}
                    onReserve={(id) => openModal(id, 'compra')}
                    onTransfer={(id) => openModal(id, 'transferencia')}
                    onRelease={handleRelease}
                  />
                </>
              )}
            </div>
          </Container>
        </section>

        <FeaturedContribution gift={featured} />
        <Contact />
      </main>

      <Footer />

      <ReserveModal
        open={modal.open}
        mode={modal.mode}
        gift={modalGift}
        gifts={gifts}
        readOnly={readOnly}
        onClose={closeModal}
        onReserved={handleReserved}
        onTaken={load}
        onPick={(id) => openModal(id, modal.mode)}
      />
    </>
  );
}
