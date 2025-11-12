import { supabase } from '../config/supabase';
import {
  validateAndSanitizeTitle,
  validateAndSanitizeText,
  validateAndSanitizeNumber,
  sanitizeString,
} from '../../utils/inputSanitizer';

/**
 * Service pour gérer les retours et feedbacks des utilisateurs
 */

export const feedbackService = {
  /**
   * Créer un nouveau feedback
   */
  createFeedback: async (feedbackData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Valider et nettoyer le type
    const allowedTypes = ['bug', 'feature', 'improvement', 'complaint', 'compliment', 'other'];
    const type = allowedTypes.includes(feedbackData.type) ? feedbackData.type : 'other';

    // Valider et nettoyer la catégorie
    const category = feedbackData.category
      ? sanitizeString(feedbackData.category, { maxLength: 100 })
      : null;

    // Valider et nettoyer le sujet
    const subjectResult = validateAndSanitizeTitle(feedbackData.subject, {
      required: true,
      maxLength: 255,
    });
    if (!subjectResult.valid) {
      return { data: null, error: subjectResult.error };
    }

    // Valider et nettoyer le message
    const messageResult = validateAndSanitizeText(feedbackData.message, {
      required: true,
      maxLength: 10000,
    });
    if (!messageResult.valid) {
      return { data: null, error: messageResult.error };
    }

    // Valider et nettoyer le rating
    let rating = null;
    if (feedbackData.rating !== null && feedbackData.rating !== undefined) {
      const ratingResult = validateAndSanitizeNumber(feedbackData.rating, {
        min: 1,
        max: 5,
        allowDecimals: false,
        allowNegative: false,
      });
      if (ratingResult.valid) {
        rating = ratingResult.cleaned;
      }
    }

    // Valider et nettoyer la priorité
    const allowedPriorities = ['low', 'normal', 'high', 'urgent'];
    const priority = allowedPriorities.includes(feedbackData.priority)
      ? feedbackData.priority
      : 'normal';

    const { data, error } = await supabase
      .from('feedbacks')
      .insert([
        {
          user_id: user.id,
          type,
          category,
          subject: subjectResult.cleaned,
          message: messageResult.cleaned,
          rating,
          status: 'pending',
          priority,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la création du feedback:', error);
    return { data: null, error: error.message || 'Erreur lors de la création du feedback' };
  }
  },

  /**
   * Récupérer tous les feedbacks de l'utilisateur connecté
   */
  getUserFeedbacks: async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération des feedbacks:', error);
    return { data: null, error: error.message || 'Erreur lors de la récupération des feedbacks' };
  }
  },

  /**
   * Récupérer un feedback spécifique par ID
   */
  getFeedbackById: async (feedbackId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('id', feedbackId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération du feedback:', error);
    return { data: null, error: error.message || 'Erreur lors de la récupération du feedback' };
  }
  },

  /**
   * Mettre à jour un feedback (seulement si status = 'pending')
   */
  updateFeedback: async (feedbackId, updates) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier que le feedback existe et appartient à l'utilisateur
    const { data: existingFeedback, error: fetchError } = await supabase
      .from('feedbacks')
      .select('status')
      .eq('id', feedbackId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!existingFeedback) {
      throw new Error('Feedback non trouvé');
    }
    if (existingFeedback.status !== 'pending') {
      throw new Error('Ce feedback ne peut plus être modifié');
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du feedback:', error);
    return { data: null, error: error.message || 'Erreur lors de la mise à jour du feedback' };
  }
  },

  /**
   * Supprimer un feedback (seulement si status = 'pending')
   */
  deleteFeedback: async (feedbackId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier que le feedback existe et appartient à l'utilisateur
    const { data: existingFeedback, error: fetchError } = await supabase
      .from('feedbacks')
      .select('status')
      .eq('id', feedbackId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!existingFeedback) {
      throw new Error('Feedback non trouvé');
    }
    if (existingFeedback.status !== 'pending') {
      throw new Error('Ce feedback ne peut plus être supprimé');
    }

    const { error } = await supabase
      .from('feedbacks')
      .delete()
      .eq('id', feedbackId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('Erreur lors de la suppression du feedback:', error);
    return { data: null, error: error.message || 'Erreur lors de la suppression du feedback' };
  }
  },

  /**
   * Récupérer tous les feedbacks (pour les admins)
   */
  getAllFeedbacks: async (filters = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Vérifier que l'utilisateur est admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        throw new Error('Accès refusé. Admin uniquement.');
      }

      let query = supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

      // Appliquer les filtres
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      const { data: feedbacks, error } = await query;

      if (error) throw error;

      // Récupérer les profils des utilisateurs séparément
      if (feedbacks && feedbacks.length > 0) {
        const userIds = [...new Set(feedbacks.map(f => f.user_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds);

        if (profilesError) {
          console.warn('Erreur lors de la récupération des profils:', profilesError);
        }

        // Fusionner les profils avec les feedbacks
        const profilesMap = {};
        if (profiles) {
          profiles.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
        }

        const feedbacksWithProfiles = feedbacks.map(feedback => ({
          ...feedback,
          profiles: profilesMap[feedback.user_id] || null
        }));

        return { data: feedbacksWithProfiles, error: null };
      }

      return { data: feedbacks || [], error: null };
    } catch (error) {
      console.error('Erreur lors de la récupération des feedbacks:', error);
      return { data: null, error: error.message || 'Erreur lors de la récupération des feedbacks' };
    }
  },

  /**
   * Mettre à jour le statut d'un feedback (pour les admins)
   */
  updateFeedbackStatus: async (feedbackId, status, adminNotes = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Vérifier que l'utilisateur est admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        throw new Error('Accès refusé. Admin uniquement.');
      }

      const updateData = {
        status,
        admin_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (adminNotes) {
        // Nettoyer les notes admin
        const notesResult = validateAndSanitizeText(adminNotes, {
          maxLength: 5000,
          required: false,
        });
        if (notesResult.valid) {
          updateData.admin_notes = notesResult.cleaned;
        } else {
          return { data: null, error: notesResult.error };
        }
      }

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data: feedback, error } = await supabase
        .from('feedbacks')
        .update(updateData)
        .eq('id', feedbackId)
        .select('*')
        .single();

      if (error) throw error;

      // Récupérer le profil de l'utilisateur
      if (feedback && feedback.user_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('id', feedback.user_id)
          .single();

        if (profileError) {
          console.warn('Erreur lors de la récupération du profil:', profileError);
        }

        return { 
          data: { 
            ...feedback, 
            profiles: profile || null 
          }, 
          error: null 
        };
      }

      return { data: feedback, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return { data: null, error: error.message || 'Erreur lors de la mise à jour du statut' };
    }
  },

  /**
   * Récupérer les statistiques de feedbacks (pour les admins)
   */
  getFeedbackStats: async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      throw new Error('Accès refusé. Admin uniquement.');
    }

    const { data, error } = await supabase
      .from('feedbacks')
      .select('type, status, priority, rating')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculer les statistiques
    const stats = {
      total: data.length,
      byType: {},
      byStatus: {},
      byPriority: {},
      avgRating: 0,
      pending: 0,
    };

    let totalRating = 0;
    let ratingCount = 0;

    data.forEach((feedback) => {
      // Par type
      stats.byType[feedback.type] = (stats.byType[feedback.type] || 0) + 1;
      
      // Par statut
      stats.byStatus[feedback.status] = (stats.byStatus[feedback.status] || 0) + 1;
      if (feedback.status === 'pending') stats.pending++;
      
      // Par priorité
      stats.byPriority[feedback.priority] = (stats.byPriority[feedback.priority] || 0) + 1;
      
      // Rating
      if (feedback.rating) {
        totalRating += feedback.rating;
        ratingCount++;
      }
    });

    stats.avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

    return { data: stats, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return { data: null, error: error.message || 'Erreur lors de la récupération des statistiques' };
  }
  }
};

