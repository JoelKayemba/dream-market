import { supabase, STORAGE_BUCKETS } from '../config/supabase';

export const storageService = {
  // Upload un fichier générique
  uploadFile: async (bucket, file, path, options = {}) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, options);

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Convertir une URI React Native en Blob/ArrayBuffer pour upload
  uriToBlob: async (uri) => {
    try {
      
      // Pour React Native, on utilise FormData ou on lit directement le fichier
      // Créer un objet File-like compatible avec Supabase
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return blob;
    } catch (error) {
      console.error('❌ [uriToBlob] Erreur:', error);
      // Si blob() ne marche pas (React Native), utiliser arrayBuffer
      try {
        const response = await fetch(uri);
        const buffer = await response.arrayBuffer();
        return buffer;
      } catch (bufferError) {
        console.error('❌ [uriToBlob] Erreur arrayBuffer:', bufferError);
        throw new Error('Impossible de convertir l\'image: ' + bufferError.message);
      }
    }
  },

  // Upload une image générique (pour React Native)
  uploadImage: async (imageUri, bucketType = 'farms', folderPrefix = '') => {
    try {
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${randomId}_${timestamp}.jpg`;
      const fullPath = folderPrefix ? `${folderPrefix}/${fileName}` : fileName;

      
      // Déterminer le bucket
      let bucket;
      switch (bucketType) {
        case 'products':
          bucket = STORAGE_BUCKETS.PRODUCTS;
          break;
        case 'services':
          bucket = STORAGE_BUCKETS.SERVICES;
          break;
        case 'avatars':
          bucket = STORAGE_BUCKETS.AVATARS;
          break;
        case 'farms':
        default:
          bucket = STORAGE_BUCKETS.FARMS;
          break;
      }

      
      // Pour React Native, utiliser FormData ou ArrayBuffer
      let fileData;
      
      // Méthode 1 : Essayer avec fetch + arrayBuffer (plus compatible React Native)
      try {
        const response = await fetch(imageUri);
        
        if (!response.ok) {
          throw new Error(`Fetch failed: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        fileData = arrayBuffer;
      } catch (fetchError) {
        console.error('❌ [uploadImage] Erreur fetch:', fetchError);
        throw new Error('Impossible de lire l\'image: ' + fetchError.message);
      }

      // Upload vers Supabase
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fullPath, fileData, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('❌ [uploadImage] Erreur Supabase:', error);
        throw new Error(`Erreur Supabase: ${error.message}`);
      }

      
      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fullPath);

      return {
        path: fullPath,
        url: urlData.publicUrl,
        fileName: fileName
      };
    } catch (error) {
      console.error('❌ [uploadImage] Erreur finale:', error);
      throw new Error(`Upload échoué: ${error.message}`);
    }
  },

  // Upload une image de ferme
  uploadFarmImage: async (file, farmId, imageType = 'main') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${farmId}/${imageType}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.FARMS)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.FARMS)
        .getPublicUrl(fileName);

      return {
        path: fileName,
        url: urlData.publicUrl
      };
    } catch (error) {
      throw error;
    }
  },

  // Upload des images de produit
  uploadProductImages: async (files, productId) => {
    try {
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}/image_${i + 1}_${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKETS.PRODUCTS)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKETS.PRODUCTS)
          .getPublicUrl(fileName);

        uploadedImages.push({
          path: fileName,
          url: urlData.publicUrl
        });
      }

      return uploadedImages;
    } catch (error) {
      throw error;
    }
  },

  // Upload une image de service
  uploadServiceImage: async (file, serviceId) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${serviceId}/service_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.SERVICES)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.SERVICES)
        .getPublicUrl(fileName);

      return {
        path: fileName,
        url: urlData.publicUrl
      };
    } catch (error) {
      throw error;
    }
  },

  // Upload un avatar utilisateur
  uploadUserAvatar: async (file, userId) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.AVATARS)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.AVATARS)
        .getPublicUrl(fileName);

      return {
        path: fileName,
        url: urlData.publicUrl
      };
    } catch (error) {
      throw error;
    }
  },

  // Supprimer un fichier
  deleteFile: async (bucket, path) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une image générique
  deleteImage: async (imageUrl) => {
    try {
      // Extraire le chemin du fichier depuis l'URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const bucketName = urlParts[urlParts.length - 2];
      
      // Déterminer le bucket selon le nom
      let bucket;
      if (bucketName.includes('farm')) {
        bucket = STORAGE_BUCKETS.FARMS;
      } else if (bucketName.includes('product')) {
        bucket = STORAGE_BUCKETS.PRODUCTS;
      } else if (bucketName.includes('service')) {
        bucket = STORAGE_BUCKETS.SERVICES;
      } else if (bucketName.includes('avatar')) {
        bucket = STORAGE_BUCKETS.AVATARS;
      } else {
        // Essayer de deviner selon le bucket Supabase
        bucket = bucketName;
      }

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer plusieurs fichiers
  deleteFiles: async (bucket, paths) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une image de ferme
  deleteFarmImage: async (imagePath) => {
    try {
      return await storageService.deleteFile(STORAGE_BUCKETS.FARMS, imagePath);
    } catch (error) {
      throw error;
    }
  },

  // Supprimer des images de produit
  deleteProductImages: async (imagePaths) => {
    try {
      return await storageService.deleteFiles(STORAGE_BUCKETS.PRODUCTS, imagePaths);
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une image de service
  deleteServiceImage: async (imagePath) => {
    try {
      return await storageService.deleteFile(STORAGE_BUCKETS.SERVICES, imagePath);
    } catch (error) {
      throw error;
    }
  },

  // Supprimer un avatar utilisateur
  deleteUserAvatar: async (avatarPath) => {
    try {
      return await storageService.deleteFile(STORAGE_BUCKETS.AVATARS, avatarPath);
    } catch (error) {
      throw error;
    }
  },

  // Récupérer l'URL publique d'un fichier
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  // Lister les fichiers d'un dossier
  listFiles: async (bucket, folder = '', limit = 100) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit,
          offset: 0,
        });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les informations d'un fichier
  getFileInfo: async (bucket, path) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });

      if (error) throw error;
      return data[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Télécharger un fichier
  downloadFile: async (bucket, path) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },
};
