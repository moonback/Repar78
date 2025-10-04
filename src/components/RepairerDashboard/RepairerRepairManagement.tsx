import { useEffect, useState } from 'react';
import {
  Camera,
  MessageSquare,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Package,
  TrendingUp,
  Star,
} from 'lucide-react';
import { supabase, Repair, Item, Quote } from '../../lib/supabase';
import { uploadMultipleFiles, BUCKETS } from '../../lib/storage';

type RepairerRepairManagementProps = {
  repairerId: string;
};

export default function RepairerRepairManagement({ repairerId }: RepairerRepairManagementProps) {
  const [activeRepairs, setActiveRepairs] = useState<Repair[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadActiveRepairs();
  }, [repairerId]);

  const loadActiveRepairs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('repairs')
        .select(`
          *,
          item:items(*),
          quote:quotes(*)
        `)
        .eq('repairer_id', repairerId)
        .in('status', ['diagnostic', 'in_repair', 'quality_check', 'ready_delivery'])
        .order('started_at', { ascending: false });

      if (error) throw error;
      setActiveRepairs(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réparations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      diagnostic: {
        label: 'Diagnostic',
        color: 'bg-blue-100 text-blue-700',
        icon: AlertCircle
      },
      in_repair: {
        label: 'En Réparation',
        color: 'bg-amber-100 text-amber-700',
        icon: Package
      },
      quality_check: {
        label: 'Contrôle Qualité',
        color: 'bg-purple-100 text-purple-700',
        icon: CheckCircle
      },
      ready_delivery: {
        label: 'Prêt pour Livraison',
        color: 'bg-emerald-100 text-emerald-700',
        icon: TrendingUp
      }
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.diagnostic;
  };

  const handleStatusUpdate = async () => {
    if (!selectedRepair || !newStatus || !updateMessage.trim()) return;

    try {
      setUploading(true);

      // Ajouter la mise à jour à l'historique
      const trackingUpdates = selectedRepair.tracking_updates || [];
      const newUpdate = {
        timestamp: new Date().toISOString(),
        status: newStatus,
        message: updateMessage.trim(),
        repairer_id: repairerId
      };

      const updatedTracking = [...trackingUpdates, newUpdate];

      // Mettre à jour la réparation
      await supabase
        .from('repairs')
        .update({
          status: newStatus,
          tracking_updates: updatedTracking
        })
        .eq('id', selectedRepair.id);

      // Si c'est terminé, mettre à jour l'objet aussi
      if (newStatus === 'ready_delivery') {
        await supabase
          .from('items')
          .update({ status: 'completed' })
          .eq('id', selectedRepair.item_id);
      }

      setShowUpdateModal(false);
      setUpdateMessage('');
      setNewStatus('');
      loadActiveRepairs();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedRepair || photos.length === 0) return;

    try {
      setUploading(true);

      // Upload des photos
      const uploadedPhotos = await uploadMultipleFiles(
        photos,
        BUCKETS.REPAIR_PHOTOS,
        `repair-${selectedRepair.id}`,
        'image'
      );

      const photoUrls = uploadedPhotos.map(photo => photo.url);
      const currentPhotos = selectedRepair.completion_photos || [];
      const updatedPhotos = [...currentPhotos, ...photoUrls];

      // Mettre à jour la réparation avec les nouvelles photos
      await supabase
        .from('repairs')
        .update({
          completion_photos: updatedPhotos
        })
        .eq('id', selectedRepair.id);

      setShowPhotoModal(false);
      setPhotos([]);
      loadActiveRepairs();
    } catch (error) {
      console.error('Erreur lors de l\'upload des photos:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const statusOptions = [
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'in_repair', label: 'En Réparation' },
    { value: 'quality_check', label: 'Contrôle Qualité' },
    { value: 'ready_delivery', label: 'Prêt pour Livraison' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Réparations Actives</h2>
        <div className="text-sm text-gray-600">
          {activeRepairs.length} réparation{activeRepairs.length > 1 ? 's' : ''} en cours
        </div>
      </div>

      {activeRepairs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune réparation active</h3>
          <p className="text-gray-600">
            Vous n'avez actuellement aucune réparation en cours.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeRepairs.map((repair) => {
            const statusInfo = getStatusInfo(repair.status);
            const item = repair.item as Item;
            const quote = repair.quote as Quote;

            return (
              <div key={repair.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{item?.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{item?.category}</p>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${statusInfo.color}`}>
                    <statusInfo.icon size={16} />
                    <span className="font-semibold text-sm">{statusInfo.label}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Détails de la réparation */}
                  <div>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prix convenu</span>
                        <span className="font-semibold">{quote?.price}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commencé le</span>
                        <span className="font-semibold">
                          {new Date(repair.started_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Photos ajoutées</span>
                        <span className="font-semibold">
                          {repair.completion_photos?.length || 0}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRepair(repair);
                          setShowUpdateModal(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <MessageSquare size={16} />
                        <span>Mettre à jour</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRepair(repair);
                          setShowPhotoModal(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Camera size={16} />
                        <span>Ajouter photos</span>
                      </button>
                    </div>
                  </div>

                  {/* Photos récentes */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Photos récentes</h4>
                    {repair.completion_photos && repair.completion_photos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {repair.completion_photos.slice(-3).map((photo, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={photo}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Camera className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-600">Aucune photo</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de mise à jour de statut */}
      {showUpdateModal && selectedRepair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mettre à jour le statut</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau statut
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un statut</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message de mise à jour
                </label>
                <textarea
                  value={updateMessage}
                  onChange={(e) => setUpdateMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez les progrès réalisés..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || !updateMessage.trim() || uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de photos */}
      {showPhotoModal && selectedRepair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter des photos</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos de progression
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {photos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos sélectionnées ({photos.length})
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePhotoUpload}
                  disabled={photos.length === 0 || uploading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Upload...' : `Uploader ${photos.length} photo${photos.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
