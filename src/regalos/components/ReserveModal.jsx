import { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import AccountCard from '../../components/ui/AccountCard';
import WhatsAppButtons from './WhatsAppButtons';
import { PriceLine } from './Registry';
import { Honeypot, TextField } from './FormFields';
import { validateGuest } from '../validation';
import { reserveGift } from '../api';
import { buyLinks } from '../stores';
import { formatPrice } from '../catalog';
import site from '../../config/site';

const SERVER_ERRORS = {
  invalid_name: 'Revisá tu nombre: tiene que tener entre 2 y 100 caracteres.',
  invalid_message: 'El mensaje puede tener hasta 500 caracteres.',
  invalid_email: 'Revisá tu mail: parece que tiene un error.',
  not_found: 'Este regalo ya no está en la lista.',
  not_reservable: 'Este regalo no se puede reservar.',
};
const GENERIC_ERROR = 'No se pudo guardar la reserva. Revisá tu conexión y probá de nuevo.';

// Dónde lo va a comprar: uno por link de compra y "en otro lado".
// (Transferir tiene su propio botón: "Prefiero transferir".)
function purchaseOptions(gift) {
  const links = buyLinks(gift);
  return [
    ...links.map((link) => ({
      value: link.key,
      forma: 'compra',
      label: `Lo compro en ${link.store}`,
      cta: `Reservar e ir a ${link.store}`,
      link,
    })),
    {
      value: 'propia',
      forma: 'compra',
      label: links.length ? 'Lo compro en otro lado' : 'Lo compro yo',
      cta: 'Reservar a mi nombre',
    },
  ];
}

function TransferDetails({ gift }) {
  const price = formatPrice(gift.precio);
  return (
    <div className="space-y-3">
      {price && (
        <p className="text-sm text-gray-600">
          Valor de referencia: <span className="font-semibold text-gray-800 tabular-nums">{price}</span>
        </p>
      )}
      {site.giftList.accounts.map((account) => (
        <AccountCard key={account.bank} account={account} compact />
      ))}
    </div>
  );
}

function LinkButton({ link, primary = false }) {
  return (
    <Button
      as="a"
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      variant={primary ? 'primary' : 'secondary'}
      size={primary ? 'lg' : 'sm'}
      fullWidth
      className="min-h-11"
    >
      {primary ? `Ir a ${link.store}` : link.label}
      <ExternalLink className="w-4 h-4 ml-2 shrink-0" aria-hidden="true" />
      <span className="sr-only"> (se abre en otra pestaña)</span>
    </Button>
  );
}

function Suggestions({ gift, gifts, onPick }) {
  const options = gifts
    .filter((g) => g.reservable && !g.reservado && g.id !== gift.id && g.categoria === gift.categoria)
    .slice(0, 3);
  if (options.length === 0) return null;
  return (
    <div className="mt-6">
      <p className="text-sm text-gray-600 mb-2">Otros regalos de {gift.categoria.toLowerCase()} que siguen libres:</p>
      <ul className="divide-y divide-gray-100 border-y border-gray-100">
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              onClick={() => onPick(option.id)}
              className="w-full min-h-11 flex items-center justify-between gap-3 py-3 text-left hover:bg-fondo transition-colors"
            >
              <span className="font-title text-xl text-gray-800">{option.item}</span>
              <span className="text-sm shrink-0">
                <PriceLine gift={option} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TRANSFER_CHOICE = { value: 'transferencia', forma: 'transferencia', cta: 'Reservar a mi nombre' };

// mode: 'compra' ("Lo regalo") o 'transferencia' ("Prefiero transferir").
function ReserveContent({ gift, gifts, mode, readOnly, onClose, onReserved, onTaken, onPick }) {
  const transfer = mode === 'transferencia';
  const options = transfer ? [TRANSFER_CHOICE] : purchaseOptions(gift);
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '', choice: options[0].value });
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('form'); // form | submitting | success | taken
  const [submitError, setSubmitError] = useState('');
  const topRef = useRef(null);

  // Al confirmar (o si lo reservó otro), volvemos arriba del modal para que se vea el resultado.
  useEffect(() => {
    if (phase === 'success' || phase === 'taken') {
      topRef.current?.closest('[role="dialog"]')?.scrollTo({ top: 0 });
    }
  }, [phase]);

  const choice = options.find((o) => o.value === form.choice) ?? options[0];
  const links = buyLinks(gift);

  if (readOnly && transfer) {
    return (
      <div className="space-y-5">
        <p className="text-gray-600">Podés transferirnos el valor a cualquiera de estas cuentas.</p>
        <TransferDetails gift={gift} />
        <p className="text-sm text-gray-600">
          Después escribinos y lo marcamos como reservado para que nadie más lo elija.
        </p>
        <WhatsAppButtons text={`Hola! Les transferí el valor de "${gift.item}" de la lista de regalos 🎁`} size="sm" />
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="space-y-5">
        <p className="text-gray-600">
          Por ahora las reservas se hacen por WhatsApp: escribinos y lo marcamos como reservado para que nadie más lo
          elija.
        </p>
        <WhatsAppButtons text={`Hola! Quiero regalarles "${gift.item}" de la lista de regalos 🎁`} />
        {links.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-sm text-gray-600">Mientras tanto, podés verlo acá:</p>
            {links.map((link) => (
              <LinkButton key={link.url} link={link} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Si al refrescar la lista vemos que otra persona lo reservó, avisamos.
  if (phase === 'taken' || (phase === 'form' && gift.reservado && !gift.mine)) {
    return (
      <div role="status" ref={topRef}>
        <p className="font-title text-2xl text-gray-800">Uy, alguien lo acaba de reservar 💛</p>
        <Suggestions gift={gift} gifts={gifts} onPick={onPick} />
        <Button variant="ghost" fullWidth className="mt-6 min-h-11" onClick={onClose}>
          Volver a la lista
        </Button>
      </div>
    );
  }

  if (phase === 'success') {
    const firstName = form.nombre.trim().split(/\s+/)[0];
    const otherLinks = links.filter((link) => link.key !== choice.link?.key);
    return (
      <div className="space-y-6">
        <div role="status" ref={topRef}>
          <p className="font-title text-3xl text-gray-800">¡Listo, {firstName}! Quedó reservado.</p>
          <p className="mt-2 text-sm text-gray-600">Ya nadie más lo puede elegir.</p>
          {form.email.trim() && (
            <p className="mt-2 text-sm text-gray-600">
              Te mandamos un mail a <span className="font-semibold text-gray-700 break-all">{form.email.trim()}</span> con
              estos datos. Si no lo ves, fijate en spam.
            </p>
          )}
        </div>

        {choice.forma === 'transferencia' ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Transferí cuando quieras a cualquiera de estas cuentas:</p>
            <TransferDetails gift={gift} />
          </div>
        ) : (
          <div className="space-y-3">
            {choice.link && <LinkButton link={choice.link} primary />}
            <p className="text-sm text-gray-600">
              {choice.link
                ? 'Si encontrás otro modelo o tienda que te guste, también vale.'
                : 'Comprálo donde quieras y en el modelo que te guste.'}
            </p>
            {otherLinks.map((link) => (
              <LinkButton key={link.url} link={link} />
            ))}
          </div>
        )}

        <div className="space-y-3 pt-5 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {choice.forma === 'transferencia'
              ? '¿Alguna duda? Escribinos.'
              : 'Traelo a la fiesta o escribinos para coordinar la entrega.'}
          </p>
          <WhatsAppButtons
            text={
              choice.forma === 'transferencia'
                ? `Hola! Reservé "${gift.item}" de la lista de regalos y les voy a transferir el valor 🎁`
                : `Hola! Reservé "${gift.item}" de la lista de regalos 🎁 ¿Cómo coordinamos la entrega?`
            }
            size="sm"
          />
        </div>

        <Button variant="ghost" fullWidth className="min-h-11" onClick={onClose}>
          Volver a la lista
        </Button>
      </div>
    );
  }

  const submitting = phase === 'submitting';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) {
      onClose();
      return;
    }
    const validation = validateGuest(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setPhase('submitting');
    setSubmitError('');
    try {
      const result = await reserveGift({
        itemId: gift.id,
        nombre: form.nombre.trim(),
        mensaje: form.mensaje.trim(),
        email: site.giftsPage.thankYouEmail ? form.email.trim() : '',
        forma: choice.forma,
      });
      if (result?.ok) {
        setPhase('success');
        onReserved(gift.id);
      } else if (result?.error === 'taken') {
        setPhase('taken');
        onTaken();
      } else {
        setPhase('form');
        setSubmitError(SERVER_ERRORS[result?.error] ?? GENERIC_ERROR);
      }
    } catch (error) {
      console.error('Error al reservar:', error);
      setPhase('form');
      setSubmitError(GENERIC_ERROR);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <p className="text-sm -mt-2">
        {gift.detalle && <span className="block text-gray-500">{gift.detalle}</span>}
        <PriceLine gift={gift} />
      </p>

      {transfer && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Transferinos el valor a cualquiera de estas cuentas y reservalo a tu nombre.
          </p>
          <TransferDetails gift={gift} />
        </div>
      )}

      {!transfer && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-gray-700">¿Dónde lo vas a comprar?</legend>
          <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {options.map((option) => {
              const checked = form.choice === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 min-h-12 px-4 py-3 text-sm cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-accent ${
                    checked ? 'bg-accent/10 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-fondo'
                  }`}
                >
                  <input
                    type="radio"
                    name="choice"
                    value={option.value}
                    checked={checked}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-4 h-4 accent-accent"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <TextField
        id="reserve-nombre"
        name="nombre"
        label="Tu nombre"
        hint="Sólo lo vemos nosotros."
        value={form.nombre}
        onChange={handleChange}
        error={errors.nombre}
        autoComplete="name"
        maxLength={100}
        required
        disabled={submitting}
        data-autofocus
      />

      {site.giftsPage.thankYouEmail && (
        <TextField
          id="reserve-email"
          name="email"
          type="email"
          label="Tu mail (opcional)"
          hint="Te mandamos un mail de agradecimiento con los datos del regalo."
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          disabled={submitting}
        />
      )}

      <TextField
        id="reserve-mensaje"
        as="textarea"
        name="mensaje"
        label="Un mensaje para nosotros (opcional)"
        rows={3}
        value={form.mensaje}
        onChange={handleChange}
        error={errors.mensaje}
        maxLength={500}
        disabled={submitting}
        className="resize-none"
      />

      <Honeypot value={honeypot} onChange={setHoneypot} />

      {submitError && (
        <p className="text-sm text-center text-red-600" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" fullWidth size="md" className="min-h-12" loading={submitting}>
        {choice.cta}
      </Button>
    </form>
  );
}

export default function ReserveModal({ open, mode, gift, gifts, readOnly, onClose, onReserved, onTaken, onPick }) {
  const title = gift ? (mode === 'transferencia' ? `Transferir: ${gift.item}` : gift.item) : '';
  return (
    <Modal open={open && Boolean(gift)} onClose={onClose} title={title}>
      {gift && (
        <ReserveContent
          key={`${mode}-${gift.id}`}
          gift={gift}
          gifts={gifts}
          mode={mode}
          readOnly={readOnly}
          onClose={onClose}
          onReserved={onReserved}
          onTaken={onTaken}
          onPick={onPick}
        />
      )}
    </Modal>
  );
}
