import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Package,
  Clock,
  DollarSign,
  User,
  MapPin,
  MessageSquare,
  CheckCircle,
  Wrench,
  Recycle,
  Home,
  Building,
  Camera,
  Video,
  Play,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Item, Quote } from '../../lib/supabase';
import Button from '../UI/Button';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';

type ItemDetailPageProps = {
  itemId: string;
  onNavigate: (page: string) => void;
};

export default function ItemDetailPage({ itemId, onNavigate }: ItemDetailPageProps) {
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSolutionChoice, setShowSolutionChoice] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showMediaModal, setShowMediaModal] = useState(false);

  useEffect(() => {
    loadItemAndQuotes();
  }, [itemId]);

  const loadItemAndQuotes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      
      // Parser les médias JSON si nécessaire
      if (itemData.images && typeof itemData.images === 'string') {
        itemData.images = JSON.parse(itemData.images);
      }
      if (itemData.videos && typeof itemData.videos === 'string') {
        itemData.videos = JSON.parse(itemData.videos);
      }
      
      setItem(itemData);

      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*, repairer:profiles!repairer_id(*)')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;
      setQuotes(quotesData || []);
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir tous les médias (images + vidéos)
  const getAllMedia = () => {
    if (!item) return [];
    
    const images = item.images || [];
    const videos = item.videos || [];
    
    return [
      ...images.map((url: string) => ({ url, type: 'image' })),
      ...videos.map((url: string) => ({ url, type: 'video' }))
    ];
  };

  const openMediaModal = (index: number) => {
    setSelectedMediaIndex(index);
    setShowMediaModal(true);
  };

  const acceptQuote = async (quoteId: string) => {
    try {
      await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quoteId);

      await supabase
        .from('items')
        .update({ status: 'in_progress' })
        .eq('id', itemId);

      loadItemAndQuotes();
    } catch (error) {
      console.error('Error accepting quote:', error);
    }
  };

  const solutions = [
    {
      id: 'home_repair',
      title: 'Réparation à Domicile',
      description: 'Un réparateur se déplace chez vous',
      icon: Home,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'workshop',
      title: 'Dépôt en Atelier',
      description: 'Envoyez l\'objet à l\'atelier de réparation',
      icon: Building,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'refurbish',
      title: 'Remise à Neuf & Vente',
      description: 'Recevez des offres de remise à neuf',
      icon: Package,
      color: 'from-primary-500 to-primary-600',
    },
    {
      id: 'recycle',
      title: 'Recyclage Certifié',
      description: 'Recyclage avec des partenaires certifiés',
      icon: Recycle,
      color: 'from-amber-500 to-amber-600',
    },
  ];

  const selectSolution = async (solutionType: string) => {
    try {
      await supabase
        .from('items')
        .update({ solution_type: solutionType })
        .eq('id', itemId);

      setShowSolutionChoice(false);
      loadItemAndQuotes();
    } catch (error) {
      console.error('Error selecting solution:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-secondary-600 text-sm">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary-600 mb-4">Objet non trouvé</p>
          <Button onClick={() => onNavigate('my-repairs')}>
            Retour à Mes Réparations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-8">
      <div className="container-mobile">
        <Button
          onClick={() => onNavigate('my-repairs')}
          variant="ghost"
          className="inline-flex items-center space-x-2 mb-6"
        >
          <ArrowLeft size={16} />
          <span>Retour à Mes Réparations</span>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-secondary-900 mb-2">{item.name}</h1>
                  <div className="flex items-center space-x-4 text-xs text-secondary-600">
                    <span className="capitalize">{item.category}</span>
                    {item.brand && <span>• {item.brand}</span>}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-lg font-semibold text-xs ${
                    item.status === 'submitted'
                      ? 'bg-blue-100 text-blue-700'
                      : item.status === 'quoted'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-primary-100 text-primary-700'
                  }`}
                >
                  {item.status === 'submitted' ? 'SOUMIS' : 
                   item.status === 'quoted' ? 'DEVIS REÇUS' : 
                   item.status === 'in_progress' ? 'EN COURS' : 
                   item.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              {/* Galerie de médias */}
              {getAllMedia().length > 0 ? (
                <div className="space-y-4 mb-6">
                  {/* Image/vidéo principale */}
                  <div className="aspect-video bg-secondary-100 rounded-xl overflow-hidden">
                    {getAllMedia()[0]?.type === 'image' ? (
                      <img
                        src={getAllMedia()[0].url}
                        alt={item.name}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => openMediaModal(0)}
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={getAllMedia()[0].url}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => openMediaModal(0)}
                          controls
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                          <Play className="text-white" size={32} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Miniatures des autres médias */}
                  {getAllMedia().length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {getAllMedia().slice(1, 5).map((media, index) => (
                        <div
                          key={index + 1}
                          className="aspect-square bg-secondary-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openMediaModal(index + 1)}
                        >
                          {media.type === 'image' ? (
                            <img
                              src={media.url}
                              alt={`${item.name} ${index + 2}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              <video
                                src={media.url}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                <Play className="text-white" size={16} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {getAllMedia().length > 5 && (
                        <div className="aspect-square bg-secondary-200 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-secondary-600">
                            +{getAllMedia().length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Package className="text-primary-600 mx-auto mb-2" size={32} />
                    <p className="text-secondary-600 text-xs">Aucune image disponible</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-2 text-sm">Description du Problème</h3>
                  <p className="text-secondary-700 leading-relaxed text-sm">{item.problem_description}</p>
                </div>

                {item.ai_diagnosis && (
                  <Card className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200">
                    <h3 className="font-semibold text-secondary-900 mb-3 text-sm">Diagnostic IA</h3>
                    <div className="space-y-2">
                      {item.ai_diagnosis.detectedIssues?.map((issue: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle
                            className="text-primary-600 flex-shrink-0 mt-0.5"
                            size={16}
                          />
                          <span className="text-secondary-700 text-xs">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </Card>

            {!item.solution_type && (
              <Card className="p-6">
                <h2 className="text-lg md:text-xl font-bold text-secondary-900 mb-3">Choisissez Votre Solution</h2>
                <p className="text-secondary-600 mb-6 text-sm">
                  Sélectionnez l'option de réparation qui vous convient le mieux
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {solutions.map((solution) => (
                    <button
                      key={solution.id}
                      onClick={() => selectSolution(solution.id)}
                      className="group relative bg-white border-2 border-secondary-200 rounded-xl p-4 text-left hover:border-primary-400 transition-all hover:shadow-medium"
                    >
                      <div
                        className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br ${solution.color} text-white rounded-lg mb-3 group-hover:scale-110 transition-transform`}
                      >
                        <solution.icon size={20} />
                      </div>
                      <h3 className="font-bold text-secondary-900 mb-2 text-sm">{solution.title}</h3>
                      <p className="text-xs text-secondary-600">{solution.description}</p>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {item.solution_type && (
              <Card className="p-6">
                <h2 className="text-lg md:text-xl font-bold text-secondary-900 mb-4">Devis Reçus</h2>

                {quotes.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto text-secondary-400 mb-3" size={32} />
                    <p className="text-secondary-600 text-sm">
                      En attente des devis des réparateurs. Vous serez notifié quand ils arrivent.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((quote: any) => (
                      <div
                        key={quote.id}
                        className="border border-secondary-200 rounded-xl p-4 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User className="text-primary-600" size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-secondary-900 text-sm">
                                {quote.repairer?.full_name || 'Réparateur Professionnel'}
                              </h3>
                              <div className="flex items-center space-x-2 text-xs text-secondary-600">
                                <MapPin size={12} />
                                <span>Zone Locale</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-secondary-900">{quote.price}€</p>
                            <p className="text-xs text-secondary-600">{quote.estimated_duration}</p>
                          </div>
                        </div>

                        {quote.message && (
                          <div className="bg-secondary-50 rounded-lg p-3 mb-3">
                            <div className="flex items-start space-x-2">
                              <MessageSquare className="text-secondary-400 flex-shrink-0 mt-1" size={14} />
                              <p className="text-xs text-secondary-700">{quote.message}</p>
                            </div>
                          </div>
                        )}

                        {quote.status === 'pending' && (
                          <Button
                            onClick={() => acceptQuote(quote.id)}
                            className="w-full"
                            size="sm"
                          >
                            Accepter le Devis
                          </Button>
                        )}

                        {quote.status === 'accepted' && (
                          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-center space-x-2 justify-center">
                            <CheckCircle className="text-primary-600" size={16} />
                            <span className="text-primary-700 font-semibold text-sm">Devis Accepté</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-4">
              <h3 className="font-bold text-secondary-900 mb-3 text-sm">Estimation des Coûts</h3>
              {item.estimated_cost_min && item.estimated_cost_max ? (
                <div className="text-center py-3">
                  <p className="text-xl font-bold text-primary-600 mb-1">
                    {item.estimated_cost_min}€ - {item.estimated_cost_max}€
                  </p>
                  <p className="text-xs text-secondary-600">Fourchette Estimée par IA</p>
                </div>
              ) : (
                <p className="text-secondary-600 text-center py-3 text-sm">
                  En attente des devis pour déterminer le coût
                </p>
              )}
            </Card>

            <Card className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200">
              <h3 className="font-bold text-secondary-900 mb-3 text-sm">Chronologie de l'Objet</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-white" size={12} />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-900 text-xs">Objet Soumis</p>
                    <p className="text-xs text-secondary-600">
                      {new Date(item.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>

                {item.solution_type && (
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-white" size={12} />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900 text-xs">Solution Sélectionnée</p>
                      <p className="text-xs text-secondary-600 capitalize">
                        {item.solution_type === 'home_repair' ? 'Réparation à domicile' :
                         item.solution_type === 'workshop' ? 'Dépôt en atelier' :
                         item.solution_type === 'refurbish' ? 'Remise à neuf' :
                         item.solution_type === 'recycle' ? 'Recyclage' :
                         item.solution_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-secondary-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="text-secondary-400" size={12} />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-600 text-xs">En Attente des Devis</p>
                    <p className="text-xs text-secondary-500">En cours</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Modal pour afficher les médias en plein écran */}
        {showMediaModal && getAllMedia().length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full w-full">
              {/* Bouton de fermeture */}
              <button
                onClick={() => setShowMediaModal(false)}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
              >
                <X size={20} />
              </button>

              {/* Navigation */}
              {getAllMedia().length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedMediaIndex(Math.max(0, selectedMediaIndex - 1))}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                    disabled={selectedMediaIndex === 0}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedMediaIndex(Math.min(getAllMedia().length - 1, selectedMediaIndex + 1))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                    disabled={selectedMediaIndex === getAllMedia().length - 1}
                  >
                    <ArrowLeft size={20} className="rotate-180" />
                  </button>
                </>
              )}

              {/* Média principal */}
              <div className="bg-white rounded-lg overflow-hidden">
                {getAllMedia()[selectedMediaIndex]?.type === 'image' ? (
                  <img
                    src={getAllMedia()[selectedMediaIndex].url}
                    alt={item.name}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                ) : (
                  <video
                    src={getAllMedia()[selectedMediaIndex].url}
                    className="w-full h-auto max-h-[80vh]"
                    controls
                    autoPlay
                  />
                )}
              </div>

              {/* Indicateur de position */}
              {getAllMedia().length > 1 && (
                <div className="flex justify-center mt-3 space-x-2">
                  {getAllMedia().map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === selectedMediaIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Miniatures en bas */}
              {getAllMedia().length > 1 && (
                <div className="flex justify-center mt-3 space-x-2 max-w-4xl overflow-x-auto">
                  {getAllMedia().map((media, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                        index === selectedMediaIndex ? 'border-white' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedMediaIndex(index)}
                    >
                      {media.type === 'image' ? (
                        <img
                          src={media.url}
                          alt={`${item.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-gray-800">
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="text-white" size={12} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
