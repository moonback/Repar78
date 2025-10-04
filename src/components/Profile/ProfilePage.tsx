import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Calendar,
  Award,
  Edit3,
  Camera,
  Save,
  X,
  MapPin,
  Star,
  Briefcase,
  Shield,
  Heart,
  Settings,
  LogOut,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, RepairerProfile } from '../../lib/supabase';

type ProfilePageProps = {
  onNavigate: (page: string) => void;
};

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingRepairer, setIsEditingRepairer] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [repairerProfile, setRepairerProfile] = useState<RepairerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour l'édition du profil principal
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
  });

  // États pour l'édition du profil réparateur
  const [editRepairerForm, setEditRepairerForm] = useState({
    business_name: '',
    expertise: [] as string[],
    service_types: [] as string[],
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    bio: '',
  });

  // États pour l'ajout d'expertise
  const [newExpertise, setNewExpertise] = useState('');
  const [newServiceType, setNewServiceType] = useState('');

  // Charger le profil réparateur si l'utilisateur est un réparateur
  useEffect(() => {
    if (profile?.role === 'repairer' || profile?.role === 'refurbisher' || profile?.role === 'recycler') {
      loadRepairerProfile();
    }
  }, [profile]);

  const loadRepairerProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('repairer_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setRepairerProfile(data);
      if (data) {
        setEditRepairerForm({
          business_name: data.business_name || '',
          expertise: data.expertise || [],
          service_types: data.service_types || [],
          location: data.location || '',
          latitude: data.latitude,
          longitude: data.longitude,
          bio: data.bio || '',
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil réparateur:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          avatar_url: editForm.avatar_url,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Rafraîchir le profil après la mise à jour
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRepairerProfile = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const profileData = {
        id: user.id,
        business_name: editRepairerForm.business_name,
        expertise: editRepairerForm.expertise,
        service_types: editRepairerForm.service_types,
        location: editRepairerForm.location,
        latitude: editRepairerForm.latitude,
        longitude: editRepairerForm.longitude,
        bio: editRepairerForm.bio,
      };

      if (repairerProfile) {
        // Mettre à jour le profil existant
        const { error } = await supabase
          .from('repairer_profiles')
          .update(profileData)
          .eq('id', user.id);

        if (error) throw error;
      } else {
        // Créer un nouveau profil réparateur
        const { error } = await supabase
          .from('repairer_profiles')
          .insert(profileData);

        if (error) throw error;
      }

      await loadRepairerProfile();
      setIsEditingRepairer(false);
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil réparateur');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !editRepairerForm.expertise.includes(newExpertise.trim())) {
      setEditRepairerForm({
        ...editRepairerForm,
        expertise: [...editRepairerForm.expertise, newExpertise.trim()],
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertise: string) => {
    setEditRepairerForm({
      ...editRepairerForm,
      expertise: editRepairerForm.expertise.filter(e => e !== expertise),
    });
  };

  const addServiceType = () => {
    if (newServiceType.trim() && !editRepairerForm.service_types.includes(newServiceType.trim())) {
      setEditRepairerForm({
        ...editRepairerForm,
        service_types: [...editRepairerForm.service_types, newServiceType.trim()],
      });
      setNewServiceType('');
    }
  };

  const removeServiceType = (serviceType: string) => {
    setEditRepairerForm({
      ...editRepairerForm,
      service_types: editRepairerForm.service_types.filter(s => s !== serviceType),
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    const labels = {
      user: 'Utilisateur',
      repairer: 'Réparateur',
      refurbisher: 'Remise à Neuf',
      recycler: 'Recycleur',
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      user: 'bg-blue-100 text-blue-800',
      repairer: 'bg-emerald-100 text-emerald-800',
      refurbisher: 'bg-purple-100 text-purple-800',
      recycler: 'bg-orange-100 text-orange-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête du profil */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  {editForm.avatar_url ? (
                    <img
                      src={editForm.avatar_url}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-emerald-600" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
                    <Camera size={16} className="text-emerald-600" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70"
                      placeholder="Nom complet"
                    />
                  ) : (
                    profile.full_name || 'Utilisateur'
                  )}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(profile.role)}`}>
                    {getRoleLabel(profile.role)}
                  </span>
                  <div className="flex items-center space-x-1 text-emerald-100">
                    <Award size={16} />
                    <span className="text-sm">{profile.eco_points} points éco</span>
                  </div>
                </div>
                <p className="text-emerald-100 text-sm">
                  Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2"
                    >
                      <Save size={16} />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                      <X size={16} />
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    Modifier
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Informations du profil */}
          <div className="px-8 py-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Informations personnelles
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-gray-700">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-gray-700">
                      Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award size={16} className="text-gray-500" />
                    <span className="text-gray-700">{profile.eco_points} points écologiques</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={20} />
                  Statistiques
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">0</div>
                    <div className="text-sm text-gray-600">Objets réparés</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Devis envoyés</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profil réparateur */}
        {(profile.role === 'repairer' || profile.role === 'refurbisher' || profile.role === 'recycler') && (
          <div className="mt-8 bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Briefcase size={24} />
                  Profil Professionnel
                </h2>
                {!isEditingRepairer && (
                  <button
                    onClick={() => setIsEditingRepairer(true)}
                    className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    {repairerProfile ? 'Modifier' : 'Compléter'}
                  </button>
                )}
              </div>
            </div>

            <div className="px-8 py-6">
              {isEditingRepairer ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'entreprise
                    </label>
                    <input
                      type="text"
                      value={editRepairerForm.business_name}
                      onChange={(e) => setEditRepairerForm({ ...editRepairerForm, business_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localisation
                    </label>
                    <input
                      type="text"
                      value={editRepairerForm.location}
                      onChange={(e) => setEditRepairerForm({ ...editRepairerForm, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ville, Région"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domaine d'expertise
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ajouter une expertise (ex: Smartphones, Ordinateurs)"
                        onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                      />
                      <button
                        onClick={addExpertise}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editRepairerForm.expertise.map((expertise, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {expertise}
                          <button
                            onClick={() => removeExpertise(expertise)}
                            className="hover:text-purple-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Types de services
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newServiceType}
                        onChange={(e) => setNewServiceType(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ajouter un type de service (ex: Réparation à domicile)"
                        onKeyPress={(e) => e.key === 'Enter' && addServiceType()}
                      />
                      <button
                        onClick={addServiceType}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editRepairerForm.service_types.map((serviceType, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        >
                          {serviceType}
                          <button
                            onClick={() => removeServiceType(serviceType)}
                            className="hover:text-purple-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description professionnelle
                    </label>
                    <textarea
                      value={editRepairerForm.bio}
                      onChange={(e) => setEditRepairerForm({ ...editRepairerForm, bio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={4}
                      placeholder="Décrivez votre expérience et vos services..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveRepairerProfile}
                      disabled={loading}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Save size={16} />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={() => setIsEditingRepairer(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors flex items-center gap-2"
                    >
                      <X size={16} />
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations professionnelles</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Entreprise:</span>
                        <p className="text-gray-600">{repairerProfile?.business_name || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Localisation:</span>
                        <p className="text-gray-600">{repairerProfile?.location || 'Non renseigné'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Note:</span>
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-current" />
                          <span className="text-gray-600">{repairerProfile?.rating || 0}/5</span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Travaux réalisés:</span>
                        <p className="text-gray-600">{repairerProfile?.total_jobs || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Expertise</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium text-gray-700">Domaines d'expertise:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {repairerProfile?.expertise?.map((expertise, index) => (
                            <span
                              key={index}
                              className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                            >
                              {expertise}
                            </span>
                          )) || <span className="text-gray-500">Aucune expertise renseignée</span>}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Types de services:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {repairerProfile?.service_types?.map((serviceType, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                            >
                              {serviceType}
                            </span>
                          )) || <span className="text-gray-500">Aucun service renseigné</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {repairerProfile?.bio && (
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{repairerProfile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
