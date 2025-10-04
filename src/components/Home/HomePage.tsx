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
import Button from '../UI/Button';
import Card from '../UI/Card';

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 via-blue-100/20 to-purple-100/30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

        <div className="relative container-mobile pt-16 pb-12 md:pt-20 md:pb-24">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center space-x-2 glass-effect px-4 py-2 rounded-full shadow-soft mb-6">
              <Sparkles className="text-primary-600" size={20} />
              <span className="text-sm font-semibold text-primary-700">
                Rejoignez la Révolution de l'Économie Circulaire
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-900 mb-4 leading-tight">
              Réparer, Réutiliser,
              <span className="text-gradient"> Réduire les Déchets</span>
            </h1>

            <p className="text-base md:text-lg text-secondary-600 mb-6 leading-relaxed max-w-3xl mx-auto">
              Connectez-vous avec des experts en réparation locaux, prolongez la durée de vie de vos produits, et gagnez des récompenses
              pour faire des choix durables. Ensemble, nous pouvons réduire les déchets électroniques et créer une
              économie circulaire.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button
                  onClick={() => onNavigate('submit')}
                  size="lg"
                  className="inline-flex items-center space-x-2 transform hover:scale-105 transition-all"
                >
                  <span>Soumettre votre Objet</span>
                  <ArrowRight size={20} />
                </Button>
              ) : (
                <Button
                  onClick={onAuthClick}
                  size="lg"
                  className="inline-flex items-center space-x-2 transform hover:scale-105 transition-all"
                >
                  <span>Commencer Gratuitement</span>
                  <ArrowRight size={20} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container-mobile">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-4 md:p-6" hover>
                <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary-100 rounded-full mb-3">
                  <stat.icon className="text-primary-600" size={20} />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-secondary-900 mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-secondary-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-primary-50">
        <div className="container-mobile">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-secondary-900 mb-3">
              Tout ce dont vous avez besoin pour des réparations durables
            </h2>
            <p className="text-sm md:text-base text-secondary-600">
              Une plateforme complète pour prolonger la durée de vie de vos appareils
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6" hover>
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={24} />
                </div>
                <h3 className="text-base font-bold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600 leading-relaxed text-xs">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="container-mobile">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-secondary-900 mb-3">Comment ça marche</h2>
            <p className="text-sm md:text-base text-secondary-600">Faites réparer vos objets en quatre étapes simples</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-6" hover>
                  <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary-600 text-white rounded-full font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-base font-bold text-secondary-900 mb-2">{step.title}</h3>
                  <p className="text-secondary-600 text-xs">{step.description}</p>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="text-primary-300" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="container-mobile text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Prêt à faire la différence ?</h2>
          <p className="text-sm md:text-base text-primary-100 mb-6 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui font des choix durables chaque jour
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button
                onClick={() => onNavigate('submit')}
                variant="secondary"
                size="lg"
                className="inline-flex items-center justify-center space-x-2"
              >
                <span>Soumettre votre Premier Objet</span>
                <ArrowRight size={20} />
              </Button>
            ) : (
              <>
                <Button
                  onClick={onAuthClick}
                  variant="secondary"
                  size="lg"
                  className="inline-flex items-center justify-center space-x-2"
                >
                  <span>Commencer</span>
                  <ArrowRight size={20} />
                </Button>
                <Button
                  onClick={onAuthClick}
                  variant="outline"
                  size="lg"
                  className="inline-flex items-center justify-center space-x-2 border-white text-white hover:bg-white hover:text-primary-700"
                >
                  <span>Devenir Réparateur</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container-mobile">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-secondary-900 mb-3">
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
                      <CheckCircle className="text-primary-600 flex-shrink-0" size={20} />
                      <span className="text-secondary-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <TrendingUp className="text-blue-600 mx-auto mb-2" size={32} />
                  <div className="text-2xl font-bold text-secondary-900">95%</div>
                  <div className="text-sm text-secondary-600">Taux de Réussite</div>
                </Card>
                <Card className="p-6 text-center">
                  <Award className="text-amber-600 mx-auto mb-2" size={32} />
                  <div className="text-2xl font-bold text-secondary-900">4.8/5</div>
                  <div className="text-sm text-secondary-600">Note Moyenne</div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
