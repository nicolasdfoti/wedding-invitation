import { useState, useEffect } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import ErrorBoundary from './components/layout/ErrorBoundary';
import EnvelopeReveal from './components/ui/EnvelopeReveal';
import Hero from './components/sections/Hero';
import Countdown from './components/sections/Countdown';
import Story from './components/sections/Story';
import Details from './components/sections/Details';
import DressCode from './components/sections/DressCode';
import GiftList from './components/sections/GiftList';
import Gallery from './components/sections/Gallery';
import RSVP from './components/sections/RSVP';
import Footer from './components/sections/Footer';

export default function App() {
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpened ? '' : 'hidden';
  }, [isOpened]);

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation} strict>
          <AnimatePresence>
            {!isOpened && <EnvelopeReveal onOpen={() => setIsOpened(true)} />}
          </AnimatePresence>

          {isOpened && (
            <div className="overflow-x-hidden animate-fade-in">
              <main>
                <Hero />
                <Countdown />
                <Story />
                <Details />
                <DressCode />
                <GiftList />
                <Gallery />
                <RSVP />
              </main>
              <Footer />
            </div>
          )}
        </LazyMotion>
      </MotionConfig>
    </ErrorBoundary>
  );
}
