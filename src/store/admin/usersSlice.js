import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../backend/services/userService';

// État initial pour les utilisateurs admin
const initialState = {
  users: [],
  loading: false,
  error: null,
  lastUpdated: null,
  stats: {
    total: 0,
    customers: 0,
    farmers: 0,
    admins: 0
  },
  // Filtres et recherche
  filters: {
    role: 'all', // all, customer, farmer, admin
    search: '',
    sortBy: 'created_at', // created_at, name, email
    sortOrder: 'desc' // asc, desc
  }
};

// Actions asynchrones pour les utilisateurs
export const fetchUsers = createAsyncThunk(
  'adminUsers/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const users = await userService.getUsers();
      return users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour récupérer les statistiques des utilisateurs
export const fetchUserStats = createAsyncThunk(
  'adminUsers/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await userService.getUserStats();
      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour tester les permissions
export const testUserPermissions = createAsyncThunk(
  'adminUsers/testPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const result = await userService.testPermissions();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour mettre à jour le rôle d'un utilisateur
export const updateUserRole = createAsyncThunk(
  'adminUsers/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const updatedUser = await userService.updateUserRole(userId, role);
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Action pour supprimer un utilisateur
export const deleteUser = createAsyncThunk(
  'adminUsers/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await userService.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice Redux
const usersSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setRoleFilter: (state, action) => {
      state.filters.role = action.payload;
    },
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.filters.sortOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.filters = {
        role: 'all',
        search: '',
        sortBy: 'created_at',
        sortOrder: 'desc'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Test Permissions
      .addCase(testUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(testUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User Role
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users = [
            ...state.users.slice(0, index),
            action.payload,
            ...state.users.slice(index + 1)
          ];
        }
        // Mettre à jour les stats
        state.stats = {
          ...state.stats,
          customers: state.users.filter(u => u.role === 'customer').length,
          farmers: state.users.filter(u => u.role === 'farmer').length,
          admins: state.users.filter(u => u.role === 'admin').length
        };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        // Mettre à jour les stats
        state.stats = {
          total: state.users.length,
          customers: state.users.filter(u => u.role === 'customer').length,
          farmers: state.users.filter(u => u.role === 'farmer').length,
          admins: state.users.filter(u => u.role === 'admin').length
        };
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export des actions
export const {
  setFilters,
  setSearch,
  setRoleFilter,
  setSortBy,
  setSortOrder,
  clearError,
  resetFilters
} = usersSlice.actions;

// Selectors
export const selectAdminUsers = (state) => state.admin.users.users;
export const selectAdminUsersLoading = (state) => state.admin.users.loading;
export const selectAdminUsersError = (state) => state.admin.users.error;
export const selectAdminUsersFilters = (state) => state.admin.users.filters;
export const selectAdminUsersStats = (state) => state.admin.users.stats;

// Selector pour les utilisateurs filtrés
export const selectFilteredUsers = (state) => {
  const { users } = state.admin.users;
  const { filters } = state.admin.users;
  
  let filtered = [...users];
  
  // Filtre par recherche
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(user => 
      (user.first_name || '').toLowerCase().includes(searchLower) ||
      (user.last_name || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower) ||
      (user.phone || '').toLowerCase().includes(searchLower)
    );
  }
  
  // Filtre par rôle
  if (filters.role !== 'all') {
    filtered = filtered.filter(user => user.role === filters.role);
  }
  
  // Tri
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (filters.sortBy) {
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case 'name':
        aValue = `${a.first_name || ''} ${a.last_name || ''}`.trim();
        bValue = `${b.first_name || ''} ${b.last_name || ''}`.trim();
        break;
      case 'email':
        aValue = a.email;
        bValue = b.email;
        break;
      default:
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
    }
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  return filtered;
};

export const selectUserById = (userId) => (state) => 
  state.admin.users.users.find(user => user.id === userId);

export default usersSlice.reducer;
