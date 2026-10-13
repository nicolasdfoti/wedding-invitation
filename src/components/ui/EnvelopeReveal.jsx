import { motion } from 'framer-motion';

export default function EnvelopeReveal({ onOpen }) {
  return (
    <motion.div
      // Fondo de la pantalla sutilmente oscuro para que resalte el sobre amarillo pastel
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2a2a2a] overflow-hidden"
      initial={{ y: 0 }}
      exit={{ y: "-100%", opacity: 0, scale: 0.95 }}
      transition={{ duration: 1.2, ease: [0.77, 0, 0.17, 1] }} 
    >
      <svg className="absolute w-0 h-0">
        <defs>
          {/* Mantenemos la textura de papel rugoso */}
          <filter id="paper-texture" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="5" result="noise" />
            <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="2" result="light">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
            <feBlend mode="multiply" in="SourceGraphic" in2="light" />
          </filter>

          {/* Sombra un poco más suave para que no ensucie los tonos pastel */}
          <filter id="flap-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.25" />
          </filter>

          {/* GRADIENTES AMARILLO PASTEL */}
          {/* Solapa inferior: un amarillo pastel con un poco más de peso */}
          <linearGradient id="grad-bottom" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FDF3B8" /> 
            <stop offset="100%" stopColor="#FCF7D5" />
          </linearGradient>
          
          {/* Solapas laterales: tonos intermedios cálidos */}
          <linearGradient id="grad-left" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDF5C4" />
            <stop offset="100%" stopColor="#FEF9DB" />
          </linearGradient>
          <linearGradient id="grad-right" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FDF5C4" />
            <stop offset="100%" stopColor="#FEF9DB" />
          </linearGradient>
          
          {/* Solapa superior: la más clara (donde pega la luz) */}
          <linearGradient id="grad-top" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFEA" />
            <stop offset="100%" stopColor="#FEF8D0" />
          </linearGradient>
        </defs>
      </svg>

      {/* 2. Cuerpo del Sobre */}
      <div className="absolute inset-0 pointer-events-none w-full h-full bg-[#FCF7D5]">
        <svg
          className="w-full h-full object-cover opacity-95"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          filter="url(#paper-texture)"
        >
          {/* Fondo interior del sobre: un amarillo/ocre oscuro para dar profundidad */}
          <rect x="0" y="0" width="100" height="100" fill="#D4C89A" />

          {/* Solapas con los nuevos gradientes amarillos */}
          <polygon points="0,0 52,52 0,100" fill="url(#grad-left)" filter="url(#flap-shadow)" />
          <polygon points="100,0 48,52 100,100" fill="url(#grad-right)" filter="url(#flap-shadow)" />
          <polygon points="0,100 100,100 50,48" fill="url(#grad-bottom)" filter="url(#flap-shadow)" />
          <polygon points="0,0 100,0 50,53" fill="url(#grad-top)" filter="url(#flap-shadow)" />
        </svg>
        
        {/* Viñeta oscurecida en los bordes para mantener el estilo vintage */}
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.4)] mix-blend-multiply" />
      </div>

      {/* 3. Sello de Cera Rojo (contraste perfecto con el amarillo) */}
      <motion.button
        onClick={onOpen}
        className="relative z-10 flex items-center justify-center cursor-pointer focus:outline-none group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Abrir invitación"
      >
        <div 
          className="absolute w-36 h-36 bg-gradient-to-br from-[#8b0000] to-[#3a0000] opacity-90 blur-[1px] shadow-2xl transition-transform duration-300 group-hover:rotate-6"
          style={{ borderRadius: '45% 55% 42% 58% / 53% 47% 55% 45%' }}
        />
        
        <div 
          className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-[#c40000] via-[#8b0000] to-[#4a0000] shadow-[inset_0_4px_12px_rgba(255,255,255,0.25),0_10px_20px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:-rotate-3"
          style={{ borderRadius: '52% 48% 55% 45% / 45% 53% 48% 52%' }}
        >
          <div 
            className="absolute inset-2 border-4 border-[#660000] shadow-[inset_0_2px_5px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.15)]"
            style={{ borderRadius: '50% 52% 48% 50% / 50% 48% 52% 50%' }}
          />
          <div 
            className="absolute inset-3 border-[1px] border-[#440000] opacity-50"
            style={{ borderRadius: '48% 50% 52% 49% / 52% 50% 48% 51%' }}
          />

          <div className="absolute top-4 left-5 w-10 h-4 bg-white opacity-20 blur-[2px] rounded-full transform -rotate-45 pointer-events-none" />
          
          <span 
            className="relative z-10 font-title text-5xl text-gold italic pr-1 tracking-tight"
            style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.3), -1px -1px 3px rgba(0,0,0,0.8)' }}
          >
            S<span className="text-3xl text-gold/90">&</span>N
          </span>
        </div>
      </motion.button>
    </motion.div>
  );
}