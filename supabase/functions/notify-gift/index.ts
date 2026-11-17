// Supabase Edge Function: cuando se reserva o libera un regalo, manda
//  - un aviso a ustedes (NOTIFY_EMAIL), y
//  - si el invitado dejó su mail, un agradecimiento con los datos del regalo.
// La dispara un Database Webhook sobre public.gift_reservations.
// Ver README → "Avisos por mail".
import { handle } from './lib.ts';
import { createSmtpSend } from './mailer.ts';

const env = (key: string) => Deno.env.get(key);
const smtpSend = createSmtpSend(env);

Deno.serve((req) => handle(req, { env, fetch, smtpSend }));
