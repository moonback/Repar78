import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
  text?: string;
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', variant = 'primary', className = '', text }, ref) => {
    const sizes = {
      xs: 'w-4 h-4',
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    const variants = {
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      white: 'text-white',
    };

    return (
      <div ref={ref} className={`flex flex-col items-center justify-center gap-3 ${className}`}>
        <Loader2 className={`animate-spin ${sizes[size]} ${variants[variant]}`} />
        {text && (
          <p className={`text-sm ${variants[variant]} animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;