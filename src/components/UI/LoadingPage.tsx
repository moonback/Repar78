import { Leaf } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

interface LoadingPageProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingPage({ 
  message = "Chargement de CircularRepair...", 
  subMessage 
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="mb-6">
          <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-4 rounded-2xl shadow-soft mx-auto w-fit mb-4">
            <Leaf className="text-primary-600 animate-bounce-gentle" size={32} />
          </div>
          <LoadingSpinner size="lg" />
        </div>
        <p className="text-secondary-600 text-lg font-medium mb-2">{message}</p>
        {subMessage && (
          <p className="text-sm text-secondary-500">{subMessage}</p>
        )}
        <div className="mt-4 text-xs text-secondary-400">
          <p>Si le chargement prend trop de temps, actualisez la page</p>
        </div>
      </div>
    </div>
  );
}
