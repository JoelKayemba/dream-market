import { supabase, STORAGE_BUCKETS } from '../config/supabase';
import {
  validateAndSanitizeTitle,
  validateAndSanitizeText,
  validateAndSanitizePhone,
  validateAndSanitizeEmail,
  validateAndSanitizeUrl,
  sanitizeString,
  sanitizeArray,
} from '../../utils/inputSanitizer';

export const farmService = {
  // Récupérer toutes les fermes
  getFarms: async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une ferme par ID
  getFarmById: async (farmId) => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('id', farmId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle ferme
  addFarm: async (farmData) => {
    try {
      // Nettoyer les données de la ferme
      const cleanedData = { ...farmData };

      // Valider et nettoyer le nom
      if (farmData.name) {
        const nameResult = validateAndSanitizeTitle(farmData.name, {
          required: true,
          maxLength: 255,
        });
        if (!nameResult.valid) {
          throw new Error(`Nom de la ferme: ${nameResult.error}`);
        }
        cleanedData.name = nameResult.cleaned;
      }

      // Valider et nettoyer la description
      if (farmData.description) {
        const descResult = validateAndSanitizeText(farmData.description, {
          maxLength: 5000,
          required: false,
        });
        if (!descResult.valid) {
          throw new Error(`Description: ${descResult.error}`);
        }
        cleanedData.description = descResult.cleaned;
      }

      // Valider et nettoyer la localisation
      if (farmData.location) {
        const locationResult = validateAndSanitizeText(farmData.location, {
          maxLength: 255,
          required: false,
        });
        if (!locationResult.valid) {
          throw new Error(`Localisation: ${locationResult.error}`);
        }
        cleanedData.location = locationResult.cleaned;
      }

      // Valider et nettoyer le téléphone
      if (farmData.phone) {
        const phoneResult = validateAndSanitizePhone(farmData.phone);
        if (!phoneResult.valid) {
          throw new Error(`Téléphone: ${phoneResult.error}`);
        }
        cleanedData.phone = phoneResult.cleaned;
      }

      // Valider et nettoyer l'email
      if (farmData.email) {
        const emailResult = validateAndSanitizeEmail(farmData.email);
        if (!emailResult.valid) {
          throw new Error(`Email: ${emailResult.error}`);
        }
        cleanedData.email = emailResult.cleaned;
      }

      // Valider et nettoyer le site web
      if (farmData.website) {
        const urlResult = validateAndSanitizeUrl(farmData.website);
        if (!urlResult.valid) {
          throw new Error(`Site web: ${urlResult.error}`);
        }
        cleanedData.website = urlResult.cleaned;
      }

      // Nettoyer les spécialités
      if (farmData.specialties && Array.isArray(farmData.specialties)) {
        cleanedData.specialties = sanitizeArray(farmData.specialties, { maxLength: 100 });
      }

      // Nettoyer les images
      if (farmData.images && Array.isArray(farmData.images)) {
        cleanedData.images = sanitizeArray(farmData.images, { maxLength: 500 });
      }

      const { data, error } = await supabase
        .from('farms')
        .insert([cleanedData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une ferme
  updateFarm: async (farmId, updates) => {
    try {
      const cleanedUpdates = {
        updated_at: new Date().toISOString(),
      };

      // Nettoyer les champs si présents
      if (updates.name !== undefined) {
        const nameResult = validateAndSanitizeTitle(updates.name, {
          required: false,
          maxLength: 255,
        });
        if (!nameResult.valid) {
          throw new Error(`Nom de la ferme: ${nameResult.error}`);
        }
        cleanedUpdates.name = nameResult.cleaned;
      }

      if (updates.description !== undefined) {
        const descResult = validateAndSanitizeText(updates.description, {
          maxLength: 5000,
          required: false,
        });
        if (!descResult.valid) {
          throw new Error(`Description: ${descResult.error}`);
        }
        cleanedUpdates.description = descResult.cleaned;
      }

      if (updates.location !== undefined) {
        const locationResult = validateAndSanitizeText(updates.location, {
          maxLength: 255,
          required: false,
        });
        if (!locationResult.valid) {
          throw new Error(`Localisation: ${locationResult.error}`);
        }
        cleanedUpdates.location = locationResult.cleaned;
      }

      if (updates.phone !== undefined) {
        if (updates.phone) {
          const phoneResult = validateAndSanitizePhone(updates.phone);
          if (!phoneResult.valid) {
            throw new Error(`Téléphone: ${phoneResult.error}`);
          }
          cleanedUpdates.phone = phoneResult.cleaned;
        } else {
          cleanedUpdates.phone = null;
        }
      }

      if (updates.email !== undefined) {
        if (updates.email) {
          const emailResult = validateAndSanitizeEmail(updates.email);
          if (!emailResult.valid) {
            throw new Error(`Email: ${emailResult.error}`);
          }
          cleanedUpdates.email = emailResult.cleaned;
        } else {
          cleanedUpdates.email = null;
        }
      }

      if (updates.website !== undefined) {
        if (updates.website) {
          const urlResult = validateAndSanitizeUrl(updates.website);
          if (!urlResult.valid) {
            throw new Error(`Site web: ${urlResult.error}`);
          }
          cleanedUpdates.website = urlResult.cleaned;
        } else {
          cleanedUpdates.website = null;
        }
      }

      if (updates.specialties !== undefined && Array.isArray(updates.specialties)) {
        cleanedUpdates.specialties = sanitizeArray(updates.specialties, { maxLength: 100 });
      }

      if (updates.images !== undefined && Array.isArray(updates.images)) {
        cleanedUpdates.images = sanitizeArray(updates.images, { maxLength: 500 });
      }

      // Copier les autres champs non textuels
      Object.keys(updates).forEach(key => {
        if (!['name', 'description', 'location', 'phone', 'email', 'website', 'specialties', 'images'].includes(key)) {
          cleanedUpdates[key] = updates[key];
        }
      });

      const { data, error } = await supabase
        .from('farms')
        .update(cleanedUpdates)
        .eq('id', farmId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une ferme
  deleteFarm: async (farmId) => {
    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farmId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Vérifier une ferme (admin seulement)
  verifyFarm: async (farmId, verified = true) => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .update({ verified })
        .eq('id', farmId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Rechercher des fermes
  searchFarms: async (query) => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .or(`name.ilike.%${query}%, location.ilike.%${query}%, specialty.ilike.%${query}%, description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Filtrer les fermes par région
  getFarmsByRegion: async (region) => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('region', region)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Filtrer les fermes vérifiées
  getVerifiedFarms: async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('verified', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Upload d'image de ferme
  uploadFarmImage: async (file, farmId, imageType = 'main') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${farmId}/${imageType}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.FARMS)
        .upload(fileName, file);

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.FARMS)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une image de ferme
  deleteFarmImage: async (imagePath) => {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.FARMS)
        .remove([imagePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les statistiques des fermes
  getFarmStats: async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('id, verified, rating, review_count');

      if (error) throw error;

      const stats = {
        total: data.length,
        verified: data.filter(farm => farm.verified).length,
        pending: data.filter(farm => !farm.verified).length,
        avgRating: data.reduce((acc, farm) => acc + (farm.rating || 0), 0) / data.length,
        totalReviews: data.reduce((acc, farm) => acc + (farm.review_count || 0), 0),
      };

      return stats;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les fermes populaires (rating >= 4)
  getPopularFarms: async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .gte('rating', 4)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les nouvelles fermes (créées dans les 30 derniers jours)
  getNewFarms: async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les catégories de fermes
  getFarmCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'farm')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },
};
