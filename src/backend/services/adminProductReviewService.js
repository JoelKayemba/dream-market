import { supabase } from '../config/supabase';
import notificationService from './notificationService';

export const adminProductReviewService = {
  async getProductRequests({ status = 'pending_review', days = null, limit = 50, offset = 0 } = {}) {
    const { data, error } = await supabase.rpc('get_admin_product_requests', {
      p_status: status,
      p_days: days,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;
    return {
      products: data?.products || [],
      total: data?.total || 0,
    };
  },

  async getPendingProducts(limit = 20) {
    const { products } = await this.getProductRequests({ status: 'pending_review', limit });
    return products;
  },

  async reviewProduct({ productId, action, reviewNote = null, price = null }) {
    const { data, error } = await supabase.rpc('review_farmer_product', {
      p_product_id: productId,
      p_action: action,
      p_review_note: reviewNote,
      p_price: price != null ? Number(price) : null,
    });

    if (error) throw error;

    const result = data || {};
    const product = result.product;
    const ownerId = result.owner_id;

    if (ownerId && product) {
      await this.notifyFarmerOfReview(ownerId, product, action, reviewNote, result.review_kind);
    }

    return product;
  },

  async notifyFarmerOfReview(ownerId, product, action, reviewNote, reviewKind = 'new_product') {
    try {
      const approved = action === 'approve';
      const isImageReview = reviewKind === 'image_change';
      await notificationService.createNotification({
        userId: ownerId,
        type: approved ? 'product_proposal_approved' : 'product_proposal_rejected',
        title: approved
          ? (isImageReview ? 'Photos validées' : 'Produit publié')
          : (isImageReview ? 'Photos refusées' : 'Proposition refusée'),
        message: approved
          ? (isImageReview
            ? `Les nouvelles photos de « ${product.name} » sont en ligne.`
            : `« ${product.name} » a été publié sur Dream Field.`)
          : (isImageReview
            ? `Les photos de « ${product.name} » ont été refusées${reviewNote ? ` : ${reviewNote}` : '.'}`
            : `« ${product.name} » a été refusé${reviewNote ? ` : ${reviewNote}` : '.'}`),
        data: {
          product_id: product.id,
          product_name: product.name,
          review_note: reviewNote || null,
        },
        priority: 2,
      });
    } catch (notifyError) {
      console.warn('[adminProductReviewService] Notification fermier ignorée:', notifyError);
    }
  },
};
