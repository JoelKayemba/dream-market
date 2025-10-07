import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from '../../../components/ui';
import { 
  fetchAllAnalytics,
  selectAllAnalytics,
  selectAnalyticsLoading,
  selectAnalyticsError,
  setPeriod,
  setTopLimit
} from '../../../store/admin/analyticsSlice';

const { width } = Dimensions.get('window');

// Composant pour les cartes de statistiques
const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statHeader}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statTitle}>{title}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    {trend && (
      <View style={styles.trendContainer}>
        <Ionicons 
          name={trend.direction === 'up' ? 'trending-up' : 'trending-down'} 
          size={16} 
          color={trend.direction === 'up' ? '#4CAF50' : '#F44336'} 
        />
        <Text style={[
          styles.trendText, 
          { color: trend.direction === 'up' ? '#4CAF50' : '#F44336' }
        ]}>
          {trend.value}%
        </Text>
      </View>
    )}
  </View>
);

// Composant pour les graphiques simples (représentation textuelle)
const SimpleChart = ({ title, data, type = 'bar', showUSD = false }) => (
  <View style={styles.chartCard}>
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={styles.chartContainer}>
      {data && data.length > 0 ? (
        data.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.chartBar}>
            <View style={styles.barInfo}>
              <Text style={styles.barLabel}>{item.label}</Text>
              <View style={styles.barValues}>
                <Text style={styles.barValue}>{item.value.toLocaleString()} CDF</Text>
                {showUSD && item.usdValue > 0 && (
                  <Text style={styles.barValueUSD}>${item.usdValue.toLocaleString()}</Text>
                )}
              </View>
            </View>
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    width: `${Math.min((item.value / Math.max(...data.map(d => d.value))) * 100, 100)}%`,
                    backgroundColor: item.color || '#2196F3'
                  }
                ]} 
              />
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noData}>Aucune donnée disponible</Text>
      )}
    </View>
  </View>
);


export default function AnalyticsDashboard({ navigation }) {
  const dispatch = useDispatch();
  const analytics = useSelector(selectAllAnalytics);
  const loading = useSelector(selectAnalyticsLoading);
  const error = useSelector(selectAnalyticsError);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  // Charger les analytiques au montage
  useEffect(() => {
    dispatch(fetchAllAnalytics());
  }, [dispatch]);

  // Rafraîchir les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchAllAnalytics());
    setRefreshing(false);
  };

  // Changer la période
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    dispatch(setPeriod(period));
    dispatch(fetchAllAnalytics());
  };

  // Formater les données pour les graphiques
  const formatRevenueData = () => {
    if (!analytics.revenue?.daily_data) return [];
    return analytics.revenue.daily_data.slice(-7).map(item => ({
      label: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      value: item.cdf || 0,
      usdValue: item.usd || 0,
      color: '#4CAF50'
    }));
  };

  const formatOrdersData = () => {
    if (!analytics.orders?.daily_data) return [];
    return analytics.orders.daily_data.slice(-7).map(item => ({
      label: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      value: item.total || 0,
      color: '#2196F3'
    }));
  };


  return (
    <SafeAreaView style={styles.container}>
      <Container style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#283106" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytiques</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={loading}
          >
            <Ionicons name="refresh" size={24} color="#283106" />
          </TouchableOpacity>
        </View>

        {/* Sélecteur de période */}
        <View style={styles.periodSelector}>
          {[7, 30, 90].map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive
              ]}
              onPress={() => handlePeriodChange(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive
              ]}>
                {period} jours
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Container>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Statistiques principales */}
        {analytics.dashboard && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Utilisateurs"
                value={analytics.dashboard.users?.total || 0}
                subtitle={`+${analytics.dashboard.users?.new_this_month || 0} ce mois`}
                icon="people-outline"
                color="#4CAF50"
                trend={analytics.growth?.users ? {
                  direction: analytics.growth.users.growth_percent >= 0 ? 'up' : 'down',
                  value: Math.abs(analytics.growth.users.growth_percent)
                } : null}
              />
              <StatCard
                title="Commandes"
                value={analytics.dashboard.orders?.total || 0}
                subtitle={`${analytics.dashboard.orders?.pending || 0} en attente`}
                icon="receipt-outline"
                color="#2196F3"
                trend={analytics.growth?.orders ? {
                  direction: analytics.growth.orders.growth_percent >= 0 ? 'up' : 'down',
                  value: Math.abs(analytics.growth.orders.growth_percent)
                } : null}
              />
              <StatCard
                title="Revenus"
                value={`${Math.round(analytics.dashboard.orders?.revenue_total_cdf || 0).toLocaleString()} CDF`}
                subtitle={`${Math.round(analytics.dashboard.orders?.revenue_total_usd || 0).toLocaleString()} USD`}
                icon="cash-outline"
                color="#FF9800"
              />
              <StatCard
                title="Produits"
                value={analytics.dashboard.products?.total || 0}
                subtitle={`${analytics.dashboard.products?.active || 0} actifs`}
                icon="leaf-outline"
                color="#4CAF50"
                trend={analytics.growth?.products ? {
                  direction: analytics.growth.products.growth_percent >= 0 ? 'up' : 'down',
                  value: Math.abs(analytics.growth.products.growth_percent)
                } : null}
              />
            </View>
          </View>
        )}

        {/* Graphiques */}
        <View style={styles.chartsSection}>
          <Text style={styles.sectionTitle}>Évolution récente</Text>
          
          <SimpleChart
            title="Revenus (7 derniers jours)"
            data={formatRevenueData()}
            type="bar"
            showUSD={true}
          />
          
          <SimpleChart
            title="Commandes (7 derniers jours)"
            data={formatOrdersData()}
            type="bar"
          />
        </View>


        {/* Message d'erreur */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Message de chargement */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des analytiques...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {

    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
  },
  refreshButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  periodButtonActive: {
    backgroundColor: '#283106',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 44) / 2,
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
    color: '#666',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartsSection: {
    padding: 16,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 12,
  },
  chartBar: {
    gap: 8,
  },
  barInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 14,
    color: '#666',
  },
  barValues: {
    alignItems: 'flex-end',
  },
  barValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
  },
  barValueUSD: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF9800',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    margin: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    color: '#F44336',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
});
