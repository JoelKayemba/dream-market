import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Dimensions, RefreshControl } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container , ScreenWrapper } from '../../../components/ui';
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
const StatCard = ({ title, value, subtitle, icon, color, trend, change }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statHeader}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    {change && (
      <View style={styles.changeContainer}>
        <Ionicons 
          name={change.value >= 0 ? 'arrow-up' : 'arrow-down'} 
          size={14} 
          color={change.value >= 0 ? '#4CAF50' : '#F44336'} 
        />
        <Text style={[
          styles.changeText, 
          { color: change.value >= 0 ? '#4CAF50' : '#F44336' }
        ]}>
          {Math.abs(change.value)}% vs période précédente
        </Text>
      </View>
    )}
  </View>
);

// Composant pour graphique en barres verticales amélioré
const BarChart = ({ title, data, color, showValues = true, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.noData}>Aucune donnée disponible</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={[styles.barChartContainer, { height }]}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0;
          
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                {showValues && item.value > 0 && (
                  <Text style={styles.barValueText}>
                    {item.value.toLocaleString()}
                  </Text>
                )}
                <View 
                  style={[
                    styles.barVertical, 
                    { 
                      height: barHeight,
                      backgroundColor: item.color || color
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barLabelVertical}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Composant pour graphique double (CDF + USD)
const DualBarChart = ({ title, data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.noData}>Aucune donnée disponible</Text>
      </View>
    );
  }

  const maxCDF = Math.max(...data.map(d => d.cdf || 0));
  const maxUSD = Math.max(...data.map(d => d.usd || 0));
  
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>CDF</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>USD</Text>
          </View>
        </View>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dualChartScroll}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.dualBarGroup}>
            <View style={styles.dualBarsContainer}>
              {/* Barre CDF */}
              <View style={styles.dualBarColumn}>
                {item.cdf > 0 && (
                  <Text style={styles.dualBarValue}>{item.cdf.toLocaleString()}</Text>
                )}
                <View 
                  style={[
                    styles.dualBar, 
                    { 
                      height: maxCDF > 0 ? (item.cdf / maxCDF) * 120 : 0,
                      backgroundColor: '#4CAF50'
                    }
                  ]} 
                />
              </View>
              
              {/* Barre USD */}
              <View style={styles.dualBarColumn}>
                {item.usd > 0 && (
                  <Text style={styles.dualBarValue}>${item.usd.toLocaleString()}</Text>
                )}
                <View 
                  style={[
                    styles.dualBar, 
                    { 
                      height: maxUSD > 0 ? (item.usd / maxUSD) * 120 : 0,
                      backgroundColor: '#FF9800'
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.dualBarLabel}>{item.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Composant pour carte récapitulative
const SummaryCard = ({ title, items, icon, color }) => (
  <View style={styles.summaryCard}>
    <View style={styles.summaryHeader}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.summaryTitle}>{title}</Text>
    </View>
    {items.map((item, index) => (
      <View key={index} style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{item.label}</Text>
        <Text style={[styles.summaryValue, { color: item.color || '#283106' }]}>
          {item.value}
        </Text>
      </View>
    ))}
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

  // Formater les données pour les graphiques de revenus (selon la période sélectionnée)
  const formatRevenueData = () => {
    if (!analytics.revenue?.daily_data) return [];
    const daysToShow = selectedPeriod === 7 ? 7 : selectedPeriod === 30 ? 14 : 30;
    return analytics.revenue.daily_data.slice(-daysToShow).map(item => ({
      label: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      cdf: item.cdf || 0,
      usd: item.usd || 0
    }));
  };

  // Formater les données pour le graphique des commandes
  const formatOrdersData = () => {
    if (!analytics.orders?.daily_data) return [];
    const daysToShow = selectedPeriod === 7 ? 7 : selectedPeriod === 30 ? 14 : 30;
    return analytics.orders.daily_data.slice(-daysToShow).map(item => ({
      label: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      value: item.total || 0,
      color: '#2196F3'
    }));
  };

  // Formater les données pour le graphique par statut
  const formatOrdersByStatus = () => {
    if (!analytics.orders) return [];
    return [
      { label: 'En attente', value: analytics.orders.pending || 0, color: '#FF9800' },
      { label: 'Confirmées', value: analytics.orders.confirmed || 0, color: '#2196F3' },
      { label: 'En préparation', value: analytics.orders.preparing || 0, color: '#9C27B0' },
      { label: 'Expédiées', value: analytics.orders.shipped || 0, color: '#3F51B5' },
      { label: 'Livrées', value: analytics.orders.delivered || 0, color: '#4CAF50' },
    ].filter(item => item.value > 0);
  };

  // Calculer la moyenne quotidienne
  const getDailyAverage = () => {
    if (!analytics.revenue?.daily_data || analytics.revenue.daily_data.length === 0) return { cdf: 0, usd: 0 };
    const days = selectedPeriod;
    return {
      cdf: Math.round((analytics.revenue?.total_cdf || 0) / days),
      usd: Math.round((analytics.revenue?.total_usd || 0) / days * 100) / 100
    };
  };

  const dailyAvg = getDailyAverage();

  return (
    <ScreenWrapper style={styles.container}>
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
            <Text style={styles.sectionTitle}>Vue d'ensemble - {selectedPeriod} derniers jours</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Revenus CDF"
                value={`${Math.round(analytics.revenue?.total_cdf || 0).toLocaleString()} FC`}
                subtitle="Commandes livrées"
                icon="cash-outline"
                color="#4CAF50"
              />
              <StatCard
                title="Revenus USD"
                value={`$${Math.round(analytics.revenue?.total_usd || 0).toLocaleString()}`}
                subtitle="Commandes livrées"
                icon="logo-usd"
                color="#FF9800"
              />
              <StatCard
                title="Total Commandes"
                value={analytics.orders?.total_orders || 0}
                subtitle={`${selectedPeriod} derniers jours`}
                icon="receipt-outline"
                color="#2196F3"
              />
              <StatCard
                title="Commandes Livrées"
                value={analytics.orders?.delivered || 0}
                subtitle={`${analytics.orders?.pending || 0} en attente`}
                icon="checkmark-circle-outline"
                color="#4CAF50"
              />
            </View>
          </View>
        )}

        {/* Cartes récapitulatives */}
        <View style={styles.summarySection}>
          <View style={styles.summaryGrid}>
            <SummaryCard
              title="Moyennes Quotidiennes"
              icon="calendar-outline"
              color="#2196F3"
              items={[
                { label: 'Revenu CDF/jour', value: `${dailyAvg.cdf.toLocaleString()} FC`, color: '#4CAF50' },
                { label: 'Revenu USD/jour', value: `$${dailyAvg.usd}`, color: '#FF9800' },
                { label: 'Commandes/jour', value: Math.round((analytics.orders?.total_orders || 0) / selectedPeriod) }
              ]}
            />
            
            <SummaryCard
              title="Statistiques Commandes"
              icon="stats-chart-outline"
              color="#9C27B0"
              items={[
                { label: 'Taux de livraison', value: `${Math.round(((analytics.orders?.delivered || 0) / (analytics.orders?.total_orders || 1)) * 100)}%`, color: '#4CAF50' },
                { label: 'En cours', value: (analytics.orders?.confirmed || 0) + (analytics.orders?.preparing || 0) + (analytics.orders?.shipped || 0), color: '#FF9800' },
                { label: 'Annulées', value: analytics.orders?.cancelled || 0, color: '#F44336' }
              ]}
            />
          </View>
        </View>

        {/* Graphiques */}
        <View style={styles.chartsSection}>
          <Text style={styles.sectionTitle}>Évolution des Revenus</Text>
          
          <DualBarChart
            title={`Revenus CDF & USD (${selectedPeriod === 7 ? '7' : selectedPeriod === 30 ? '14' : '30'} derniers jours)`}
            data={formatRevenueData()}
          />
          
          <BarChart
            title={`Commandes (${selectedPeriod === 7 ? '7' : selectedPeriod === 30 ? '14' : '30'} derniers jours)`}
            data={formatOrdersData()}
            color="#2196F3"
            height={180}
          />

          {formatOrdersByStatus().length > 0 && (
            <BarChart
              title="Répartition par Statut"
              data={formatOrdersByStatus()}
              color="#4CAF50"
              height={180}
            />
          )}
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statSubtitle: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  changeText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  summarySection: {
    padding: 16,
    paddingTop: 0,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartsSection: {
    padding: 16,
    paddingTop: 0,
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
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 8,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValueText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  barVertical: {
    width: '80%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 5,
  },
  barLabelVertical: {
    fontSize: 10,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  dualChartScroll: {
    paddingVertical: 10,
  },
  dualBarGroup: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  dualBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    gap: 4,
  },
  dualBarColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 28,
  },
  dualBarValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  dualBar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 5,
  },
  dualBarLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
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
