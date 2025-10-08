import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Container from '../../components/ui/Container';
import AdminNotificationCenter from '../../components/admin/AdminNotificationCenter';
import { useAuth } from '../../hooks/useAuth';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import BackgroundNotificationService from '../../services/backgroundNotificationService';
import { fetchOrders, selectOrderStats } from '../../store/admin/ordersSlice';
import { fetchServices, selectServiceStats } from '../../store/admin/servicesSlice';
import { selectAdminProducts, fetchProducts } from '../../store/admin/productSlice';
import { selectAllFarms, fetchFarms } from '../../store/admin/farmSlice';
import { fetchUserStats, selectAdminUsersStats } from '../../store/admin/usersSlice';
import { fetchAllAnalytics, selectDashboardStats } from '../../store/admin/analyticsSlice';
import { ScreenWrapper } from '../../components/ui';

export default function AdminDashboard({ navigation }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  
  // Hook pour les notifications admin
  const { unreadAdminCount } = useAdminNotifications();
  const orderStats = useSelector(selectOrderStats);
  const serviceStats = useSelector(selectServiceStats);
  const products = useSelector(selectAdminProducts);
  const farms = useSelector(selectAllFarms);
  const userStats = useSelector(selectAdminUsersStats);
  const analyticsStats = useSelector(selectDashboardStats);
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalFarms: 0,
    totalOrders: 0,
    revenueCDF: 0,
    revenueUSD: 0,
    pendingOrders: 0,
    pendingFarms: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  // Fonction pour formater le temps écoulé
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} h`;
    return `${Math.floor(diffInMinutes / 1440)} j`;
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchOrders()),
      dispatch(fetchServices()),
      dispatch(fetchProducts()),
      dispatch(fetchFarms()),
      dispatch(fetchUserStats()),
      dispatch(fetchAllAnalytics())
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [dispatch]);

  useEffect(() => {
    onRefresh();
  }, [dispatch]);

  const loadDashboardData = () => {
    // Calculer les statistiques à partir des données réelles
    const totalProducts = products.length;
    const totalFarms = farms.length;
    const activeProducts = products.filter(p => p.is_active).length;
    const verifiedFarms = farms.filter(f => f.verified).length;
    const pendingFarms = farms.filter(f => !f.verified).length;
    const pendingOrders = orderStats.pending || 0;
    
    // Récupérer les revenus des commandes livrées uniquement
    const revenueCDF = analyticsStats?.orders?.revenue_total_cdf || 0;
    const revenueUSD = analyticsStats?.orders?.revenue_total_usd || 0;
    
    setStats({
      totalProducts: totalProducts,
      totalFarms: totalFarms,
      totalOrders: orderStats.total || 0,
      revenueCDF: revenueCDF,
      revenueUSD: revenueUSD,
      totalServices: serviceStats.total || 0,
      activeProducts: activeProducts,
      verifiedFarms: verifiedFarms,
      pendingFarms: pendingFarms,
      pendingOrders: pendingOrders
    });

    // Générer des activités récentes basées sur les données réelles
    const recentProducts = [...products]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);
    
    const recentFarms = [...farms]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);

    const recentOrders = orderStats.recentOrders || [];

    const activities = [
      ...recentProducts.map((product) => ({
        id: `product-${product.id}`,
        type: 'product',
        message: `Nouveau produit: "${product.name}"`,
        time: formatTimeAgo(product.created_at),
        priority: 1
      })),
      ...recentFarms.map((farm) => ({
        id: `farm-${farm.id}`,
        type: 'farm',
        message: farm.verified ? `Ferme vérifiée: "${farm.name}"` : `Nouvelle ferme en attente: "${farm.name}"`,
        time: formatTimeAgo(farm.created_at),
        priority: farm.verified ? 2 : 0 // Priorité haute pour les fermes en attente
      })),
      ...recentOrders.map((order) => ({
        id: `order-${order.id}`,
        type: 'order',
        message: `Nouvelle commande #${order.id}`,
        time: formatTimeAgo(order.created_at),
        priority: 1
      }))
    ];
    
    const sortedActivities = [...activities]
      .sort((a, b) => {
        // Priorité d'abord, puis temps
        if (a.priority !== b.priority) return b.priority - a.priority;
        return new Date(b.time) - new Date(a.time);
      })
      .slice(0, 5);

    setRecentActivities(sortedActivities);
  };

  // Mettre à jour les stats quand les données changent
  useEffect(() => {
    loadDashboardData();
  }, [products, farms, orderStats, serviceStats, analyticsStats]);

  // Actions rapides par ordre de priorité
  const quickActions = [
    {
      id: 1,
      title: 'Commandes en Attente',
      subtitle: `${stats.pendingOrders} en attente`,
      icon: 'time-outline',
      color: '#FF6B35',
      route: 'OrdersManagement',
      badge: stats.pendingOrders,
      priority: 0 // Haute priorité
    },
    {
      id: 2,
      title: 'Fermes à Vérifier',
      subtitle: `${stats.pendingFarms} en attente`,
      icon: 'business-outline',
      color: '#FF9800',
      route: 'FarmsManagement',
      badge: stats.pendingFarms,
      priority: 1
    },
    {
      id: 4,
      title: 'Gérer les Produits',
      subtitle: `${stats.totalProducts} produits`,
      icon: 'leaf-outline',
      color: '#4CAF50',
      route: 'ProductsManagement',
      priority: 2
    },
    {
      id: 5,
      title: 'Gérer les Services',
      subtitle: `${stats.totalServices} services`,
      icon: 'construct-outline',
      color: '#2196F3',
      route: 'AdminServicesManagement',
      priority: 3
    },
   
  ];
  
  const sortedQuickActions = [...quickActions].sort((a, b) => a.priority - b.priority); // Trier par priorité

  const handleQuickAction = (action) => {
    switch (action.route) {
      case 'AnalyticsDashboard':
        navigation.navigate('AnalyticsDashboard');
        break;
      case 'ProductsManagement':
        navigation.navigate('ProductsManagement');
        break;
      case 'FarmsManagement':
        navigation.navigate('FarmsManagement');
        break;
      case 'AdminServicesManagement':
        navigation.navigate('AdminServicesManagement');
        break;
      case 'UsersManagement':
        navigation.navigate('UsersManagement');
        break;
      case 'OrdersManagement':
        navigation.navigate('OrdersManagement');
        break;
      case 'TestNotifications':
        // Tester les notifications en arrière-plan
        BackgroundNotificationService.sendTestNotification();
        break;
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? '#4CAF50' : '#F44336' }]}>
            <Ionicons 
              name={trend > 0 ? 'trending-up' : 'trending-down'} 
              size={12} 
              color="#FFF" 
            />
            <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const PriorityBadge = ({ count, color }) => {
    if (!count || count === 0) return null;
    
    return (
      <View style={[styles.priorityBadge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    );
  };

  const ActivityItem = ({ activity }) => (
    <View style={[
      styles.activityItem,
      activity.priority === 0 && styles.priorityActivity
    ]}>
      <View style={[
        styles.activityIcon,
        { backgroundColor: 
          activity.type === 'order' ? '#FF6B3520' : 
          activity.type === 'user' ? '#2196F320' :
          activity.type === 'farm' ? '#FF980020' : '#4CAF5020'
        }
      ]}>
        <Ionicons 
          name={activity.type === 'order' ? 'receipt' : 
                activity.type === 'user' ? 'person' :
                activity.type === 'farm' ? 'business' : 'leaf'} 
          size={16} 
          color={
            activity.type === 'order' ? '#FF6B35' : 
            activity.type === 'user' ? '#2196F3' :
            activity.type === 'farm' ? '#FF9800' : '#4CAF50'
          } 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{activity.message}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
      {activity.priority === 0 && (
        <Ionicons name="alert-circle" size={16} color="#FF6B35" />
      )}
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color="#283106" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tableau de Bord Admin</Text>
          <Text style={styles.headerSubtitle}>
            Bienvenue, {user?.firstName}
            {unreadAdminCount > 0 && ` • ${unreadAdminCount} nouvelle(s)`}
          </Text>
        </View>
        <AdminNotificationCenter navigation={navigation} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Section Alertes Prioritaires */}
        {(stats.pendingOrders > 0 || stats.pendingFarms > 0) && (
          <Container style={styles.alertsSection}>
            <View style={styles.alertsHeader}>
              <Ionicons name="warning-outline" size={20} color="#FF6B35" />
              <Text style={styles.alertsTitle}>Actions Requises</Text>
            </View>
            <View style={styles.alertsGrid}>
              {stats.pendingOrders > 0 && (
                <TouchableOpacity 
                  style={styles.alertCard}
                  onPress={() => navigation.navigate('OrdersManagement')}
                >
                  <View style={styles.alertContent}>
                    <Ionicons name="time-outline" size={24} color="#FF6B35" />
                    <View style={styles.alertText}>
                      <Text style={styles.alertTitle}>Commandes en attente</Text>
                      <Text style={styles.alertCount}>{stats.pendingOrders} commande(s)</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
                </TouchableOpacity>
              )}
              {stats.pendingFarms > 0 && (
                <TouchableOpacity 
                  style={styles.alertCard}
                  onPress={() => navigation.navigate('FarmsManagement')}
                >
                  <View style={styles.alertContent}>
                    <Ionicons name="business-outline" size={24} color="#FF9800" />
                    <View style={styles.alertText}>
                      <Text style={styles.alertTitle}>Fermes à vérifier</Text>
                      <Text style={styles.alertCount}>{stats.pendingFarms} ferme(s)</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#FF9800" />
                </TouchableOpacity>
              )}
            </View>
          </Container>
        )}

        {/* Statistiques Principales */}
        <Container style={styles.statsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Aperçu Global</Text>
            <TouchableOpacity 
              style={styles.analyticsButton}
              onPress={() => navigation.navigate('AnalyticsDashboard')}
            >
              <Ionicons name="bar-chart-outline" size={18} color="#9C27B0" />
              <Text style={styles.analyticsButtonText}>Analytiques</Text>
              <Ionicons name="chevron-forward" size={18} color="#9C27B0" />
            </TouchableOpacity>
          </View>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Revenus CDF" 
              value={`${Math.round(stats.revenueCDF || 0).toLocaleString()} FC`} 
              subtitle="Commandes livrées"
              icon="cash-outline" 
              color="#4CAF50"
            />
            <StatCard 
              title="Revenus USD" 
              value={`$${Math.round(stats.revenueUSD || 0).toLocaleString()}`} 
              subtitle="Commandes livrées"
              icon="logo-usd" 
              color="#FF9800"
            />
            <StatCard 
              title="Commandes Total" 
              value={stats.totalOrders?.toLocaleString() || '0'} 
              subtitle="Toutes les commandes"
              icon="cart-outline" 
              color="#2196F3"
            />
            <StatCard 
              title="Produits Actifs" 
              value={stats.activeProducts?.toLocaleString() || '0'} 
              subtitle={`sur ${stats.totalProducts}`}
              icon="leaf-outline" 
              color="#9C27B0" 
            />
          </View>
        </Container>

        {/* Actions rapides */}
        <Container style={styles.actionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actions Rapides</Text>
            <Text style={styles.sectionSubtitle}>Gestion quotidienne</Text>
          </View>
          <View style={styles.actionsGrid}>
            {sortedQuickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleQuickAction(action)}
              >
                <View style={styles.actionHeader}>
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <Ionicons name={action.icon} size={20} color="#FFFFFF" />
                  </View>
                  <PriorityBadge count={action.badge} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Container>

        {/* Activités récentes */}
        <Container style={styles.activitiesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activités Récentes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activitiesList}>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <Text style={styles.noActivities}>Aucune activité récente</Text>
            )}
          </View>
        </Container>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  // Section Alertes
  alertsSection: {
    marginTop: 16,
    padding: 0,
    overflow: 'hidden',
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF8F6',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5DE',
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  alertsGrid: {
    gap: 1,
    backgroundColor: '#FFE5DE',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertText: {
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  alertCount: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  // Sections communes
  statsSection: {
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  analyticsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C27B0',
  },
  actionsSection: {
    marginTop: 16,
  },
  activitiesSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4299E1',
    fontWeight: '500',
  },
  // Cartes de statistiques
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  // Actions rapides
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
  },
  // Activités
  activitiesList: {
    gap: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityActivity: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
    backgroundColor: '#FFF8F6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#718096',
  },
  noActivities: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: 14,
    fontStyle: 'italic',
    padding: 20,
  },
});