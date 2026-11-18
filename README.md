# Invitación de boda · Sofy & Nico

Invitación web: sobre animado → portada, cuenta regresiva, historia, detalles del evento (con "Agregar al calendario"), código de vestimenta, regalos, galería y confirmación de asistencia (RSVP). Más una segunda página, **`/regalos`**, con la lista de regalos completa y reservas.

**Stack:** React 19 · Vite · Tailwind CSS 3 · framer-motion · Supabase (RSVP y reservas de regalos) · Supabase Edge Function + Gmail (mails de reservas, con Resend como alternativa) · Vercel (hosting + cron).

## Qué tiene la invitación

| Sección | Detalles |
| --- | --- |
| **Sobre** | Pantalla inicial con un sello de cera apoyado sobre la punta de la solapa, como si cerrara el sobre. Un halo late suavemente y un cartel dice "Tocá el sello" en celulares o "Hacé clic en el sello" en compu. Si el invitado vuelve desde `/regalos` (`/#regalos`), el sobre no se repite. |
| **Portada y cuenta regresiva** | La fecha se formatea desde `site.wedding` con la zona horaria de Argentina. La cuenta regresiva apunta a `wedding.isoString` (12/02/2027 09:40, hora del civil). Para lectores de pantalla hay un resumen que no se anuncia cada segundo. |
| **Cuándo y Dónde** | Una tarjeta por evento (Civil, Recepción, Sellamiento) con fecha, hora, dirección y "Ver en mapa" siempre al pie. El Sellamiento aclara que no se asegura el ingreso a la sesión, pero se los espera en los jardines del Templo. Cada tarjeta tiene **Agendar en Google**, que abre Google Calendar con ese evento ya cargado (Google acepta un evento por link). El botón **Agregar todo a Apple / Outlook** descarga un `.ics` con los tres eventos. Ambos usan la duración de cada uno (`durationMinutes`). |
| **Código de vestimenta** | Detalles más un recuadro destacado con `dressCode.notice` ("Mujeres: no vestimenta blanca"). |
| **Regalos** | Cuentas para transferir (alias, CBU y CVU) con botón de copiar independiente por campo, y link a `/regalos`. |
| **Galería** | Fotos en WebP con epígrafe visible también en celulares. |
| **RSVP** | Formulario validado que guarda en Supabase. Tiene un campo trampa (*honeypot*) contra bots y se cierra solo después de `rsvp.deadline` (1/1/2027), mostrando `rsvp.closedMessage`. |

**Detalles generales**

- **Accesibilidad:** las animaciones respetan *reducir movimiento* del sistema (`MotionConfig reducedMotion="user"`). Hay labels y mensajes de error asociados a cada campo.
- **Vista previa al compartir:** `index.html` tiene título, descripción y meta tags Open Graph con [`public/assets/og-image.jpg`](public/assets/og-image.jpg) (1200×630), así el link se ve bien en WhatsApp.
- **Rendimiento:** fotos optimizadas a WebP (≤1600 px, de ~3,7 MB a ~0,75 MB). framer-motion se carga con `LazyMotion`, y Supabase con import dinámico recién al enviar. Las fuentes se cargan con `preconnect`.

## Estructura

```
index.html              Página principal (meta tags / Open Graph)
regalos/index.html      Página /regalos
src/
  config/site.js        Todo el contenido: textos, fechas, eventos, cuentas, fotos
  components/sections/  Secciones de la invitación (Hero, Details, RSVP, …)
  components/ui/        Piezas reutilizables (EnvelopeReveal, Card, Button, Modal, CopyRow, …)
  regalos/              App de la lista de regalos
  lib/                  Supabase, animaciones, portapapeles, WhatsApp
  utils/                Fechas (formato, cuenta regresiva, .ics) y validación del RSVP
supabase/
  schema.sql            Tabla rsvp + RLS
  gifts.sql             Tablas y funciones de la lista de regalos
  functions/notify-gift Edge Function de mails
api/keepalive.js        Cron de Vercel para que Supabase no se pause
public/assets/          Fotos (WebP) e imagen para compartir
```

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

