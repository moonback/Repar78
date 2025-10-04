import { useState, useRef } from 'react';
import { Upload, Camera, Video, Sparkles, AlertCircle, CheckCircle, X, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { uploadMultipleFiles, deleteFile, BUCKETS, validateFile } from '../../lib/storage';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Input from '../UI/Input';
import Alert from '../UI/Alert';
import LoadingSpinner from '../UI/LoadingSpinner';

type SubmitItemPageProps = {
  onNavigate: (page: string) => void;
};

export default function SubmitItemPage({ onNavigate }: SubmitItemPageProps) {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

  const proceedToNextStep = () => {
    if (!formData.name || !formData.problemDescription) {
      setError('Veuillez remplir au moins le nom et la description du problème');
      return;
    }
    setStep(3);
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
          status: 'submitted',
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

      // Créer une entrée de réparation pour le suivi
      await supabase.from('repairs').insert({
        item_id: itemData.id,
        quote_id: null, // Sera mis à jour quand un devis sera accepté
        repairer_id: null, // Sera mis à jour quand un réparateur sera assigné
        status: 'diagnostic',
        tracking_updates: [{
          timestamp: new Date().toISOString(),
          status: 'diagnostic',
          message: 'Objet soumis, en attente de diagnostic',
          repairer_id: null
        }],
        completion_photos: [],
        started_at: new Date().toISOString()
      });

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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-8">
      <div className="container-mobile">
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-secondary-900 mb-2">Soumettre votre Objet</h1>
          <p className="text-sm text-secondary-600">
            Faisons réparer votre objet et gagnez des points éco
          </p>
        </div>

        {/* Messages d'erreur et de succès */}
        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert type="success" className="mb-6">
            Objet soumis avec succès ! Redirection vers vos réparations...
          </Alert>
        )}

        {/* Indicateur de progression */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 md:space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s === step
                      ? 'bg-primary-600 text-white scale-110'
                      : s < step
                      ? 'bg-primary-200 text-primary-700'
                      : 'bg-secondary-200 text-secondary-500'
                  }`}
                >
                  {s < step ? <CheckCircle size={16} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-8 md:w-16 h-1 mx-1 md:mx-2 ${s < step ? 'bg-primary-200' : 'bg-secondary-200'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-secondary-900 mb-4">Détails de l'Objet</h2>

              <Input
                label="Nom de l'objet *"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="ex: iPhone 12 Pro"
                required
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Catégorie *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Marque (optionnel)"
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="ex: Apple, Samsung, etc."
              />

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description du problème *
                </label>
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Décrivez ce qui ne va pas avec votre objet..."
                  className="input-field resize-none"
                  required
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.problemDescription}
                className="w-full"
              >
                Suivant : Télécharger des Médias
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-secondary-900 mb-4">Télécharger Photos & Vidéos</h2>

              {/* Zone de téléchargement */}
              <div className="border-2 border-dashed border-secondary-300 rounded-xl p-8 md:p-12 text-center hover:border-primary-400 transition-colors">
                <Upload className="mx-auto text-secondary-400 mb-4" size={48} />
                <p className="text-secondary-600 mb-2 text-sm md:text-base">
                  Glissez-déposez vos fichiers ici, ou cliquez pour sélectionner
                </p>
                <p className="text-xs md:text-sm text-secondary-500">
                  Les photos et vidéos nous aident à diagnostiquer le problème
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    variant="secondary"
                    className="inline-flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Upload...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={20} />
                        <span>Ajouter des Photos</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    variant="outline"
                    className="inline-flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Upload...</span>
                      </>
                    ) : (
                      <>
                        <Video size={20} />
                        <span>Ajouter des Vidéos</span>
                      </>
                    )}
                  </Button>
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
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2">Photos ({images.length})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-20 md:h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeMedia(image, 'images')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {videos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2">Vidéos ({videos.length})</h3>
                      <div className="space-y-2">
                        {videos.map((video, index) => (
                          <div key={index} className="relative group flex items-center space-x-3 bg-secondary-100 rounded-lg p-3">
                            <Video className="text-primary-600" size={24} />
                            <span className="text-secondary-700 flex-1">Vidéo {index + 1}</span>
                            <button
                              onClick={() => removeMedia(video, 'videos')}
                              className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  onClick={proceedToNextStep}
                  className="flex-1"
                >
                  Passer aux Solutions
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-secondary-900 mb-4">Confirmation de Soumission</h2>

              <Card className="p-6 bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800 mb-2 font-medium">Prochaines Étapes</p>
                <p className="text-secondary-700 text-sm">
                  Votre objet sera visible par les réparateurs vérifiés qui pourront fournir des devis détaillés.
                  Vous recevrez des notifications quand les devis arrivent.
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-600 text-white p-2 rounded-lg">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-900">Gagnez 10 Points Éco</p>
                    <p className="text-sm text-secondary-600">
                      Pour avoir soumis un objet à réparer au lieu de le jeter
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || success}
                  loading={loading}
                  className="flex-1"
                >
                  {success ? 'Soumis !' : 'Soumettre l\'Objet'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
