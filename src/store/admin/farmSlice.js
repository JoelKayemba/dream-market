import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { farmService } from '../../backend';

// Actions asynchrones avec backend Supabase
export const fetchFarms = createAsyncThunk(
  'farms/fetchFarms',
  async (options = {}, { rejectWithValue, getState }) => {
    try {
      const { page = 0, limit = 20, refresh = false } = options;
      const state = getState();
      const filters = state.admin?.farms?.filters || {};
      
      // Tous les filtres (search, verified) sont gérés côté client
      const result = await farmService.getFarms({
        limit,
        offset: page * limit,
        search: null,
        verified: null,
        region: filters.region || null
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

export const addFarm = createAsyncThunk(
  'farms/addFarm',
  async (farmData, { rejectWithValue }) => {
    try {
      const farmToCreate = {
        ...farmData,
        verified: false,
        rating: 0,
        review_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (farmData.images && farmData.images.length > 0) {
        farmToCreate.main_image = farmData.images[0] || null;
        farmToCreate.cover_image = farmData.images[1] || null;
      }

      delete farmToCreate.images;

      const newFarm = await farmService.addFarm(farmToCreate);
      return newFarm;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateFarm = createAsyncThunk(
  'farms/updateFarm',
  async ({ id, farmData }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const existingFarm = state.admin.farms.farms.find(farm => farm.id === id);
      
      if (!existingFarm) {
        throw new Error('Ferme non trouvée');
      }

      const updatedFarmData = {
        ...farmData,
        updated_at: new Date().toISOString()
      };

      delete updatedFarmData.images;
      delete updatedFarmData.newImages;
      delete updatedFarmData.imagesToDelete;

      const updatedFarm = await farmService.updateFarm(id, updatedFarmData);

      if (farmData.images && farmData.images.length > 0) {
        const finalUpdatedFarm = await farmService.updateFarm(id, {
          main_image: farmData.images[0] || null,
          cover_image: farmData.images[1] || null,
          updated_at: new Date().toISOString()
        });
        return finalUpdatedFarm;
      }

      return updatedFarm;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteFarm = createAsyncThunk(
  'farms/deleteFarm',
  async (farmId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const farm = state.admin.farms.farms.find(f => f.id === farmId);
      
      if (!farm) {
        throw new Error('Ferme non trouvée');
      }

      // ⚠️ seulement si tu as bien storageService importé
      if (farm.images && farm.images.length > 0) {
        const deletePromises = farm.images.map(imageUrl => 
          storageService.deleteImage(imageUrl)
        );
        await Promise.all(deletePromises);
      }

      await farmService.deleteFarm(farmId);
      return farmId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const verifyFarm = createAsyncThunk(
  'farms/verifyFarm',
  async (farmId, { rejectWithValue }) => {
    try {
      const verifiedFarm = await farmService.verifyFarm(farmId);
      return verifiedFarm;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  farms: [],
  loading: false,
  loadingMore: false,
  uploading: false,
  error: null,
  searchQuery: '',
  filter: 'all', // 'all', 'verified', 'pending'
  sortBy: 'name', // 'name', 'rating', 'createdAt'
  sortOrder: 'asc', // 'asc', 'desc'
  filters: {
    search: '',
    verified: null,
    region: null
  },
  pagination: {
    page: 0,
    limit: 20,
    total: 0,
    hasMore: true
  }
};

const farmSlice = createSlice({
  name: 'farms',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch farms
      .addCase(fetchFarms.pending, (state, action) => {
        const { refresh = false } = action.meta.arg || {};
        if (refresh || state.farms.length === 0) {
          state.loading = true;
          state.loadingMore = false;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action) => {
        const { items, total, hasMore, page, refresh } = action.payload;
        state.loading = false;
        state.loadingMore = false;
        
        if (refresh || page === 0) {
          state.farms = items;
        } else {
          state.farms = [...state.farms, ...items];
        }
        
        state.pagination = {
          page,
          limit: 20,
          total,
          hasMore
        };
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })

      // Add farm
      .addCase(addFarm.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(addFarm.fulfilled, (state, action) => {
        state.uploading = false;
        state.farms = [...state.farms, action.payload];
      })
      .addCase(addFarm.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })

      // Update farm
      .addCase(updateFarm.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(updateFarm.fulfilled, (state, action) => {
        state.uploading = false;
        const index = state.farms.findIndex(farm => farm.id === action.payload.id);
        if (index !== -1) {
          state.farms = state.farms.map((farm, i) =>
            i === index ? action.payload : farm
          );
        }
      })
      .addCase(updateFarm.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })

      // Delete farm
      .addCase(deleteFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFarm.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = state.farms.filter(farm => farm.id !== action.payload);
      })
      .addCase(deleteFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify farm
      .addCase(verifyFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyFarm.fulfilled, (state, action) => {
        state.loading = false;
        // si l'API retourne l'objet, adapte ici
        const updated = action.payload;
        state.farms = state.farms.map(farm =>
          farm.id === updated.id ? updated : farm
        );
      })
      .addCase(verifyFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSearchQuery, setFilter, setSortBy, setSortOrder, clearError } = farmSlice.actions;

// Selectors
export const selectAllFarms = (state) => state.admin.farms.farms;
export const selectFarmsLoading = (state) => state.admin.farms.loading;
export const selectFarmsLoadingMore = (state) =>
  state.admin.farms.loadingMore || false;
export const selectFarmsPagination = (state) =>
  state.admin.farms.pagination || { page: 0, limit: 20, total: 0, hasMore: true };
export const selectFarmsUploading = (state) => state.admin.farms.uploading;
export const selectFarmsError = (state) => state.admin.farms.error;
export const selectSearchQuery = (state) => state.admin.farms.searchQuery;
export const selectFilter = (state) => state.admin.farms.filter;
export const selectSortBy = (state) => state.admin.farms.sortBy;
export const selectSortOrder = (state) => state.admin.farms.sortOrder;

// Selector pour les fermes filtrées et triées
export const selectFilteredFarms = (state) => {
  const { farms, searchQuery, filter, sortBy, sortOrder } = state.admin.farms;

  // On travaille sur une copie pour ne pas muter le state
  let filteredFarms = [...farms];

  // Filtrage par recherche
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredFarms = filteredFarms.filter((farm) => {
      const name = (farm.name || '').toLowerCase();
      const location = (farm.location || '').toLowerCase();
      const region = (farm.region || '').toLowerCase();
      const specialty = (farm.specialty || '').toLowerCase();

      return (
        name.includes(query) ||
        location.includes(query) ||
        region.includes(query) ||
        specialty.includes(query)
      );
    });
  }

  // Filtrage par statut de vérification
  if (filter !== 'all') {
    if (filter === 'verified') {
      filteredFarms = filteredFarms.filter((farm) => !!farm.verified);
    } else if (filter === 'pending') {
      filteredFarms = filteredFarms.filter((farm) => !farm.verified);
    }
  }

  // Tri
  filteredFarms.sort((a, b) => {
    let aValue;
    let bValue;

    switch (sortBy) {
      case 'name':
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
        break;
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      case 'createdAt':
        // adapte selon tes vrais champs : created_at, createdAt, established...
        aValue = new Date(a.created_at || a.createdAt || a.established || 0);
        bValue = new Date(b.created_at || b.createdAt || b.established || 0);
        break;
      default:
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return filteredFarms;
};

// Selector pour une ferme spécifique
export const selectFarmById = (state, farmId) =>
  state.admin.farms.farms.find((farm) => farm.id === farmId);

// Selector pour les statistiques
export const selectFarmStats = (state) => {
  const farms = state.admin.farms.farms;
  return {
    total: farms.length,
    verified: farms.filter((farm) => farm.verified).length,
    pending: farms.filter((farm) => !farm.verified).length,
    totalProducts: farms.reduce(
      (sum, farm) => sum + (farm.products?.length || 0),
      0
    ),
    averageRating:
      farms.length > 0
        ? farms.reduce((sum, farm) => sum + (farm.rating || 0), 0) / farms.length
        : 0
  };
};

export default farmSlice.reducer;
