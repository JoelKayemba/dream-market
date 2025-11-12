import { supabase, USER_ROLES } from '../config/supabase';
import {
  validateAndSanitizeEmail,
  validateAndSanitizeName,
  validateAndSanitizePhone,
  validateAndSanitizeText,
  sanitizeString,
} from '../../utils/inputSanitizer';

export const authService = {
  // Inscription
  signUp: async (email, password, userData = {}) => {
    try {
      // Valider et nettoyer l'email
      const emailResult = validateAndSanitizeEmail(email);
      if (!emailResult.valid) {
        throw new Error(emailResult.error);
      }

      // Valider et nettoyer les noms
      const firstNameResult = validateAndSanitizeName(userData.firstName || '', {
        maxLength: 100,
        required: false,
      });
      if (!firstNameResult.valid) {
        throw new Error(firstNameResult.error);
      }

      const lastNameResult = validateAndSanitizeName(userData.lastName || '', {
        maxLength: 100,
        required: false,
      });
      if (!lastNameResult.valid) {
        throw new Error(lastNameResult.error);
      }

      // Valider et nettoyer le téléphone
      let phone = null;
      if (userData.phone) {
        const phoneResult = validateAndSanitizePhone(userData.phone);
        if (phoneResult.valid) {
          phone = phoneResult.cleaned;
        } else {
          throw new Error(phoneResult.error);
        }
      }

      // Valider et nettoyer l'adresse
      let address = null;
      if (userData.address) {
        const addressResult = validateAndSanitizeText(userData.address, {
          maxLength: 500,
          required: false,
        });
        if (addressResult.valid) {
          address = addressResult.cleaned;
        } else {
          throw new Error(addressResult.error);
        }
      }

      // Valider et nettoyer l'URL de l'avatar
      let avatarUrl = null;
      if (userData.avatarUrl) {
        avatarUrl = sanitizeString(userData.avatarUrl, { maxLength: 500 });
      }

      // Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailResult.cleaned,
        password,
      });

      if (authError) throw authError;

      // Si l'inscription réussit et qu'on a un utilisateur
      if (authData.user) {
        // Créer le profil utilisateur
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email: emailResult.cleaned,
            first_name: firstNameResult.cleaned || null,
            last_name: lastNameResult.cleaned || null,
            phone,
            address,
            role: userData.role || USER_ROLES.CUSTOMER,
            avatar_url: avatarUrl,
          }])
          .select()
          .single();

        if (profileError) throw profileError;

        return {
          user: authData.user,
          profile: profileData,
          session: authData.session,
        };
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      throw error;
    }
  },

  // Connexion
  signIn: async (email, password) => {
    try {
      // Valider et nettoyer l'email
      const emailResult = validateAndSanitizeEmail(email);
      if (!emailResult.valid) {
        throw new Error(emailResult.error);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailResult.cleaned,
        password,
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

      return {
        user: data.user,
        profile: profile || null,
        session: data.session,
      };
    } catch (error) {
      throw error;
    }
  },

  // Déconnexion
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer la session actuelle
  getSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour le profil utilisateur
  updateProfile: async (userId, updates) => {
    try {
      const cleanedUpdates = {
        updated_at: new Date().toISOString(),
      };

      // Valider et nettoyer les champs si présents
      if (updates.first_name !== undefined) {
        const firstNameResult = validateAndSanitizeName(updates.first_name, {
          maxLength: 100,
          required: false,
        });
        if (!firstNameResult.valid) {
          throw new Error(firstNameResult.error);
        }
        cleanedUpdates.first_name = firstNameResult.cleaned || null;
      }

      if (updates.last_name !== undefined) {
        const lastNameResult = validateAndSanitizeName(updates.last_name, {
          maxLength: 100,
          required: false,
        });
        if (!lastNameResult.valid) {
          throw new Error(lastNameResult.error);
        }
        cleanedUpdates.last_name = lastNameResult.cleaned || null;
      }

      if (updates.phone !== undefined) {
        if (updates.phone) {
          const phoneResult = validateAndSanitizePhone(updates.phone);
          if (phoneResult.valid) {
            cleanedUpdates.phone = phoneResult.cleaned;
          } else {
            throw new Error(phoneResult.error);
          }
        } else {
          cleanedUpdates.phone = null;
        }
      }

      if (updates.address !== undefined) {
        if (updates.address) {
          const addressResult = validateAndSanitizeText(updates.address, {
            maxLength: 500,
            required: false,
          });
          if (addressResult.valid) {
            cleanedUpdates.address = addressResult.cleaned;
          } else {
            throw new Error(addressResult.error);
          }
        } else {
          cleanedUpdates.address = null;
        }
      }

      if (updates.avatar_url !== undefined) {
        cleanedUpdates.avatar_url = updates.avatar_url
          ? sanitizeString(updates.avatar_url, { maxLength: 500 })
          : null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(cleanedUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer le profil utilisateur
  getProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Réinitialiser le mot de passe
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'dreammarket://reset-password',
      });
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Changer le mot de passe
  updatePassword: async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  },
};
