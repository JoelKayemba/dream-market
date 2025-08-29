import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Actions asynchrones
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Simulation d'une API - à remplacer par Supabase plus tard
      if (email === 'admin@dreammarket.com' && password === 'admin123') {
        return {
          user: {
            id: 'admin-1',
            email: 'admin@dreammarket.com',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'Dream Market'
          },
          token: 'fake-admin-token-' + Date.now()
        };
      }
      
      // Simulation d'un utilisateur normal
      if (email === 'marie@email.com' && password === 'password123') {
        return {
          user: {
            id: 'user-1',
            email: 'marie@email.com',
            role: 'user',
            firstName: 'Marie',
            lastName: 'Dupont',
            phone: '+33 6 12 34 56 78',
            address: '123 Rue des Champs, 14000 Caen'
          },
          token: 'fake-user-token-' + Date.now()
        };
      }
      
      throw new Error('Email ou mot de passe incorrect');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ firstName, lastName, email, password, phone, address }, { rejectWithValue }) => {
    try {
      // Simulation d'une API - à remplacer par Supabase plus tard
      const newUser = {
        id: 'user-' + Date.now(),
        email,
        role: 'user',
        firstName,
        lastName,
        phone,
        address
      };
      
      return {
        user: newUser,
        token: 'fake-new-user-token-' + Date.now()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      // Simulation d'envoi de code - à remplacer par Supabase plus tard
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Stocker le code temporairement (en production, ce serait dans la base de données)
      setTimeout(() => {
        console.log('Code de réinitialisation:', resetCode);
      }, 1000);
      
      return { message: 'Code de réinitialisation envoyé par email', resetCode };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, code, newPassword }, { rejectWithValue }) => {
    try {
      // Simulation de vérification de code - à remplacer par Supabase plus tard
      // Ici on simule que le code est toujours valide
      return { message: 'Mot de passe mis à jour avec succès' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  resetCode: null,
  isPasswordReset: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.resetCode = null;
      state.isPasswordReset = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordReset: (state) => {
      state.resetCode = null;
      state.isPasswordReset = false;
    },
    updateUserInfo: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetCode = action.payload.resetCode;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isPasswordReset = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError, clearPasswordReset, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;
