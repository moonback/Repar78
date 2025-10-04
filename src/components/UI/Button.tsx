import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    rounded = 'xl',
    children,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500/50 shadow-sm hover:shadow-md',
      secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 active:bg-secondary-300 focus:ring-secondary-500/50 shadow-sm hover:shadow-md',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:border-primary-700 active:bg-primary-100 focus:ring-primary-500/50',
      ghost: 'text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus:ring-secondary-500/50',
      danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus:ring-error-500/50 shadow-sm hover:shadow-md',
      success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus:ring-success-500/50 shadow-sm hover:shadow-md',
      warning: 'bg-warning-600 text-white hover:bg-warning-700 active:bg-warning-800 focus:ring-warning-500/50 shadow-sm hover:shadow-md',
    };

    const sizes = {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    };

    const roundedClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${roundedClasses[rounded]} ${widthClass} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className={`${size === 'xs' || size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-2 animate-spin`} />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
