// Envío por SMTP con la cuenta de Gmail (contraseña de aplicación).
// Supabase bloquea los puertos 25 y 587: usamos 465 (TLS directo).
import nodemailer from 'npm:nodemailer@6.9.16';
import type { Deps, Mail } from './lib.ts';

export function createSmtpSend(env: Deps['env']): (mail: Mail) => Promise<void> {
  let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

  return async (mail) => {
    transporter ??= nodemailer.createTransport({
      host: env('SMTP_HOST') || 'smtp.gmail.com',
      port: Number(env('SMTP_PORT') || 465),
      secure: (env('SMTP_SECURE') ?? 'true') !== 'false',
      auth: {
        user: (env('GMAIL_USER') ?? '').trim(),
        // Google muestra la contraseña de aplicación en grupos ("abcd efgh …"): sacamos los espacios.
        pass: (env('GMAIL_APP_PASSWORD') ?? '').replace(/\s+/g, ''),
      },
    });

    const info = await transporter.sendMail({
      from: mail.from,
      to: mail.to.join(', '),
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { replyTo: mail.replyTo } : {}),
    });
    if (info.rejected?.length) throw new Error(`SMTP rechazó: ${info.rejected.join(', ')}`);
  };
}
