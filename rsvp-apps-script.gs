/**
 * Boda Sofy & Nico · RSVP (Supabase) → Google Sheets + mail de aviso
 * Reemplaza el workflow de n8n. Corre en Google, gratis y siempre prendido.
 *
 * El repo es público: este archivo NO tiene secretos ni mails. Esos datos viven en
 * las Propiedades del script (solo las ve tu cuenta de Google).
 *
 * Instalación:
 * 0. La fila 1 de la planilla ya tiene los encabezados (ver más abajo): no hay que tocarla.
 * 1. Abrí la planilla RSVP → Extensiones → Apps Script. Pegá este archivo entero.
 * 2. Configuración del proyecto (⚙️) → Propiedades del script → agregar:
 *      SECRET     = un texto largo y aleatorio (ej. generado con un gestor de contraseñas)
 *      AVISAR_A   = mails separados por coma que reciben el aviso de cada RSVP
 * 3. Implementar → Nueva implementación → tipo "Aplicación web"
 *      Ejecutar como: Yo   ·   Quién tiene acceso: Cualquier persona
 *    Autorizá con tu cuenta (si aparece "Google no verificó esta app":
 *    Configuración avanzada → Ir a ... — es tu propio script).
 * 4. Copiá la URL que termina en /exec.
 * 5. Supabase → Database → Webhooks → Create: tabla public.rsvp, evento Insert,
 *    tipo HTTP Request, método POST,
 *    URL = <URL /exec>?secret=<el mismo SECRET>
 *    (Apps Script no lee headers, por eso el secreto va en la URL.)
 *    En los logs de Supabase vas a ver un 302: es normal, la fila igual se guarda.
 * 6. Para probar: insertá una fila de prueba en rsvp y fijate la planilla y el mail.
 *
 * Si cambiás el código después: Implementar → Gestionar implementaciones →
 * editar → Versión: nueva. Así la URL /exec sigue siendo la misma.
 */

const SPREADSHEET_ID = '1rzxH3G1e2Ucfs7q473AG4Ib4t65l1K-q1uyjC83B-OA';
const TZ = 'America/Argentina/Buenos_Aires';

// Secreto y destinatarios se leen de Configuración → Propiedades del script.
const PROPS = PropertiesService.getScriptProperties();
const SECRET = PROPS.getProperty('SECRET');
const AVISAR_A = PROPS.getProperty('AVISAR_A');

function doPost(e) {
  // Sin SECRET configurado, el script rechaza todo (nunca queda abierto por error).
  if (!SECRET || !e || !e.parameter || e.parameter.secret !== SECRET) {
    return respuesta('forbidden');
  }

  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return respuesta('bad json');
  }
  if (body.type !== 'INSERT' || body.table !== 'rsvp') {
    return respuesta('ignored');
  }

  const r = body.record || {};
  const fecha = Utilities.formatDate(
    r.created_at ? new Date(r.created_at) : new Date(), TZ, 'dd/MM/yyyy HH:mm');
  const asistencia = r.asistencia ? 'Sí' : 'No';
  const nombre = texto(r.nombre);
  const restricciones = texto(r.restricciones);
  const mensaje = texto(r.mensaje);

  // Hoja 1 (gid=0), fila 1:
  // ID | Nombre | Personas | Asistencia | Restricciones | Mensaje | Fecha | Mesa
  // "Mesa" queda vacía para que la completen ustedes.
  const hoja = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  hoja.appendRow([
    String(r.id ?? ''),
    seguro(nombre),
    Number(r.cantidad_personas) || 0,
    asistencia,
    seguro(restricciones),
    seguro(mensaje),
    fecha,
  ]);

  // El mail va aparte: si falla (por ejemplo, cupo diario de Gmail), la fila ya quedó guardada.
  if (!AVISAR_A) return respuesta('ok');
  try {
    MailApp.sendEmail({
      to: AVISAR_A,
      subject: `RSVP: ${nombre || 'Sin nombre'} · ${asistencia === 'Sí'
        ? `viene (${r.cantidad_personas ?? '?'})` : 'no viene'}`,
      body: [
        `Nombre: ${nombre}`,
        `Asistencia: ${asistencia}`,
        `Cantidad de personas: ${r.cantidad_personas ?? ''}`,
        `Restricciones alimentarias: ${restricciones || '-'}`,
        `Mensaje: ${mensaje || '-'}`,
        `Fecha: ${fecha}`,
        '',
        `Planilla: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
      ].join('\n'),
    });
  } catch (err) {
    console.error('No se pudo mandar el mail: ' + err);
  }

  return respuesta('ok');
}

function texto(v) {
  return v == null ? '' : String(v).trim();
}

// Evita que un invitado escriba "=FORMULA(...)" y se ejecute en la planilla.
function seguro(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function respuesta(t) {
  return ContentService.createTextOutput(t);
}
