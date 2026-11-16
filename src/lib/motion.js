// Configuración compartida para las animaciones que se disparan al hacer scroll.
export const revealViewport = { once: true, margin: '0px 0px -50px 0px' };

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: revealViewport,
};
