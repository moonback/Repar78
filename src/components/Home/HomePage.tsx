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
      {/* Hero Section modernisé */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-secondary-100/10 to-primary-100/20" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(14,165,233,0.1)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.1)_0%,_transparent_50%)]" />
        </div>

        <div className="relative container-responsive pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="text-center max-w-5xl mx-auto animate-fade-in">
            <div className="inline-flex items-center space-x-2 glass-effect px-6 py-3 rounded-full shadow-sm mb-8 hover-lift">
              <Sparkles className="text-primary-600 animate-pulse" size={20} />
              <span className="text-sm font-semibold text-primary-700">
                🌱 Rejoignez la Révolution de l'Économie Circulaire
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6 leading-tight">
              Réparer, Réutiliser,
              <span className="text-gradient block mt-2">Réduire l'Impact</span>
            </h1>

            <p className="text-lg md:text-xl text-secondary-600 mb-8 leading-relaxed max-w-4xl mx-auto">
              Connectez-vous avec des experts en réparation locaux, prolongez la durée de vie de vos produits, et gagnez des récompenses
              pour faire des choix durables. Ensemble, créons un avenir plus responsable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Button
                  onClick={() => onNavigate('submit')}
                  size="xl"
                  className="inline-flex items-center space-x-3 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span>Soumettre votre Objet</span>
                  <ArrowRight size={20} />
                </Button>
              ) : (
                <Button
                  onClick={onAuthClick}
                  size="xl"
                  className="inline-flex items-center space-x-3 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span>Commencer Gratuitement</span>
                  <ArrowRight size={20} />
                </Button>
              )}

              <div className="hidden sm:flex items-center space-x-2 text-secondary-500">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-sm">Rejoignez +3000 utilisateurs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section modernisée */}
      <section className="py-16 bg-white border-t border-secondary-100">
        <div className="container-responsive">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="text-center group"
                variant="elevated"
                hover
                padding="lg"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="text-primary-600" size={24} />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-secondary-900 mb-2 text-gradient">{stat.value}</div>
                <div className="text-sm lg:text-base text-secondary-600 font-medium">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section modernisée */}
      <section className="py-20 bg-gradient-to-b from-white to-primary-50/30">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">
              Tout ce dont vous avez besoin pour des réparations durables
            </h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Une plateforme complète et intuitive pour prolonger la durée de vie de vos appareils
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group text-center"
                variant="elevated"
                hover
                padding="lg"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-all duration-300 shadow-sm`}>
                  <feature.icon size={28} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-bold text-secondary-900 mb-3">{feature.title}</h3>
                <p className="text-secondary-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section modernisée */}
      <section className="py-20 bg-gradient-to-br from-primary-50/50 to-secondary-50/30">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary-900 mb-4">Comment ça marche</h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">Faites réparer vos objets en quatre étapes simples et intuitives</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <Card
                  className="text-center hover-lift"
                  variant="elevated"
                  hover
                  padding="lg"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl font-bold text-xl mb-6 shadow-lg group-hover:scale-110 transition-all duration-300">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-secondary-900 mb-3">{step.title}</h3>
                  <p className="text-secondary-600 leading-relaxed">{step.description}</p>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="bg-white rounded-full p-2 shadow-md border border-secondary-200">
                      <ArrowRight className="text-primary-500" size={20} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section modernisée */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_rgba(255,255,255,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,_rgba(255,255,255,0.05)_0%,_transparent_50%)]" />

        <div className="container-responsive text-center relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Prêt à faire la différence ?
            </h2>
            <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
              Rejoignez des milliers d'utilisateurs qui font des choix durables chaque jour et contribuez à un avenir plus responsable
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Button
                  onClick={() => onNavigate('submit')}
                  variant="secondary"
                  size="xl"
                  className="inline-flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  <span>Soumettre votre Premier Objet</span>
                  <ArrowRight size={20} />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={onAuthClick}
                    variant="secondary"
                    size="xl"
                    className="inline-flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                  >
                    <span>Commencer Maintenant</span>
                    <ArrowRight size={20} />
                  </Button>
                  <Button
                    onClick={onAuthClick}
                    variant="outline"
                    size="xl"
                    className="inline-flex items-center justify-center space-x-3 border-2 border-white text-white hover:bg-white hover:text-primary-700 shadow-lg hover:shadow-xl"
                  >
                    <span>Devenir Réparateur</span>
                  </Button>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center space-x-8 text-primary-200 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Gratuit</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Écologique</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section modernisée */}
      <section className="py-20 bg-white">
        <div className="container-responsive">
          <Card className="bg-gradient-to-br from-primary-50 via-secondary-50/30 to-primary-50 border border-primary-100 shadow-lg" padding="xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-6">
                  Pourquoi choisir CircularRepair ?
                </h3>
                <ul className="space-y-4">
                  {[
                    'Professionnels de réparation vérifiés et certifiés',
                    'Tarification transparente avec devis comparatifs',
                    'Suivi en temps réel et mises à jour instantanées',
                    'Récompenses écologiques pour vos choix durables',
                    'Soutien aux entreprises locales et économie circulaire',
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="text-primary-600" size={14} />
                      </div>
                      <span className="text-secondary-700 leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-6">
                <Card className="text-center bg-white/80 backdrop-blur-sm border border-white/50" padding="lg" hover>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-4">
                    <TrendingUp className="text-primary-600" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-secondary-900 mb-2">95%</div>
                  <div className="text-sm text-secondary-600 font-medium">Taux de Réussite</div>
                </Card>
                <Card className="text-center bg-white/80 backdrop-blur-sm border border-white/50" padding="lg" hover>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl mb-4">
                    <Award className="text-success-600" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-secondary-900 mb-2">4.8/5</div>
                  <div className="text-sm text-secondary-600 font-medium">Note Moyenne</div>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
