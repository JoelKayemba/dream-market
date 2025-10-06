import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// État initial pour les produits admin
const initialState = {
  products: [],
  loading: false,
  error: null,
  lastUpdated: null,
  // Filtres et recherche
  filters: {
    category: null,
    status: 'all', // all, active, inactive, pending
    search: '',
    sortBy: 'name', // name, price, date, popularity
    sortOrder: 'asc' // asc, desc
  },
  // Pagination
  pagination: {
    currentPage: 1,
    itemsPerPage: 20,
    totalItems: 0,
    totalPages: 0
  },
  // État de l'édition
  editingProduct: null,
  isEditing: false
};

// Actions asynchrones pour les produits
export const fetchProducts = createAsyncThunk(
  'adminProducts/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      // Dans une vraie app, ceci ferait un appel à votre API
      const { page = 1, limit = 20, category, status, search, sortBy, sortOrder } = params;
      
      // Simuler un délai d'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées (à remplacer par un vrai appel API)
      const mockProducts = [
        {
          id: 1,
          name: 'Tomates Bio Premium',
          description: 'Tomates biologiques cultivées avec soin, parfaites pour vos salades et plats. Récoltées à maturité optimale pour un goût exceptionnel.',
          price: 2.50,
          currency: 'CDF',
          oldPrice: 3.20,
          unit: 'kg',
          images: [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
            'https://images.unsplash.com/photo-1546470427-e8e7b3d8b8b8',
            'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b'
          ],
          farm: 'Ferme du Soleil',
          farmId: 'farm1',
          category: 'Légumes',
          categoryId: 1,
          rating: 4.8,
          reviewCount: 127,
          stock: 45,
          isNew: false,
          isOrganic: true,
          isPopular: true,
          discount: 22,
          status: 'active',
          tags: ['Bio', 'Premium', 'Saison', 'Local'],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'Pommes Golden Deluxe',
          description: 'Pommes Golden de qualité exceptionnelle, récoltées à maturité optimale. Douceur et croquant garantis pour un plaisir gustatif unique.',
          price: 3.20,
          currency: 'CDF',
          oldPrice: null,
          unit: 'kg',
          images: [
            'https://images.unsplash.com/photo-1519996529931-28324d5a630e',
            'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6'
          ],
          farm: 'Verger des Collines',
          farmId: 'farm2',
          category: 'Fruits',
          categoryId: 2,
          rating: 4.6,
          reviewCount: 89,
          stock: 32,
          isNew: true,
          isOrganic: false,
          isPopular: true,
          discount: null,
          status: 'active',
          tags: ['Fruits', 'Qualité', 'Tradition', 'Sucré'],
          createdAt: '2024-01-14T14:30:00Z',
          updatedAt: '2024-01-14T14:30:00Z'
        },
        {
          id: 3,
          name: 'Carottes Nouvelles',
          description: 'Carottes nouvelles et tendres, récoltées jeunes pour une saveur douce et sucrée. Parfaites crues ou cuites.',
          price: 1.90,
          currency: 'CDF',
          oldPrice: null,
          unit: 'kg',
          images: [
            'https://images.unsplash.com/photo-1447175008436-170170e886ae',
            'https://images.unsplash.com/photo-1582515073490-39981397c445'
          ],
          farm: 'Ferme du Soleil',
          farmId: 'farm1',
          category: 'Légumes',
          categoryId: 1,
          rating: 4.7,
          reviewCount: 78,
          stock: 65,
          isNew: true,
          isOrganic: false,
          isPopular: false,
          discount: null,
          status: 'pending',
          tags: ['Légumes', 'Nouveau', 'Tendre', 'Sucré'],
          createdAt: '2024-01-13T09:15:00Z',
          updatedAt: '2024-01-13T09:15:00Z'
        },
        {
          id: 4,
          name: 'Lait Frais du Matin',
          description: 'Lait frais du jour, récolté le matin même, pour une fraîcheur incomparable. Crémeux et délicieux comme autrefois.',
          price: 1.20,
          currency: 'USD',
          oldPrice: 1.50,
          unit: 'L',
          images: [
            'https://images.unsplash.com/photo-1550583724-b2692b85b150',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
          ],
          farm: 'Ferme du Plateau',
          farmId: 'farm3',
          category: 'Produits Laitiers',
          categoryId: 4,
          rating: 4.9,
          reviewCount: 203,
          stock: 28,
          isNew: false,
          isOrganic: true,
          isPopular: true,
          discount: 20,
          status: 'active',
          tags: ['Lait', 'Frais', 'Local', 'Bio'],
          createdAt: '2024-01-12T07:00:00Z',
          updatedAt: '2024-01-12T07:00:00Z'
        },
        {
          id: 5,
          name: 'Miel de Fleurs Sauvages',
          description: 'Miel pur et naturel récolté dans nos prairies fleuries. Goût floral délicat et propriétés nutritives exceptionnelles.',
          price: 8.50,
          currency: 'CDF',
          oldPrice: 10.00,
          unit: '500g',
          images: [
            'https://images.unsplash.com/photo-1587049352846-4a222e784d38',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
            'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136'
          ],
          farm: 'Rucher des Prairies',
          farmId: 'farm4',
          category: 'Produits de la Ruche',
          categoryId: 5,
          rating: 4.9,
          reviewCount: 156,
          stock: 15,
          isNew: false,
          isOrganic: true,
          isPopular: true,
          discount: 15,
          status: 'inactive',
          tags: ['Miel', 'Bio', 'Naturel', 'Local'],
          createdAt: '2024-01-11T16:45:00Z',
          updatedAt: '2024-01-11T16:45:00Z'
        }
      ];
      
      // Appliquer les filtres
      let filteredProducts = mockProducts;
      
      if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      if (status && status !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.status === status);
      }
      
      if (search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Appliquer le tri
      filteredProducts.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        if (sortBy === 'price') {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        } else if (sortBy === 'date') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else {
          aValue = aValue.toString().toLowerCase();
          bValue = bValue.toString().toLowerCase();
        }
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      // Pagination
      const totalItems = filteredProducts.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages
        }
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addProduct = createAsyncThunk(
  'adminProducts/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newProduct = {
        id: Date.now().toString(),
        ...productData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newProduct;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'adminProducts/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedProduct = {
        ...productData,
        id,
        updatedAt: new Date().toISOString()
      };
      
      return updatedProduct;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'adminProducts/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return productId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleProductStatus = createAsyncThunk(
  'adminProducts/toggleProductStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return { id, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice principal