### Ver y administrar las confirmaciones

Las respuestas se ven en Supabase → **Table Editor** → `rsvp`. Los invitados no pueden leer esa tabla, sólo ustedes desde el panel.

**Volver el ID a 1** (por ejemplo, para borrar las pruebas antes de mandar las invitaciones), en el **SQL Editor**:

```sql
-- Borra TODAS las confirmaciones y reinicia el contador: la próxima tendrá id = 1.
truncate table public.rsvp restart identity;
```

Si la tabla ya está vacía y sólo querés reiniciar el contador:

```sql
alter table public.rsvp alter column id restart with 1;
```

> ⚠️ No reinicies el contador si quedan filas: cuando llegue a un id existente, el insert falla y el invitado ve un error.

## Lista de regalos (`/regalos`)

Página aparte (Vite multi-page: [`regalos/index.html`](regalos/index.html) → [`src/regalos/`](src/regalos/)) con sus propios meta tags para que el link se vea bien en WhatsApp. [`vercel.json`](vercel.json) hace que `/regalos` funcione al recargar. Los textos salen de [`src/config/site.js`](src/config/site.js) (`giftsPage`). **Las cuentas para transferir, el titular y los WhatsApp** están en [`supabase/functions/_shared/couple.json`](supabase/functions/_shared/couple.json): los usan la invitación, `/regalos` y el mail de agradecimiento (si los cambiás, volvé a deployar la función).

La lista **se actualiza sola** cada 30 segundos (y al volver a la pestaña), así una reserva hecha en otro celular aparece sin recargar.

