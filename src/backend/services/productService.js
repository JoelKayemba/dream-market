import { supabase, STORAGE_BUCKETS } from '../config/supabase';
import {
  validateAndSanitizeTitle,
  validateAndSanitizeText,
  validateAndSanitizeNumber,
  sanitizeString,
  sanitizeArray,
} from '../../utils/inputSanitizer';

export const productService = {
  // Récupérer tous les produits avec pagination
  getProducts: async (options = {}) => {
    try {
      const {
        limit = 20,
        offset = 0,
        categoryId = null,
        farmId = null,
        search = null,
        isActive = null,
        includeInactive = false,
        isNew = null,
        isPopular = null,
        hasPromotion = null
      } = options;

      let query = supabase
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
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filtres optionnels
      // NOTE: Tous les filtres (category, farm, search, status) sont désactivés côté serveur
      // et gérés côté client dans le slice Redux pour éviter les erreurs Supabase
      // et pour être cohérent avec les autres services
      
      // Les filtres category, farm, search et status sont gérés côté client dans selectFilteredProducts
      // Filtres pour nouveaux produits, populaires et promotions
      if (isNew === true) {
        query = query.eq('is_new', true);
      }
      if (isPopular === true) {
        query = query.eq('is_popular', true);
      }
      if (hasPromotion === true) {
        // Produits en promotion : old_price n'est pas null et > 0
        query = query.not('old_price', 'is', null).gt('old_price', 0);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        hasMore: (offset + limit) < (count || 0),
        limit,
        offset
      };
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
  addProduct: async (productData) => {
    try {
      // Nettoyer les données du produit
      const cleanedData = { ...productData };

      // Valider et nettoyer le nom
      if (productData.name) {
        const nameResult = validateAndSanitizeTitle(productData.name, {
          required: true,
          maxLength: 255,
        });
        if (!nameResult.valid) {
          throw new Error(`Nom du produit: ${nameResult.error}`);
        }
        cleanedData.name = nameResult.cleaned;
      }

      // Valider et nettoyer la description
      if (productData.description) {
        const descResult = validateAndSanitizeText(productData.description, {
          maxLength: 5000,
          required: false,
        });
        if (!descResult.valid) {
          throw new Error(`Description: ${descResult.error}`);
        }
        cleanedData.description = descResult.cleaned;
      }

      // Valider et nettoyer le prix
      if (productData.price !== undefined && productData.price !== null) {
        const priceResult = validateAndSanitizeNumber(productData.price, {
          min: 0,
          allowDecimals: true,
          allowNegative: false,
        });
        if (!priceResult.valid) {
          throw new Error(`Prix: ${priceResult.error}`);
        }
        cleanedData.price = priceResult.cleaned;
      }

      // Valider la devise
      const allowedCurrencies = ['CDF', 'USD'];
      if (productData.currency && !allowedCurrencies.includes(productData.currency)) {
        cleanedData.currency = 'CDF';
      }

      // Nettoyer les images (tableau d'URLs)
      if (productData.images && Array.isArray(productData.images)) {
        cleanedData.images = sanitizeArray(productData.images, { maxLength: 500 });
      }

      // Nettoyer l'unité
      if (productData.unit) {
        cleanedData.unit = sanitizeString(productData.unit, { maxLength: 50 });
      }

      // Nettoyer les tags
      if (productData.tags && Array.isArray(productData.tags)) {
        cleanedData.tags = sanitizeArray(productData.tags, { maxLength: 50 });
      }

      const { data, error } = await supabase
        .from('products')
        .insert([cleanedData])
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

      if (error) {
        console.error('❌ [productService.addProduct] Erreur Supabase:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('❌ [productService.addProduct] Exception:', error);
      throw error;
    }
  },

  // Mettre à jour un produit
  updateProduct: async (productId, updates) => {
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
          throw new Error(`Nom du produit: ${nameResult.error}`);
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
        const priceResult = validateAndSanitizeNumber(updates.price, {
          min: 0,
          allowDecimals: true,
          allowNegative: false,
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

      if (updates.unit !== undefined) {
        cleanedUpdates.unit = sanitizeString(updates.unit, { maxLength: 50 });
      }

      if (updates.tags !== undefined && Array.isArray(updates.tags)) {
        cleanedUpdates.tags = sanitizeArray(updates.tags, { maxLength: 50 });
      }

      // Copier les autres champs non textuels
      Object.keys(updates).forEach(key => {
        if (!['name', 'description', 'price', 'currency', 'images', 'unit', 'tags'].includes(key)) {
          cleanedUpdates[key] = updates[key];
        }
      });

      const { data, error } = await supabase
        .from('products')
        .update(cleanedUpdates)
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
      // Si isActive n'est pas fourni, on récupère le statut actuel et on le bascule
      let newStatus = isActive;
      
      if (newStatus === undefined) {
        const { data: currentProduct, error: fetchError } = await supabase
          .from('products')
          .select('is_active')
          .eq('id', productId)
          .single();

        if (fetchError) throw fetchError;
        newStatus = !currentProduct.is_active;
      }
      
      const { data, error } = await supabase
        .from('products')
        .update({ 
          is_active: newStatus,
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
