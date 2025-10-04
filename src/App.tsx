import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import AuthModal from './components/Auth/AuthModal';
import HomePage from './components/Home/HomePage';
import SubmitItemPage from './components/Submit/SubmitItemPage';
import MyRepairsPage from './components/MyRepairs/MyRepairsPage';
import ItemDetailPage from './components/ItemDetail/ItemDetailPage';
import RepairerDashboard from './components/RepairerDashboard/RepairerDashboard';
import MarketplacePage from './components/Marketplace/MarketplacePage';
import ProfilePage from './components/Profile/ProfilePage';

function AppContent() {
  const { loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleNavigate = (page: string, itemId?: string) => {
    setCurrentPage(page);
    if (itemId) {
      setSelectedItemId(itemId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading CircularRepair...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        onAuthClick={() => setAuthModalOpen(true)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {currentPage === 'home' && (
        <HomePage onNavigate={handleNavigate} onAuthClick={() => setAuthModalOpen(true)} />
      )}

      {currentPage === 'submit' && <SubmitItemPage onNavigate={handleNavigate} />}

      {currentPage === 'my-repairs' && <MyRepairsPage onNavigate={handleNavigate} />}

      {currentPage === 'item-detail' && selectedItemId && (
        <ItemDetailPage itemId={selectedItemId} onNavigate={handleNavigate} />
      )}

      {currentPage === 'repairer-dashboard' && <RepairerDashboard onNavigate={handleNavigate} />}

      {currentPage === 'marketplace' && <MarketplacePage onNavigate={handleNavigate} />}

      {currentPage === 'profile' && <ProfilePage onNavigate={handleNavigate} />}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">CircularRepair</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Extending product lifespan, reducing e-waste, and building a sustainable circular
                economy.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button
                    onClick={() => handleNavigate('submit')}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Submit Item
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('marketplace')}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    Marketplace
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigate('my-repairs')}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    My Repairs
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Repairers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Become a Repairer
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Verification Process
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Pricing Guide
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Our Mission
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Environmental Impact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} CircularRepair. Building a sustainable future
              together.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
