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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <LoadingSpinner size="xl" className="mb-8" text="Chargement de CircularRepair..." />
          <div className="mt-6 space-y-2">
            <div className="w-64 h-2 bg-secondary-200 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-secondary-500 text-sm">Vérification de votre profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
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

      {/* Footer modernisé - caché sur mobile */}
      <footer className="hidden md:block bg-secondary-900 text-white mt-20">
        <div className="container-responsive py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-3 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                    CircularRepair
                  </h3>
                  <p className="text-secondary-400 text-sm">Économie circulaire pour tous</p>
                </div>
              </div>
              <p className="text-secondary-300 leading-relaxed max-w-md">
                Prolonger la durée de vie des produits, réduire les déchets électroniques et construire une économie circulaire durable. Ensemble, créons un avenir plus responsable.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Plateforme</h4>
              <nav className="space-y-3">
                {[
                  { label: 'Soumettre un Objet', action: () => handleNavigate('submit') },
                  { label: 'Place de Marché', action: () => handleNavigate('marketplace') },
                  { label: 'Mes Réparations', action: () => handleNavigate('my-repairs') },
                ].map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="block text-secondary-300 hover:text-primary-400 transition-colors duration-200 text-left w-full"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-lg">Pour les Professionnels</h4>
              <nav className="space-y-3">
                {[
                  'Devenir Réparateur',
                  'Processus de Vérification',
                  'Guide des Tarifs',
                ].map((item, index) => (
                  <a
                    key={index}
                    href="#"
                    className="block text-secondary-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          <div className="border-t border-secondary-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-secondary-400 text-sm">
                &copy; {new Date().getFullYear()} CircularRepair. Construire un avenir durable ensemble.
              </p>
              <div className="flex items-center space-x-6 text-sm text-secondary-400">
                <a href="#" className="hover:text-primary-400 transition-colors">Politique de confidentialité</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Conditions d'utilisation</a>
                <a href="#" className="hover:text-primary-400 transition-colors">Support</a>
              </div>
            </div>
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
