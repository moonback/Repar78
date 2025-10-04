import { useState } from 'react';
import { X, Leaf } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Alert from '../UI/Alert';
import Card from '../UI/Card';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        console.log('Connexion réussie, fermeture du modal');
      } else {
        await signUp(email, password, fullName, role);
        console.log('Inscription réussie, fermeture du modal');
      }
      
      // Réinitialiser le formulaire
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('user');
      
      onClose();
    } catch (err: any) {
      console.error('Erreur d\'authentification:', err);
      
      // Messages d'erreur plus explicites
      let errorMessage = 'Une erreur est survenue';
      
      if (err.message) {
        if (err.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (err.message.includes('User already registered')) {
          errorMessage = 'Cet email est déjà utilisé';
        } else if (err.message.includes('Password should be at least')) {
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
        } else if (err.message.includes('Invalid email')) {
          errorMessage = 'Adresse email invalide';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 safe-area-inset">
      <Card className="max-w-md w-full relative animate-slide-up glass-strong" padding="lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-secondary-400 hover:text-secondary-600 transition-all duration-200 hover:bg-secondary-100 rounded-full p-1 z-10"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-4">
            <Leaf className="text-primary-600" size={32} />
          </div>

          <h2 className="text-2xl font-bold text-secondary-900 mb-2">
            {mode === 'signin' ? 'Bon retour !' : 'Rejoignez l\'Économie Circulaire'}
          </h2>
          <p className="text-secondary-600">
            {mode === 'signin'
              ? 'Connectez-vous pour continuer votre parcours de réparation'
              : 'Créez un compte pour commencer à réparer durablement'}
          </p>
        </div>

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <Input
              label="Nom complet"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Votre nom complet"
              autoComplete="name"
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            autoComplete="email"
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={6}
          />

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Je souhaite
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
              >
                <option value="user">Faire réparer mes objets</option>
                <option value="repairer">Proposer des services de réparation</option>
                <option value="refurbisher">Remettre à neuf des objets</option>
                <option value="recycler">Recycler des objets</option>
              </select>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            className="w-full"
          >
            {mode === 'signin' ? 'Se connecter' : 'Créer un compte'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-secondary-200 text-center">
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
          >
            {mode === 'signin'
              ? "Pas de compte ? S'inscrire"
              : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </Card>
    </div>
  );
}
