import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Layout/Navbar';
import BottomNav from './components/Layout/BottomNav';
import AuthModal from './components/Auth/AuthModal';
import HomePage from './components/Home/HomePage';
import SubmitItemPage from './components/Submit/SubmitItemPage';
import MyRepairsPage from './components/MyRepairs/MyRepairsPage';
import ItemDetailPage from './components/ItemDetail/ItemDetailPage';
import RepairerDashboard from './components/RepairerDashboard/RepairerDashboard';
import MarketplacePage from './components/Marketplace/MarketplacePage';
import ProfilePage from './components/Profile/ProfilePage';
import RepairTrackingPage from './components/RepairTracking/RepairTrackingPage';
import LoadingSpinner from './components/UI/LoadingSpinner';

function AppContent() {
  const { loading, user, profile, refreshProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Forcer le rechargement du profil si l'utilisateur est connecté mais le profil n'est pas chargé
  useEffect(() => {
    console.log('🔍 App useEffect déclenché:', {
      hasUser: !!user,
      userId: user?.id,
      hasProfile: !!profile,
      isLoading: loading,
      shouldRefresh: user && !profile && !loading
    });
    
    if (user && !profile && !loading) {
      console.log('🔄 Utilisateur connecté mais profil manquant, rechargement programmé...');
      // Petit délai pour éviter les rechargements trop rapides
      const timer = setTimeout(() => {
        console.log('⏰ Timer déclenché, appel de refreshProfile...');
        refreshProfile();
      }, 500);
      
      return () => {
        console.log('🧹 Nettoyage du timer...');
        clearTimeout(timer);
      };
    }
  }, [user, profile, loading, refreshProfile]);

  const handleNavigate = (page: string, itemId?: string, repairId?: string) => {
    setCurrentPage(page);
    if (itemId) {
      setSelectedItemId(itemId);
    }
    if (repairId) {
      setSelectedRepairId(repairId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <LoadingSpinner size="lg" className="mb-6" />
          <p className="text-secondary-600 text-lg font-medium">Chargement de CircularRepair...</p>
          {user && !profile && (
            <p className="text-sm text-secondary-500 mt-2">Chargement du profil utilisateur...</p>
          )}
          <div className="mt-4 text-xs text-secondary-400">
            <p>Si le chargement prend trop de temps, actualisez la page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <Navbar
        onAuthClick={() => setAuthModalOpen(true)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* Contenu principal avec padding pour la bottom nav mobile */}
      <main className="pb-20 md:pb-0">
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} onAuthClick={() => setAuthModalOpen(true)} />
        )}

        {currentPage === 'submit' && <SubmitItemPage onNavigate={handleNavigate} />}

        {currentPage === 'my-repairs' && <MyRepairsPage onNavigate={handleNavigate} />}

        {currentPage === 'item-detail' && selectedItemId && (
          <ItemDetailPage itemId={selectedItemId} onNavigate={handleNavigate} />
        )}

        {currentPage === 'repairer-dashboard' && <RepairerDashboard />}

        {currentPage === 'marketplace' && <MarketplacePage onNavigate={handleNavigate} />}

        {currentPage === 'profile' && <ProfilePage onNavigate={handleNavigate} />}

        {currentPage === 'repair-tracking' && selectedRepairId && (
          <RepairTrackingPage repairId={selectedRepairId} onNavigate={handleNavigate} />
        )}
      </main>

      {/* Bottom Navigation pour mobile */}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Footer caché sur mobile */}
      <footer className="hidden md:block bg-secondary-900 text-white py-12 mt-20">
        <div className="container-mobile">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">CircularRepair</h3>
              <p className="text-secondary-400 text-sm leading-relaxed">
                Prolonger la durée de vie des produits, réduire les déchets électroniques et construire une économie circulaire durable.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-sm text-secondary-400">
                <li>
                  <button
                    onClick={() => handleNavigate('submit')}
                    className="hover:text-primary-400 transition-colors"
                  >
                    Soumettre un Objet
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('marketplace')}
                    className="hover:text-primary-400 transition-colors"
                  >
                    Place de Marché
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('my-repairs')}
                    className="hover:text-primary-400 transition-colors"
                  >
                    Mes Réparations
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Pour les Réparateurs</h4>
              <ul className="space-y-2 text-sm text-secondary-400">
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Devenir Réparateur
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Processus de Vérification
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Guide des Tarifs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">À Propos</h4>
              <ul className="space-y-2 text-sm text-secondary-400">
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Notre Mission
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Impact Environnemental
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    Nous Contacter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary-800 mt-8 pt-8 text-center">
            <p className="text-sm text-secondary-400">
              &copy; {new Date().getFullYear()} CircularRepair. Construire un avenir durable ensemble.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
