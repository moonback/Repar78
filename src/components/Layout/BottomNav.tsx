import { Home, Plus, Package, User, Wrench } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const { user, profile } = useAuth();

  const navItems = user
    ? [
        { id: 'home', label: 'Accueil', icon: Home },
        { id: 'submit', label: 'Soumettre', icon: Plus },
        { id: 'my-repairs', label: 'Mes Réparations', icon: Package },
        ...(profile?.role === 'repairer' || profile?.role === 'refurbisher'
          ? [{ id: 'repairer-dashboard', label: 'Tableau', icon: Wrench }]
          : []),
        { id: 'profile', label: 'Profil', icon: User },
      ]
    : [
        { id: 'home', label: 'Accueil', icon: Home },
        { id: 'profile', label: 'Connexion', icon: User },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 safe-area-inset z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50'
              }`}
              aria-label={item.label}
            >
              <Icon 
                size={20} 
                className={`mb-1 ${isActive ? 'text-primary-600' : 'text-secondary-500'}`} 
              />
              <span className={`text-xs font-medium ${isActive ? 'text-primary-600' : 'text-secondary-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
