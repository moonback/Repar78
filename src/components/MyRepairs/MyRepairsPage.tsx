import { useEffect, useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  TrendingUp,
  Play,
  Camera,
  Video,
  ExternalLink,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Item, Quote } from '../../lib/supabase';

type MyRepairsPageProps = {
  onNavigate: (page: string, itemId?: string, repairId?: string) => void;
};

export default function MyRepairsPage({ onNavigate }: MyRepairsPageProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [repairTracking, setRepairTracking] = useState<{[key: string]: string}>({});
  const [filter, setFilter] = useState<string>('all');
  const [isAddingTestItems, setIsAddingTestItems] = useState(false);

  useEffect(() => {
    if (user) {
      loadItems();
      loadRepairTracking();
    }
  }, [user, filter]);

  const loadRepairTracking = async () => {
    try {
      const { data, error } = await supabase
        .from('repairs')
        .select('item_id, id')
        .in('status', ['diagnostic', 'in_repair', 'quality_check', 'ready_delivery', 'completed']);

      if (error) throw error;

      const trackingMap: {[key: string]: string} = {};
      data?.forEach(repair => {
        trackingMap[repair.item_id] = repair.id;
      });
      setRepairTracking(trackingMap);
    } catch (error) {
      console.error('Erreur lors du chargement du tracking:', error);
    }
  };

  const loadItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Parser les médias JSON si nécessaire
      const itemsWithParsedMedia = (data || []).map(item => ({
        ...item,
        images: typeof item.images === 'string' ? JSON.parse(item.images || '[]') : item.images || [],
        videos: typeof item.videos === 'string' ? JSON.parse(item.videos || '[]') : item.videos || []
      }));
      
      setItems(itemsWithParsedMedia);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTestItems = async () => {
    if (!user) return;

    setIsAddingTestItems(true);
    try {
      const testItems = [
        {
          name: "iPhone 13 Pro",
          category: "phones",
          brand: "Apple",
          problem_description: "L'écran est fissuré après une chute. L'affichage fonctionne mais il y a des lignes noires sur le côté droit. Le tactile répond encore correctement.",
          status: "submitted" as const,
          estimated_cost_min: 150,
          estimated_cost_max: 280,
        },
        {
          name: "MacBook Pro 15\"",
          category: "computers",
          brand: "Apple",
          problem_description: "Le ventilateur fait un bruit anormal et l'ordinateur chauffe beaucoup. Performance ralentie lors de l'utilisation intensive.",
          status: "quoted" as const,
          estimated_cost_min: 80,
          estimated_cost_max: 150,
        },
        {
          name: "Lave-linge Samsung",
          category: "appliances",
          brand: "Samsung",
          problem_description: "Le lave-linge ne se vide plus correctement. L'eau reste dans le tambour après le cycle de lavage.",
          status: "in_progress" as const,
          estimated_cost_min: 120,
          estimated_cost_max: 200,
        },
        {
          name: "Aspirateur Dyson V11",
          category: "appliances",
          brand: "Dyson",
          problem_description: "L'aspirateur ne tient plus la charge. La batterie se décharge très rapidement même après une charge complète.",
          status: "completed" as const,
          estimated_cost_min: 60,
          estimated_cost_max: 120,
        },
        {
          name: "iPad Air 4",
          category: "phones",
          brand: "Apple",
          problem_description: "L'écran tactile ne répond plus dans la partie inférieure. Le reste de la tablette fonctionne normalement.",
          status: "submitted" as const,
          estimated_cost_min: 200,
          estimated_cost_max: 350,
        },
        {
          name: "PS5",
          category: "electronics",
          brand: "Sony",
          problem_description: "La console ne démarre plus. LED bleue qui clignote puis s'éteint. Aucun signal vidéo.",
          status: "quoted" as const,
          estimated_cost_min: 180,
          estimated_cost_max: 300,
        },
        {
          name: "Cafetière Delonghi",
          category: "appliances",
          brand: "Delonghi",
          problem_description: "La cafetière ne chauffe plus l'eau. Le mécanisme de percolation fonctionne mais l'eau reste froide.",
          status: "submitted" as const,
          estimated_cost_min: 40,
          estimated_cost_max: 80,
        },
        {
          name: "Écouteurs AirPods Pro",
          category: "electronics",
          brand: "Apple",
          problem_description: "Le casque gauche ne fonctionne plus. Aucun son ne sort, même après réinitialisation et nettoyage.",
          status: "in_progress" as const,
          estimated_cost_min: 80,
          estimated_cost_max: 140,
        },
        {
          name: "Imprimante Canon",
          category: "electronics",
          brand: "Canon",
          problem_description: "L'imprimante affiche une erreur de papier bloqué même quand il n'y en a pas. Le papier s'enroule mal.",
          status: "completed" as const,
          estimated_cost_min: 30,
          estimated_cost_max: 60,
        },
        {
          name: "Grille-pain Philips",
          category: "appliances",
          brand: "Philips",
          problem_description: "Le grille-pain ne grille plus uniformément. Un côté reste pâle tandis que l'autre brûle.",
          status: "submitted" as const,
          estimated_cost_min: 25,
          estimated_cost_max: 45,
        },
      ];

      // Insérer les éléments de test dans la base de données
      const { data: insertedItems, error } = await supabase
        .from('items')
        .insert(
          testItems.map(item => ({
            ...item,
            user_id: user.id,
            images: [],
            videos: [],
          }))
        )
        .select();

      if (error) throw error;

      console.log(`${insertedItems.length} éléments de test ajoutés avec succès`);
      
      // Créer des entrées de réparation pour les nouveaux éléments
      if (insertedItems && insertedItems.length > 0) {
        const repairEntries = insertedItems.map(item => ({
          item_id: item.id,
          quote_id: null,
          repairer_id: null,
          status: item.status === 'completed' ? 'completed' as const : 'diagnostic' as const,
          tracking_updates: [
            {
              timestamp: new Date().toISOString(),
              status: item.status === 'completed' ? 'completed' : 'diagnostic',
              message: item.status === 'completed' ? 'Réparation terminée' : 'Objet soumis, en attente de diagnostic',
              repairer_id: null
            }
          ],
          completion_photos: [],
          started_at: new Date().toISOString(),
          completed_at: item.status === 'completed' ? new Date().toISOString() : null
        }));

        const { error: repairError } = await supabase
          .from('repairs')
          .insert(repairEntries);

        if (repairError) {
          console.warn('Erreur lors de la création des entrées de réparation:', repairError);
        } else {
          console.log('Entrées de réparation créées avec succès');
        }
      }
      
      // Recharger la liste des éléments et le tracking
      await loadItems();
      await loadRepairTracking();
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout des éléments de test:', error);
    } finally {
      setIsAddingTestItems(false);
    }
  };

  // Fonction pour obtenir le premier média d'un item
  const getFirstMedia = (item: Item) => {
    const images = item.images || [];
    const videos = item.videos || [];
    
    if (images.length > 0) {
      return { url: images[0], type: 'image' };
    } else if (videos.length > 0) {
      return { url: videos[0], type: 'video' };
    }
    return null;
  };

  // Fonction pour compter tous les médias
  const getMediaCount = (item: Item) => {
    const images = item.images || [];
    const videos = item.videos || [];
    return images.length + videos.length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      case 'quoted':
        return 'bg-purple-100 text-purple-700';
      case 'in_progress':
        return 'bg-amber-100 text-amber-700';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock size={16} />;
      case 'quoted':
        return <DollarSign size={16} />;
      case 'in_progress':
        return <TrendingUp size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const filters = [
    { value: 'all', label: 'Tous les Objets' },
    { value: 'submitted', label: 'En Attente' },
    { value: 'quoted', label: 'Devis Reçus' },
    { value: 'in_progress', label: 'En Cours' },
    { value: 'completed', label: 'Terminés' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Réparations</h1>
              <p className="text-lg text-gray-600">Suivez vos demandes de réparation et leur statut</p>
            </div>
            <button
              onClick={addTestItems}
              disabled={isAddingTestItems}
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingTestItems ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Ajout en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Ajouter des produits de test</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun objet pour le moment</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "Vous n'avez pas encore soumis d'objet à réparer"
                : `Aucun objet avec le statut : ${filter}`}
            </p>
            <button
              onClick={() => onNavigate('submit')}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Soumettre Votre Premier Objet
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden group"
              >
                {/* Affichage des médias ou placeholder */}
                {getFirstMedia(item) ? (
                  <div className="aspect-video bg-gray-100 overflow-hidden relative">
                    {getFirstMedia(item)?.type === 'image' ? (
                      <img
                        src={getFirstMedia(item)?.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={getFirstMedia(item)?.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <Play className="text-white" size={32} />
                        </div>
                      </div>
                    )}
                    
                    {/* Badge pour le nombre de médias */}
                    {getMediaCount(item) > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        {getMediaCount(item) > 1 && <Camera size={12} />}
                        {getMediaCount(item) > 1 && <span>+{getMediaCount(item) - 1}</span>}
                      </div>
                    )}
                    
                    {/* Indicateur de type de média */}
                    <div className="absolute bottom-2 left-2 flex space-x-1">
                      {(item.images || []).length > 0 && (
                        <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Camera size={12} />
                          <span>{(item.images || []).length}</span>
                        </div>
                      )}
                      {(item.videos || []).length > 0 && (
                        <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Video size={12} />
                          <span>{(item.videos || []).length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Package className="text-blue-600" size={48} />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                    </div>
                    <div
                      className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {item.problem_description}
                  </p>

                  {item.estimated_cost_min && item.estimated_cost_max && (
                    <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-emerald-700 mb-1">Coût Estimé</p>
                      <p className="text-lg font-bold text-emerald-900">
                        {item.estimated_cost_min}€ - {item.estimated_cost_max}€
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigate('item-detail', item.id)}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Eye size={16} />
                      <span>Voir Détails</span>
                    </button>
                    
                    {/* Bouton de suivi pour les réparations en cours */}
                    {repairTracking[item.id] && ['in_progress', 'quoted'].includes(item.status) && (
                      <button
                        onClick={() => onNavigate('repair-tracking', undefined, repairTracking[item.id])}
                        className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <ExternalLink size={16} />
                        <span>Suivre</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    Soumis le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
