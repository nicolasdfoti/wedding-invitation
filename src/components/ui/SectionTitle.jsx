import { forwardRef } from 'react';

const SectionTitle = forwardRef(
  ({
    children,
    subtitle,
    className = '',
    titleClassName = '',
    subtitleClassName = '',
    align = 'center',
    divider = true,
    dividerColor = 'gold',
    ...props
  }, ref) => {
    const alignments = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    const dividerColors = {
      gold: 'bg-gold',
      accent: 'bg-accent',
      coral: 'bg-coral',
      blue: 'bg-blue',
    };

    return (
      <div ref={ref} className={`${alignments[align]} ${className}`} {...props}>
        {subtitle && (
          <p className={`uppercase tracking-[0.4em] text-sm mb-4 font-semibold ${subtitleClassName}`}>
            {subtitle}
          </p>
        )}
        <h2 className={`font-title text-5xl text-blue mb-4 ${titleClassName}`}>{children}</h2>
        {divider && (
          <div className={`${dividerColors[dividerColor]} w-24 h-px mx-auto ${align !== 'center' ? 'mx-0' : ''} mt-4`} />
        )}
      </div>
    );
  }
);

SectionTitle.displayName = 'SectionTitle';

export default SectionTitle;