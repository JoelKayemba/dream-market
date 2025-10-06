import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { farms } from '../../data/farms';

// Actions asynchrones pour simuler les appels API
export const fetchFarms = createAsyncThunk(
  'farms/fetchFarms',
  async (_, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Créer une copie profonde pour éviter les mutations
      return JSON.parse(JSON.stringify(farms));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addFarm = createAsyncThunk(
  'farms/addFarm',
  async (farmData, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newFarm = {
        id: Date.now(), // ID temporaire
        ...farmData,
        rating: 0,
        reviewCount: 0,
        verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return newFarm;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateFarm = createAsyncThunk(
  'farms/updateFarm',
  async ({ id, farmData }, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedFarm = {
        ...farmData,
        id,
        updatedAt: new Date().toISOString()
      };
      
      return updatedFarm;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteFarm = createAsyncThunk(
  'farms/deleteFarm',
  async (farmId, { rejectWithValue }) => {
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 600));
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
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 600));
      return farmId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  farms: [],
  loading: false,
  error: null,
  searchQuery: '',
  filter: 'all', // 'all', 'verified', 'pending'
  sortBy: 'name', // 'name', 'rating', 'createdAt'
  sortOrder: 'asc' // 'asc', 'desc'
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
    // Fetch farms
    builder
      .addCase(fetchFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = action.payload;
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add farm
      .addCase(addFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFarm.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = [...state.farms, action.payload];
      })
      .addCase(addFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update farm
      .addCase(updateFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFarm.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.farms.findIndex(farm => farm.id === action.payload.id);
        if (index !== -1) {
          state.farms = state.farms.map((farm, i) => 
            i === index ? action.payload : farm
          );
        }
      })
      .addCase(updateFarm.rejected, (state, action) => {
        state.loading = false;
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
        state.farms = state.farms.map(farm => 
          farm.id === action.payload ? { ...farm, verified: true } : farm
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
export const selectFarmsError = (state) => state.admin.farms.error;
export const selectSearchQuery = (state) => state.admin.farms.searchQuery;
export const selectFilter = (state) => state.admin.farms.filter;
export const selectSortBy = (state) => state.admin.farms.sortBy;
export const selectSortOrder = (state) => state.admin.farms.sortOrder;

// Selector pour les fermes filtrées et triées
export const selectFilteredFarms = (state) => {
  const { farms, searchQuery, filter, sortBy, sortOrder } = state.admin.farms;
  
  let filteredFarms = farms;
  
  // Filtrage par recherche
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredFarms = filteredFarms.filter(farm =>
      farm.name.toLowerCase().includes(query) ||
      farm.location.toLowerCase().includes(query) ||
      farm.region.toLowerCase().includes(query) ||
      farm.specialty.toLowerCase().includes(query)
    );
  }
  
  // Filtrage par statut de vérification
  if (filter !== 'all') {
    if (filter === 'verified') {
      filteredFarms = filteredFarms.filter(farm => farm.verified);
    } else if (filter === 'pending') {
      filteredFarms = filteredFarms.filter(farm => !farm.verified);
    }
  }
  
  // Tri
  filteredFarms.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || a.established);
        bValue = new Date(b.createdAt || b.established);
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  return filteredFarms;
};

// Selector pour une ferme spécifique
export const selectFarmById = (state, farmId) => 
  state.admin.farms.farms.find(farm => farm.id === farmId);

// Selector pour les statistiques
export const selectFarmStats = (state) => {
  const farms = state.admin.farms.farms;
  return {
    total: farms.length,
    verified: farms.filter(farm => farm.verified).length,
    pending: farms.filter(farm => !farm.verified).length,
    totalProducts: farms.reduce((sum, farm) => sum + (farm.products?.length || 0), 0),
    averageRating: farms.length > 0 ? 
      farms.reduce((sum, farm) => sum + (farm.rating || 0), 0) / farms.length : 0
  };
};

export default farmSlice.reducer;
