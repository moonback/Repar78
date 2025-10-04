import { forwardRef } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ type = 'info', title, children, onClose, className = '' }, ref) => {
    const icons = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertCircle,
      info: Info,
    };

    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const iconColors = {
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-amber-600',
      info: 'text-blue-600',
    };

    const Icon = icons[type];

    return (
      <div
        ref={ref}
        className={`rounded-xl border p-4 ${colors[type]} ${className}`}
        role="alert"
      >
        <div className="flex items-start">
          <Icon className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${iconColors[type]}`} />
          <div className="flex-1">
            {title && (
              <h3 className="font-semibold mb-1">{title}</h3>
            )}
            <div className="text-sm">{children}</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-3 flex-shrink-0 hover:opacity-70 transition-opacity"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
