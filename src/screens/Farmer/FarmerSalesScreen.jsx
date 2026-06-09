import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui';
import { useFarmerDataRefresh } from '../../hooks/useFarmerDataRefresh';
import {
  fetchFarmerSales,
  selectFarmerSales,
  selectFarmerSalesLoading,
} from '../../store/farmer/farmerSlice';
import { formatMoney } from '../../utils/commission';

const statusLabel = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'Préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const formatDualMoney = (cdf, usd) => {
  const parts = [];
  if (Number(cdf) > 0) parts.push(formatMoney(cdf, 'CDF'));
  if (Number(usd) > 0) parts.push(formatMoney(usd, 'USD'));
  return parts.length > 0 ? parts.join(' · ') : formatMoney(0, 'CDF');
};

export default function FarmerSalesScreen() {
  const sales = useSelector(selectFarmerSales);
  const loading = useSelector(selectFarmerSalesLoading);
  const { refreshing, onRefresh } = useFarmerDataRefresh(fetchFarmerSales);

  const renderItem = ({ item }) => {
    const items = Array.isArray(item.farm_items) ? item.farm_items : [];
    const date = item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : '—';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.order_number || `#${String(item.order_id).slice(0, 8)}`}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{statusLabel[item.status] || item.status}</Text>
          </View>
        </View>

        {items.map((line, index) => (
          <View key={`${item.order_id}-${index}`} style={styles.lineRow}>
            <Text style={styles.lineName} numberOfLines={1}>
              {line.product_name || 'Produit'}
            </Text>
            <Text style={styles.lineQty}>×{line.quantity || 1}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total client</Text>
          <Text style={styles.totalValue}>
            {formatDualMoney(item.farm_subtotal_cdf, item.farm_subtotal_usd)}
          </Text>
        </View>
        {(item.farm_commission_cdf > 0 || item.farm_commission_usd > 0
          || item.farm_payout_cdf > 0 || item.farm_payout_usd > 0) ? (
          <>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Commission Dream Field</Text>
              <Text style={styles.commissionValue}>
                −{formatDualMoney(item.farm_commission_cdf, item.farm_commission_usd)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Votre part</Text>
              <Text style={styles.payoutValue}>
                {formatDualMoney(item.farm_payout_cdf, item.farm_payout_usd)}
              </Text>
            </View>
          </>
        ) : null}
      </View>
    );
  };

  return (
    <ScreenWrapper style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes ventes</Text>
        <Text style={styles.subtitle}>Commandes contenant vos produits</Text>
      </View>

      {loading && sales.length === 0 ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => String(item.order_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="receipt-outline" size={40} color="#CBD5E0" />
              <Text style={styles.empty}>Aucune vente enregistrée pour le moment.</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F3' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#283106' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  list: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderNumber: { fontSize: 15, fontWeight: '800', color: '#111827' },
  date: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusBadge: { backgroundColor: '#F0F8F0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '700', color: '#2E7D32' },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  lineName: { flex: 1, fontSize: 13, color: '#374151', marginRight: 8 },
  lineQty: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  totalLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  totalValue: { fontSize: 14, fontWeight: '800', color: '#283106' },
  commissionValue: { fontSize: 13, fontWeight: '700', color: '#C62828' },
  payoutValue: { fontSize: 14, fontWeight: '800', color: '#2E7D32' },
  emptyWrap: { alignItems: 'center', marginTop: 48, gap: 12 },
  empty: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
});