Usa **las mismas variables de entorno que el RSVP** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`): no hay que agregar nada en Vercel. Si faltan, la página funciona en **modo solo lectura** con [`src/data/gifts.seed.json`](src/data/gifts.seed.json): se ven los regalos y "Lo regalo" ofrece escribir por WhatsApp.

### Instalación en Supabase (una sola vez)

1. Supabase → **SQL Editor** → pegar y ejecutar [`supabase/gifts.sql`](supabase/gifts.sql). Crea las tablas, las funciones y carga los 39 ítems del Excel. Se puede volver a correr sin romper nada (no pisa ítems que ya editaron ni borra reservas). **Cada vez que cambie este archivo, volvé a ejecutarlo completo** (por ejemplo, para sumar el mail del invitado o la forma de entrega), y hacelo **antes** de deployar el frontend: si la web nueva llama a la función vieja, las reservas fallan.
2. Listo: al recargar `/regalos` ya se pueden hacer reservas.

### Editar la lista (sin tocar código)

Supabase → **Table Editor** → `gift_items`. Cada fila es un regalo:

| Columna      | Para qué                                                                  |
| ------------ | ------------------------------------------------------------------------- |
| `precio`     | Precio de referencia en pesos, sin puntos (ej. `189999`). Vacío = sólo se muestra el nivel. |
| `link1/link2`| Links de compra. El nombre de la tienda sale del dominio: "Ver opción 1 en Mercado Libre", "Ver opción 2 en Arredo", etc.; en el popup de reserva, "Lo compro en Mercado Libre (opción 1)" (las conocidas están en [`stores.js`](supabase/functions/_shared/stores.js); las demás toman el nombre del dominio). Vacío = no aparece el botón. |
| `imagen`     | URL de una foto (opcional). Si está vacía, el regalo se muestra sin foto. |
| `nivel`      | `$`, `$$`, `$$$` (o `libre` para el aporte libre).                        |
| `orden`      | Orden en la lista (de menor a mayor).                                     |
| `activo`     | `false` para ocultarlo sin borrarlo.                                      |
| `reservable` | `false` = tarjeta destacada "Aporte libre" (nunca se reserva).            |

Para agregar un regalo, sumá una fila con un `id` nuevo (ej. `R-040`). Para no romper reservas existentes, preferí desactivar (`activo = false`) antes que borrar.

### Ver quién regaló qué

Table Editor → vista **`regalos_reservas`** (más nueva primero): ítem, nombre, mensaje, forma (`compra` / `transferencia`), estado (`activa` o `liberada`), mail (si lo dejó), `opcion` (dónde lo compra: `link1`/`link2` = uno de los links de la lista, `propia` = en otro lado), `entrega` (`llevo` = lo lleva a la boda, `envio` = lo envía y hay que pasarle la dirección) y `link_compra` (si eligió "Lo compro en otro lado" y dejó el link). Para liberar una reserva a mano, en `gift_reservations` cambiá `estado` de `activa` a `liberada`.

### Seguridad

- Los invitados **no pueden leer ni escribir las tablas**: sólo llaman a 3 funciones (`get_gifts`, `reserve_gift`, `release_gift`) que validan largos, ítem, forma y mail, y **nunca devuelven nombres, mensajes ni mails**.
- Doble reserva imposible: la base permite una sola reserva activa por ítem; si dos personas tocan a la vez, una ve "Uy, alguien lo acaba de reservar 💛".
- "Liberar mi reserva" sólo funciona desde el mismo dispositivo: al reservar se genera un token aleatorio que queda en el navegador (`localStorage`); en la base se guarda sólo su hash.

## Mails (Gmail)

Cuando alguien **reserva** o **libera** un regalo:

- **A ustedes** les llega un aviso con ítem, categoría, quién lo regala, forma ("Lo compro" / "Transfiero el valor"), entrega (lo lleva a la boda o lo envía), el link si compra en otro lado, su mensaje, su mail y fecha/hora de Argentina. Asunto: `🎁 Nuevo regalo reservado: Microondas — de Juan Pérez`. Si le dan *Responder*, le contestan directo al invitado.
- **Al invitado**, si dejó su mail (es opcional), le llega un **mail de agradecimiento** de parte de ustedes con el regalo y **sólo el link que eligió** (el de la tienda o el suyo propio), o los datos de las cuentas si eligió transferir. Si eligió enviarlo, el mail le pide que les escriba para coordinar la dirección. Asunto: `💛 ¡Gracias por tu regalo, Juan!`. Sólo al reservar, no al liberar.

**Mensaje de cierre del agradecimiento:** se edita en [`supabase/functions/_shared/couple.json`](supabase/functions/_shared/couple.json), campo `"thankYouNote"` (con `\n` dentro del texto armás otro párrafo; vacío `""` = sin mensaje). Después de editarlo hay que volver a deployar la función.

Los mails salen **desde tu Gmail** (gratis, hasta ~500 por día). Flujo: **Database Webhook** (INSERT/UPDATE en `gift_reservations`) → **Edge Function [`notify-gift`](supabase/functions/notify-gift/index.ts)** → **Gmail**. El webhook corre después de guardar la reserva, así que **si un mail falla la reserva no se cae**: el error queda registrado en la tabla `gift_email_log` y en los logs de la función.

Las claves van como **secrets de Supabase**, nunca en el frontend ni en el repo.

### Instalación

1. **Contraseña de aplicación de Google** (no es tu contraseña de Gmail):
   1. En [myaccount.google.com/security](https://myaccount.google.com/security) activá la **Verificación en 2 pasos** (si no la tenés).
   2. Entrá a [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords), poné de nombre `Lista de regalos` y tocá *Crear*.
   3. Copiá las 16 letras que aparecen (se ven una sola vez; los espacios no importan).
2. **Supabase CLI** (desde la carpeta del repo, no hace falta instalar nada):

   ```bash
   npx supabase login
   npx supabase link --project-ref <ref>   # el <ref> está en la URL del proyecto: https://<ref>.supabase.co
   ```

3. **Secreto del webhook.** Generalo **primero** y copialo, porque lo vas a pegar en dos lugares:

   ```bash
   openssl rand -hex 32
   ```

   Imprime una línea de 64 caracteres (letras `a-f` y números). **No es** el `<ref>` del proyecto.

4. **Secrets** (reemplazá cada valor; las comillas evitan problemas con los espacios de la contraseña):

   ```bash
   npx supabase secrets set GMAIL_USER="tu@gmail.com" GMAIL_APP_PASSWORD="abcd efgh ijkl mnop" NOTIFY_EMAIL="tu@gmail.com" WEBHOOK_SECRET="<las-64-letras-del-paso-3>"
   ```

   `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen cargados en las Edge Functions.

