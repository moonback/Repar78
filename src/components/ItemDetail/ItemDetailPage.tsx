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
      title: 'Home Repair',
      description: 'A repairer comes to your location',
      icon: Home,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'workshop',
      title: 'Workshop Drop-off',
      description: 'Send item to repair workshop',
      icon: Building,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'refurbish',
      title: 'Refurbish & Sell',
      description: 'Get offers from refurbishers',
      icon: Package,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      id: 'recycle',
      title: 'Certified Recycling',
      description: 'Recycle with certified partners',
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Item not found</p>
          <button
            onClick={() => onNavigate('my-repairs')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to My Repairs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('my-repairs')}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to My Repairs</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="capitalize">{item.category}</span>
                    {item.brand && <span>• {item.brand}</span>}
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    item.status === 'submitted'
                      ? 'bg-blue-100 text-blue-700'
                      : item.status === 'quoted'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {item.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              {/* Galerie de médias */}
              {getAllMedia().length > 0 ? (
                <div className="space-y-4 mb-6">
                  {/* Image/vidéo principale */}
                  <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
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
                          <Play className="text-white" size={48} />
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
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
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
                                <Play className="text-white" size={20} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {getAllMedia().length > 5 && (
                        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            +{getAllMedia().length - 5}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Package className="text-blue-600 mx-auto mb-2" size={48} />
                    <p className="text-gray-600 text-sm">Aucune image disponible</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Problem Description</h3>
                  <p className="text-gray-700 leading-relaxed">{item.problem_description}</p>
                </div>

                {item.ai_diagnosis && (
                  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
                    <h3 className="font-semibold text-gray-900 mb-4">AI Diagnosis</h3>
                    <div className="space-y-3">
                      {item.ai_diagnosis.detectedIssues?.map((issue: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle
                            className="text-emerald-600 flex-shrink-0 mt-0.5"
                            size={18}
                          />
                          <span className="text-gray-700">{issue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!item.solution_type && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose Your Solution</h2>
                <p className="text-gray-600 mb-6">
                  Select the repair option that works best for you
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {solutions.map((solution) => (
                    <button
                      key={solution.id}
                      onClick={() => selectSolution(solution.id)}
                      className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 text-left hover:border-emerald-400 transition-all hover:shadow-lg"
                    >
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${solution.color} text-white rounded-lg mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <solution.icon size={24} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">{solution.title}</h3>
                      <p className="text-sm text-gray-600">{solution.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {item.solution_type && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Quotes Received</h2>

                {quotes.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">
                      Waiting for quotes from repairers. You'll be notified when they arrive.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((quote: any) => (
                      <div
                        key={quote.id}
                        className="border border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                              <User className="text-emerald-600" size={24} />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {quote.repairer?.full_name || 'Professional Repairer'}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <MapPin size={14} />
                                <span>Local Area</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">${quote.price}</p>
                            <p className="text-sm text-gray-600">{quote.estimated_duration}</p>
                          </div>
                        </div>

                        {quote.message && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex items-start space-x-2">
                              <MessageSquare className="text-gray-400 flex-shrink-0 mt-1" size={16} />
                              <p className="text-sm text-gray-700">{quote.message}</p>
                            </div>
                          </div>
                        )}

                        {quote.status === 'pending' && (
                          <button
                            onClick={() => acceptQuote(quote.id)}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                          >
                            Accept Quote
                          </button>
                        )}

                        {quote.status === 'accepted' && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center space-x-2 justify-center">
                            <CheckCircle className="text-emerald-600" size={20} />
                            <span className="text-emerald-700 font-semibold">Quote Accepted</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Cost Estimate</h3>
              {item.estimated_cost_min && item.estimated_cost_max ? (
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-emerald-600 mb-1">
                    ${item.estimated_cost_min} - ${item.estimated_cost_max}
                  </p>
                  <p className="text-sm text-gray-600">AI Estimated Range</p>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  Waiting for quotes to determine cost
                </p>
              )}
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl shadow-sm p-6 border border-emerald-200">
              <h3 className="font-bold text-gray-900 mb-4">Item Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-white" size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Item Submitted</p>
                    <p className="text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {item.solution_type && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="text-white" size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Solution Selected</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {item.solution_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="text-gray-400" size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Awaiting Quotes</p>
                    <p className="text-sm text-gray-500">In progress</p>
                  </div>
                </div>
              </div>
            </div>
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
                <X size={24} />
              </button>

              {/* Navigation */}
              {getAllMedia().length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedMediaIndex(Math.max(0, selectedMediaIndex - 1))}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                    disabled={selectedMediaIndex === 0}
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <button
                    onClick={() => setSelectedMediaIndex(Math.min(getAllMedia().length - 1, selectedMediaIndex + 1))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                    disabled={selectedMediaIndex === getAllMedia().length - 1}
                  >
                    <ArrowLeft size={24} className="rotate-180" />
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
                <div className="flex justify-center mt-4 space-x-2">
                  {getAllMedia().map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === selectedMediaIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Miniatures en bas */}
              {getAllMedia().length > 1 && (
                <div className="flex justify-center mt-4 space-x-2 max-w-4xl overflow-x-auto">
                  {getAllMedia().map((media, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
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
                            <Play className="text-white" size={16} />
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
