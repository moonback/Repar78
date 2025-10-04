import { useEffect, useState } from 'react';
import { Package, Search, Filter, ShoppingCart, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, MarketplaceItem } from '../../lib/supabase';

type MarketplacePageProps = {
  onNavigate: (page: string) => void;
};

export default function MarketplacePage({ onNavigate }: MarketplacePageProps) {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMarketplaceItems();
  }, [categoryFilter]);

  const loadMarketplaceItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('marketplace_items')
        .select('*')
        .eq('sold', false)
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'parts', label: 'Spare Parts' },
    { value: 'refurbished', label: 'Refurbished' },
    { value: 'tools', label: 'Tools' },
  ];

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-emerald-100 text-emerald-700';
      case 'like_new':
        return 'bg-blue-100 text-blue-700';
      case 'good':
        return 'bg-amber-100 text-amber-700';
      case 'fair':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Marketplace</h1>
            <p className="text-lg text-gray-600">
              Buy spare parts and refurbished items from the community
            </p>
          </div>

          {(profile?.role === 'repairer' || profile?.role === 'refurbisher') && (
            <button className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Plus size={20} />
              <span>List Item</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for parts, tools, or devices..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    categoryFilter === cat.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Be the first to list an item in this category'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden group"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center relative">
                  <Package className="text-purple-600" size={64} />
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getConditionColor(
                      item.condition
                    )}`}
                  >
                    {item.condition.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-3">
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">${item.price}</p>
                      <p className="text-xs text-gray-500">
                        {item.stock} {item.stock === 1 ? 'item' : 'items'} available
                      </p>
                    </div>
                  </div>

                  <button className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors group-hover:shadow-lg">
                    <ShoppingCart size={18} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 border border-emerald-200">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sell Your Items</h2>
            <p className="text-gray-700 mb-6">
              Are you a repairer or refurbisher? List your spare parts and refurbished items to
              reach thousands of potential buyers in the circular economy community.
            </p>
            {profile?.role === 'user' ? (
              <p className="text-sm text-gray-600">
                Switch to a repairer or refurbisher account to start selling
              </p>
            ) : (
              <button className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                <Plus size={20} />
                <span>List Your First Item</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
