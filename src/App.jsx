import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/layout/ErrorBoundary';
import EnvelopeReveal from './components/ui/EnvelopeReveal';
import Hero from './components/sections/Hero';
import Countdown from './components/sections/Countdown';
import Story from './components/sections/Story';
import Details from './components/sections/Details';
import Location from './components/sections/Location';
import DressCode from './components/sections/DressCode';
import GiftList from './components/sections/GiftList';
import Gallery from './components/sections/Gallery';
import RSVP from './components/sections/RSVP';
import Footer from './components/sections/Footer';

export default function App() {
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpened ? 'unset' : 'hidden';
  }, [isOpened]);

  return (
    <ErrorBoundary>
      <AnimatePresence>
        {!isOpened && <EnvelopeReveal onOpen={() => setIsOpened(true)} />}
      </AnimatePresence>

      {isOpened && (
        <div className="overflow-x-hidden animate-fade-in">
          <Hero />
          <Countdown />
          <Story />
          <Details />
          <Location />
          <DressCode />
          <GiftList />
          <Gallery />
          <RSVP />
          <Footer />
        </div>
      )}
    </ErrorBoundary>
  );
}