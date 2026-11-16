import { m } from 'framer-motion';

export default function EnvelopeReveal({ onOpen }) {
  return (
    <m.div
      // Fondo de la pantalla sutilmente oscuro para que resalte el sobre amarillo pastel
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a2a2a] overflow-hidden"
      initial={{ y: 0 }}
      exit={{ y: '-100%', opacity: 0, scale: 0.95 }}
      transition={{ duration: 1.2, ease: [0.77, 0, 0.17, 1] }}
    >
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          {/* Textura de papel rugoso */}
          <filter id="paper-texture" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="5" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2" result="light">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feBlend mode="multiply" in="SourceGraphic" in2="light" />
          </filter>

          {/* Sombra suave para no ensuciar los tonos pastel */}
          <filter id="flap-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.25" />
          </filter>

          {/* Gradientes amarillo pastel */}
          <linearGradient id="grad-bottom" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FDF3B8" />
            <stop offset="100%" stopColor="#FCF7D5" />
          </linearGradient>
          <linearGradient id="grad-left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDF5C4" />
            <stop offset="100%" stopColor="#FEF9DB" />
          </linearGradient>
          <linearGradient id="grad-right" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FDF5C4" />
            <stop offset="100%" stopColor="#FEF9DB" />
          </linearGradient>
          <linearGradient id="grad-top" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFEA" />
            <stop offset="100%" stopColor="#FEF8D0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Cuerpo del sobre */}
      <div className="absolute inset-0 pointer-events-none w-full h-full bg-[#FCF7D5]" aria-hidden="true">
        <svg
          className="w-full h-full object-cover opacity-95"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          filter="url(#paper-texture)"
        >
          {/* Fondo interior del sobre: ocre oscuro para dar profundidad */}
          <rect x="0" y="0" width="100" height="100" fill="#D4C89A" />
          <polygon points="0,0 52,52 0,100" fill="url(#grad-left)" filter="url(#flap-shadow)" />
          <polygon points="100,0 48,52 100,100" fill="url(#grad-right)" filter="url(#flap-shadow)" />
          <polygon points="0,100 100,100 50,48" fill="url(#grad-bottom)" filter="url(#flap-shadow)" />
          <polygon points="0,0 100,0 50,53" fill="url(#grad-top)" filter="url(#flap-shadow)" />
        </svg>

        {/* Viñeta en los bordes para el estilo vintage */}
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.4)] mix-blend-multiply" />
      </div>

      {/* Sello de cera + cartel indicador. Todo el bloque es clickeable. */}
      <m.button
        type="button"
        onClick={onOpen}
        className="relative z-10 flex flex-col items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b0000] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FCF7D5] rounded-3xl group"
        whileTap={{ scale: 0.96 }}
        aria-label="Abrir invitación"
      >
        <span className="relative flex items-center justify-center w-36 h-36">
          {/* Halo que late suavemente para invitar a tocar */}
          <m.span
            className="absolute w-36 h-36 rounded-full border-2 border-[#8b0000]/40"
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1.35, opacity: 0 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            aria-hidden="true"
          />

          <span
            className="absolute w-36 h-36 bg-gradient-to-br from-[#8b0000] to-[#3a0000] opacity-90 blur-[1px] shadow-2xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105"
            style={{ borderRadius: '45% 55% 42% 58% / 53% 47% 55% 45%' }}
            aria-hidden="true"
          />

          <span
            className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-[#c40000] via-[#8b0000] to-[#4a0000] shadow-[inset_0_4px_12px_rgba(255,255,255,0.25),0_10px_20px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"
            style={{ borderRadius: '52% 48% 55% 45% / 45% 53% 48% 52%' }}
            aria-hidden="true"
          >
            <span
              className="absolute inset-2 border-4 border-[#660000] shadow-[inset_0_2px_5px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.15)]"
              style={{ borderRadius: '50% 52% 48% 50% / 50% 48% 52% 50%' }}
            />
            <span
              className="absolute inset-3 border-[1px] border-[#440000] opacity-50"
              style={{ borderRadius: '48% 50% 52% 49% / 52% 50% 48% 51%' }}
            />
            <span className="absolute top-4 left-5 w-10 h-4 bg-white opacity-20 blur-[2px] rounded-full -rotate-45 pointer-events-none" />
            <span
              className="relative z-10 font-title text-5xl text-gold italic pr-1 tracking-tight"
              style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.3), -1px -1px 3px rgba(0,0,0,0.8)' }}
            >
              S<span className="text-3xl text-gold/90">&</span>N
            </span>
          </span>
        </span>

        {/* Cartel elegante */}
        <m.span
          className="mt-10 mx-4 flex flex-col items-center px-6 sm:px-8 py-4 rounded-2xl bg-[#FFFDF0]/80 backdrop-blur-sm border border-[#B8962E]/40 shadow-[0_8px_30px_rgba(90,60,10,0.18)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          aria-hidden="true"
        >
          <span className="flex items-center gap-2 sm:gap-3 text-[#8A6A1F]">
            <span className="h-px w-5 sm:w-8 bg-[#B8962E]/60" />
            <span className="uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[11px] font-semibold">
              <span className="[@media(hover:hover)]:hidden">Tocá el sello</span>
              <span className="hidden [@media(hover:hover)]:inline">Hacé clic en el sello</span>
            </span>
            <span className="h-px w-5 sm:w-8 bg-[#B8962E]/60" />
          </span>
          <m.span
            className="mt-1 font-title italic text-2xl text-[#6B1A1A]"
            animate={{ opacity: [1, 0.55, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            para abrir la invitación
          </m.span>
        </m.span>
      </m.button>
    </m.div>
  );
}
