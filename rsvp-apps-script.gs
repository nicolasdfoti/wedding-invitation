/**
 * Boda Sofy & Nico · RSVP (Supabase) → Google Sheets + mail de aviso
 * Reemplaza el workflow de n8n. Corre en Google, gratis y siempre prendido.
 *
 * Instalación:
 * 1. Abrí la planilla RSVP → Extensiones → Apps Script. Pegá este archivo entero.
 * 2. Cambiá SECRET por un texto largo y aleatorio.
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

const SECRET = '123456789';
const SPREADSHEET_ID = '1rzxH3G1e2Ucfs7q473AG4Ib4t65l1K-q1uyjC83B-OA';
const AVISAR_A = 'nicolasdfoti@gmail.com,sofylortega@gmail.com';
const TZ = 'America/Argentina/Buenos_Aires';

function doPost(e) {
  if (!e || !e.parameter || e.parameter.secret !== SECRET) {
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

  // Hoja 1 (gid=0): Fecha de confirmación | Nombre | Cantidad de personas |
  // Asistencia | Restricciones alimentarias | Mensaje | ID Supabase
  const hoja = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  hoja.appendRow([
    fecha,
    seguro(nombre),
    Number(r.cantidad_personas) || 0,
    asistencia,
    seguro(restricciones),
    seguro(mensaje),
    String(r.id ?? ''),
  ]);

  // El mail va aparte: si falla (por ejemplo, cupo diario de Gmail), la fila ya quedó guardada.
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
