# Configuration Gemini AI pour CircularRepair

## 🚀 Installation et Configuration

### 1. Installation des dépendances
```bash
npm install @google/generative-ai
```

### 2. Obtenir une clé API Gemini

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Create API Key"
4. Copiez la clé API générée

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Redémarrage du serveur

```bash
npm run dev
```

## 🔧 Fonctionnalités Gemini AI

### Diagnostic Automatique
- **Analyse d'images** : Détection visuelle des problèmes
- **Analyse de texte** : Compréhension de la description du problème
- **Estimation de coûts** : Fourchette de prix réaliste en euros
- **Évaluation de difficulté** : Facile, Moyenne, Difficile
- **Recommandations** : Actions spécifiques suggérées

### Types de Produits Supportés
- 📱 Téléphones et tablettes
- 💻 Ordinateurs et laptops
- 🏠 Électroménager
- 🎮 Électronique grand public
- 🔧 Outils et équipements

### Limites Techniques
- **Images** : Maximum 4 images par diagnostic
- **Vidéos** : Maximum 2 vidéos par diagnostic
- **Taille** : Images optimisées automatiquement
- **Format** : JPEG, PNG, MP4 supportés

## 🛠️ Utilisation dans l'Application

### 1. Soumission d'Objet
1. Remplissez les informations de base
2. Uploadez des photos/vidéos du problème
3. Cliquez sur "Lancer le Diagnostic IA"
4. Consultez les résultats détaillés

### 2. Résultats du Diagnostic
- **Problèmes détectés** : Liste des issues identifiées
- **Coût estimé** : Fourchette de prix en euros
- **Difficulté** : Niveau de complexité de la réparation
- **Actions recommandées** : Étapes suggérées
- **Niveau de confiance** : Pourcentage de fiabilité

## 🔍 Dépannage

### Erreur "Clé API non configurée"
- Vérifiez que `VITE_GEMINI_API_KEY` est définie dans `.env`
- Redémarrez le serveur de développement
- Vérifiez que la clé API est valide

### Erreur "Connexion Gemini échouée"
- Vérifiez votre connexion internet
- Vérifiez que la clé API n'a pas expiré
- Consultez les logs de la console pour plus de détails

### Diagnostic qui échoue
- Vérifiez que les images sont accessibles
- Assurez-vous que la description du problème est claire
- Réessayez avec moins d'images si nécessaire

## 📊 Monitoring et Logs

Les diagnostics IA sont loggés dans la console du navigateur pour le débogage :
- Requêtes envoyées à Gemini
- Réponses reçues
- Erreurs éventuelles
- Temps de traitement

## 🔒 Sécurité

- La clé API est stockée côté client (VITE_*)
- Les images sont traitées localement avant envoi
- Aucune donnée personnelle n'est stockée par Gemini
- Conformité RGPD respectée

## 📈 Améliorations Futures

- [ ] Support de plus de formats d'images
- [ ] Diagnostic vidéo avancé
- [ ] Intégration avec des bases de données de réparateurs
- [ ] Suggestions de pièces de rechange
- [ ] Estimation de temps de réparation
