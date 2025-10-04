import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Settings, Key } from 'lucide-react';
import { aiService } from '../../services/aiService';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Alert from '../UI/Alert';

export default function GeminiConfig() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      setError(null);
      
      const isConnected = await aiService.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
      
      if (!isConnected) {
        setError('Clé API Gemini non configurée ou invalide');
      }
    } catch (error) {
      setConnectionStatus('error');
      setError('Erreur de connexion à Gemini');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-primary-100 p-2 rounded-lg">
          <Settings className="text-primary-600" size={20} />
        </div>
        <h3 className="font-semibold text-secondary-900">Configuration Gemini AI</h3>
      </div>

      <div className="space-y-4">
        {/* Statut de connexion */}
        <div className="flex items-center space-x-3">
          {connectionStatus === 'checking' && (
            <>
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-secondary-600">Vérification de la connexion...</span>
            </>
          )}
          
          {connectionStatus === 'connected' && (
            <>
              <CheckCircle className="text-primary-600" size={16} />
              <span className="text-sm text-primary-700 font-medium">Connexion Gemini établie</span>
            </>
          )}
          
          {connectionStatus === 'error' && (
            <>
              <AlertCircle className="text-red-600" size={16} />
              <span className="text-sm text-red-700 font-medium">Connexion Gemini échouée</span>
            </>
          )}
        </div>

        {/* Instructions de configuration */}
        {connectionStatus === 'error' && (
          <Alert type="warning" className="mb-4">
            <div className="space-y-3">
              <p className="font-medium">Configuration requise pour Gemini AI</p>
              <div className="space-y-2 text-sm">
                <p>1. Obtenez une clé API Gemini :</p>
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                >
                  <Key size={14} />
                  <span>https://makersuite.google.com/app/apikey</span>
                </a>
                
                <p>2. Ajoutez la clé à votre fichier .env :</p>
                <code className="block bg-secondary-100 p-2 rounded text-xs">
                  VITE_GEMINI_API_KEY=votre_cle_api_ici
                </code>
                
                <p>3. Redémarrez le serveur de développement</p>
              </div>
            </div>
          </Alert>
        )}

        {/* Bouton de test */}
        <Button 
          onClick={checkConnection}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Tester la Connexion
        </Button>

        {/* Informations sur Gemini */}
        <div className="bg-primary-50 rounded-lg p-4">
          <h4 className="font-medium text-secondary-900 mb-2 text-sm">À propos de Gemini 2.0 Flash</h4>
          <ul className="text-xs text-secondary-600 space-y-1">
            <li>• Analyse d'images haute qualité</li>
            <li>• Diagnostic technique précis</li>
            <li>• Estimation de coûts réaliste</li>
            <li>• Recommandations personnalisées</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
