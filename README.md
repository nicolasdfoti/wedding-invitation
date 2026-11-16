# Invitación de boda · Sofy & Nico

Invitación web de una sola página: sobre animado → portada, cuenta regresiva, historia, detalles del evento (con "Agregar al calendario"), código de vestimenta, regalos, galería y confirmación de asistencia (RSVP).

**Stack:** React 19 · Vite · Tailwind CSS 3 · framer-motion · Supabase (RSVP) · Google Apps Script (sincronización a Google Sheets + aviso por mail). Deploy en Vercel.

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

## Google Apps Script: RSVP → Google Sheets + mail

[`rsvp-apps-script.gs`](rsvp-apps-script.gs) recibe cada confirmación nueva de Supabase, agrega una fila en la planilla de RSVP y manda un mail de aviso. Corre gratis en Google y no necesita servidor.

Flujo: **Supabase Database Webhook** (INSERT en `rsvp`) → **Apps Script (Web App `/exec`)** → fila en la planilla + mail.

### ¿Es visible?

- **En el sitio, no.** Vite sólo publica `public/` y lo que importa el código. El `.gs` no entra en el build y los invitados no lo pueden ver.
- **En GitHub, sí.** El repo es público, así que el archivo **no contiene secretos**. El `SECRET` y los mails de aviso se guardan en las *Propiedades del script* de Google, que sólo ve tu cuenta. El ID de la planilla sí está en el código, pero sin permisos sobre la hoja no sirve de nada: la planilla tiene que estar compartida **sólo** con ustedes.

### Instalación

1. **Encabezados:** la fila 1 de la primera hoja tiene que tener
   `ID | Nombre | Personas | Asistencia | Restricciones | Mensaje | Fecha | Mesa`
   La columna *Mesa* queda vacía para completarla a mano.
2. **Pegar el script:** en la planilla, *Extensiones → Apps Script*, pegar el contenido de `rsvp-apps-script.gs`.
3. **Propiedades del script:** en *Configuración del proyecto (⚙️) → Propiedades del script*, agregar:

   | Propiedad  | Valor                                                     |
   | ---------- | --------------------------------------------------------- |
   | `SECRET`   | Texto largo y aleatorio (por ejemplo, de un gestor de contraseñas) |
   | `AVISAR_A` | Mails que reciben el aviso, separados por coma            |

   Si falta `SECRET`, el script rechaza todos los pedidos. Si falta `AVISAR_A`, guarda la fila pero no manda mail.
4. **Publicar:** *Implementar → Nueva implementación → Aplicación web*, con *Ejecutar como: Yo* y *Quién tiene acceso: Cualquier persona*. Autorizar con tu cuenta. Si aparece "Google no verificó esta app", ir a *Configuración avanzada → Ir a…*: es tu propio script. Copiar la URL que termina en `/exec`.
5. **Webhook en Supabase:** *Database → Webhooks → Create a new hook*:
   - Tabla: `public.rsvp` · Eventos: **Insert**
   - Tipo: *HTTP Request* · Método: `POST`
   - URL: `https://script.google.com/macros/s/…/exec?secret=<tu SECRET>`

   Apps Script no lee headers, por eso el secreto va en la URL. Esa URL queda guardada sólo en Supabase: no la pegues en el código ni en el repo. En los logs de Supabase vas a ver un `302`: es normal, la fila igual se guarda.
6. **Probar:** enviar un RSVP desde la web (o insertar una fila en `rsvp`) y verificar la planilla y el mail. Los errores se ven en Apps Script → *Ejecuciones*.

### Actualizar el script

Después de editar el código: *Implementar → Gestionar implementaciones → ✏️ → Versión: Nueva*. Así la URL `/exec` sigue siendo la misma y no hay que tocar el webhook.

### Seguridad

- El script antepone `'` a los textos que empiezan con `=`, `+`, `-` o `@`, para que un invitado no pueda inyectar fórmulas en la planilla.
- Si alguna vez el `SECRET` termina en un lugar público, cambialo en las Propiedades del script y en la URL del webhook de Supabase.
