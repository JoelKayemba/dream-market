import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { commissionService } from '../../backend/services/commissionService';
import { formatMoney } from '../../utils/commission';

export default function AdminCommissionsSection({ navigation, refreshKey = 0 }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ totals: {}, farms: [] });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await commissionService.getAdminCommissionDashboard({ status: 'delivered' });
      setData(result);
    } catch {
      setData({ totals: {}, farms: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const totals = data?.totals || {};
  const farms = data?.farms || [];

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Commissions & reversements</Text>
          <Text style={styles.subtitle}>Commandes livrées · montants à envoyer aux fermes</Text>
        </View>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('AnalyticsDashboard')}>
          <Text style={styles.linkText}>Analytique</Text>
          <Ionicons name="chevron-forward" size={14} color="#6A1B9A" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#6A1B9A" style={{ marginVertical: 16 }} />
      ) : (
        <>
          <View style={styles.totalsRow}>
            <View style={[styles.totalCard, styles.commissionCard]}>
              <Text style={styles.totalLabel}>Commission Dream Field</Text>
              <Text style={styles.totalValue}>{formatMoney(totals.commission_cdf, 'CDF')}</Text>
              {(totals.commission_usd || 0) > 0 ? (
                <Text style={styles.totalSecondary}>{formatMoney(totals.commission_usd, 'USD')}</Text>
              ) : null}
            </View>
            <View style={[styles.totalCard, styles.payoutCard]}>
              <Text style={styles.totalLabel}>À reverser fermiers</Text>
              <Text style={styles.totalValue}>{formatMoney(totals.payout_cdf, 'CDF')}</Text>
              {(totals.payout_usd || 0) > 0 ? (
                <Text style={styles.totalSecondary}>{formatMoney(totals.payout_usd, 'USD')}</Text>
              ) : null}
            </View>
          </View>

          {farms.length > 0 ? (
            <View style={styles.farmList}>
              <Text style={styles.listTitle}>Par ferme</Text>
              {farms.slice(0, 5).map((farm) => (
                <View key={farm.farm_id} style={styles.farmRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.farmName} numberOfLines={1}>{farm.farm_name}</Text>
                    <Text style={styles.farmMeta}>
                      {Number(farm.commission_rate || 0)} % · {farm.order_count || 0} commande(s)
                    </Text>
                  </View>
                  <View style={styles.farmAmounts}>
                    <Text style={styles.payoutText}>{formatMoney(farm.payout_cdf, 'CDF')}</Text>
                    {(farm.payout_usd || 0) > 0 ? (
                      <Text style={styles.payoutSub}>{formatMoney(farm.payout_usd, 'USD')}</Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.empty}>Aucune vente livrée avec commission pour le moment.</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '800', color: '#283106' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  linkText: { color: '#6A1B9A', fontWeight: '700', fontSize: 12 },
  totalsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  totalCard: { flex: 1, borderRadius: 16, padding: 12 },
  commissionCard: { backgroundColor: '#F3E5F5' },
  payoutCard: { backgroundColor: '#E8F5E9' },
  totalLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 6 },
  totalSecondary: { fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: '600' },
  farmList: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  listTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8 },
  farmRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F9FAFB' },
  farmName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  farmMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  farmAmounts: { alignItems: 'flex-end' },
  payoutText: { fontSize: 13, fontWeight: '800', color: '#2E7D32' },
  payoutSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  empty: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4 },
});
