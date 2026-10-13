import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { validateRSVPForm } from '../../utils/validation';
import { submitRSVP } from '../../lib/supabase';
import Container from '../ui/Container';
import SectionTitle from '../ui/SectionTitle';
import Card from '../ui/Card';
import Button from '../ui/Button';
import site from '../../config/site';

export default function RSVP() {
  const { ref, isVisible } = useScrollReveal({ triggerOnce: true });
  const [formData, setFormData] = useState({
    nombre: '',
    cantidadPersonas: '',
    asistencia: '',
    restricciones: '',
    mensaje: '',
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: [] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setFormData({ nombre: '', cantidadPersonas: '', asistencia: '', restricciones: '', mensaje: '' });
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

  return (
    <section
      ref={ref}
      className="section bg-peach/10"
      aria-labelledby="rsvp-title"
    >
      <Container size="md">
        <SectionTitle
          id="rsvp-title"
          subtitle="Confirmación"
          dividerColor="accent"
        >
          {site.rsvp.title}
        </SectionTitle>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: isVisible ? 0.2 : 0, duration: 0.6 }}
        >
          <Card variant="elevated" padding="xl" className="rounded-[2rem]">
            {status === 'success' ? (
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
                  Enviar otra confirmación
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <label htmlFor="nombre" className="sr-only">
                    Nombre y apellido
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder={site.rsvp.form.namePlaceholder}
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border ${
                      errors.nombre?.length
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-200 focus:border-accent'
                    } outline-none transition-colors`}
                    aria-invalid={errors.nombre?.length > 0}
                    aria-describedby={errors.nombre?.length ? 'nombre-error' : undefined}
                    disabled={status === 'submitting'}
                    autoComplete="name"
                  />
                  {errors.nombre?.length > 0 && (
                    <p id="nombre-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.nombre[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="cantidadPersonas" className="sr-only">
                    Cantidad de personas
                  </label>
                  <input
                    type="number"
                    id="cantidadPersonas"
                    name="cantidadPersonas"
                    placeholder={site.rsvp.form.cantidadPersonasPlaceholder}
                    value={formData.cantidadPersonas}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    className={`w-full p-4 rounded-2xl border ${
                      errors.cantidadPersonas?.length
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-200 focus:border-accent'
                    } outline-none transition-colors`}
                    aria-invalid={errors.cantidadPersonas?.length > 0}
                    aria-describedby={errors.cantidadPersonas?.length ? 'cantidadPersonas-error' : undefined}
                    disabled={status === 'submitting'}
                    autoComplete="off"
                  />
                  {errors.cantidadPersonas?.length > 0 && (
                    <p id="cantidadPersonas-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.cantidadPersonas[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="asistencia" className="sr-only">
                    Asistencia
                  </label>
                  <select
                    id="asistencia"
                    name="asistencia"
                    value={formData.asistencia}
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border ${
                      errors.asistencia?.length
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-200 focus:border-accent'
                    } outline-none transition-colors appearance-none bg-white`}
                    aria-invalid={errors.asistencia?.length > 0}
                    aria-describedby={errors.asistencia?.length ? 'asistencia-error' : undefined}
                    disabled={status === 'submitting'}
                  >
                    <option value="">Seleccionar...</option>
                    {site.rsvp.form.attendanceOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.asistencia?.length > 0 && (
                    <p id="asistencia-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.asistencia[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="restricciones" className="sr-only">
                    Restricciones alimentarias
                  </label>
                  <textarea
                    id="restricciones"
                    name="restricciones"
                    rows={3}
                    placeholder={site.rsvp.form.restriccionesPlaceholder}
                    value={formData.restricciones}
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border ${
                      errors.restricciones?.length
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-200 focus:border-accent'
                    } outline-none transition-colors resize-none`}
                    aria-invalid={errors.restricciones?.length > 0}
                    aria-describedby={errors.restricciones?.length ? 'restricciones-error' : undefined}
                    disabled={status === 'submitting'}
                  />
                  {errors.restricciones?.length > 0 && (
                    <p id="restricciones-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.restricciones[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="mensaje" className="sr-only">
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={4}
                    placeholder={site.rsvp.form.messagePlaceholder}
                    value={formData.mensaje}
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border ${
                      errors.mensaje?.length
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-gray-200 focus:border-accent'
                    } outline-none transition-colors resize-none`}
                    aria-invalid={errors.mensaje?.length > 0}
                    aria-describedby={errors.mensaje?.length ? 'mensaje-error' : undefined}
                    disabled={status === 'submitting'}
                  />
                  {errors.mensaje?.length > 0 && (
                    <p id="mensaje-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.mensaje[0]}
                    </p>
                  )}
                </div>

                {status === 'error' && (
                  <p className="text-center text-red-600 text-sm" role="alert">
                    {submitError}
                  </p>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={status === 'submitting'}
                  className="tracking-widest uppercase"
                >
                  {site.rsvp.form.submitText}
                </Button>

                <p className="text-center text-xs text-gray-400">
                  {site.rsvp.subtitle}
                </p>
              </form>
            )}
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}