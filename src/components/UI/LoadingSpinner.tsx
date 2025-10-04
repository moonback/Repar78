import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', className = '' }, ref) => {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    };

    return (
      <div ref={ref} className={`flex items-center justify-center ${className}`}>
        <Loader2 className={`${sizes[size]} animate-spin text-primary-600`} />
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
