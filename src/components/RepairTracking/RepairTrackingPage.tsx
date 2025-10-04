import { useEffect, useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Camera,
  Star,
  MessageSquare,
  MapPin,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { supabase, Repair, Quote, Item } from '../../lib/supabase';

type RepairTrackingPageProps = {
  repairId: string;
  onNavigate: (page: string) => void;
};

export default function RepairTrackingPage({ repairId, onNavigate }: RepairTrackingPageProps) {
  const { user } = useAuth();
  const { success, error } = useNotifications();
  const [repair, setRepair] = useState<Repair | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [repairer, setRepairer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    loadRepairDetails();
  }, [repairId]);

  const loadRepairDetails = async () => {
    setLoading(true);
    try {
      // Charger les détails de la réparation
      const { data: repairData, error: repairError } = await supabase
        .from('repairs')
        .select('*')
        .eq('id', repairId)
        .single();

      if (repairError) throw repairError;
      setRepair(repairData);

      // Charger le devis associé
      const { data: quoteData, error: quoteError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', repairData.quote_id)
        .single();

      if (quoteError) throw quoteError;
      setQuote(quoteData);

      // Charger l'objet
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', repairData.item_id)
        .single();

      if (itemError) throw itemError;
      setItem(itemData);

      // Charger le profil du réparateur
      const { data: repairerData, error: repairerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', repairData.repairer_id)
        .single();

      if (repairerError) throw repairerError;
      setRepairer(repairerData);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (!repair || rating === 0) return;

    try {
      await supabase
        .from('repairs')
        .update({
          rating,
          review: review.trim() || null,
          completed_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', repairId);

      // Mettre à jour le statut de l'objet
      await supabase
        .from('items')
        .update({ status: 'completed' })
        .eq('id', repair?.item_id);

      // Mettre à jour les points éco du réparateur
      const pointsEarned = Math.floor(rating * 10); // 10-50 points selon la note
      await supabase
        .from('eco_transactions')
        .insert({
          user_id: repair?.repairer_id,
          points: pointsEarned,
          reason: `Réparation terminée avec note ${rating}/5`,
          related_id: repairId
        });

      setShowRatingModal(false);
      success('Évaluation soumise', 'Merci d\'avoir évalué cette réparation !');
      loadRepairDetails(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'évaluation:', error);
      error('Erreur', 'Impossible de soumettre l\'évaluation');
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      diagnostic: {
        label: 'Diagnostic',
        icon: AlertCircle,
        color: 'bg-blue-100 text-blue-700',
        description: 'Analyse du problème en cours'
      },
      in_repair: {
        label: 'En Réparation',
        icon: Package,
        color: 'bg-amber-100 text-amber-700',
        description: 'Réparation en cours'
      },
      quality_check: {
        label: 'Contrôle Qualité',
        icon: CheckCircle,
        color: 'bg-purple-100 text-purple-700',
        description: 'Vérification de la qualité'
      },
      ready_delivery: {
        label: 'Prêt pour Livraison',
        icon: TrendingUp,
        color: 'bg-emerald-100 text-emerald-700',
        description: 'Réparation terminée, prêt à être récupéré'
      },
      completed: {
        label: 'Terminé',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-700',
        description: 'Réparation terminée avec succès'
      }
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.diagnostic;
  };

  const statusSteps = [
    'diagnostic',
    'in_repair',
    'quality_check',
    'ready_delivery',
    'completed'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!repair || !quote || !item || !repairer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-gray-600 mb-4">Réparation non trouvée</p>
          <button
            onClick={() => onNavigate('my-repairs')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retour aux Réparations
          </button>
        </div>
      </div>
    );
  }

  const currentStatusInfo = getStatusInfo(repair.status);
  const currentStepIndex = statusSteps.indexOf(repair.status);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('my-repairs')}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <Package size={20} />
            <span>Retour aux Réparations</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivi de Réparation</h1>
          <p className="text-lg text-gray-600">{item.name}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statut actuel */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Statut Actuel</h2>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentStatusInfo.color}`}>
                  <currentStatusInfo.icon size={20} />
                  <span className="font-semibold">{currentStatusInfo.label}</span>
                </div>
              </div>

              {/* Timeline des étapes */}
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const stepInfo = getStatusInfo(step);
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isPending = index > currentStepIndex;

                  return (
                    <div key={step} className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-emerald-600' : 
                        isCurrent ? 'bg-blue-600' : 
                        'bg-gray-200'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="text-white" size={16} />
                        ) : (
                          <stepInfo.icon className={`${isCurrent ? 'text-white' : 'text-gray-400'}`} size={16} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          isCurrent ? 'text-blue-700' : 
                          isCompleted ? 'text-emerald-700' : 
                          'text-gray-500'
                        }`}>
                          {stepInfo.label}
                        </h3>
                        <p className={`text-sm ${
                          isCurrent ? 'text-blue-600' : 
                          isCompleted ? 'text-emerald-600' : 
                          'text-gray-400'
                        }`}>
                          {stepInfo.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Photos de progression */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Photos de Progression</h2>
              
              {repair.completion_photos && repair.completion_photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {repair.completion_photos.map((photo, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`Photo de progression ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-600">Aucune photo de progression pour le moment</p>
                </div>
              )}
            </div>

            {/* Mises à jour de suivi */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Historique des Mises à Jour</h2>
              
              {repair.tracking_updates && repair.tracking_updates.length > 0 ? (
                <div className="space-y-4">
                  {repair.tracking_updates.map((update: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Clock size={16} className="text-gray-500 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">{update.message}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(update.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-600">Aucune mise à jour pour le moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations du réparateur */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Réparateur</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Package className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{repairer.full_name}</h4>
                    <p className="text-sm text-gray-600">{repairer.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                    <Phone size={16} />
                    <span>Contacter</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                    <MessageSquare size={16} />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Détails du devis */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Détails du Devis</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prix</span>
                  <span className="font-semibold text-gray-900">{quote.price}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durée estimée</span>
                  <span className="font-semibold text-gray-900">{quote.estimated_duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commencé le</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(repair.started_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              {quote.message && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{quote.message}</p>
                </div>
              )}
            </div>

            {/* Évaluation */}
            {repair.status === 'ready_delivery' && !repair.rating && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Évaluer la Réparation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Votre réparation est terminée ! Évaluez le service reçu.
                </p>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Noter la Réparation
                </button>
              </div>
            )}

            {repair.rating && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Votre Évaluation</h3>
                <div className="flex items-center space-x-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      className={star <= repair.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                  <span className="font-semibold text-gray-900">{repair.rating}/5</span>
                </div>
                {repair.review && (
                  <p className="text-sm text-gray-700">{repair.review}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal d'évaluation */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Évaluer la Réparation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (1-5 étoiles)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          size={32}
                          className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire (optionnel)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Décrivez votre expérience..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleRatingSubmit}
                    disabled={rating === 0}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Soumettre
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
