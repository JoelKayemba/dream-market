import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Container from '../../components/ui/Container';
import { useAuth } from '../../hooks/useAuth';
import { fetchOrders, selectOrderStats } from '../../store/admin/ordersSlice';
import { fetchServices, selectServiceStats } from '../../store/admin/servicesSlice';

export default function AdminDashboard({ navigation }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const orderStats = useSelector(selectOrderStats);
  const serviceStats = useSelector(selectServiceStats);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalFarms: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Charger les commandes, services et statistiques
    dispatch(fetchOrders());
    dispatch(fetchServices());
    loadDashboardData();
  }, [dispatch]);

  const loadDashboardData = () => {
    // TODO: Remplacer par des appels API réels
    setStats({
      totalUsers: 1250,
      totalProducts: 340,
      totalFarms: 45,
      totalOrders: orderStats.total || 890,
      totalRevenue: orderStats.totalRevenue || 45600,
      totalServices: serviceStats.total || 15
    });

    setRecentActivities([
      { id: 1, type: 'order', message: 'Nouvelle commande #1234', time: '2 min' },
      { id: 2, type: 'user', message: 'Nouvel utilisateur inscrit', time: '5 min' },
      { id: 3, type: 'farm', message: 'Ferme en attente de validation', time: '10 min' },
      { id: 4, type: 'product', message: 'Produit ajouté par Ferme Bio', time: '15 min' }
    ]);
  };

  // Mettre à jour les stats quand les données changent
  useEffect(() => {
    setStats(prevStats => ({
      ...prevStats,
      totalOrders: orderStats.total || prevStats.totalOrders,
      totalRevenue: orderStats.totalRevenue || prevStats.totalRevenue,
      totalServices: serviceStats.total || prevStats.totalServices
    }));
  }, [orderStats, serviceStats]);

  const quickActions = [
    {
      id: 1,
      title: 'Gérer les Commandes',
      subtitle: 'Suivi, statuts, contact',
      icon: 'receipt-outline',
      color: '#4CAF50',
      route: 'OrdersManagement'
    },
    {
      id: 2,
      title: 'Gérer les Produits',
      subtitle: 'Ajouter, modifier, supprimer',
      icon: 'leaf-outline',
      color: '#2196F3',
      route: 'ProductsManagement'
    },
    {
      id: 3,
      title: 'Gérer les Fermes',
      subtitle: 'Validation et gestion',
      icon: 'business-outline',
      color: '#FF9800',
      route: 'FarmsManagement'
    },
    {
      id: 4,
      title: 'Gérer les Services',
      subtitle: 'Services et tarifs',
      icon: 'construct-outline',
      color: '#9C27B0',
      route: 'AdminServicesManagement'
    },
    {
      id: 6,
      title: 'Analytics',
      subtitle: 'Statistiques et rapports',
      icon: 'analytics-outline',
      color: '#607D8B',
      route: 'DashboardAnalytics'
    }
  ];

  const handleQuickAction = (action) => {
    console.log('Action admin:', action.title);
    
    switch (action.route) {
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
      case 'DashboardAnalytics':
        navigation.navigate('DashboardAnalytics');
        break;
      default:
        Alert.alert('Info', `Navigation vers ${action.title} - À implémenter`);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  const ActivityItem = ({ activity }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Ionicons 
          name={activity.type === 'order' ? 'receipt' : 
                activity.type === 'user' ? 'person' :
                activity.type === 'farm' ? 'business' : 'leaf'} 
          size={16} 
          color="#4CAF50" 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityMessage}>{activity.message}</Text>
        <Text style={styles.activityTime}>{activity.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color="#283106" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tableau de Bord </Text>
          <Text style={styles.headerSubtitle}>Bienvenue, {user?.firstName}</Text>
        </View>
        
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistiques */}
        <Container style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistiques Générales</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Utilisateurs" 
              value={stats.totalUsers.toLocaleString()} 
              icon="people-outline" 
              color="#4CAF50" 
            />
            <StatCard 
              title="Produits" 
              value={stats.totalProducts.toLocaleString()} 
              icon="leaf-outline" 
              color="#2196F3" 
            />
            <StatCard 
              title="Fermes" 
              value={stats.totalFarms.toLocaleString()} 
              icon="business-outline" 
              color="#FF9800" 
            />
            <StatCard 
              title="Commandes" 
              value={stats.totalOrders.toLocaleString()} 
              icon="receipt-outline" 
              color="#F44336" 
            />
          </View>
        </Container>

        {/* Actions rapides */}
        <Container style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleQuickAction(action)}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Container>

        {/* Activités récentes */}
        <Container style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Activités Récentes</Text>
          <View style={styles.activitiesList}>
            {recentActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 16,
  },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#777E5C',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionsSection: {
    paddingVertical: 20,
  },
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
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#777E5C',
    textAlign: 'center',
  },
  activitiesSection: {
    paddingVertical: 20,
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    color: '#283106',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#777E5C',
  },
});
