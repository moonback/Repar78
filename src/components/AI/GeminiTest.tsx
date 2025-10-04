import { useState } from 'react';
import { Sparkles, Upload, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { aiService, ProductInfo } from '../../services/aiService';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Input from '../UI/Input';
import Alert from '../UI/Alert';
import LoadingSpinner from '../UI/LoadingSpinner';

export default function GeminiTest() {
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    name: 'iPhone 12 Pro',
    category: 'phones',
    brand: 'Apple',
    problemDescription: 'L\'écran est fissuré et la batterie se décharge rapidement',
    images: [],
    videos: []
  });

  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnosis = async () => {
    setLoading(true);
    setError(null);
    setDiagnosis(null);

    try {
      const result = await aiService.diagnoseProduct(productInfo);
      setDiagnosis(result);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du diagnostic');
    } finally {
      setLoading(false);
    }
  };

  const updateProductInfo = (field: keyof ProductInfo, value: string) => {
    setProductInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-secondary-900 mb-2">Test Gemini AI</h1>
        <p className="text-secondary-600">Testez le diagnostic IA avec Gemini 2.0 Flash</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulaire de test */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Informations du Produit</h2>
          
          <div className="space-y-4">
            <Input
              label="Nom du produit"
              value={productInfo.name}
              onChange={(e) => updateProductInfo('name', e.target.value)}
              placeholder="ex: iPhone 12 Pro"
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Catégorie
              </label>
              <select
                value={productInfo.category}
                onChange={(e) => updateProductInfo('category', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="phones">Téléphones</option>
                <option value="computers">Ordinateurs</option>
                <option value="appliances">Électroménager</option>
                <option value="electronics">Électronique</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <Input
              label="Marque"
              value={productInfo.brand || ''}
              onChange={(e) => updateProductInfo('brand', e.target.value)}
              placeholder="ex: Apple, Samsung, Sony"
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description du problème
              </label>
              <textarea
                value={productInfo.problemDescription}
                onChange={(e) => updateProductInfo('problemDescription', e.target.value)}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                placeholder="Décrivez le problème en détail..."
              />
            </div>

            <Button
              onClick={handleDiagnosis}
              loading={loading}
              disabled={!productInfo.name || !productInfo.problemDescription}
              className="w-full"
            >
              <Sparkles size={16} className="mr-2" />
              Lancer le Diagnostic IA
            </Button>
          </div>
        </Card>

        {/* Résultats */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Résultats du Diagnostic</h2>
          
          {loading && (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-secondary-600">Analyse en cours...</p>
            </div>
          )}

          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          {diagnosis && (
            <div className="space-y-4">
              {/* Confiance */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-700">Confiance</span>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {Math.round(diagnosis.confidence * 100)}%
                </span>
              </div>

              {/* Problèmes détectés */}
              <div>
                <h3 className="font-medium text-secondary-900 mb-2">Problèmes Détectés</h3>
                <ul className="space-y-1">
                  {diagnosis.detectedIssues.map((issue: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={14} />
                      <span className="text-sm text-secondary-700">{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Coût estimé */}
              <div className="bg-secondary-50 rounded-lg p-4">
                <h3 className="font-medium text-secondary-900 mb-2">Coût Estimé</h3>
                <p className="text-2xl font-bold text-primary-600">
                  {diagnosis.estimatedCostMin}€ - {diagnosis.estimatedCostMax}€
                </p>
              </div>

              {/* Difficulté */}
              <div className="bg-secondary-50 rounded-lg p-4">
                <h3 className="font-medium text-secondary-900 mb-2">Difficulté</h3>
                <p className="text-lg font-semibold text-secondary-900 capitalize">
                  {diagnosis.repairDifficulty === 'easy' ? 'Facile' :
                   diagnosis.repairDifficulty === 'medium' ? 'Moyenne' : 'Difficile'}
                </p>
              </div>

              {/* Actions recommandées */}
              {diagnosis.recommendedActions && diagnosis.recommendedActions.length > 0 && (
                <div>
                  <h3 className="font-medium text-secondary-900 mb-2">Actions Recommandées</h3>
                  <ul className="space-y-1">
                    {diagnosis.recommendedActions.map((action: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={14} />
                        <span className="text-sm text-secondary-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {!loading && !diagnosis && !error && (
            <div className="text-center py-8 text-secondary-500">
              <Camera size={32} className="mx-auto mb-2" />
              <p>Lancez un diagnostic pour voir les résultats</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
