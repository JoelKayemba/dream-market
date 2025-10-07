import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../backend/config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Actions asynchrones
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Vérifier que email et password sont des chaînes
      if (typeof email !== 'string' || typeof password !== 'string') {
        throw new Error('Email et mot de passe doivent être des chaînes de caractères');
      }

      // Connexion avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;

      // Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Sauvegarder le token dans AsyncStorage
      await AsyncStorage.setItem('auth_token', data.session.access_token);
      await AsyncStorage.setItem('user_id', data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: profile?.role || 'customer',
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          phone: profile?.phone || '',
          address: profile?.address || '',
          avatarUrl: profile?.avatar_url || '',
        },
        token: data.session.access_token,
        refreshToken: data.session.refresh_token
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ firstName, lastName, email, password, phone, address }, { rejectWithValue }) => {
    try {
      // Vérifier que email et password sont des chaînes
      if (typeof email !== 'string' || typeof password !== 'string') {
        throw new Error('Email et mot de passe doivent être des chaînes de caractères');
      }

      // Inscription avec Supabase + métadonnées pour le trigger
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            address: address,
            role: 'customer'
          },
          emailRedirectTo: undefined // Désactiver la redirection email
        }
      });

      if (error) throw error;

      // Sauvegarder le token dans AsyncStorage si on a une session
      if (data.session) {
        await AsyncStorage.setItem('auth_token', data.session.access_token);
        await AsyncStorage.setItem('user_id', data.user.id);
      }

      // Le profil sera créé automatiquement par le trigger
      // On retourne les données de base
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: 'customer',
          firstName,
          lastName,
          phone: phone || '',
          address: address || '',
          avatarUrl: '',
        },
        token: data.session?.access_token || null,
        refreshToken: data.session?.refresh_token || null,
        needsEmailConfirmation: !data.session // True si l'email doit être confirmé
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'dreammarket://reset-password',
      });
      
      if (error) throw error;
      return { message: 'Email de réinitialisation envoyé' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, code, newPassword }, { rejectWithValue }) => {
    try {
      // Pour Supabase, on utilise directement updateUser
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return { message: 'Mot de passe mis à jour avec succès' };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Supprimer le token de l'AsyncStorage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_id');
      
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserInfo = createAsyncThunk(
  'auth/updateUserInfo',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth.user?.id;
      
      if (!userId) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          address: userData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        address: data.address,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'auth/changeUserPassword',
  async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // D'abord, vérifier le mot de passe actuel
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: auth.user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Mot de passe actuel incorrect');
      }

      // Changer le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      // Vérifier s'il y a un token stocké
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUserId = await AsyncStorage.getItem('user_id');
      
      if (!storedToken || !storedUserId) {
        return null;
      }

      // Vérifier si la session Supabase est toujours valide
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session || session.access_token !== storedToken) {
        // Session invalide ou token différent, nettoyer le stockage
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('user_id');
        return null;
      }

      // Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: profile?.role || 'customer',
          firstName: profile?.first_name || '',
          lastName: profile?.last_name || '',
          phone: profile?.phone || '',
          address: profile?.address || '',
          avatarUrl: profile?.avatar_url || '',
        },
        token: session.access_token,
        refreshToken: session.refresh_token
      };
    } catch (error) {
      // En cas d'erreur, nettoyer le stockage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_id');
      return null;
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    resetCode: null,
    isPasswordReset: false,
    needsEmailConfirmation: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordReset: (state) => {
      state.resetCode = null;
      state.isPasswordReset = false;
    },
    clearEmailConfirmation: (state) => {
      state.needsEmailConfirmation = false;
    },
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
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = !!action.payload.token; // Authentifié si on a un token
        state.needsEmailConfirmation = action.payload.needsEmailConfirmation || false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetCode = 'sent';
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isPasswordReset = true;
        state.resetCode = null;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update User Info
    builder
      .addCase(updateUserInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.firstName = action.payload.firstName;
          state.user.lastName = action.payload.lastName;
          state.user.phone = action.payload.phone;
          state.user.address = action.payload.address;
        }
        state.error = null;
      })
      .addCase(updateUserInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

        // Change User Password
        builder
          .addCase(changeUserPassword.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          .addCase(changeUserPassword.fulfilled, (state) => {
            state.isLoading = false;
            state.error = null;
          })
          .addCase(changeUserPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
          });

        // Load Stored Auth
        builder
          .addCase(loadStoredAuth.pending, (state) => {
            state.isLoading = true;
          })
          .addCase(loadStoredAuth.fulfilled, (state, action) => {
            state.isLoading = false;
            if (action.payload) {
              state.user = action.payload.user;
              state.token = action.payload.token;
              state.refreshToken = action.payload.refreshToken;
              state.isAuthenticated = true;
            } else {
              state.user = null;
              state.token = null;
              state.refreshToken = null;
              state.isAuthenticated = false;
            }
            state.error = null;
          })
          .addCase(loadStoredAuth.rejected, (state, action) => {
            state.isLoading = false;
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = action.payload;
          });
  },
});

export const { clearError, clearPasswordReset, clearEmailConfirmation } = authSlice.actions;
export default authSlice.reducer;