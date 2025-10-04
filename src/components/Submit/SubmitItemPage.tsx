import { useState, useRef } from 'react';
import { Upload, Camera, Video, Sparkles, AlertCircle, CheckCircle, X, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { uploadMultipleFiles, deleteFile, BUCKETS, validateFile } from '../../lib/storage';

type SubmitItemPageProps = {
  onNavigate: (page: string) => void;
};

export default function SubmitItemPage({ onNavigate }: SubmitItemPageProps) {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiDiagnosing, setAiDiagnosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'electronics',
    brand: '',
    problemDescription: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);

  const categories = [
    { value: 'electronics', label: 'Électronique' },
    { value: 'appliances', label: 'Électroménager' },
    { value: 'phones', label: 'Téléphones & Tablettes' },
    { value: 'computers', label: 'Ordinateurs' },
    { value: 'home', label: 'Maison & Jardin' },
    { value: 'other', label: 'Autre' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (files: FileList | null, type: 'images' | 'videos') => {
    if (!files) return;

    setLoading(true);
    setError(null);

    try {
      const fileArray = Array.from(files);
      const fileType = type === 'images' ? 'image' : 'video';
      
      console.log(`Upload de ${fileArray.length} fichiers de type ${fileType}`);

      // Utiliser la nouvelle librairie de stockage
      const uploadedFiles = await uploadMultipleFiles(
        fileArray,
        BUCKETS.ITEM_MEDIA,
        type,
        fileType
      );

      const uploadedUrls = uploadedFiles.map(file => file.url);

      if (type === 'images') {
        setImages(prev => [...prev, ...uploadedUrls]);
      } else {
        setVideos(prev => [...prev, ...uploadedUrls]);
      }

      console.log(`${uploadedUrls.length} fichiers uploadés avec succès`);
    } catch (error: any) {
      console.error('Erreur lors de l\'upload:', error);
      setError(error.message || 'Erreur lors de l\'upload des fichiers');
    } finally {
      setLoading(false);
    }
  };

  const removeMedia = async (url: string, type: 'images' | 'videos') => {
    try {
      // Extraire le nom du fichier de l'URL
      const fileName = url.split('/').pop();
      const filePath = `${type}/${fileName}`;

      // Supprimer le fichier du bucket
      await deleteFile(BUCKETS.ITEM_MEDIA, filePath);
      console.log(`Fichier supprimé: ${filePath}`);

      // Retirer de l'interface
      if (type === 'images') {
        setImages(prev => prev.filter(img => img !== url));
      } else {
        setVideos(prev => prev.filter(vid => vid !== url));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      // Retirer quand même de l'interface
      if (type === 'images') {
        setImages(prev => prev.filter(img => img !== url));
      } else {
        setVideos(prev => prev.filter(vid => vid !== url));
      }
    }
  };

  const simulateAIDiagnosis = () => {
    setAiDiagnosing(true);
    setTimeout(() => {
      const diagnosis = {
        detectedIssues: [
          'Battery not holding charge',
          'Possible charging port damage',
          'Software optimization needed',
        ],
        estimatedCostMin: 45,
        estimatedCostMax: 120,
        repairComplexity: 'Medium',
        recommendedSolution: 'workshop',
        confidence: 0.87,
      };
      setAiDiagnosis(diagnosis);
      setAiDiagnosing(false);
      setStep(3);
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Vous devez être connecté pour soumettre un objet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Soumission de l\'objet...', {
        user_id: user.id,
        name: formData.name,
        category: formData.category,
        images: images.length,
        videos: videos.length
      });

      // Insérer l'objet dans la base de données
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .insert({
          user_id: user.id,
          name: formData.name,
          category: formData.category,
          brand: formData.brand || null,
          problem_description: formData.problemDescription,
          images: images,
          videos: videos,
          ai_diagnosis: aiDiagnosis,
          estimated_cost_min: aiDiagnosis?.estimatedCostMin || null,
          estimated_cost_max: aiDiagnosis?.estimatedCostMax || null,
          status: 'submitted',
          solution_type: aiDiagnosis?.recommendedSolution || null,
        })
        .select()
        .single();

      if (itemError) {
        console.error('Erreur lors de l\'insertion de l\'objet:', itemError);
        throw itemError;
      }

      console.log('Objet créé avec succès:', itemData.id);

      // Ajouter des points éco pour la soumission
      const { error: ecoTransactionError } = await supabase
        .from('eco_transactions')
        .insert({
          user_id: user.id,
          points: 10,
          reason: 'Objet soumis pour réparation',
          related_id: itemData.id,
        });

      if (ecoTransactionError) {
        console.error('Erreur lors de l\'ajout des points éco:', ecoTransactionError);
      }

      // Mettre à jour le profil utilisateur avec les nouveaux points
      await refreshProfile();

      console.log('Soumission réussie !');
      setSuccess(true);

      // Rediriger vers la page des réparations après 2 secondes
      setTimeout(() => {
        onNavigate('my-repairs');
      }, 2000);

    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la soumission';
      
      if (error.message) {
        if (error.message.includes('violates row-level security')) {
          errorMessage = 'Erreur de permissions. Veuillez vous reconnecter.';
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'Cet objet existe déjà.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'electronics',
      brand: '',
      problemDescription: '',
    });
    setImages([]);
    setVideos([]);
    setAiDiagnosis(null);
    setStep(1);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Soumettre votre Objet</h1>
          <p className="text-lg text-gray-600">
            Faisons réparer votre objet et gagnez des points éco
          </p>
        </div>

        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={20} />
              <p className="text-green-700">Objet soumis avec succès ! Redirection vers vos réparations...</p>
            </div>
          </div>
        )}

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s === step
                      ? 'bg-emerald-600 text-white scale-110'
                      : s < step
                      ? 'bg-emerald-200 text-emerald-700'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? <CheckCircle size={20} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${s < step ? 'bg-emerald-200' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Détails de l'Objet</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'objet *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ex: iPhone 12 Pro"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marque (optionnel)
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="ex: Apple, Samsung, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du problème *
                </label>
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Décrivez ce qui ne va pas avec votre objet..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                  required
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.problemDescription}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant : Télécharger des Médias
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Télécharger Photos & Vidéos</h2>

              {/* Zone de téléchargement */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-emerald-400 transition-colors">
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-2">
                  Glissez-déposez vos fichiers ici, ou cliquez pour sélectionner
                </p>
                <p className="text-sm text-gray-500">
                  Les photos et vidéos nous aident à diagnostiquer le problème
                </p>

                <div className="flex justify-center gap-4 mt-6">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                        <span>Upload...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={20} />
                        <span>Ajouter des Photos</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
                        <span>Upload...</span>
                      </>
                    ) : (
                      <>
                        <Video size={20} />
                        <span>Ajouter des Vidéos</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      // Séparer les images et vidéos
                      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
                      const videoFiles = Array.from(files).filter(file => file.type.startsWith('video/'));
                      
                      if (imageFiles.length > 0) handleFileUpload(imageFiles as any, 'images');
                      if (videoFiles.length > 0) handleFileUpload(videoFiles as any, 'videos');
                    }
                  }}
                  className="hidden"
                />
              </div>

              {/* Affichage des médias téléchargés */}
              {(images.length > 0 || videos.length > 0) && (
                <div className="space-y-4">
                  {images.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Photos ({images.length})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeMedia(image, 'images')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {videos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Vidéos ({videos.length})</h3>
                      <div className="space-y-2">
                        {videos.map((video, index) => (
                          <div key={index} className="relative group flex items-center space-x-3 bg-gray-100 rounded-lg p-3">
                            <Video className="text-purple-600" size={24} />
                            <span className="text-gray-700 flex-1">Vidéo {index + 1}</span>
                            <button
                              onClick={() => removeMedia(video, 'videos')}
                              className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-start space-x-3">
                  <Sparkles className="text-emerald-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Diagnostic IA</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Notre IA analysera vos photos et fournira une estimation de coût et des solutions possibles
                    </p>
                    <button
                      onClick={simulateAIDiagnosis}
                      disabled={aiDiagnosing}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {aiDiagnosing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Analyse en cours...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Lancer le Diagnostic IA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Passer aux Solutions
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Résultats du Diagnostic IA</h2>

              {aiDiagnosis && (
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Problèmes Détectés</h3>
                    <span className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-full">
                      {Math.round(aiDiagnosis.confidence * 100)}% Confiance
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {aiDiagnosis.detectedIssues.map((issue: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                        <span className="text-gray-700">{issue}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-4 bg-white rounded-lg p-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Coût Estimé</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {aiDiagnosis.estimatedCostMin}€ - {aiDiagnosis.estimatedCostMax}€
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Complexité</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {aiDiagnosis.repairComplexity}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <p className="text-sm text-blue-800 mb-2 font-medium">Prochaines Étapes</p>
                <p className="text-gray-700">
                  Votre objet sera visible par les réparateurs vérifiés qui pourront fournir des devis détaillés.
                  Vous recevrez des notifications quand les devis arrivent.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-600 text-white p-2 rounded-lg">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Gagnez 10 Points Éco</p>
                    <p className="text-sm text-gray-600">
                      Pour avoir soumis un objet à réparer au lieu de le jeter
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || success}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Soumission en cours...' : success ? 'Soumis !' : 'Soumettre l\'Objet'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
