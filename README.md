# Invitación de boda · Sofy & Nico

Invitación web: sobre animado → portada, cuenta regresiva, historia, detalles del evento (con "Agregar al calendario"), código de vestimenta, regalos, galería y confirmación de asistencia (RSVP). Más una segunda página, **`/regalos`**, con la lista de regalos completa y reservas.

**Stack:** React 19 · Vite · Tailwind CSS 3 · framer-motion · Supabase (RSVP y reservas de regalos) · Supabase Edge Function + Resend (aviso por mail de reservas) · Google Apps Script (sincronización del RSVP a Google Sheets + aviso por mail). Deploy en Vercel.

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

## Lista de regalos (`/regalos`)

Página aparte (Vite multi-page: [`regalos/index.html`](regalos/index.html) → [`src/regalos/`](src/regalos/)) con sus propios meta tags para que el link se vea bien en WhatsApp. [`vercel.json`](vercel.json) hace que `/regalos` funcione al recargar. Los textos salen de [`src/config/site.js`](src/config/site.js) (`giftsPage`). **Las cuentas para transferir, el titular y los WhatsApp** están en [`supabase/functions/_shared/couple.json`](supabase/functions/_shared/couple.json): los usan la invitación, `/regalos` y el mail de agradecimiento (si los cambiás, volvé a deployar la función).

La lista **se actualiza sola** cada 30 segundos (y al volver a la pestaña), así una reserva hecha en otro celular aparece sin recargar.

Usa **las mismas variables de entorno que el RSVP** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`): no hay que agregar nada en Vercel. Si faltan, la página funciona en **modo solo lectura** con [`src/data/gifts.seed.json`](src/data/gifts.seed.json): se ven los regalos y "Lo regalo" ofrece escribir por WhatsApp.

### Instalación en Supabase (una sola vez)

1. Supabase → **SQL Editor** → pegar y ejecutar [`supabase/gifts.sql`](supabase/gifts.sql). Crea las tablas, las funciones y carga los 39 ítems del Excel. Se puede volver a correr sin romper nada (no pisa ítems que ya editaron ni borra reservas). **Cada vez que cambie este archivo, volvé a ejecutarlo completo** (por ejemplo, para sumar el mail del invitado).
2. Listo: al recargar `/regalos` ya se pueden hacer reservas.

### Editar la lista (sin tocar código)

Supabase → **Table Editor** → `gift_items`. Cada fila es un regalo:

| Columna      | Para qué                                                                  |
| ------------ | ------------------------------------------------------------------------- |
| `precio`     | Precio de referencia en pesos, sin puntos (ej. `189999`). Vacío = sólo se muestra el nivel. |
| `link1/link2`| Links de compra. La tienda se detecta sola (Mercado Libre, Frávega, Garbarino…); si no, dice "Ver opción 1/2". Vacío = no aparece el botón. |
| `imagen`     | URL de una foto (opcional). Si está vacía, el regalo se muestra sin foto. |
| `nivel`      | `$`, `$$`, `$$$` (o `libre` para el aporte libre).                        |
| `orden`      | Orden en la lista (de menor a mayor).                                     |
| `activo`     | `false` para ocultarlo sin borrarlo.                                      |
| `reservable` | `false` = tarjeta destacada "Aporte libre" (nunca se reserva).            |

Para agregar un regalo, sumá una fila con un `id` nuevo (ej. `R-040`). Para no romper reservas existentes, preferí desactivar (`activo = false`) antes que borrar.

### Ver quién regaló qué

Table Editor → vista **`regalos_reservas`** (más nueva primero): ítem, nombre, mensaje, forma (`compra` / `transferencia`), estado (`activa` o `liberada`) y mail (si lo dejó). Para liberar una reserva a mano, en `gift_reservations` cambiá `estado` de `activa` a `liberada`.

### Seguridad

- Los invitados **no pueden leer ni escribir las tablas**: sólo llaman a 3 funciones (`get_gifts`, `reserve_gift`, `release_gift`) que validan largos, ítem, forma y mail, y **nunca devuelven nombres, mensajes ni mails**.
- Doble reserva imposible: la base permite una sola reserva activa por ítem; si dos personas tocan a la vez, una ve "Uy, alguien lo acaba de reservar 💛".
- "Liberar mi reserva" sólo funciona desde el mismo dispositivo: al reservar se genera un token aleatorio que queda en el navegador (`localStorage`); en la base se guarda sólo su hash.

## Mails (Gmail)

Cuando alguien **reserva** o **libera** un regalo:

- **A ustedes** les llega un aviso con ítem, categoría, quién lo regala, forma ("Lo compro" / "Transfiero el valor"), su mensaje, su mail y fecha/hora de Argentina. Asunto: `🎁 Nuevo regalo reservado: Microondas — de Juan Pérez`. Si le dan *Responder*, le contestan directo al invitado.
- **Al invitado**, si dejó su mail (es opcional), le llega un **mail de agradecimiento** de parte de ustedes con el regalo y los links para comprarlo, o los datos de las cuentas si eligió transferir. Asunto: `💛 ¡Gracias por tu regalo, Juan!`. Sólo al reservar, no al liberar.

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
