import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminStockAlertService } from '../../backend/services/farmerProductService';

const alertMeta = {
  rupture: { label: 'Rupture', color: '#C62828', icon: 'close-circle' },
  empty: { label: 'Stock épuisé', color: '#E65100', icon: 'alert-circle' },
  low: { label: 'Stock bas', color: '#F57F17', icon: 'warning' },
};

export default function AdminStockAlertsSection({ navigation, refreshKey = 0 }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminStockAlertService.getAlerts(8);
        if (mounted) setAlerts(data || []);
      } catch (error) {
        if (mounted) setAlerts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [refreshKey]);

  if (loading && alerts.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#4CAF50" />
      </View>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="warning-outline" size={20} color="#E65100" />
          <Text style={styles.title}>Alertes stock</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductsManagement')}
          hitSlop={8}
        >
          <Text style={styles.link}>Voir produits</Text>
        </TouchableOpacity>
      </View>

      {alerts.slice(0, 5).map((alert) => {
        const meta = alertMeta[alert.alert_type] || alertMeta.low;
        return (
          <View key={alert.product_id} style={styles.row}>
            <Ionicons name={meta.icon} size={18} color={meta.color} />
            <View style={styles.rowContent}>
              <Text style={styles.productName} numberOfLines={1}>{alert.product_name}</Text>
              <Text style={styles.farmName} numberOfLines={1}>
                {alert.farm_name} · Stock {alert.stock ?? 0} · {meta.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 15, fontWeight: '800', color: '#283106' },
  link: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 193, 7, 0.25)',
  },
  rowContent: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  farmName: { fontSize: 11, color: '#6B7280', marginTop: 2 },
});
