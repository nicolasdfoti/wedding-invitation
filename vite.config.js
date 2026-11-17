import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// /regalos es una segunda página (multi-page) para que tenga sus propios
// meta tags al compartirla por WhatsApp. En dev/preview, "/regalos" (sin barra)
// se sirve igual que "/regalos/". En Vercel lo resuelve vercel.json.
function regalosRoute() {
  const rewrite = (req, _res, next) => {
    if (req.url && /^\/regalos(\?|$)/.test(req.url)) req.url = req.url.replace('/regalos', '/regalos/')
    next()
  }
  return {
    name: 'regalos-route',
    // Cuerpo con llaves: si el hook devuelve una función, Vite la toma como post-hook.
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), regalosRoute()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        regalos: resolve(import.meta.dirname, 'regalos/index.html'),
      },
    },
  },
})
