import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    children, 
    className = '', 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500 shadow-soft hover:shadow-medium',
      secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 active:bg-secondary-300 focus:ring-secondary-500',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
      ghost: 'text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus:ring-secondary-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-soft hover:shadow-medium',
    };

    const sizes = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
