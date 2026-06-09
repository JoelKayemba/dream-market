import { supabase } from '../config/supabase';

export const farmerProductService = {
  async updateStock(productId, stock, isActive = null) {
    const { data, error } = await supabase.rpc('update_farmer_product_stock', {
      p_product_id: productId,
      p_stock: Math.max(0, parseInt(stock, 10) || 0),
      p_is_active: isActive,
    });

    if (error) throw error;
    return data?.product || data;
  },

  async getStockLogs(productId, limit = 10) {
    const { data, error } = await supabase.rpc('get_product_stock_logs', {
      p_product_id: productId,
      p_limit: limit,
    });

    if (error) throw error;
    return data?.logs || [];
  },
};

export const adminStockAlertService = {
  async getAlerts(limit = 30) {
    const { data, error } = await supabase.rpc('get_admin_stock_alerts', {
      p_limit: limit,
    });

    if (error) throw error;
    return data?.alerts || [];
  },
};
