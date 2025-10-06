import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button } from '../../../components/ui';

export default function DashboardAnalytics({ navigation }) {
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    // TODO: Remplacer par un appel API réel
    setAnalytics({
      totalRevenue: 45600,
      totalOrders: 890,
      totalUsers: 1250,
      totalProducts: 340,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
      usersGrowth: 15.2,
      productsGrowth: 5.7,
      topProducts: [
        { name: 'Tomates Bio', sales: 150, revenue: 525 },
        { name: 'Pommes Golden', sales: 120, revenue: 336 },
        { name: 'Carottes', sales: 95, revenue: 180.5 },
      ],
      recentOrders: [
        { id: 1, customer: 'Jean Dupont', amount: 45.50, date: '2024-01-15' },
        { id: 2, customer: 'Marie Martin', amount: 78.20, date: '2024-01-14' },
        { id: 3, customer: 'Pierre Durand', amount: 32.10, date: '2024-01-13' },
      ]
    });
    setLoading(false);
  };

  const MetricCard = ({ title, value, growth, icon, color }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.metricValue}>{value}</Text>
        </View>
        <View style={styles.growthContainer}>
          <Ionicons 
            name={growth > 0 ? 'trending-up' : 'trending-down'} 
            size={16} 
            color={growth > 0 ? '#4CAF50' : '#F44336'} 
          />
          <Text style={[
            styles.growthText, 
            { color: growth > 0 ? '#4CAF50' : '#F44336' }
          ]}>
            {growth > 0 ? '+' : ''}{growth}%
          </Text>
        </View>
      </View>
    </View>
  );

  const TopProductCard = ({ product, index }) => (
    <View style={styles.topProductCard}>
      <View style={styles.productRank}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productSales}>{product.sales} ventes</Text>
      </View>
      <Text style={styles.productRevenue}>{product.revenue}€</Text>
    </View>
  );

  const RecentOrderCard = ({ order }) => (
    <View style={styles.recentOrderCard}>
      <View style={styles.orderInfo}>
        <Text style={styles.orderId}>Commande #{order.id}</Text>
        <Text style={styles.orderCustomer}>{order.customer}</Text>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderAmount}>{order.amount}€</Text>
        <Text style={styles.orderDate}>{order.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadAnalytics}
        >
          <Ionicons name="refresh-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Métriques Principales</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des analytics...</Text>
            </View>
          ) : (
            <>
              {/* Métriques principales */}
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Revenus Totaux"
                  value={`${analytics.totalRevenue.toLocaleString()}€`}
                  growth={analytics.revenueGrowth}
                  icon="cash-outline"
                  color="#4CAF50"
                />
                <MetricCard
                  title="Commandes Totales"
                  value={analytics.totalOrders.toLocaleString()}
                  growth={analytics.ordersGrowth}
                  icon="receipt-outline"
                  color="#2196F3"
                />
                <MetricCard
                  title="Utilisateurs Totaux"
                  value={analytics.totalUsers.toLocaleString()}
                  growth={analytics.usersGrowth}
                  icon="people-outline"
                  color="#FF9800"
                />
                <MetricCard
                  title="Produits Totaux"
                  value={analytics.totalProducts.toLocaleString()}
                  growth={analytics.productsGrowth}
                  icon="leaf-outline"
                  color="#9C27B0"
                />
              </View>

              {/* Top produits */}
              <View style={styles.topProductsSection}>
                <Text style={styles.sectionTitle}>Top Produits</Text>
                <View style={styles.topProductsList}>
                  {analytics.topProducts.map((product, index) => (
                    <TopProductCard key={index} product={product} index={index} />
                  ))}
                </View>
              </View>

              {/* Commandes récentes */}
              <View style={styles.recentOrdersSection}>
                <Text style={styles.sectionTitle}>Commandes Récentes</Text>
                <View style={styles.recentOrdersList}>
                  {analytics.recentOrders.map((order) => (
                    <RecentOrderCard key={order.id} order={order} />
                  ))}
                </View>
              </View>
            </>
          )}
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  analyticsSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  topProductsSection: {
    marginBottom: 24,
  },
  topProductsList: {
    gap: 8,
  },
  topProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 2,
  },
  productSales: {
    fontSize: 12,
    color: '#777E5C',
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  recentOrdersSection: {
    marginBottom: 24,
  },
  recentOrdersList: {
    gap: 8,
  },
  recentOrderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 2,
  },
  orderCustomer: {
    fontSize: 12,
    color: '#777E5C',
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#777E5C',
  },
});




