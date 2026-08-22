import { forwardRef } from 'react';

const Container = forwardRef(
  ({ children, className = '', size = 'xl', ...props }, ref) => {
    const sizes = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full',
    };

    return (
      <div
        ref={ref}
        className={`mx-auto px-6 ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;