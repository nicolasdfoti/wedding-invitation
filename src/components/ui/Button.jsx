import { forwardRef } from 'react';

const Button = forwardRef(
  (
    {
      as: Tag = 'button',
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold tracking-widest uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-accent text-white hover:bg-coral focus:ring-accent',
      secondary: 'bg-transparent border-2 border-accent text-accent hover:bg-accent/10 focus:ring-accent',
      outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
      ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs rounded-full',
      md: 'px-6 py-3 text-sm rounded-full',
      lg: 'px-8 py-4 text-base rounded-full',
    };

    // Con as="a" se puede usar el mismo estilo en links.
    const elementProps = Tag === 'button' ? { type, disabled: disabled || loading } : {};

    return (
      <Tag
        ref={ref}
        {...elementProps}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Cargando...
          </>
        ) : (
          children
        )}
      </Tag>
    );
  }
);

Button.displayName = 'Button';

export default Button;