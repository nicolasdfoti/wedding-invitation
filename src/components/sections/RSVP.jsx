import { useState } from 'react';
import { m } from 'framer-motion';
import { fadeUp } from '../../lib/motion';
import { validateRSVPForm } from '../../utils/validation';
import { submitRSVP } from '../../lib/supabase';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import Button from '../ui/Button';
import site from '../../config/site';

const EMPTY_FORM = {
  nombre: '',
  cantidadPersonas: '',
  asistencia: '',
  restricciones: '',
  mensaje: '',
};

function FormField({ as: Tag = 'input', name, label, error, className = '', children, ...props }) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      <Tag
        id={name}
        name={name}
        className={`w-full p-4 rounded-2xl border bg-white outline-none transition-colors ${
          error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-accent'
        } ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {children}
      </Tag>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const isClosed = () => site.rsvp.deadline && new Date() > new Date(site.rsvp.deadline);

export default function RSVP() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const closed = isClosed();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]?.length) {
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Los bots suelen completar todos los campos, incluido el oculto: los ignoramos en silencio.
    if (honeypot) {
      setStatus('success');
      return;
    }

    const validation = validateRSVPForm(formData);
    if (validation.hasErrors) {
      setErrors(validation.errors);
      return;
    }

    setStatus('submitting');
    setSubmitError('');

    try {
      await submitRSVP({
        nombre: formData.nombre.trim(),
        cantidadPersonas: Number(formData.cantidadPersonas),
        asistencia: formData.asistencia === 'true',
        restricciones: formData.restricciones.trim(),
        mensaje: formData.mensaje.trim(),
      });
      setStatus('success');
      setFormData(EMPTY_FORM);
    } catch (error) {
      setStatus('error');
      setSubmitError(site.rsvp.errorMessage);
      console.error('RSVP submission error:', error);
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setSubmitError('');
  };

  const submitting = status === 'submitting';
  const fieldProps = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    error: errors[name]?.[0],
    disabled: submitting,
  });

  let content;
  if (closed) {
    content = (
      <div className="text-center py-8">
        <h3 className="font-title text-3xl text-blue mb-3">Confirmaciones cerradas</h3>
        <p className="text-gray-600">{site.rsvp.closedMessage}</p>
      </div>
    );
  } else if (status === 'success') {
    content = (
      <div className="text-center py-8" role="status" aria-live="polite">
        <svg
          className="mx-auto text-sage mb-4"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h3 className="font-title text-3xl text-blue mb-3">¡Confirmado!</h3>
        <p className="text-gray-600 mb-6">{site.rsvp.successMessage}</p>
        <Button onClick={handleReset} variant="secondary" size="md">
          Confirmar otra familia o grupo
        </Button>
      </div>
    );
  } else {
    content = (
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FormField
          {...fieldProps('nombre')}
          label="Nombre y apellido"
          type="text"
          placeholder={site.rsvp.form.namePlaceholder}
          autoComplete="name"
        />

        <FormField
          {...fieldProps('cantidadPersonas')}
          label="Cantidad de personas"
          type="number"
          inputMode="numeric"
          min="1"
          max="20"
          placeholder={site.rsvp.form.cantidadPersonasPlaceholder}
          autoComplete="off"
        />

        <FormField {...fieldProps('asistencia')} as="select" label="Asistencia" className="appearance-none">
          <option value="">¿Vas a venir?</option>
          {site.rsvp.form.attendanceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </FormField>

        <FormField
          {...fieldProps('restricciones')}
          as="textarea"
          label="Restricciones alimentarias"
          rows={3}
          placeholder={site.rsvp.form.restriccionesPlaceholder}
          className="resize-none"
        />

        <FormField
          {...fieldProps('mensaje')}
          as="textarea"
          label="Mensaje"
          rows={4}
          placeholder={site.rsvp.form.messagePlaceholder}
          className="resize-none"
        />

        {/* Honeypot anti-spam: invisible para personas, tentador para bots */}
        <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
          <label htmlFor="website">No completar este campo</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {status === 'error' && (
          <p className="text-center text-red-600 text-sm" role="alert">
            {submitError}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" loading={submitting}>
          {site.rsvp.form.submitText}
        </Button>

        <p className="text-center text-xs text-gray-400">{site.rsvp.subtitle}</p>
      </form>
    );
  }

  return (
    <section className="section bg-peach/10" aria-labelledby="rsvp-title">
      <Container size="md">
        <SectionTitle id="rsvp-title" subtitle="Confirmación" dividerColor="accent">
          {site.rsvp.title}
        </SectionTitle>

        <m.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }}>
          <Card variant="elevated" padding="xl" className="rounded-[2rem] relative">
            {content}
          </Card>
        </m.div>
      </Container>
    </section>
  );
}
