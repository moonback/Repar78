import {
  Wrench,
  Package,
  Recycle,
  TrendingUp,
  Award,
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type HomePageProps = {
  onNavigate: (page: string) => void;
  onAuthClick: () => void;
};

export default function HomePage({ onNavigate, onAuthClick }: HomePageProps) {
  const { user } = useAuth();

  const features = [
    {
      icon: Wrench,
      title: 'Réparations Professionnelles',
      description: 'Connectez-vous avec des experts en réparation vérifiés dans votre région',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Package,
      title: 'Remise à Neuf',
      description: 'Obtenez des offres équitables pour la remise à neuf de vos objets cassés',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Recycle,
      title: 'Recyclage Responsable',
      description: 'Assurez un traitement approprié avec des partenaires de recyclage certifiés',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: Award,
      title: 'Récompenses Écologiques',
      description: 'Gagnez des points pour chaque réparation et échangez-les contre des réductions',
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  const stats = [
    { label: 'Objets Sauvés', value: '12,345', icon: Package },
    { label: 'CO₂ Réduit', value: '89 tonnes', icon: Leaf },
    { label: 'Réparateurs Actifs', value: '456', icon: Users },
    { label: 'Utilisateurs Satisfaits', value: '3,200+', icon: Award },
  ];

  const steps = [
    { number: 1, title: 'Soumettre un Objet', description: 'Téléchargez des photos et décrivez le problème' },
    { number: 2, title: 'Obtenir des Devis', description: 'Recevez des offres de professionnels vérifiés' },
    {
      number: 3,
      title: 'Choisir une Solution',
      description: 'Optez pour réparation, remise à neuf ou recyclage',
    },
    { number: 4, title: 'Suivre les Progrès', description: 'Surveillez votre réparation en temps réel' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-blue-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-blue-100/30 to-purple-100/50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
              <Sparkles className="text-emerald-600" size={20} />
              <span className="text-sm font-semibold text-emerald-700">
                Rejoignez la Révolution de l'Économie Circulaire
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Réparer, Réutiliser,
              <span className="text-emerald-600"> Réduire les Déchets</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connectez-vous avec des experts en réparation locaux, prolongez la durée de vie de vos produits, et gagnez des récompenses
              pour faire des choix durables. Ensemble, nous pouvons réduire les déchets électroniques et créer une
              économie circulaire.
            </p>

            {user ? (
              <button
                onClick={() => onNavigate('submit')}
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              >
                <span>Soumettre votre Objet</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={onAuthClick}
                className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              >
                <span>Commencer Gratuitement</span>
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
                  <stat.icon className="text-emerald-600" size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin pour des réparations durables
            </h2>
            <p className="text-xl text-gray-600">
              Une plateforme complète pour prolonger la durée de vie de vos appareils
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-emerald-200 group"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 ${feature.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comment ça marche</h2>
            <p className="text-xl text-gray-600">Faites réparer vos objets en quatre étapes simples</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 text-white rounded-full font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-emerald-300" size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Prêt à faire la différence ?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Rejoignez des milliers d'utilisateurs qui font des choix durables chaque jour
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <button
                onClick={() => onNavigate('submit')}
                className="inline-flex items-center justify-center space-x-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
              >
                <span>Soumettre votre Premier Objet</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <>
                <button
                  onClick={onAuthClick}
                  className="inline-flex items-center justify-center space-x-2 bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
                >
                  <span>Commencer</span>
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={onAuthClick}
                  className="inline-flex items-center justify-center space-x-2 bg-emerald-800 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-emerald-900 transition-colors"
                >
                  <span>Devenir Réparateur</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-blue-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Pourquoi choisir CircularRepair ?
                </h3>
                <ul className="space-y-3">
                  {[
                    'Professionnels de réparation vérifiés',
                    'Tarification transparente avec plusieurs devis',
                    'Suivi et mises à jour en temps réel',
                    'Récompenses écologiques pour des choix durables',
                    'Soutien aux entreprises de réparation locales',
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="text-emerald-600 flex-shrink-0" size={20} />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                  <TrendingUp className="text-blue-600 mx-auto mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Taux de Réussite</div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                  <Award className="text-amber-600 mx-auto mb-2" size={32} />
                  <div className="text-2xl font-bold text-gray-900">4.8/5</div>
                  <div className="text-sm text-gray-600">Note Moyenne</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
