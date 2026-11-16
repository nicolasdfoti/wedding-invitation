# Invitación de boda · Sofy & Nico

Invitación web de una sola página: sobre animado → portada, cuenta regresiva, historia, detalles del evento (con "Agregar al calendario"), código de vestimenta, regalos, galería y confirmación de asistencia (RSVP).

**Stack:** React 19 · Vite · Tailwind CSS 3 · framer-motion · Supabase (RSVP) · n8n (sincronización a Google Sheets). Deploy en Vercel.

## Desarrollo

```bash
npm install
cp .env.example .env   # completar con los datos de Supabase
npm run dev
```

| Comando           | Qué hace                         |
| ----------------- | -------------------------------- |
| `npm run dev`     | Servidor de desarrollo           |
| `npm run build`   | Build de producción en `dist/`   |
| `npm run preview` | Sirve el build localmente        |
| `npm run lint`    | ESLint                           |

### Variables de entorno

| Variable                 | Descripción                       |
| ------------------------ | --------------------------------- |
| `VITE_SUPABASE_URL`      | URL del proyecto de Supabase      |
| `VITE_SUPABASE_ANON_KEY` | Anon key (pública) de Supabase    |

En desarrollo, si faltan, el RSVP simula el envío. **En producción el envío falla** (y el invitado ve el error) para no perder confirmaciones en silencio: asegurate de cargarlas en Vercel → Settings → Environment Variables.

## Contenido

Todo el texto, fechas, direcciones, cuentas y fotos se editan en [`src/config/site.js`](src/config/site.js). Las fotos viven en `public/assets/` en formato WebP (≤1600 px).

## Supabase

El esquema y las políticas de seguridad (RLS) están en [`supabase/schema.sql`](supabase/schema.sql). La anon key es pública, así que la tabla `rsvp` sólo debe permitir **INSERT** para `anon` (nada de SELECT/UPDATE/DELETE).

## n8n: RSVP → Google Sheets

[`n8n-rsvp-to-google-sheets.json`](n8n-rsvp-to-google-sheets.json) es un workflow que agrega una fila a la planilla de confirmaciones cada vez que se inserta un RSVP en Supabase.

Flujo: **Supabase Database Webhook** → **Webhook (n8n)** → filtro `INSERT` en `rsvp` → formateo → **Google Sheets: Append row**.

1. **Importar:** en n8n → *Workflows* → *Import from file* → elegir el JSON.
2. **Webhook:** en el nodo *Webhook Supabase*, crear una credencial **Header Auth** con nombre `x-webhook-secret` y un valor secreto largo. Activar el workflow y copiar la **Production URL** (termina en `/webhook/rsvp-boda`).
3. **Google Sheets:** en el nodo *Agregar fila*, asignar la credencial de Google (OAuth2). La planilla ya está configurada (primera pestaña). En la fila 1 poner estos encabezados exactos:

   `Fecha de confirmación` · `Nombre` · `Cantidad de personas` · `Asistencia` · `Restricciones alimentarias` · `Mensaje` · `ID Supabase`

4. **Supabase:** Dashboard → *Database* → *Webhooks* → *Create a new hook*:
   - Tabla: `public.rsvp` · Eventos: **Insert**
   - Tipo: *HTTP Request* · Método: `POST` · URL: la Production URL de n8n
   - HTTP Headers: `x-webhook-secret: <el mismo secreto>`
5. **Probar:** enviar un RSVP desde la web y verificar la nueva fila en la planilla (y la ejecución en n8n).
