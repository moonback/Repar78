import { supabase } from './supabase';

// Types de fichiers supportés
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/mkv'];

// Tailles maximales (en bytes)
export const MAX_FILE_SIZE = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  AVATAR: 5 * 1024 * 1024, // 5MB
};

// Buckets disponibles
export const BUCKETS = {
  ITEM_MEDIA: 'item-media',
  AVATARS: 'avatars',
  REPAIR_PHOTOS: 'repair-photos',
} as const;

export type BucketType = typeof BUCKETS[keyof typeof BUCKETS];

/**
 * Upload un fichier vers un bucket Supabase
 */
export const uploadFile = async (
  file: File,
  bucket: BucketType,
  path: string,
  options?: {
    upsert?: boolean;
    cacheControl?: string;
  }
): Promise<{ url: string; path: string }> => {
  const { error, data } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options?.upsert || false,
      cacheControl: options?.cacheControl || '3600',
    });

  if (error) {
    throw new Error(`Erreur upload: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
};

/**
 * Supprime un fichier d'un bucket
 */
export const deleteFile = async (bucket: BucketType, path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Erreur suppression: ${error.message}`);
  }
};

/**
 * Supprime plusieurs fichiers d'un bucket
 */
export const deleteFiles = async (bucket: BucketType, paths: string[]): Promise<void> => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (error) {
    throw new Error(`Erreur suppression: ${error.message}`);
  }
};

/**
 * Génère un nom de fichier unique
 */
export const generateFileName = (originalName: string, prefix?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  const prefixStr = prefix ? `${prefix}-` : '';
  
  return `${prefixStr}${timestamp}-${random}.${extension}`;
};

/**
 * Valide un fichier avant upload
 */
export const validateFile = (
  file: File,
  type: 'image' | 'video' | 'avatar'
): { valid: boolean; error?: string } => {
  // Vérifier la taille
  const maxSize = type === 'avatar' ? MAX_FILE_SIZE.AVATAR : 
                 type === 'image' ? MAX_FILE_SIZE.IMAGE : 
                 MAX_FILE_SIZE.VIDEO;

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    return {
      valid: false,
      error: `Le fichier est trop volumineux. Taille maximale: ${maxSizeMB}MB`,
    };
  }

  // Vérifier le type MIME
  const allowedTypes = type === 'avatar' ? SUPPORTED_IMAGE_TYPES :
                      type === 'image' ? SUPPORTED_IMAGE_TYPES :
                      SUPPORTED_VIDEO_TYPES;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non supporté. Types autorisés: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (
  files: File[],
  bucket: BucketType,
  folder: string,
  type: 'image' | 'video' | 'avatar' = 'image'
): Promise<{ url: string; path: string }[]> => {
  const uploadPromises = files.map(async (file) => {
    // Valider le fichier
    const validation = validateFile(file, type);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Générer le nom de fichier
    const fileName = generateFileName(file.name, folder);
    const filePath = `${folder}/${fileName}`;

    // Upload le fichier
    return await uploadFile(file, bucket, filePath);
  });

  return await Promise.all(uploadPromises);
};

/**
 * Nettoie les URLs pour extraire le chemin du fichier
 */
export const extractFilePathFromUrl = (url: string, bucket: BucketType): string => {
  const baseUrl = supabase.storage.from(bucket).getPublicUrl('').data.publicUrl;
  const bucketUrl = baseUrl.replace('/storage/v1/object/public/', '/storage/v1/object/public/');
  
  if (url.startsWith(bucketUrl)) {
    return url.replace(bucketUrl, '');
  }
  
  // Fallback: extraire le nom du fichier de l'URL
  return url.split('/').pop() || '';
};
