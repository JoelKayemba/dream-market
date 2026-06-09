import { supabase } from '../config/supabase';

export const farmerStatsService = {
  async getDashboardStats() {
    const { data, error } = await supabase.rpc('get_farmer_dashboard_stats');
    if (error) throw error;
    return data || {};
  },

  async getMyFarmProfile() {
    const { data, error } = await supabase.rpc('get_my_farm_profile');
    if (error) throw error;
    return data || { found: false };
  },

  async getProducts() {
    const { data, error } = await supabase.rpc('get_farmer_products');
    if (error) throw error;
    return data || [];
  },

  async getSales({ limit = 20, offset = 0 } = {}) {
    const { data, error } = await supabase.rpc('get_farmer_sales', {
      p_limit: limit,
      p_offset: offset,
    });
    if (error) throw error;
    return data?.sales || [];
  },
};
