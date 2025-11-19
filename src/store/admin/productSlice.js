import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService, categoryService } from '../../backend';

// État initial pour les produits admin
const initialState = {
  products: [],
  loading: false,
  loadingMore: false,
  error: null,
  lastUpdated: null,
  // Filtres et recherche
  filters: {
    category: null,
    farm: null,
    status: 'all', // all, active, inactive, out_of_stock
    search: '',
    sortBy: 'name', // name, price, date, popularity
    sortOrder: 'asc' // asc, desc
  },
  // Pagination
  pagination: {
    page: 0,
    limit: 20,
    total: 0,
    hasMore: true
  },
  // État de l'édition
  editingProduct: null,
  isEditing: false,
  // État de l'upload d'images
  uploading: false,
  // Catégories disponibles
  categories: []
};

// Actions asynchrones pour les produits
export const fetchProducts = createAsyncThunk(
  'adminProducts/fetchProducts',
  async (options = {}, { rejectWithValue, getState }) => {
    try {
      const { page = 0, limit = 20, refresh = false } = options;
      const state = getState();
      const filters = state.admin?.products?.filters || {};
      
      // Tous les filtres (category, farm, search, status) sont gérés côté client
      // On récupère tous les produits sans filtres côté serveur
      const result = await productService.getProducts({
        limit,
        offset: page * limit,
        categoryId: null, // Filtre désactivé côté serveur, géré côté client
        farmId: null, // Filtre désactivé côté serveur, géré côté client
        search: null, // Recherche désactivée côté serveur, gérée côté client
        isActive: null, // Filtre désactivé côté serveur, géré côté client
        includeInactive: true // Inclure tous les produits pour filtrage côté client
      });

      return {
        items: result.data,
        total: result.total,
        hasMore: result.hasMore,
        page,
        refresh
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour récupérer les catégories
export const fetchCategories = createAsyncThunk(
  'adminProducts/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour ajouter un produit
export const addProduct = createAsyncThunk(
  'adminProducts/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      console.log('🔵 [addProduct] Données reçues:', productData);
      
      // Préparer les données du produit
      const productToCreate = {
        name: productData.name,
        description: productData.description || null,
        short_description: productData.short_description || null,
        price: productData.price,
        old_price: productData.old_price || null,
        currency: productData.currency || 'CDF',
        unit: productData.unit || 'kg',
        category_id: productData.category_id,
        farm_id: productData.farm_id || null,
        stock: productData.stock || 0,
        is_organic: productData.is_organic || false,
        is_new: productData.is_new || false,
        is_popular: productData.is_popular || false,
        discount: productData.discount || 0,
        tags: productData.tags || [],
        images: productData.images || [],
        is_active: true,
        rating: 0,
        review_count: 0,
      };

      console.log('🔵 [addProduct] Données à envoyer à Supabase:', productToCreate);

      // Créer le produit avec les images
      const newProduct = await productService.addProduct(productToCreate);
      
      console.log('✅ [addProduct] Produit créé avec succès:', newProduct);
      return newProduct;
    } catch (error) {
      console.error('❌ [addProduct] Erreur:', error);
      return rejectWithValue(error.message || 'Erreur lors de l\'ajout du produit');
    }
  }
);

// Action pour mettre à jour un produit
export const updateProduct = createAsyncThunk(
  'adminProducts/updateProduct',
  async ({ id, productData }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const existingProduct = state.admin.products.products.find(product => product.id === id);
      
      if (!existingProduct) {
        throw new Error('Produit non trouvé');
      }

      // Préparer les données de mise à jour
      const updatedProductData = {
        ...productData,
        updated_at: new Date().toISOString()
      };

      // Si il y a de nouvelles images, les assigner directement
      if (productData.images && productData.images.length > 0) {
        updatedProductData.images = productData.images;
      }

      // Mettre à jour le produit
      const updatedProduct = await productService.updateProduct(id, updatedProductData);
      return updatedProduct;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour supprimer un produit
export const deleteProduct = createAsyncThunk(
  'adminProducts/deleteProduct',
  async (productId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const existingProduct = state.admin.products.products.find(product => product.id === productId);
      
      // Supprimer les images associées si elles existent
      if (existingProduct && existingProduct.images && existingProduct.images.length > 0) {
        for (const imageUrl of existingProduct.images) {
          try {
            await storageService.deleteImage(imageUrl);
          } catch (imageError) {
            // Ignorer l'erreur de suppression d'image silencieusement
          }
        }
      }
      
      // Supprimer le produit via le service
      await productService.deleteProduct(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour basculer le statut d'un produit
export const toggleProductStatus = createAsyncThunk(
  'adminProducts/toggleProductStatus',
  async ({ productId, isActive }, { rejectWithValue, getState }) => {
    try {
      // Si isActive n'est pas fourni, on le récupère depuis le state
      if (isActive === undefined) {
        const state = getState();
        const product = state.admin.products.products.find(p => p.id === productId);
        isActive = !product?.is_active;
      }
      
      const updatedProduct = await productService.toggleProductStatus(productId, isActive);
      return updatedProduct;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice Redux
const productSlice = createSlice({
  name: 'adminProducts',
  initialState,
  reducers: {
    // Actions synchrones
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
    },
    setFarmFilter: (state, action) => {
      state.filters.farm = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setSorting: (state, action) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setEditingProduct: (state, action) => {
      state.editingProduct = action.payload;
      state.isEditing = !!action.payload;
    },
    clearEditingProduct: (state) => {
      state.editingProduct = null;
      state.isEditing = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearProducts: (state) => {
      state.products = [];
      state.lastUpdated = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state, action) => {
        const { refresh = false } = action.meta.arg || {};
        if (refresh || state.products.length === 0) {
          state.loading = true;
          state.loadingMore = false;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { items, total, hasMore, page, refresh } = action.payload;
        state.loading = false;
        state.loadingMore = false;
        
        if (refresh || page === 0) {
          state.products = items;
        } else {
          state.products = [...state.products, ...items];
        }
        
        state.pagination = {
          page,
          limit: 20,
          total,
          hasMore
        };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      // Add Product
      .addCase(addProduct.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.uploading = false;
        state.products = [...state.products, action.payload];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.uploading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products = [
            ...state.products.slice(0, index),
            action.payload,
            ...state.products.slice(index + 1)
          ];
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p.id !== action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle Product Status
      .addCase(toggleProductStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products = [
            ...state.products.slice(0, index),
            action.payload,
            ...state.products.slice(index + 1)
          ];
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(toggleProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions
export const {
  setFilters,
  setSearch,
  setCategoryFilter,
  setFarmFilter,
  setStatusFilter,
  setSorting,
  setPagination,
  setEditingProduct,
  clearEditingProduct,
  clearError,
  clearProducts
} = productSlice.actions;

// Selectors
export const selectAdminProducts = (state) => state.admin.products.products;
export const selectAdminProductsLoading = (state) => state.admin.products.loading;
export const selectAdminProductsLoadingMore = (state) => state.admin.products.loadingMore || false;
export const selectAdminProductsError = (state) => state.admin.products.error;
export const selectAdminProductsFilters = (state) => state.admin.products.filters;
export const selectAdminProductsPagination = (state) => state.admin.products.pagination || { page: 0, limit: 20, total: 0, hasMore: true };
export const selectEditingProduct = (state) => state.admin.products.editingProduct;
export const selectIsEditingProduct = (state) => state.admin.products.isEditing;
export const selectAdminProductsUploading = (state) => state.admin.products.uploading;
export const selectAdminCategories = (state) => state.admin.products.categories;

// Selectors dérivés
export const selectFilteredProducts = (state) => {
  const { products } = state.admin.products;
  const { filters } = state.admin.products;
  
  let filtered = [...products];
  
  // Filtre par recherche
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(product => 
      (product.name || '').toLowerCase().includes(searchLower) ||
      (product.description || '').toLowerCase().includes(searchLower) ||
      (product.short_description || '').toLowerCase().includes(searchLower) ||
      (product.farms?.name || '').toLowerCase().includes(searchLower)
    );
  }
  
  // Filtre par catégorie
  if (filters.category) {
    filtered = filtered.filter(product => product.category_id === filters.category);
  }
  
  // Filtre par ferme
  if (filters.farm) {
    filtered = filtered.filter(product => product.farm_id === filters.farm);
  }
  
  // Filtre par statut
  if (filters.status === 'active') {
    filtered = filtered.filter(product => product.is_active);
  } else if (filters.status === 'inactive') {
    filtered = filtered.filter(product => !product.is_active);
  } else if (filters.status === 'out_of_stock') {
    // Produits en rupture de stock (stock = 0 ou stock est null mais devrait être défini)
    filtered = filtered.filter(product => {
      const stock = product.stock;
      return stock !== null && stock !== undefined && stock === 0;
    });
  }
  
  // Tri
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (filters.sortBy) {
      case 'name':
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
        break;
      case 'price':
        aValue = parseFloat(a.price) || 0;
        bValue = parseFloat(b.price) || 0;
        break;
      case 'date':
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
        break;
      case 'popularity':
        aValue = a.review_count || 0;
        bValue = b.review_count || 0;
        break;
      default:
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
    }
    
    if (filters.sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });
  
  return filtered;
};

export const selectProductById = (state, productId) => 
  state.admin.products.products.find(product => product.id === productId);

export const selectProductStats = (state) => {
  const products = state.admin.products.products;
  
  return {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
    organic: products.filter(p => p.is_organic).length,
    new: products.filter(p => p.is_new).length,
    popular: products.filter(p => p.is_popular).length
  };
};

export default productSlice.reducer;