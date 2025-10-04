import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingProfileRef = useRef<Set<string>>(new Set());
  const lastProfileLoadRef = useRef<number>(0);
  const lastProcessedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let isInitializing = true;

    // Vérifier la session existante au démarrage
    const initializeAuth = async () => {
      try {
        console.log('🔍 Initialisation de l\'authentification...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erreur lors de la récupération de la session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('📋 Session récupérée:', session ? 'Oui' : 'Non');

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        if (session?.user && mounted) {
          console.log('👤 Utilisateur trouvé, chargement du profil...', session.user.id);
          await loadProfile(session.user.id);
        } else if (mounted) {
          console.log('🚫 Aucun utilisateur, arrêt du chargement');
          setLoading(false);
        }
        
        isInitializing = false;
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de l\'authentification:', error);
        if (mounted) {
          setLoading(false);
        }
        isInitializing = false;
      }
    };

    initializeAuth();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', {
          event,
          sessionUserId: session?.user?.id,
          currentUserId: user?.id,
          currentProfile: profile ? 'chargé' : 'non chargé',
          isInitializing,
          mounted
        });
        
        if (!mounted) {
          console.log('⏭️ Composant démonté, ignore');
          return;
        }

        // Éviter de traiter l'événement INITIAL_SESSION si on vient de l'initialiser
        if (isInitializing && event === 'INITIAL_SESSION') {
          console.log('⏭️ Ignore INITIAL_SESSION car déjà traité');
          return;
        }

        // Éviter les rechargements multiples pour SIGNED_IN
        if (event === 'SIGNED_IN' && session?.user) {
          const eventUserId = session.user.id;
          const isSameUser = user?.id === eventUserId;
          const isProfileLoaded = !!profile;
          const isProfileLoading = loadingProfileRef.current.has(eventUserId);
          const isAlreadyProcessed = lastProcessedUserIdRef.current === eventUserId;
          
          console.log('🔍 Vérification SIGNED_IN:', {
            eventUserId,
            currentUserId: user?.id,
            lastProcessedUserId: lastProcessedUserIdRef.current,
            isSameUser,
            isProfileLoaded,
            isProfileLoading,
            isAlreadyProcessed,
            shouldSkip: (isSameUser && isProfileLoaded) || isProfileLoading || isAlreadyProcessed
          });
          
          if ((isSameUser && isProfileLoaded) || isProfileLoading || isAlreadyProcessed) {
            console.log('⏭️ Ignore SIGNED_IN car profil déjà chargé, en cours de chargement, ou déjà traité');
            return;
          }
          
          // Marquer cet utilisateur comme en cours de traitement
          lastProcessedUserIdRef.current = eventUserId;
        }

        console.log('🔄 Mise à jour des états...');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Vérifier si le profil est déjà chargé pour cet utilisateur
          const currentProfileUserId = profile?.id;
          const isProfileAlreadyLoaded = currentProfileUserId === session.user.id;
          
          console.log('👤 Nouvelle session, vérification du profil...', {
            userId: session.user.id,
            email: session.user.email,
            currentProfileUserId,
            isProfileAlreadyLoaded,
            reason: isProfileAlreadyLoaded ? 'profil déjà chargé' : 'nouvelle session détectée'
          });
          
          if (!isProfileAlreadyLoaded) {
            console.log('🚀 Chargement du profil nécessaire...');
            await loadProfile(session.user.id);
          } else {
            console.log('✅ Profil déjà chargé, pas de rechargement nécessaire');
          }
        } else {
          console.log('🚪 Déconnexion détectée');
          setProfile(null);
          setLoading(false);
          // Réinitialiser la référence lors de la déconnexion
          lastProcessedUserIdRef.current = null;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    const now = Date.now();
    
    console.log('🔍 loadProfile appelé:', {
      userId,
      currentTime: now,
      lastLoad: lastProfileLoadRef.current,
      timeSinceLastLoad: now - lastProfileLoadRef.current,
      isCurrentlyLoading: loadingProfileRef.current.has(userId),
      currentProfile: profile ? 'chargé' : 'non chargé'
    });
    
    // Éviter les chargements multiples simultanés
    if (loadingProfileRef.current.has(userId)) {
      console.log('⏳ Profil déjà en cours de chargement pour:', userId);
      return;
    }

    // Éviter les chargements trop fréquents (moins de 2 secondes)
    if (now - lastProfileLoadRef.current < 2000) {
      console.log('⏳ Chargement trop récent, attente...', {
        timeSinceLastLoad: now - lastProfileLoadRef.current,
        requiredDelay: 2000
      });
      return;
    }

    console.log('🚀 Début du chargement du profil...');
    loadingProfileRef.current.add(userId);
    lastProfileLoadRef.current = now;

    try {
      console.log('📥 Requête Supabase pour le profil:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Profil chargé avec succès:', {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          eco_points: data.eco_points
        });
        console.log('🔄 Mise à jour de l\'état du profil...');
        setProfile(data);
        // Marquer que le profil est maintenant chargé pour cet utilisateur
        lastProcessedUserIdRef.current = userId;
      } else {
        console.log('⚠️ Aucun profil trouvé pour l\'utilisateur:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil:', error);
      setProfile(null);
    } finally {
      console.log('🏁 Fin du chargement du profil, mise à jour loading=false');
      setLoading(false);
      // Petit délai avant de retirer l'ID pour éviter les chargements trop rapides
      setTimeout(() => {
        console.log('🧹 Nettoyage: retrait de l\'ID du loadingProfileRef');
        loadingProfileRef.current.delete(userId);
      }, 500);
    }
  };

  const refreshProfile = async () => {
    console.log('🔄 refreshProfile appelé:', {
      hasUser: !!user,
      userId: user?.id,
      currentProfile: profile ? 'chargé' : 'non chargé',
      isCurrentlyLoading: loadingProfileRef.current.has(user?.id || '')
    });
    
    if (user) {
      console.log('🔄 Rechargement forcé du profil pour:', user.id);
      // Forcer le rechargement en retirant l'ID du Set et en réinitialisant le timestamp
      loadingProfileRef.current.delete(user.id);
      lastProfileLoadRef.current = 0; // Réinitialiser le timestamp
      await loadProfile(user.id);
    } else {
      console.log('⚠️ Tentative de rechargement du profil sans utilisateur');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentative de connexion pour:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Erreur de connexion:', error);
        throw error;
      }
      
      console.log('Connexion réussie:', data.user?.id);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    try {
      console.log('Tentative d\'inscription pour:', email);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Erreur d\'inscription:', error);
        throw error;
      }

      if (data.user) {
        console.log('Utilisateur créé, création du profil...');
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            role: role as 'user' | 'repairer' | 'refurbisher' | 'recycler',
          });

        if (profileError) {
          console.error('Erreur lors de la création du profil:', profileError);
          throw profileError;
        }
        
        console.log('Profil créé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Déconnexion en cours...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
      }
      
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
