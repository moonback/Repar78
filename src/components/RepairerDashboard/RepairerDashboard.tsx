import { useEffect, useState } from 'react';
import {
  Wrench,
  Package,
  DollarSign,
  TrendingUp,
  Star,
  Eye,
  Send,
  Filter,
  Award,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Item } from '../../lib/supabase';

type RepairerDashboardProps = {
  onNavigate: (page: string) => void;
};

export default function RepairerDashboard({ onNavigate }: RepairerDashboardProps) {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const [quoteForm, setQuoteForm] = useState({
    price: '',
    estimatedDuration: '',
    message: '',
  });

  useEffect(() => {
    loadAvailableItems();
  }, []);

  const loadAvailableItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitQuote = async () => {
    if (!user || !selectedItem) return;

    try {
      const { error } = await supabase.from('quotes').insert({
        item_id: selectedItem.id,
        repairer_id: user.id,
        price: parseFloat(quoteForm.price),
        estimated_duration: quoteForm.estimatedDuration,
        message: quoteForm.message,
        status: 'pending',
      });

      if (error) throw error;

      await supabase
        .from('items')
        .update({ status: 'quoted' })
        .eq('id', selectedItem.id);

      setShowQuoteModal(false);
      setSelectedItem(null);
      setQuoteForm({ price: '', estimatedDuration: '', message: '' });
      loadAvailableItems();
    } catch (error) {
      console.error('Error submitting quote:', error);
    }
  };

  const stats = [
    { label: 'Total Jobs', value: '47', icon: Wrench, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active', value: '5', icon: TrendingUp, color: 'bg-amber-100 text-amber-600' },
    { label: 'Earnings', value: '$3,240', icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Rating', value: '4.8', icon: Star, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Repairer Dashboard</h1>
          <p className="text-lg text-gray-600">
            Welcome back, {profile?.full_name || 'Repairer'}
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.color} rounded-lg mb-3`}>
                <stat.icon size={24} />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Repair Requests</h2>
            <button className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">No new repair requests available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Package className="text-blue-600" size={48} />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-1 capitalize">{item.category}</p>
                  {item.brand && <p className="text-sm text-gray-500 mb-3">Brand: {item.brand}</p>}

                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {item.problem_description}
                  </p>

                  {item.estimated_cost_min && item.estimated_cost_max && (
                    <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-emerald-700 mb-1">AI Estimate</p>
                      <p className="text-sm font-bold text-emerald-900">
                        ${item.estimated_cost_min} - ${item.estimated_cost_max}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowQuoteModal(false);
                      }}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowQuoteModal(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Send size={16} />
                      <span>Quote</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Posted {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedItem && !showQuoteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedItem.name}</h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <Package className="text-blue-600" size={80} />
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                    <p className="text-gray-900 capitalize">{selectedItem.category}</p>
                  </div>

                  {selectedItem.brand && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Brand</p>
                      <p className="text-gray-900">{selectedItem.brand}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Problem Description</p>
                    <p className="text-gray-900 leading-relaxed">
                      {selectedItem.problem_description}
                    </p>
                  </div>

                  {selectedItem.ai_diagnosis && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                      <p className="text-sm font-medium text-emerald-700 mb-2">AI Diagnosis</p>
                      <ul className="space-y-2">
                        {selectedItem.ai_diagnosis.detectedIssues?.map(
                          (issue: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700">
                              • {issue}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setShowQuoteModal(true)}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Submit Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showQuoteModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Quote</h2>
                <p className="text-gray-600 mb-6">Provide your quote for {selectedItem.name}</p>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      value={quoteForm.price}
                      onChange={(e) => setQuoteForm({ ...quoteForm, price: e.target.value })}
                      placeholder="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={quoteForm.estimatedDuration}
                      onChange={(e) =>
                        setQuoteForm({ ...quoteForm, estimatedDuration: e.target.value })
                      }
                      placeholder="2-3 days"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={quoteForm.message}
                      onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                      rows={4}
                      placeholder="Additional details about the repair..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowQuoteModal(false);
                      setQuoteForm({ price: '', estimatedDuration: '', message: '' });
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitQuote}
                    disabled={!quoteForm.price || !quoteForm.estimatedDuration}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    Submit Quote
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
