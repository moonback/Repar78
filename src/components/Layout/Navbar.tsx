import { Leaf, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

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
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 group"
          >
            <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-2.5 rounded-xl group-hover:from-emerald-200 group-hover:to-green-200 transition-all duration-200 shadow-sm group-hover:shadow-md">
              <Leaf className="text-emerald-600 group-hover:text-emerald-700" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
              CircularRepair
            </span>
          </button>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                  <Leaf size={16} className="text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">
                    {profile?.eco_points || 0}
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">pts</span>
                </div>
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group"
                  title="Mon Profil"
                >
                  <User size={16} className="text-gray-600 group-hover:text-gray-800" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {profile?.full_name || 'Utilisateur'}
                  </span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md"
              >
                Connexion
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user ? (
              <>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-3 ${
                      currentPage === 'profile'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <User size={18} className="text-gray-500" />
                    <span>Mon Profil</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center space-x-2">
                    <Leaf size={16} className="text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">Points Éco</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">
                    {profile?.eco_points || 0}
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center space-x-3"
                >
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <button
                  onClick={() => {
                    onAuthClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Se Connecter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
