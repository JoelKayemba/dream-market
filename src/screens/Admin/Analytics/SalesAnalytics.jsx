import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Container, Button , ScreenWrapper } from '../../../components/ui';

export default function SalesAnalytics({ navigation }) {
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = () => {
    // TODO: Remplacer par un appel API réel
    setSalesData({
      totalSales: 45600,
      averageOrderValue: 51.2,
      totalOrders: 890,
      conversionRate: 3.2,
      dailySales: [
        { date: '2024-01-15', sales: 1200, orders: 25 },
        { date: '2024-01-14', sales: 980, orders: 20 },
        { date: '2024-01-13', sales: 1500, orders: 30 },
        { date: '2024-01-12', sales: 1100, orders: 22 },
        { date: '2024-01-11', sales: 1300, orders: 26 },
        { date: '2024-01-10', sales: 900, orders: 18 },
        { date: '2024-01-09', sales: 1400, orders: 28 },
      ],
      topCategories: [
        { name: 'Légumes', sales: 18500, percentage: 40.6 },
        { name: 'Fruits', sales: 12300, percentage: 27.0 },
        { name: 'Céréales', sales: 8900, percentage: 19.5 },
        { name: 'Épicerie', sales: 5900, percentage: 12.9 },
      ],
      monthlyTrend: [
        { month: 'Jan', sales: 45600 },
        { month: 'Fév', sales: 38900 },
        { month: 'Mar', sales: 42100 },
        { month: 'Avr', sales: 47800 },
        { month: 'Mai', sales: 51200 },
        { month: 'Juin', sales: 48900 },
      ]
    });
    setLoading(false);
  };

  const SalesMetricCard = ({ title, value, subtitle, icon, color }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.metricValue}>{value}</Text>
          {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  const CategoryCard = ({ category, index }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
      </View>
      <View style={styles.categoryBar}>
        <View 
          style={[
            styles.categoryBarFill, 
            { 
              width: `${category.percentage}%`,
              backgroundColor: index === 0 ? '#4CAF50' : 
                              index === 1 ? '#2196F3' : 
                              index === 2 ? '#FF9800' : '#9C27B0'
            }
          ]} 
        />
      </View>
      <Text style={styles.categorySales}>{category.sales.toLocaleString()}€</Text>
    </View>
  );

  const DailySalesCard = ({ day }) => (
    <View style={styles.dailySalesCard}>
      <Text style={styles.dailyDate}>{day.date}</Text>
      <Text style={styles.dailySales}>{day.sales}€</Text>
      <Text style={styles.dailyOrders}>{day.orders} commandes</Text>
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Ventes</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadSalesData}
        >
          <Ionicons name="refresh-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Métriques de Ventes</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des analytics...</Text>
            </View>
          ) : (
            <>
              {/* Métriques principales */}
              <View style={styles.metricsGrid}>
                <SalesMetricCard
                  title="Ventes Totales"
                  value={`${salesData.totalSales.toLocaleString()}€`}
                  subtitle="Ce mois"
                  icon="cash-outline"
                  color="#4CAF50"
                />
                <SalesMetricCard
                  title="Valeur Moyenne"
                  value={`${salesData.averageOrderValue}€`}
                  subtitle="Par commande"
                  icon="calculator-outline"
                  color="#2196F3"
                />
                <SalesMetricCard
                  title="Commandes Totales"
                  value={salesData.totalOrders.toLocaleString()}
                  subtitle="Ce mois"
                  icon="receipt-outline"
                  color="#FF9800"
                />
                <SalesMetricCard
                  title="Taux de Conversion"
                  value={`${salesData.conversionRate}%`}
                  subtitle="Visiteurs → Clients"
                  icon="trending-up-outline"
                  color="#9C27B0"
                />
              </View>

              {/* Ventes par catégorie */}
              <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>Ventes par Catégorie</Text>
                <View style={styles.categoriesList}>
                  {salesData.topCategories.map((category, index) => (
                    <CategoryCard key={index} category={category} index={index} />
                  ))}
                </View>
              </View>

              {/* Ventes quotidiennes */}
              <View style={styles.dailySalesSection}>
                <Text style={styles.sectionTitle}>Ventes Quotidiennes (7 derniers jours)</Text>
                <View style={styles.dailySalesGrid}>
                  {salesData.dailySales.map((day, index) => (
                    <DailySalesCard key={index} day={day} />
                  ))}
                </View>
              </View>
            </>
          )}
        </Container>
      </ScrollView>
    </ScreenWrapper>
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
  metricSubtitle: {
    fontSize: 12,
    color: '#777E5C',
    marginTop: 2,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesList: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  categoryBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categorySales: {
    fontSize: 14,
    color: '#777E5C',
  },
  dailySalesSection: {
    marginBottom: 24,
  },
  dailySalesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dailySalesCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dailyDate: {
    fontSize: 12,
    color: '#777E5C',
    marginBottom: 4,
  },
  dailySales: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  dailyOrders: {
    fontSize: 12,
    color: '#777E5C',
  },
});




