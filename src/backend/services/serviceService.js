import { supabase, STORAGE_BUCKETS } from '../config/supabase';
import {
  validateAndSanitizeTitle,
  validateAndSanitizeText,
  sanitizeString,
  sanitizeArray,
} from '../../utils/inputSanitizer';

export const serviceService = {
  // Récupérer tous les services
  getServices: async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          categories (
            id,
            name,
            emoji
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer un service par ID
  getServiceById: async (serviceId) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          categories (
            id,
            name,
            emoji
          )
        `)
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Créer un nouveau service
  addService: async (serviceData) => {
    try {
      // Nettoyer les données du service
      const cleanedData = { ...serviceData };

      // Valider et nettoyer le nom
      if (serviceData.name) {
        const nameResult = validateAndSanitizeTitle(serviceData.name, {
          required: true,
          maxLength: 255,
        });
        if (!nameResult.valid) {
          throw new Error(`Nom du service: ${nameResult.error}`);
        }
        cleanedData.name = nameResult.cleaned;
      }

      // Valider et nettoyer la description
      if (serviceData.description) {
        const descResult = validateAndSanitizeText(serviceData.description, {
          maxLength: 5000,
          required: false,
        });
        if (!descResult.valid) {
          throw new Error(`Description: ${descResult.error}`);
        }
        cleanedData.description = descResult.cleaned;
      }

      // Valider et nettoyer le prix (champ texte)
      if (serviceData.price !== undefined && serviceData.price !== null) {
        const priceResult = validateAndSanitizeText(serviceData.price, {
          maxLength: 100,
          required: false,
        });
        if (!priceResult.valid) {
          throw new Error(`Prix: ${priceResult.error}`);
        }
        cleanedData.price = priceResult.cleaned;
      }

      // Valider la devise
      const allowedCurrencies = ['CDF', 'USD'];
      if (serviceData.currency && !allowedCurrencies.includes(serviceData.currency)) {
        cleanedData.currency = 'CDF';
      }

      // Nettoyer les images
      if (serviceData.images && Array.isArray(serviceData.images)) {
        cleanedData.images = sanitizeArray(serviceData.images, { maxLength: 500 });
      }

      // Nettoyer les caractéristiques
      if (serviceData.features && Array.isArray(serviceData.features)) {
        cleanedData.features = sanitizeArray(serviceData.features, { maxLength: 200 });
      }

      const { data, error } = await supabase
        .from('services')
        .insert([cleanedData])
        .select(`
          *,
          categories (
            id,
            name,
            emoji
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour un service
  updateService: async (serviceId, updates) => {
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
          throw new Error(`Nom du service: ${nameResult.error}`);
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

      if (updates.price !== undefined && updates.price !== null) {
        const priceResult = validateAndSanitizeText(updates.price, {
          maxLength: 100,
          required: false,
        });
        if (!priceResult.valid) {
          throw new Error(`Prix: ${priceResult.error}`);
        }
        cleanedUpdates.price = priceResult.cleaned;
      }

      if (updates.currency !== undefined) {
        const allowedCurrencies = ['CDF', 'USD'];
        cleanedUpdates.currency = allowedCurrencies.includes(updates.currency)
          ? updates.currency
          : 'CDF';
      }

      if (updates.images !== undefined && Array.isArray(updates.images)) {
        cleanedUpdates.images = sanitizeArray(updates.images, { maxLength: 500 });
      }

      if (updates.features !== undefined && Array.isArray(updates.features)) {
        cleanedUpdates.features = sanitizeArray(updates.features, { maxLength: 200 });
      }

      // Copier les autres champs non textuels
      Object.keys(updates).forEach(key => {
        if (!['name', 'description', 'price', 'currency', 'images', 'features'].includes(key)) {
          cleanedUpdates[key] = updates[key];
        }
      });

      const { data, error } = await supabase
        .from('services')
        .update(cleanedUpdates)
        .eq('id', serviceId)
        .select(`
          *,
          categories (
            id,
            name,
            emoji
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer un service
  deleteService: async (serviceId) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Activer/Désactiver un service
  toggleServiceStatus: async (serviceId, isActive) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les services par catégorie
  getServicesByCategory: async (categoryId) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          categories (
            id,
            name,
            emoji
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Rechercher des services
  searchServices: async (query) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          categories (
            id,
            name,
            emoji
          )
        `)
        .or(`name.ilike.%${query}%, description.ilike.%${query}%, short_description.ilike.%${query}%, category.ilike.%${query}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Filtrer les services actifs
  getActiveServices: async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          categories (
            id,
            name,
            emoji
          )
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Filtrer les services par zone de couverture
  getServicesByCoverage: async (coverage) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          categories (
            id,
            name,
            emoji
          )
        `)
        .ilike('coverage', `%${coverage}%`)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Upload d'image de service
  uploadServiceImage: async (file, serviceId) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${serviceId}/service_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.SERVICES)
        .upload(fileName, file);

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.SERVICES)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une image de service
  deleteServiceImage: async (imagePath) => {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.SERVICES)
        .remove([imagePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les statistiques des services
  getServiceStats: async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, is_active, rating, review_count, category');

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(service => service.is_active).length,
        inactive: data.filter(service => !service.is_active).length,
        avgRating: data.reduce((acc, service) => acc + (service.rating || 0), 0) / data.length,
        totalReviews: data.reduce((acc, service) => acc + (service.review_count || 0), 0),
        categories: [...new Set(data.map(service => service.category))].length,
      };

      return stats;
    } catch (error) {
      throw error;
    }
  },
};
