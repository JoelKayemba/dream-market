import { supabase } from '../config/supabase';

class AnalyticsService {
  // Récupérer toutes les statistiques du dashboard
  async getDashboardStats() {
    try {
      console.log('🔍 Récupération des statistiques du dashboard...');
      
      // Récupérer les données directement depuis les tables
      const [
        { count: totalUsers },
        { count: totalOrders },
        { count: totalProducts },
        { count: totalFarms },
        { count: totalServices }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('farms').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true })
      ]);

      // Récupérer les commandes livrées pour les revenus
      const { data: deliveredOrders, error: ordersError } = await supabase
        .from('orders')
        .select('totals')
        .eq('status', 'delivered');

      if (ordersError) {
        console.error('❌ Erreur lors de la récupération des commandes livrées:', ordersError);
      }

      // Calculer les revenus totaux
      let totalRevenueCDF = 0;
      let totalRevenueUSD = 0;

      deliveredOrders?.forEach(order => {
        const totals = order.totals || {};
        totalRevenueCDF += parseFloat(totals.totalCDF || totals.total || 0);
        totalRevenueUSD += parseFloat(totals.totalUSD || 0);
      });

      const stats = {
        users: {
          total: totalUsers || 0,
          new_today: 0, // TODO: calculer si nécessaire
          new_this_week: 0, // TODO: calculer si nécessaire
          new_this_month: 0 // TODO: calculer si nécessaire
        },
        orders: {
          total: totalOrders || 0,
          pending: 0, // TODO: calculer si nécessaire
          delivered: 0, // TODO: calculer si nécessaire
          cancelled: 0, // TODO: calculer si nécessaire
          revenue_total_cdf: totalRevenueCDF,
          revenue_total_usd: totalRevenueUSD,
          revenue_this_month: totalRevenueCDF + (totalRevenueUSD * 2500) // Approximation
        },
        products: {
          total: totalProducts || 0,
          active: 0, // TODO: calculer si nécessaire
          inactive: 0, // TODO: calculer si nécessaire
          organic: 0 // TODO: calculer si nécessaire
        },
        farms: {
          total: totalFarms || 0,
          verified: 0 // TODO: calculer si nécessaire
        },
        services: {
          total: totalServices || 0,
          active: 0 // TODO: calculer si nécessaire
        }
      };

      console.log('✅ Statistiques dashboard calculées:', stats);
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques dashboard:', error);
      throw error;
    }
  }

  // Récupérer les analytiques de revenus
  async getRevenueAnalytics(periodDays = 30) {
    try {
      console.log(`🔍 Récupération des revenus des commandes livrées (${periodDays} jours)...`);
      
      // Récupérer les commandes livrées des derniers jours
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, totals')
        .eq('status', 'delivered')
        .gte('created_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération des commandes:', error);
        throw error;
      }

      // Calculer les revenus par jour et par devise
      const dailyRevenue = {};
      let totalCDF = 0;
      let totalUSD = 0;

      orders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const totals = order.totals || {};
        
        if (!dailyRevenue[date]) {
          dailyRevenue[date] = { cdf: 0, usd: 0 };
        }

        // Calculer selon les devises
        const cdfAmount = parseFloat(totals.totalCDF || totals.total || 0);
        const usdAmount = parseFloat(totals.totalUSD || 0);
        
        dailyRevenue[date].cdf += cdfAmount;
        dailyRevenue[date].usd += usdAmount;
        totalCDF += cdfAmount;
        totalUSD += usdAmount;
      });

      // Transformer en format attendu
      const dailyData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
        date,
        cdf: revenue.cdf,
        usd: revenue.usd,
        total: revenue.cdf + (revenue.usd * 2500) // Conversion USD vers CDF (1 USD = 2500 CDF environ)
      }));

      const result = {
        period_days: periodDays,
        total_cdf: totalCDF,
        total_usd: totalUSD,
        total_equivalent: totalCDF + (totalUSD * 2500), // Total en CDF
        average_daily_cdf: totalCDF / periodDays,
        average_daily_usd: totalUSD / periodDays,
        daily_data: dailyData
      };

      console.log('✅ Revenus calculés:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des revenus:', error);
      throw error;
    }
  }

  // Récupérer les analytiques de commandes
  async getOrdersAnalytics(periodDays = 30) {
    try {
      console.log(`🔍 Récupération des commandes (${periodDays} jours)...`);
      
      // Récupérer les commandes des derniers jours
      const { data: orders, error } = await supabase
        .from('orders')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors de la récupération des commandes:', error);
        throw error;
      }

      // Calculer les commandes par jour et par statut
      const dailyOrders = {};
      let totalOrders = 0;
      let pendingCount = 0;
      let confirmedCount = 0;
      let preparingCount = 0;
      let shippedCount = 0;
      let deliveredCount = 0;
      let cancelledCount = 0;

      orders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        
        if (!dailyOrders[date]) {
          dailyOrders[date] = {
            total: 0,
            pending: 0,
            confirmed: 0,
            preparing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
          };
        }

        dailyOrders[date].total++;
        dailyOrders[date][order.status]++;
        totalOrders++;

        // Compter par statut
        switch (order.status) {
          case 'pending': pendingCount++; break;
          case 'confirmed': confirmedCount++; break;
          case 'preparing': preparingCount++; break;
          case 'shipped': shippedCount++; break;
          case 'delivered': deliveredCount++; break;
          case 'cancelled': cancelledCount++; break;
        }
      });

      // Transformer en format attendu
      const dailyData = Object.entries(dailyOrders).map(([date, counts]) => ({
        date,
        total: counts.total,
        pending: counts.pending,
        confirmed: counts.confirmed,
        preparing: counts.preparing,
        shipped: counts.shipped,
        delivered: counts.delivered,
        cancelled: counts.cancelled
      }));

      const result = {
        period_days: periodDays,
        total_orders: totalOrders,
        pending: pendingCount,
        confirmed: confirmedCount,
        preparing: preparingCount,
        shipped: shippedCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
        average_daily: totalOrders / periodDays,
        daily_data: dailyData
      };

      console.log('✅ Commandes calculées:', result);
      return result;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      throw error;
    }
  }


  // Récupérer les métriques de croissance
  async getGrowthMetrics() {
    try {
      console.log('🔍 Récupération des métriques de croissance...');
      
      // Pour simplifier, retourner des métriques basiques
      // TODO: Implémenter un calcul de croissance réel si nécessaire
      const growthMetrics = {
        users: {
          current: 0,
          previous: 0,
          growth_percent: 0
        },
        orders: {
          current: 0,
          previous: 0,
          growth_percent: 0
        },
        products: {
          current: 0,
          previous: 0,
          growth_percent: 0
        },
        farms: {
          current: 0,
          previous: 0,
          growth_percent: 0
        }
      };

      console.log('✅ Métriques de croissance (simplifiées):', growthMetrics);
      return growthMetrics;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques de croissance:', error);
      throw error;
    }
  }

  // Récupérer toutes les analytiques en une seule fois (revenus et commandes seulement)
  async getAllAnalytics() {
    try {
      console.log('🔍 Récupération des analytiques (revenus et commandes)...');
      
      const [
        dashboardStats,
        revenueAnalytics,
        ordersAnalytics,
        growthMetrics
      ] = await Promise.all([
        this.getDashboardStats(),
        this.getRevenueAnalytics(30),
        this.getOrdersAnalytics(30),
        this.getGrowthMetrics()
      ]);

      const allAnalytics = {
        dashboard: dashboardStats,
        revenue: revenueAnalytics,
        orders: ordersAnalytics,
        growth: growthMetrics,
        lastUpdated: new Date().toISOString()
      };

      console.log('✅ Analytiques récupérées:', allAnalytics);
      return allAnalytics;
    } catch (error) {
      console.error('Erreur lors de la récupération des analytiques:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
