import { supabase } from '../config/supabase';

class UserService {
  // Récupérer tous les utilisateurs (profiles)
  async getUsers() {
    try {
      console.log('🔍 Récupération de tous les utilisateurs...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Utilisateurs récupérés:', { count: data?.length, error });

      if (error) {
        console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  // Méthode de test pour vérifier les permissions
  async testPermissions() {
    try {
      console.log('🔍 Test des permissions sur la table profiles...');
      
      // Test 1: Compter tous les profils
      const { count: totalCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      console.log('📊 Test 1 - Comptage total:', { totalCount, countError });

      // Test 2: Récupérer quelques profils
      const { data: sampleData, error: sampleError } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .limit(5);
      
      console.log('📊 Test 2 - Échantillon de données:', { sampleData, sampleError });

      // Test 3: Vérifier l'utilisateur actuel
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      console.log('📊 Test 3 - Utilisateur actuel:', { currentUser: currentUser?.user?.id, userError });

      return {
        totalCount,
        sampleCount: sampleData?.length || 0,
        currentUserId: currentUser?.user?.id,
        errors: { countError, sampleError, userError }
      };
    } catch (error) {
      console.error('❌ Erreur lors du test des permissions:', error);
      throw error;
    }
  }

  // Récupérer le nombre total d'utilisateurs
  async getUserCount() {
    try {
      console.log('🔍 Tentative de comptage des utilisateurs...');
      
      // Utiliser une requête SQL directe pour compter tous les utilisateurs
      const { data, error } = await supabase.rpc('get_user_count');

      if (error) {
        console.log('⚠️ Fonction RPC non disponible, fallback vers profiles...');
        // Fallback: essayer avec profiles
        const { count, error: fallbackError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        console.log('📊 Résultat fallback profiles:', { count, fallbackError });
        return count || 0;
      }

      console.log('✅ Nombre d\'utilisateurs trouvés via RPC:', data || 0);
      return data || 0;
    } catch (error) {
      console.error('Erreur lors du comptage des utilisateurs:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des utilisateurs
  async getUserStats() {
    try {
      console.log('🔍 Récupération des statistiques utilisateurs...');
      
      // Utiliser une requête SQL directe pour récupérer les statistiques
      const { data: statsData, error: rpcError } = await supabase.rpc('get_user_stats');

      if (!rpcError && statsData) {
        console.log('✅ Statistiques récupérées via RPC:', statsData);
        return statsData;
      }

      console.log('⚠️ Fonction RPC non disponible, fallback vers profiles...');
      
      // Fallback: essayer avec profiles
      const { count: totalCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      console.log('📊 Total utilisateurs depuis profiles:', { totalCount, countError });

      // Récupérer les rôles depuis profiles
      let roleStats = [];
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('role')
          .not('role', 'is', null);

        if (!profilesError) {
          roleStats = profilesData;
          console.log('📊 Rôles récupérés depuis profiles:', roleStats);
        } else {
          console.log('⚠️ Impossible de récupérer les rôles depuis profiles:', profilesError);
        }
      } catch (profilesError) {
        console.log('⚠️ Erreur lors de la récupération des rôles:', profilesError);
      }

      const stats = {
        total: totalCount || 0,
        customers: roleStats.filter(p => p.role === 'customer').length,
        farmers: roleStats.filter(p => p.role === 'farmer').length,
        admins: roleStats.filter(p => p.role === 'admin').length
      };

      console.log('✅ Statistiques calculées (fallback):', stats);
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques utilisateurs:', error);
      throw error;
    }
  }

  // Récupérer un utilisateur par ID
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour le rôle d'un utilisateur
  async updateUserRole(userId, role) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      throw error;
    }
  }

  // Supprimer un utilisateur
  async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
