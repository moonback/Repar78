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
    <nav className="glass-strong sticky top-0 z-50 safe-area-inset border-b border-secondary-200/50">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16">
          {/* Logo modernisé */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 group hover-lift"
          >
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Leaf className="text-white group-hover:scale-110 transition-transform duration-200" size={24} />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-secondary-900 group-hover:text-primary-700 transition-colors">
                CircularRepair
              </span>
              <p className="text-xs text-secondary-500 -mt-1">Réparation circulaire</p>
            </div>
          </button>

          {/* Navigation Desktop modernisée */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover-scale ${
                  currentPage === item.id
                    ? 'bg-primary-100 text-primary-700 shadow-sm border border-primary-200'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions Desktop modernisées */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 shadow-sm">
                  <Leaf size={16} className="text-primary-600" />
                  <span className="text-sm font-bold text-primary-700">
                    {profile?.eco_points || 0}
                  </span>
                  <span className="text-xs text-primary-600 font-medium">pts</span>
                </div>
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center space-x-2 px-3 py-2 bg-secondary-100 hover:bg-secondary-200 rounded-xl transition-all duration-200 group"
                  title="Mon Profil"
                >
                  <User size={16} className="text-secondary-600 group-hover:text-secondary-800" />
                  <span className="text-sm font-medium text-secondary-700 group-hover:text-secondary-900">
                    {profile?.full_name || 'Utilisateur'}
                  </span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2.5 text-secondary-600 hover:bg-error-50 hover:text-error-600 rounded-xl transition-all duration-200"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Button onClick={onAuthClick} size="sm" variant="outline">
                Connexion
              </Button>
            )}
          </div>

          {/* Menu Mobile modernisé */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 text-secondary-600 hover:bg-secondary-100 rounded-xl transition-all duration-200"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Dropdown modernisé */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-secondary-200/50 bg-white/95 backdrop-blur-sm shadow-lg animate-slide-down">
          <div className="container-responsive py-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 hover-lift ${
                  currentPage === item.id
                    ? 'bg-primary-100 text-primary-700 shadow-sm border border-primary-200'
                    : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user ? (
              <>
                <div className="border-t border-secondary-200/50 pt-4 mt-4 space-y-3">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3 hover-lift ${
                      currentPage === 'profile'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-secondary-600 hover:bg-secondary-100'
                    }`}
                  >
                    <User size={18} className="text-secondary-500" />
                    <span>Mon Profil</span>
                  </button>

                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 mx-1">
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
                    className="w-full text-left px-4 py-3 text-error-600 hover:bg-error-50 rounded-xl font-medium transition-all duration-200 flex items-center space-x-3"
                  >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-secondary-200/50 pt-4 mt-4">
                <Button
                  onClick={() => {
                    onAuthClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full"
                  size="lg"
                >
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