const adminProductSlice = createSlice({
  name: 'adminProducts',
  initialState,
  reducers: {
    // Actions synchrones
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    
    setCategory: (state, action) => {
      state.filters.category = action.payload;
    },
    
    setStatus: (state, action) => {
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Product
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.pagination.totalItems += 1;
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
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
        state.pagination.totalItems -= 1;
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.itemsPerPage);
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
        const product = state.products.find(p => p.id === action.payload.id);
        if (product) {
          product.status = action.payload.status;
          product.updatedAt = new Date().toISOString();
        }
      })
      .addCase(toggleProductStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions
export const {
  setFilters,
  clearFilters,
  setSearch,
  setCategory,
  setStatus,
  setSorting,
  setPagination,
  setEditingProduct,
  clearEditingProduct,
  clearError
} = adminProductSlice.actions;

// Sélecteurs
export const selectAdminProducts = (state) => state.admin.products.products;
export const selectAdminProductsLoading = (state) => state.admin.products.loading;
export const selectAdminProductsError = (state) => state.admin.products.error;
export const selectAdminProductsFilters = (state) => state.admin.products.filters;
export const selectAdminProductsPagination = (state) => state.admin.products.pagination;
export const selectEditingProduct = (state) => state.admin.products.editingProduct;
export const selectIsEditingProduct = (state) => state.admin.products.isEditing;
export const selectAdminProductsLastUpdated = (state) => state.admin.products.lastUpdated;

// Sélecteurs calculés
export const selectFilteredProducts = (state) => {
  const { products, filters } = state.admin.products;
  let filtered = products;
  
  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category);
  }
  
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(p => p.status === filters.status);
  }
  
  if (filters.search) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      p.description.toLowerCase().includes(filters.search.toLowerCase())
    );
  }
  
  return filtered;
};

export const selectProductById = (state, productId) => 
  state.admin.products.products.find(p => p.id === productId);

export const selectProductsByStatus = (state, status) => 
  state.admin.products.products.filter(p => p.status === status);

export const selectProductsByCategory = (state, category) => 
  state.admin.products.products.filter(p => p.category === category);

export default adminProductSlice.reducer;

