// Campos de formulario con el mismo estilo que el RSVP de la invitación.
const inputClass = (error) =>
  `w-full p-4 rounded-2xl border bg-white outline-none transition-colors ${
    error ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-accent'
  }`;

export function TextField({ id, label, hint, error, as: Tag = 'input', className = '', ...props }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-semibold text-gray-700">
        {label}
      </label>
      <Tag
        id={id}
        className={`${inputClass(error)} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Campo trampa anti-bots: invisible para personas.
export function Honeypot({ value, onChange }) {
  return (
    <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
      <label>
        No completar este campo
        <input type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}
