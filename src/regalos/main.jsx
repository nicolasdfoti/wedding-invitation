import React from 'react';
import ReactDOM from 'react-dom/client';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import GiftsPage from './GiftsPage';
import '../styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation} strict>
          <div className="overflow-x-clip">
            <GiftsPage />
          </div>
        </LazyMotion>
      </MotionConfig>
    </ErrorBoundary>
  </React.StrictMode>
);
