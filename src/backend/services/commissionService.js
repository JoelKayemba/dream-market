import { supabase } from '../config/supabase';
import { buildOrderItemWithCommission } from '../../utils/commission';

export const commissionService = {
  async getFarmCommissionRates(farmIds = []) {
    const uniqueIds = [...new Set(farmIds.filter(Boolean))];
    if (uniqueIds.length === 0) return {};

    const { data, error } = await supabase
      .from('farms')
      .select('id, commission_rate')
      .in('id', uniqueIds);

    if (error) throw error;

    return (data || []).reduce((acc, farm) => {
      acc[farm.id] = Number(farm.commission_rate) || 0;
      return acc;
    }, {});
  },

  async buildOrderItemsWithCommission(cartItems) {
    const farmIds = cartItems.map(
      (item) => item.product?.farm_id || item.product?.farms?.id || null
    );
    const ratesByFarm = await this.getFarmCommissionRates(farmIds);

    return cartItems.map((item) => {
      const farmId = item.product?.farm_id || item.product?.farms?.id || null;
      const subtotal = (Number(item.product?.price) || 0) * (Number(item.quantity) || 0);
      const baseItem = {
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        product_currency: item.product.currency || 'CDF',
        product_image: item.product.images?.[0] || item.product.image || null,
        farm_id: farmId,
        farm_name: item.product.farms?.name || null,
        quantity: item.quantity,
        subtotal,
      };
      const rate = farmId ? ratesByFarm[farmId] ?? 0 : 0;
      return buildOrderItemWithCommission(baseItem, rate);
    });
  },

  async getAdminCommissionDashboard({ days = null, status = 'delivered' } = {}) {
    const { data, error } = await supabase.rpc('get_admin_commission_dashboard', {
      p_days: days,
      p_status: status,
    });
    if (error) throw error;
    return data || { totals: {}, farms: [] };
  },
};
