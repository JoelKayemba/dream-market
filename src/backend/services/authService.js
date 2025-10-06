import { supabase, USER_ROLES } from '../config/supabase';

export const authService = {
  // Inscription
  signUp: async (email, password, userData = {}) => {
    try {
      // Créer l'utilisateur avec Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
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
            email: authData.user.email,
            first_name: userData.firstName || null,
            last_name: userData.lastName || null,
            phone: userData.phone || null,
            address: userData.address || null,
            role: userData.role || USER_ROLES.CUSTOMER,
            avatar_url: userData.avatarUrl || null,
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
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
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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
