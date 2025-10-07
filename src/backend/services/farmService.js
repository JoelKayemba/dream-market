import { supabase, STORAGE_BUCKETS } from '../config/supabase';

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
      const { data, error } = await supabase
        .from('farms')
        .insert([farmData])
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
      const { data, error } = await supabase
        .from('farms')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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
