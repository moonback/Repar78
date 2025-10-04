import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from '../config/gemini';

// Configuration Gemini
const genAI = new GoogleGenerativeAI(GEMINI_CONFIG.API_KEY);

export interface ProductInfo {
  name: string;
  category: string;
  brand?: string;
  problemDescription: string;
  images?: string[];
  videos?: string[];
}

export interface AIDiagnosis {
  detectedIssues: string[];
  estimatedCostMin: number;
  estimatedCostMax: number;
  repairDifficulty: 'easy' | 'medium' | 'hard';
  recommendedActions: string[];
  confidence: number;
}

class AIService {
  private model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL_NAME });

  async diagnoseProduct(productInfo: ProductInfo): Promise<AIDiagnosis> {
    try {
      // Préparer les données pour Gemini
      const prompt = this.buildDiagnosisPrompt(productInfo);
      
      // Préparer les images si disponibles
      const imageParts = await this.prepareImageParts(productInfo.images || []);
      
      // Combiner le texte et les images
      const parts = [
        { text: prompt },
        ...imageParts
      ];

      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      // Parser la réponse JSON
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Erreur lors du diagnostic IA:', error);
      throw new Error('Impossible de diagnostiquer le produit. Veuillez réessayer.');
    }
  }

  private buildDiagnosisPrompt(productInfo: ProductInfo): string {
    return `
Tu es un expert en réparation d'objets électroniques et électroménagers. 
Analyse ce produit et fournis un diagnostic détaillé.

INFORMATIONS DU PRODUIT:
- Nom: ${productInfo.name}
- Catégorie: ${productInfo.category}
- Marque: ${productInfo.brand || 'Non spécifiée'}
- Description du problème: ${productInfo.problemDescription}

${productInfo.images?.length ? `- ${productInfo.images.length} image(s) fournie(s)` : ''}
${productInfo.videos?.length ? `- ${productInfo.videos.length} vidéo(s) fournie(s)` : ''}

TÂCHES À EFFECTUER:
1. Analyse les images/vidéos pour identifier les problèmes visuels
2. Corrèle les problèmes visuels avec la description fournie
3. Estime la difficulté de réparation (easy/medium/hard)
4. Fournis une estimation de coût en euros
5. Recommande des actions spécifiques

RÉPONSE ATTENDUE (format JSON strict):
{
  "detectedIssues": [
    "Problème 1 identifié",
    "Problème 2 identifié"
  ],
  "estimatedCostMin": 50,
  "estimatedCostMax": 150,
  "repairDifficulty": "medium",
  "recommendedActions": [
    "Action recommandée 1",
    "Action recommandée 2"
  ],
  "confidence": 0.85
}

IMPORTANT:
- Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire
- Les coûts doivent être réalistes pour le marché français
- La difficulté doit être basée sur l'expertise technique requise
- La confiance doit être entre 0 et 1
- Sois précis et technique dans tes analyses
`;
  }

  private async prepareImageParts(imageUrls: string[]): Promise<any[]> {
    const imageParts = [];
    
    for (const imageUrl of imageUrls.slice(0, GEMINI_CONFIG.MAX_IMAGES)) { // Limite configurée
      try {
        // Convertir l'URL en base64 ou utiliser directement l'URL
        const imageData = await this.fetchImageAsBase64(imageUrl);
        imageParts.push({
          inlineData: {
            data: imageData,
            mimeType: 'image/jpeg'
          }
        });
      } catch (error) {
        console.warn('Impossible de charger l\'image:', imageUrl);
      }
    }
    
    return imageParts;
  }

  private async fetchImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Retirer le préfixe data:image/jpeg;base64,
          resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Impossible de charger l'image: ${imageUrl}`);
    }
  }

  private parseAIResponse(responseText: string): AIDiagnosis {
    try {
      // Nettoyer la réponse pour extraire le JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Réponse JSON non trouvée');
      }
      
      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);
      
      // Validation et valeurs par défaut
      return {
        detectedIssues: parsed.detectedIssues || ['Problème non identifié'],
        estimatedCostMin: Math.max(0, parsed.estimatedCostMin || 50),
        estimatedCostMax: Math.max(parsed.estimatedCostMin || 50, parsed.estimatedCostMax || 150),
        repairDifficulty: ['easy', 'medium', 'hard'].includes(parsed.repairDifficulty) 
          ? parsed.repairDifficulty 
          : 'medium',
        recommendedActions: parsed.recommendedActions || ['Consulter un professionnel'],
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
      };
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse IA:', error);
      
      // Retourner un diagnostic par défaut en cas d'erreur
      return {
        detectedIssues: ['Diagnostic en cours d\'analyse'],
        estimatedCostMin: 50,
        estimatedCostMax: 150,
        repairDifficulty: 'medium',
        recommendedActions: ['Consulter un professionnel pour un diagnostic précis'],
        confidence: 0.3
      };
    }
  }

  // Méthode pour tester la connexion
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Test de connexion');
      await result.response;
      return true;
    } catch (error) {
      console.error('Test de connexion Gemini échoué:', error);
      return false;
    }
  }
}

export const aiService = new AIService();
