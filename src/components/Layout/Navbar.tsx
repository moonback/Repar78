import { Leaf, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';

type NavbarProps = {
  onAuthClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
};

export default function Navbar({ onAuthClick, onNavigate, currentPage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = user
    ? [
        { id: 'home', label: 'Accueil' },
        { id: 'submit', label: 'Soumettre un Objet' },
        { id: 'my-repairs', label: 'Mes Réparations' },
        { id: 'marketplace', label: 'Place de Marché' },
        ...(profile?.role === 'repairer' || profile?.role === 'refurbisher'
          ? [{ id: 'repairer-dashboard', label: 'Tableau de Bord' }]
          : []),
      ]
    : [{ id: 'home', label: 'Accueil' }];

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-soft sticky top-0 z-40 safe-area-inset">
      <div className="container-mobile">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 group"
          >
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-2.5 rounded-xl group-hover:from-primary-200 group-hover:to-primary-300 transition-all duration-200 shadow-soft group-hover:shadow-medium">
              <Leaf className="text-primary-600 group-hover:text-primary-700" size={24} />
            </div>
            <span className="text-base font-bold text-secondary-800 group-hover:text-primary-700 transition-colors hidden sm:block">
              CircularRepair
            </span>
          </button>

          {/* Navigation Desktop */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-primary-100 text-primary-700 shadow-soft'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions Desktop */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                  <Leaf size={16} className="text-primary-600" />
                  <span className="text-sm font-bold text-primary-700">
                    {profile?.eco_points || 0}
                  </span>
                  <span className="text-xs text-primary-600 font-medium">pts</span>
                </div>
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center space-x-2 px-3 py-2 bg-secondary-100 hover:bg-secondary-200 rounded-xl transition-colors group"
                  title="Mon Profil"
                >
                  <User size={16} className="text-secondary-600 group-hover:text-secondary-800" />
                  <span className="text-sm font-medium text-secondary-700 group-hover:text-secondary-900">
                    {profile?.full_name || 'Utilisateur'}
                  </span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-secondary-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <Button onClick={onAuthClick} size="sm">
                Connexion
              </Button>
            )}
          </div>

          {/* Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-secondary-600 hover:bg-secondary-100 rounded-xl transition-colors"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-secondary-200 bg-white shadow-medium animate-slide-up">
          <div className="container-mobile py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-primary-100 text-primary-700 shadow-soft'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user ? (
              <>
                <div className="border-t border-secondary-200 pt-3 mt-3">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors flex items-center space-x-3 ${
                      currentPage === 'profile'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-600 hover:bg-secondary-100'
                    }`}
                  >
                    <User size={18} className="text-secondary-500" />
                    <span>Mon Profil</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                  <div className="flex items-center space-x-2">
                    <Leaf size={16} className="text-primary-600" />
                    <span className="text-sm font-medium text-secondary-700">Points Éco</span>
                  </div>
                  <span className="text-lg font-bold text-primary-700">
                    {profile?.eco_points || 0}
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors flex items-center space-x-3"
                >
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <div className="border-t border-secondary-200 pt-3 mt-3">
                <Button onClick={() => {
                  onAuthClick();
                  setMobileMenuOpen(false);
                }} className="w-full">
                  Se Connecter
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
