import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { adminProductReviewService } from '../../backend/services/adminProductReviewService';
import { fetchProducts } from '../../store/admin/productSlice';

const formatPrice = (product) => {
  const amount = Number(product.proposed_price ?? product.price) || 0;
  const currency = (product.currency || 'CDF').toUpperCase();
  if (currency === 'USD') return `$${amount.toFixed(2)}`;
  return `${Math.round(amount).toLocaleString('fr-FR')} CDF`;
};

export default function AdminPendingProductsSection({ navigation, refreshKey = 0 }) {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminProductReviewService.getPendingProducts(6);
        if (mounted) setItems(data || []);
      } catch {
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [refreshKey]);

  const refreshAdminProducts = () => {
    dispatch(fetchProducts({ page: 0, limit: 100, refresh: true }));
  };

  const promptReject = (product) => {
    Alert.prompt(
      'Refuser la proposition',
      `Motif pour « ${product.name} »`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async (note) => {
            setReviewingId(product.id);
            try {
              await adminProductReviewService.reviewProduct({
                productId: product.id,
                action: 'reject',
                reviewNote: note || 'Proposition non retenue.',
              });
              setItems((prev) => prev.filter((p) => p.id !== product.id));
              refreshAdminProducts();
            } catch (error) {
              Alert.alert('Erreur', error.message || 'Impossible de refuser.');
            } finally {
              setReviewingId(null);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const promptApprove = (product) => {
    Alert.prompt(
      'Publier le produit',
      `Prix de vente final pour « ${product.name} » (souhaité : ${formatPrice(product)})`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Publier',
          onPress: async (priceText) => {
            const price = Number(priceText || product.proposed_price || product.price);
            if (!price || price <= 0) {
              Alert.alert('Erreur', 'Indiquez un prix valide.');
              return;
            }
            setReviewingId(product.id);
            try {
              await adminProductReviewService.reviewProduct({
                productId: product.id,
                action: 'approve',
                price,
              });
              setItems((prev) => prev.filter((p) => p.id !== product.id));
              refreshAdminProducts();
              Alert.alert('Publié', 'Le produit est visible côté client.');
            } catch (error) {
              Alert.alert('Erreur', error.message || 'Impossible de publier.');
            } finally {
              setReviewingId(null);
            }
          },
        },
      ],
      'plain-text',
      String(product.proposed_price ?? product.price ?? '')
    );
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#9C27B0" />
      </View>
    );
  }

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="hourglass-outline" size={20} color="#9C27B0" />
          <Text style={styles.title}>Produits à valider</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('FarmerProductRequests')}
          hitSlop={8}
        >
          <Text style={styles.link}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {items.slice(0, 4).map((product) => (
        <View key={product.id} style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.farmName} numberOfLines={1}>
              {product.farm_name} · {formatPrice(product)}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => promptReject(product)}
              disabled={reviewingId === product.id}
            >
              <Ionicons name="close" size={16} color="#C62828" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => promptApprove(product)}
              disabled={reviewingId === product.id}
            >
              {reviewingId === product.id ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F3E5F5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 15, fontWeight: '800', color: '#283106' },
  link: { fontSize: 12, fontWeight: '700', color: '#6A1B9A' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 39, 176, 0.15)',
  },
  rowContent: { flex: 1 },
  productName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  farmName: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  rejectBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  approveBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
