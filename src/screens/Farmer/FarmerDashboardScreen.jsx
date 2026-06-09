import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui';
import { useFarmerDataRefresh } from '../../hooks/useFarmerDataRefresh';
import {
  fetchFarmerDashboard,
  selectFarmerStats,
  selectFarmerLoading,
  selectFarmerError,
} from '../../store/farmer/farmerSlice';

const formatMoney = (amount, currency = 'CDF') => {
  const value = Number(amount) || 0;
  if (currency === 'USD') return `$${value.toFixed(2)}`;
  return `${Math.round(value).toLocaleString('fr-FR')} CDF`;
};

const StatCard = ({ icon, label, value, accent = '#2E7D32' }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${accent}18` }]}>
      <Ionicons name={icon} size={20} color={accent} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function FarmerDashboardScreen() {
  const stats = useSelector(selectFarmerStats);
  const loading = useSelector(selectFarmerLoading);
  const error = useSelector(selectFarmerError);
  const { refreshing, onRefresh } = useFarmerDataRefresh(fetchFarmerDashboard);

  return (
    <ScreenWrapper style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Espace producteur</Text>
          <Text style={styles.title}>{stats?.farm_name || 'Ma ferme'}</Text>
          <Text style={styles.subtitle}>Suivi de vos ventes via Dream Market</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{String(error)}</Text>
          </View>
        ) : null}

        {loading && !stats ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.grid}>
              <StatCard icon="receipt-outline" label="Commandes aujourd'hui" value={String(stats?.orders_today ?? 0)} />
              <StatCard icon="calendar-outline" label="Commandes ce mois" value={String(stats?.orders_month ?? 0)} accent="#1565C0" />
              <StatCard icon="cube-outline" label="Unités vendues" value={String(stats?.units_sold_month ?? 0)} accent="#6A1B9A" />
              <StatCard icon="leaf-outline" label="Produits en ligne" value={String(stats?.product_count ?? 0)} accent="#EF6C00" />
            </View>

            <View style={styles.revenueCard}>
              <Text style={styles.sectionTitle}>Ventes du mois (prix client)</Text>
              <Text style={styles.revenueValue}>{formatMoney(stats?.revenue_month_cdf, 'CDF')}</Text>
              {(stats?.revenue_month_usd || 0) > 0 ? (
                <Text style={styles.revenueSecondary}>{formatMoney(stats?.revenue_month_usd, 'USD')}</Text>
              ) : null}

              {(stats?.commission_rate || 0) > 0 ? (
                <View style={styles.commissionBox}>
                  <Text style={styles.commissionTitle}>
                    Commission Dream Field : {stats.commission_rate} %
                  </Text>
                  <Text style={styles.commissionLine}>
                    Prélevée : {formatMoney(stats?.commission_month_cdf, 'CDF')}
                    {(stats?.commission_month_usd || 0) > 0
                      ? ` · ${formatMoney(stats?.commission_month_usd, 'USD')}`
                      : ''}
                  </Text>
                  <Text style={styles.payoutLine}>
                    Votre part nette : {formatMoney(stats?.payout_month_cdf, 'CDF')}
                    {(stats?.payout_month_usd || 0) > 0
                      ? ` · ${formatMoney(stats?.payout_month_usd, 'USD')}`
                      : ''}
                  </Text>
                </View>
              ) : null}

              <Text style={styles.revenueHint}>
                Les reversements sont gérés par Dream Field après validation des commandes.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top produits du mois</Text>
              {(stats?.top_products || []).length === 0 ? (
                <Text style={styles.emptyText}>Pas encore de ventes ce mois-ci.</Text>
              ) : (
                (stats.top_products || []).map((item, index) => (
                  <View key={`${item.product_name}-${index}`} style={styles.topRow}>
                    <Text style={styles.topRank}>{index + 1}</Text>
                    <View style={styles.topContent}>
                      <Text style={styles.topName}>{item.product_name}</Text>
                      <Text style={styles.topMeta}>
                        {item.quantity} vendu{item.quantity > 1 ? 's' : ''} · {formatMoney(item.revenue)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F3' },
  content: { padding: 20, paddingBottom: 32 },
  header: { marginBottom: 20 },
  eyebrow: { fontSize: 12, fontWeight: '700', color: '#2E7D32', textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 26, fontWeight: '800', color: '#283106' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  revenueCard: {
    backgroundColor: '#283106',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  revenueValue: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginTop: 8 },
  revenueSecondary: { fontSize: 16, color: '#D1D8BD', marginTop: 4, fontWeight: '600' },
  revenueHint: { fontSize: 12, color: '#C5CEB4', marginTop: 12, lineHeight: 18 },
  commissionBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    gap: 4,
  },
  commissionTitle: { fontSize: 12, color: '#D1D8BD', fontWeight: '700' },
  commissionLine: { fontSize: 13, color: '#FFCDD2', fontWeight: '600' },
  payoutLine: { fontSize: 15, color: '#FFFFFF', fontWeight: '800', marginTop: 4 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#283106', marginBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  topRank: { width: 24, fontSize: 14, fontWeight: '800', color: '#2E7D32' },
  topContent: { flex: 1 },
  topName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  topMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  emptyText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  errorBox: { backgroundColor: '#FFEBEE', padding: 12, borderRadius: 16, marginBottom: 12 },
  errorText: { color: '#C62828', fontWeight: '600' },
});