5. **Deploy de la función** (repetilo cada vez que cambie el código de `supabase/functions/` o `couple.json`):

   ```bash
   npx supabase functions deploy notify-gift --no-verify-jwt
   ```

   `--no-verify-jwt` porque la protege el `WEBHOOK_SECRET` (sin él responde `401`).

6. **Webhook:** Supabase → *Database* → *Webhooks* → *Create a new hook* (o editá el que ya tenés):
   - Nombre: `notify-gift` · Tabla: `public.gift_reservations` · Eventos: **Insert** y **Update**
   - Tipo: **Supabase Edge Functions** → `notify-gift` · Método `POST`
   - *HTTP Headers* → `x-webhook-secret` = **exactamente** las 64 letras del paso 3 (sin espacios ni comillas)
7. **Probar:** reservá un regalo en `/regalos` poniendo tu mail, y después liberalo. Te tienen que llegar 3 mails: el aviso de reserva, el agradecimiento y el aviso de liberada (revisá *Spam* la primera vez).

### Si no llegan los mails

Mirá en este orden:

1. **Table Editor → `gift_email_log`**, una fila por mail (`evento` = `reserva`, `gracias` o `liberada`):
   - `ok = true`: el mail salió. Fijate en *Spam* y en *Enviados* de tu Gmail.
   - `ok = false`: la columna `error` dice qué pasó. `535 … not accepted` = usuario o contraseña de aplicación mal cargados (repetí el paso 4).
   - **Vacía**: el webhook no llega a la función. Seguí con el punto 2.
2. **Edge Functions → `notify-gift` → *Logs***: si dice `webhook rechazado (401)`, el mensaje explica si falta el secret, si falta el header o si no coinciden (con los largos, para detectar espacios de más). Volvé a hacer los pasos 3, 4 y 6 con el mismo valor.
3. **Database → Webhooks**: que el hook exista, sobre `gift_reservations`, con Insert y Update.

### Sumar a Sofy

Con Gmail no hace falta dominio: agregala a `NOTIFY_EMAIL` separando con coma (no hace falta volver a deployar):

```bash
npx supabase secrets set NOTIFY_EMAIL="tu@gmail.com,sofy@mail.com"
```

### Alternativa: Resend

Si no cargan `GMAIL_USER`/`GMAIL_APP_PASSWORD`, la función usa [Resend](https://resend.com) con `RESEND_API_KEY`. Con su remitente de prueba sólo puede mandarle a la dirección dueña de la cuenta, así que **el agradecimiento a invitados no se envía** (queda en `gift_email_log` con el motivo) hasta verificar un dominio y cargar `FROM_EMAIL="Sofy & Nico <regalos@tudominio.com>"`.

### Tests de la función

```bash
docker run --rm -v "$PWD/supabase/functions":/fn -w /fn/notify-gift denoland/deno:2.1.4 test lib_test.ts
# o, con Deno instalado: cd supabase/functions/notify-gift && deno test lib_test.ts
```

## Supabase despierto (Vercel Cron)

En el plan gratis, Supabase **pausa los proyectos sin actividad** y, si pasa, se caen el RSVP y la lista hasta reactivarlo a mano. Para evitarlo, [`vercel.json`](vercel.json) programa un **cron diario** que llama a [`api/keepalive.js`](api/keepalive.js), y esa función hace una consulta liviana a Supabase. No hay que configurar nada: se activa solo al deployar en producción.

- Para verlo: Vercel → proyecto → *Settings → Cron Jobs* (ahí también se puede ejecutar a mano con *Run*).
- Opcional: en Vercel → *Settings → Environment Variables* agregá `CRON_SECRET` con un texto aleatorio. Así sólo Vercel puede llamar a `/api/keepalive`.
