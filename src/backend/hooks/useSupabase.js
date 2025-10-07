import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook personnalisé pour les requêtes Supabase
 * @param {string} table - Nom de la table
 * @param {string} query - Requête SQL (défaut: '*')
 * @param {object} filters - Filtres à appliquer
 * @param {boolean} autoFetch - Charger automatiquement au montage
 */
export const useSupabase = (table, query = '*', filters = {}, autoFetch = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let supabaseQuery = supabase
        .from(table)
        .select(query);

      // Appliquer les filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          supabaseQuery = supabaseQuery.eq(key, value);
        }
      });

      const { data: result, error: fetchError } = await supabaseQuery;
      
      if (fetchError) throw fetchError;
      
      setData(result || []);
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${table}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [table, JSON.stringify(filters)]);

  const refetch = () => {
    fetchData();
  };

  return { 
    data, 
    loading, 
    error, 
    refetch,
    setData 
  };
};

/**
 * Hook pour les subscriptions temps réel
 * @param {string} table - Nom de la table
 * @param {string} query - Requête SQL
 * @param {object} filters - Filtres à appliquer
 */
export const useSupabaseRealtime = (table, query = '*', filters = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Charger les données initiales
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        let supabaseQuery = supabase
          .from(table)
          .select(query);

        // Appliquer les filtres
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            supabaseQuery = supabaseQuery.eq(key, value);
          }
        });

        const { data: result, error: fetchError } = await supabaseQuery;
        
        if (fetchError) throw fetchError;
        
        setData(result || []);
      } catch (err) {
        setError(err.message);
        console.error(`Error loading initial ${table} data:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();

    // Configurer la subscription temps réel
    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log(`${table} change received:`, payload);
          
          setData(currentData => {
            const newData = [...currentData];
            
            switch (payload.eventType) {
              case 'INSERT':
                newData.unshift(payload.new);
                break;
              case 'UPDATE':
                const updateIndex = newData.findIndex(item => item.id === payload.new.id);
                if (updateIndex !== -1) {
                  newData[updateIndex] = payload.new;
                }
                break;
              case 'DELETE':
                return newData.filter(item => item.id !== payload.old.id);
              default:
                break;
            }
            
            return newData;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, query, JSON.stringify(filters)]);

  return { data, loading, error };
};

/**
 * Hook pour l'authentification
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session actuelle
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Récupérer le profil utilisateur
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error getting profile:', profileError);
          } else {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Récupérer le profil utilisateur
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error getting profile:', profileError);
            setProfile(null);
          } else {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Créer le profil utilisateur
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            email: data.user.email,
            first_name: userData.firstName || null,
            last_name: userData.lastName || null,
            phone: userData.phone || null,
            address: userData.address || null,
            role: userData.role || 'customer',
            avatar_url: userData.avatarUrl || null,
          }])
          .select()
          .single();

        if (profileError) throw profileError;
        
        return {
          ...data,
          profile: profileData,
        };
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
};
