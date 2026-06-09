import { supabase } from '../config/supabase';
import notificationService from './notificationService';

export const farmerProposalService = {
  async upsertProposal(payload) {
    const { data, error } = await supabase.rpc('upsert_farmer_product_proposal', {
      p_product_id: payload.productId || null,
      p_name: payload.name,
      p_description: payload.description || null,
      p_short_description: payload.shortDescription || null,
      p_proposed_price: payload.proposedPrice != null ? Number(payload.proposedPrice) : null,
      p_currency: payload.currency || 'CDF',
      p_unit: payload.unit || 'kg',
      p_category_id: payload.categoryId || null,
      p_images: payload.images || [],
      p_stock: payload.stock != null ? Number(payload.stock) : 0,
      p_submit: payload.submit !== false,
    });

    if (error) throw error;

    const product = data?.product || data;
    if (data?.needs_admin_review && product?.id) {
      await this.notifyAdminsOfSubmission(product, data?.images_changed ? 'image_change' : 'new_product');
    }

    return { product, needsAdminReview: !!data?.needs_admin_review };
  },

  async submitProposal(productId) {
    const { data, error } = await supabase.rpc('submit_farmer_product_proposal', {
      p_product_id: productId,
    });

    if (error) throw error;

    const product = data?.product || data;
    if (data?.needs_admin_review && product?.id) {
      await this.notifyAdminsOfSubmission(
        product,
        product.review_status === 'pending_review' ? 'new_product' : 'image_change'
      );
    }
    return product;
  },

  async notifyAdminsOfSubmission(product, reviewKind = 'new_product') {
    try {
      const { data: admins, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (error || !admins?.length) return;

      const isImageChange = reviewKind === 'image_change';
      await Promise.all(
        admins.map((admin) =>
          notificationService.createNotification({
            userId: admin.id,
            type: 'admin_product_review',
            title: isImageChange ? 'Photos produit à valider' : 'Produit à valider',
            message: isImageChange
              ? `Nouvelles photos pour « ${product?.name || 'Produit'} » en attente de validation.`
              : `Nouvelle proposition : ${product?.name || 'Produit'} en attente de validation.`,
            data: {
              product_id: product?.id,
              product_name: product?.name,
              farm_id: product?.farm_id,
              review_kind: reviewKind,
              adminAction: true,
            },
            priority: 2,
          })
        )
      );
    } catch (notifyError) {
      console.warn('[farmerProposalService] Notification admin ignorée:', notifyError);
    }
  },
};
