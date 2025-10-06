import { supabase, STORAGE_BUCKETS } from '../config/supabase';

export const serviceService = {
  // Récupérer tous les services
  getAllServices: async () => {
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
  createService: async (serviceData) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
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
      const { data, error } = await supabase
        .from('services')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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
