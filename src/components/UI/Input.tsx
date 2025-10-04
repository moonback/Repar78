import { forwardRef } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'search';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    success = false,
    leftIcon,
    rightIcon,
    variant = 'default',
    size = 'md',
    fullWidth = true,
    required = false,
    className = '',
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = 'w-full border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 bg-white hover:border-secondary-400';

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-sm',
      lg: 'px-5 py-4 text-base',
    };

    const variantClasses = {
      default: 'pl-4',
      search: 'pl-12',
    };

    const stateClasses = error
      ? 'border-error-300 focus:ring-error-500/20 focus:border-error-500 bg-error-50/30'
      : success
      ? 'border-success-300 focus:ring-success-500/20 focus:border-success-500 bg-success-50/30'
      : 'border-secondary-300 focus:ring-primary-500/20 focus:border-primary-500';

    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `${baseClasses} ${sizes[size]} ${variantClasses[variant]} ${stateClasses} ${widthClass} ${className}`;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium ${required ? 'text-secondary-700' : 'text-secondary-600'}`}
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {variant === 'search' && !leftIcon && (
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 h-5 w-5 pointer-events-none" />
          )}

          <input
            ref={ref}
            id={inputId}
            className={classes}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-error-600 flex items-center gap-1"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-secondary-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
