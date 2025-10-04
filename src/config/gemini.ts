// Configuration pour Gemini AI
export const GEMINI_CONFIG = {
  // Remplacez par votre clé API Gemini
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY || 'your_gemini_api_key_here',
  
  // Configuration du modèle
  MODEL_NAME: 'gemini-2.0-flash-exp',
  
  // Limites
  MAX_IMAGES: 4,
  MAX_VIDEOS: 2,
  
  // Timeouts
  REQUEST_TIMEOUT: 30000, // 30 secondes
  IMAGE_TIMEOUT: 10000,   // 10 secondes
};

// Instructions pour obtenir une clé API Gemini :
// 1. Allez sur https://makersuite.google.com/app/apikey
// 2. Créez une nouvelle clé API
// 3. Copiez la clé et ajoutez-la à votre fichier .env :
//    VITE_GEMINI_API_KEY=votre_cle_api_ici
