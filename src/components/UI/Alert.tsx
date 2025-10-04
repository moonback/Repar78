import { forwardRef } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
  onClose?: () => void;
  dismissible?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({
    children,
    variant = 'info',
    className = '',
    onClose,
    dismissible = false,
    size = 'md'
  }, ref) => {
    const variants = {
      info: {
        container: 'bg-primary-50 border-primary-200 text-primary-800',
        icon: Info,
        iconColor: 'text-primary-600',
      },
      success: {
        container: 'bg-success-50 border-success-200 text-success-800',
        icon: CheckCircle,
        iconColor: 'text-success-600',
      },
      warning: {
        container: 'bg-warning-50 border-warning-200 text-warning-800',
        icon: AlertTriangle,
        iconColor: 'text-warning-600',
      },
      error: {
        container: 'bg-error-50 border-error-200 text-error-800',
        icon: AlertCircle,
        iconColor: 'text-error-600',
      },
    };

    const sizes = {
      sm: 'p-3 text-sm',
      md: 'p-4',
      lg: 'p-5 text-lg',
    };

    const config = variants[variant];
    const Icon = config.icon;

    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };

    return (
      <div
        ref={ref}
        className={`border-l-4 rounded-r-lg ${config.container} ${sizes[size]} ${className}`}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <Icon className={`${config.iconColor} flex-shrink-0 mt-0.5`} size={iconSizes[size]} />
          <div className="flex-1">
            {children}
          </div>
          {dismissible && onClose && (
            <button
              onClick={onClose}
              className={`flex-shrink-0 ${config.iconColor} hover:opacity-75 transition-opacity`}
              aria-label="Fermer l'alerte"
            >
              <X size={iconSizes[size]} />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;