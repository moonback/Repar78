import { forwardRef } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hover = false, padding = 'md' }, ref) => {
    const baseClasses = 'bg-white rounded-2xl border border-secondary-100 overflow-hidden';
    const hoverClasses = hover ? 'hover:shadow-medium hover:border-primary-200 transition-all duration-300' : 'shadow-soft';
    
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const classes = `${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`;

    return (
      <div ref={ref} className={classes}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
