import { forwardRef } from 'react';

const Card = forwardRef(
  ({ children, className = '', variant = 'default', padding = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-white shadow-soft',
      elevated: 'bg-white shadow-xl',
      outlined: 'bg-white border border-gray-200',
      flat: 'bg-transparent',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    return (
      <div
        ref={ref}
        className={`${variants[variant]} ${paddings[padding]} rounded-3xl ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;