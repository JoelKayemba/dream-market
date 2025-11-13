import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService, categoryService } from '../../backend';

// État initial pour les produits côté client
const initialState = {
  products: [],
  categories: [],
  popularProducts: [],
  newProducts: [],
  promotionProducts: [],
  loading: false,
  loadingMore: false, // Chargement de plus d'éléments
  initialLoading: false, // Loading pour le premier chargement
  error: null,
  lastUpdated: null,
  hasInitialized: false,
  pagination: {
    page: 0,
    limit: 20,
    total: 0,
    hasMore: true
  }
};

// Actions asynchrones
export const fetchProducts = createAsyncThunk(
  'clientProducts/fetchProducts',
  async (options = {}, { rejectWithValue, getState }) => {
    try {
      const { 
        page = 0, 
        limit = 20, 
        refresh = false, 
        categoryId = null, 
        farmId = null, 
        search = null,
        isNew = null,
        isPopular = null,
        hasPromotion = null
      } = options;
      const offset = page * limit;

      const result = await productService.getProducts({
        limit,
        offset,
        categoryId,
        farmId,
        search,
        isActive: true,
        includeInactive: false,
        isNew,
        isPopular,
        hasPromotion
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

export const fetchCategories = createAsyncThunk(
  'clientProducts/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await categoryService.getCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPopularProducts = createAsyncThunk(
  'clientProducts/fetchPopularProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Charger seulement les premiers produits populaires (limite de 10)
      const result = await productService.getProducts({
        limit: 10,
        offset: 0,
        isActive: true
      });
      const popularProducts = result.data.filter(product => 
        product.is_popular && product.is_active
      );
      return popularProducts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNewProducts = createAsyncThunk(
  'clientProducts/fetchNewProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Charger seulement les premiers nouveaux produits (limite de 10)
      const result = await productService.getProducts({
        limit: 10,
        offset: 0,
        isActive: true
      });
      const newProducts = result.data.filter(product => 
        product.is_new && product.is_active
      );
      return newProducts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPromotionProducts = createAsyncThunk(
  'clientProducts/fetchPromotionProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Charger seulement les premiers produits en promotion (limite de 10)
      const result = await productService.getProducts({
        limit: 10,
        offset: 0,
        isActive: true
      });
      const promotionProducts = result.data.filter(product => 
        product.old_price && product.old_price > 0 && product.is_active
      );
      return promotionProducts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice Redux
const clientProductsSlice = createSlice({
  name: 'clientProducts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProducts: (state) => {
      state.products = [];
      state.popularProducts = [];
      state.newProducts = [];
      state.promotionProducts = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        const { refresh = false } = action.meta.arg || {};
        if (refresh || !state.hasInitialized) {
          state.initialLoading = true;
          state.loadingMore = false;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const { items, total, hasMore, page, refresh } = action.payload;
        state.initialLoading = false;
        state.loadingMore = false;
        
        if (refresh || page === 0) {
          // Nouveau chargement ou refresh
          state.products = items;
        } else {
          // Chargement de plus d'éléments
          state.products = [...state.products, ...items];
        }
        
        state.pagination = {
          page,
          limit: 20,
          total,
          hasMore
        };
        state.hasInitialized = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.initialLoading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })
      
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        // Pas de loading pour les catégories (chargement silencieux)
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.filter(cat => cat.type === 'product');
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch Popular Products
      .addCase(fetchPopularProducts.pending, (state) => {
        // Pas de loading pour les produits populaires (chargement silencieux)
        state.error = null;
      })
      .addCase(fetchPopularProducts.fulfilled, (state, action) => {
        state.popularProducts = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPopularProducts.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch New Products
      .addCase(fetchNewProducts.pending, (state) => {
        // Pas de loading pour les nouveaux produits (chargement silencieux)
        state.error = null;
      })
      .addCase(fetchNewProducts.fulfilled, (state, action) => {
        state.newProducts = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchNewProducts.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch Promotion Products
      .addCase(fetchPromotionProducts.pending, (state) => {
        // Pas de loading pour les produits en promotion (chargement silencieux)
        state.error = null;
      })
      .addCase(fetchPromotionProducts.fulfilled, (state, action) => {
        state.promotionProducts = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPromotionProducts.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearProducts } = clientProductsSlice.actions;

// Selectors avec valeurs par défaut
export const selectClientProducts = (state) => state.client?.products?.products || [];
export const selectClientCategories = (state) => state.client?.products?.categories || [];
export const selectPopularProducts = (state) => state.client?.products?.popularProducts || [];
export const selectNewProducts = (state) => state.client?.products?.newProducts || [];
export const selectPromotionProducts = (state) => state.client?.products?.promotionProducts || [];
export const selectClientProductsLoading = (state) => state.client?.products?.initialLoading || false;
export const selectClientProductsLoadingMore = (state) => state.client?.products?.loadingMore || false;
export const selectClientProductsError = (state) => state.client?.products?.error || null;
export const selectClientProductsLastUpdated = (state) => state.client?.products?.lastUpdated || null;
export const selectClientProductsPagination = (state) => state.client?.products?.pagination || { page: 0, limit: 20, total: 0, hasMore: true };

export default clientProductsSlice.reducer;
