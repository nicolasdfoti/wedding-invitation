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
      peach: 'bg-peach',
    };

    const dividerAlignments = {
      left: 'mr-auto',
      center: 'mx-auto',
      right: 'ml-auto',
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
          <div className={`${dividerColors[dividerColor] ?? dividerColors.gold} w-24 h-px ${dividerAlignments[align]} mt-4`} aria-hidden="true" />
        )}
      </div>
    );
  }
);

SectionTitle.displayName = 'SectionTitle';

export default SectionTitle;