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
  error: null,
  lastUpdated: null,
};

// Actions asynchrones
export const fetchProducts = createAsyncThunk(
  'clientProducts/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const products = await productService.getProducts();
      return products;
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
      const products = await productService.getProducts();
      const popularProducts = products.filter(product => 
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
      const products = await productService.getProducts();
      const newProducts = products.filter(product => 
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
      const products = await productService.getProducts();
      const promotionProducts = products.filter(product => 
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
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
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
        state.categories = action.payload.filter(cat => cat.type === 'product');
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Popular Products
      .addCase(fetchPopularProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopularProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.popularProducts = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPopularProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch New Products
      .addCase(fetchNewProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.newProducts = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchNewProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Promotion Products
      .addCase(fetchPromotionProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.promotionProducts = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPromotionProducts.rejected, (state, action) => {
        state.loading = false;
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
export const selectClientProductsLoading = (state) => state.client?.products?.loading || false;
export const selectClientProductsError = (state) => state.client?.products?.error || null;
export const selectClientProductsLastUpdated = (state) => state.client?.products?.lastUpdated || null;

export default clientProductsSlice.reducer;
