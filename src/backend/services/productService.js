import { supabase, STORAGE_BUCKETS } from '../config/supabase';

export const productService = {
  // Récupérer tous les produits
  getAllProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farms (
            id,
            name,
            location,
            verified
          ),
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

  // Récupérer un produit par ID
  getProductById: async (productId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farms (
            id,
            name,
            location,
            verified,
            rating,
            review_count
          ),
          categories (
            id,
            name,
            emoji
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Créer un nouveau produit
  createProduct: async (productData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select(`
          *,
          farms (
            id,
            name,
            location
          ),
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

  // Mettre à jour un produit
  updateProduct: async (productId, updates) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select(`
          *,
          farms (
            id,
            name,
            location
          ),
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

  // Supprimer un produit
  deleteProduct: async (productId) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Activer/Désactiver un produit
  toggleProductStatus: async (productId, isActive) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les produits par ferme
  getProductsByFarm: async (farmId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            emoji
          )
        `)
        .eq('farm_id', farmId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les produits par catégorie
  getProductsByCategory: async (categoryId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farms (
            id,
            name,
            location,
            verified
          ),
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

  // Rechercher des produits
  searchProducts: async (query) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farms (
            id,
            name,
            location,
            verified
          ),
          categories (
            id,
            name,
            emoji
          )
        `)
        .or(`name.ilike.%${query}%, description.ilike.%${query}%, short_description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Filtrer les produits organiques
  getOrganicProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farms (
            id,
            name,
            location,
            verified
          ),
          categories (
            id,
            name,
            emoji
          )
        `)
        .eq('is_organic', true)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Filtrer les nouveaux produits
  getNewProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farms (
            id,
            name,
            location,
            verified
          ),
          categories (
            id,
            name,
            emoji
          )
        `)
        .eq('is_new', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Filtrer les produits populaires
  getPopularProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farms (
            id,
            name,
            location,
            verified
          ),
          categories (
            id,
            name,
            emoji
          )
        `)
        .eq('is_popular', true)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Upload d'images de produit
  uploadProductImages: async (files, productId) => {
    try {
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}/image_${i + 1}_${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKETS.PRODUCTS)
          .upload(fileName, file);

        if (error) throw error;

        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKETS.PRODUCTS)
          .getPublicUrl(fileName);

        uploadedImages.push(urlData.publicUrl);
      }

      return uploadedImages;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une image de produit
  deleteProductImage: async (imagePath) => {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.PRODUCTS)
        .remove([imagePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les statistiques des produits
  getProductStats: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, is_active, is_organic, is_new, is_popular, rating, review_count');

      if (error) throw error;

      const stats = {
        total: data.length,
        active: data.filter(product => product.is_active).length,
        inactive: data.filter(product => !product.is_active).length,
        organic: data.filter(product => product.is_organic).length,
        new: data.filter(product => product.is_new).length,
        popular: data.filter(product => product.is_popular).length,
        avgRating: data.reduce((acc, product) => acc + (product.rating || 0), 0) / data.length,
        totalReviews: data.reduce((acc, product) => acc + (product.review_count || 0), 0),
      };

      return stats;
    } catch (error) {
      throw error;
    }
  },
};
