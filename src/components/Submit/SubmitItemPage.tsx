import { useState } from 'react';
import { Upload, Camera, Video, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type SubmitItemPageProps = {
  onNavigate: (page: string) => void;
};

export default function SubmitItemPage({ onNavigate }: SubmitItemPageProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiDiagnosing, setAiDiagnosing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'electronics',
    brand: '',
    problemDescription: '',
  });

  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'appliances', label: 'Appliances' },
    { value: 'phones', label: 'Phones & Tablets' },
    { value: 'computers', label: 'Computers' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from('items').insert({
        user_id: user.id,
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        problem_description: formData.problemDescription,
        ai_diagnosis: aiDiagnosis,
        estimated_cost_min: aiDiagnosis?.estimatedCostMin,
        estimated_cost_max: aiDiagnosis?.estimatedCostMax,
        status: 'submitted',
      }).select();

      if (error) throw error;

      await supabase.from('eco_transactions').insert({
        user_id: user.id,
        points: 10,
        reason: 'Item submitted for repair',
        related_id: data?.[0]?.id,
      });

      await supabase
        .from('profiles')
        .update({ eco_points: (await getEcoPoints()) + 10 })
        .eq('id', user.id);

      onNavigate('my-repairs');
    } catch (error) {
      console.error('Error submitting item:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEcoPoints = async () => {
    if (!user) return 0;
    const { data } = await supabase
      .from('profiles')
      .select('eco_points')
      .eq('id', user.id)
      .single();
    return data?.eco_points || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Your Item</h1>
          <p className="text-lg text-gray-600">
            Let's get your item repaired and earn eco-points
          </p>
        </div>

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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Item Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., iPhone 12 Pro"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Apple"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Description
                </label>
                <textarea
                  name="problemDescription"
                  value={formData.problemDescription}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe what's wrong with your item..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.problemDescription}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Upload Media
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Photos & Videos</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-emerald-400 transition-colors">
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Photos and videos help us diagnose the problem
                </p>

                <div className="flex justify-center gap-4 mt-6">
                  <button className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                    <Camera size={20} />
                    <span>Add Photos</span>
                  </button>
                  <button className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                    <Video size={20} />
                    <span>Add Video</span>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-start space-x-3">
                  <Sparkles className="text-emerald-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Diagnosis</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Our AI will analyze your photos and provide an estimated cost range and
                      possible solutions
                    </p>
                    <button
                      onClick={simulateAIDiagnosis}
                      disabled={aiDiagnosing}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {aiDiagnosing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Run AI Diagnosis</span>
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
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Skip to Solutions
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Diagnosis Results</h2>

              {aiDiagnosis && (
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Detected Issues</h3>
                    <span className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-full">
                      {Math.round(aiDiagnosis.confidence * 100)}% Confidence
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
                      <p className="text-sm text-gray-600 mb-1">Estimated Cost</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${aiDiagnosis.estimatedCostMin} - ${aiDiagnosis.estimatedCostMax}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Complexity</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {aiDiagnosis.repairComplexity}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <p className="text-sm text-blue-800 mb-2 font-medium">Next Steps</p>
                <p className="text-gray-700">
                  Your item will be visible to verified repairers who can provide detailed quotes.
                  You'll receive notifications when quotes arrive.
                </p>
              </div>

              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-600 text-white p-2 rounded-lg">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Earn 10 Eco Points</p>
                    <p className="text-sm text-gray-600">
                      For submitting an item for repair instead of discarding it
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Item'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
