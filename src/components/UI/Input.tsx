import { forwardRef } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    className = '', 
    ...props 
  }, ref) => {
    const baseClasses = 'w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
    
    const variantClasses = {
      default: 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500',
      search: 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500 pl-12',
    };

    const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : '';
    const classes = `${baseClasses} ${variantClasses[variant]} ${errorClasses} ${className}`;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-secondary-700">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400">
              {leftIcon}
            </div>
          )}
          
          {variant === 'search' && !leftIcon && (
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5" />
          )}
          
          <input
            ref={ref}
            className={classes}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-secondary-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
