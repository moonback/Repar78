import { forwardRef } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive' | 'flat' | 'glass';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  shadow?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    children,
    className = '',
    variant = 'default',
    padding = 'md',
    hover = false,
    rounded = '2xl',
    shadow = 'sm'
  }, ref) => {
    const baseClasses = 'bg-white overflow-hidden transition-all duration-300';

    const variants = {
      default: 'border border-secondary-200/50',
      elevated: 'border border-secondary-200/50 shadow-md',
      interactive: 'border border-secondary-200/50 cursor-pointer hover:shadow-md hover:border-primary-200 hover:bg-primary-50/30',
      flat: 'border-0',
      glass: 'bg-white/90 backdrop-blur-sm border border-white/20 shadow-sm',
    };

    const paddingClasses = {
      none: 'p-0',
      xs: 'p-3',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    const roundedClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
    };

    const shadowClasses = {
      none: 'shadow-none',
      xs: 'shadow-xs',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    };

    const hoverClasses = hover && variant !== 'interactive'
      ? 'hover:shadow-lg hover:-translate-y-1'
      : '';

    const classes = `${baseClasses} ${variants[variant]} ${paddingClasses[padding]} ${roundedClasses[rounded]} ${shadowClasses[shadow]} ${hoverClasses} ${className}`;

    return (
      <div ref={ref} className={classes}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
