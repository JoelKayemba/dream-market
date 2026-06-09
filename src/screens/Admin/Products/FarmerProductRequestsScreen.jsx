import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import SafeAreaWrapper from '../../../components/SafeAreaWrapper';
import AdminNotificationCenter from '../../../components/admin/AdminNotificationCenter';
import { adminProductReviewService } from '../../../backend/services/adminProductReviewService';
import { fetchProducts } from '../../../store/admin/productSlice';

const STATUS_FILTERS = [
  { id: 'pending_review', label: 'En attente' },
  { id: 'approved', label: 'Approuvées' },
  { id: 'rejected', label: 'Refusées' },
  { id: 'draft', label: 'Brouillons' },
  { id: 'all', label: 'Toutes' },
];

const TIME_FILTERS = [
  { id: null, label: 'Tout' },
  { id: 1, label: '24 h' },
  { id: 7, label: '7 jours' },
  { id: 30, label: '30 jours' },
  { id: 90, label: '90 jours' },
];

const statusMeta = {
  draft: { label: 'Brouillon', color: '#6B7280', bg: '#F3F4F6' },
  pending_review: { label: 'En attente', color: '#E65100', bg: '#FFF3E0' },
  published: { label: 'Publié', color: '#2E7D32', bg: '#E8F5E9' },
  rejected: { label: 'Refusé', color: '#C62828', bg: '#FFEBEE' },
};

const formatPrice = (product) => {
  const amount = Number(product.proposed_price ?? product.price) || 0;
  const currency = (product.currency || 'CDF').toUpperCase();
  if (currency === 'USD') return `$${amount.toFixed(2)}`;
  return `${Math.round(amount).toLocaleString('fr-FR')} CDF`;
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function FilterChip({ active, label, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function FarmerProductRequestsScreen({ navigation }) {
  const dispatch = useDispatch();
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [daysFilter, setDaysFilter] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await adminProductReviewService.getProductRequests({
        status: statusFilter,
        days: daysFilter,
        limit: 100,
      });
      setItems(result.products || []);
      setTotal(result.total || 0);
    } catch (error) {
      setItems([]);
      setTotal(0);
      Alert.alert('Erreur', error.message || 'Impossible de charger les demandes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, daysFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const refreshCatalog = () => {
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
              await load(true);
              refreshCatalog();
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
    const isImageReview = product.review_kind === 'image_change' || product.images_review_status === 'pending';

    if (isImageReview) {
      Alert.alert(
        'Valider les photos',
        `Approuver les nouvelles photos pour « ${product.name} » ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Approuver',
            onPress: async () => {
              setReviewingId(product.id);
              try {
                await adminProductReviewService.reviewProduct({
                  productId: product.id,
                  action: 'approve',
                });
                await load(true);
                refreshCatalog();
                Alert.alert('Validé', 'Les nouvelles photos sont en ligne.');
              } catch (error) {
                Alert.alert('Erreur', error.message || 'Impossible de valider.');
              } finally {
                setReviewingId(null);
              }
            },
          },
        ]
      );
      return;
    }

    Alert.prompt(
      'Publier le produit',
      `Prix final pour « ${product.name} » (souhaité : ${formatPrice(product)})`,
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
              await load(true);
              refreshCatalog();
              Alert.alert('Publié', 'Le produit est en ligne côté client.');
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

  const renderItem = ({ item }) => {
    const isImageReview = item.review_kind === 'image_change' || item.images_review_status === 'pending';
    const meta = isImageReview
      ? { label: 'Photos', color: '#9C27B0', bg: '#F3E5F5' }
      : (statusMeta[item.review_status] || statusMeta.pending_review);
    const imageUri = isImageReview && Array.isArray(item.pending_images) && item.pending_images[0]
      ? item.pending_images[0]
      : (Array.isArray(item.images) ? item.images[0] : null);
    const canReview = item.review_status === 'pending_review' || item.images_review_status === 'pending';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Text style={{ fontSize: 22 }}>🌿</Text>
            </View>
          )}
          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
              </View>
            </View>
            <Text style={styles.farmName}>{item.farm_name}</Text>
            <Text style={styles.metaLine}>
              {formatPrice(item)} · Stock {item.stock ?? 0}
              {item.category_name ? ` · ${item.category_name}` : ''}
            </Text>
            <Text style={styles.dateLine}>
              {isImageReview ? 'Photos soumises' : 'Soumis'} : {formatDate(item.submitted_at || item.created_at)}
            </Text>
            {isImageReview ? (
              <Text style={styles.reviewNote}>Produit déjà publié — validation photos uniquement</Text>
            ) : null}
            {item.review_note ? (
              <Text style={styles.reviewNote}>Motif : {item.review_note}</Text>
            ) : null}
          </View>
        </View>

        {canReview ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => promptReject(item)}
              disabled={reviewingId === item.id}
            >
              <Ionicons name="close-outline" size={18} color="#C62828" />
              <Text style={styles.rejectText}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => promptApprove(item)}
              disabled={reviewingId === item.id}
            >
              {reviewingId === item.id ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.approveText}>{isImageReview ? 'Valider photos' : 'Publier'}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaWrapper style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#283106" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Demandes producteurs</Text>
          <Text style={styles.subtitle}>{total} demande(s) · produits et photos fermiers</Text>
        </View>
        <AdminNotificationCenter navigation={navigation} />
      </View>

      <View style={styles.filtersBlock}>
        <Text style={styles.filterLabel}>Statut</Text>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              active={statusFilter === item.id}
              onPress={() => setStatusFilter(item.id)}
            />
          )}
        />

        <Text style={[styles.filterLabel, { marginTop: 12 }]}>Période</Text>
        <FlatList
          horizontal
          data={TIME_FILTERS}
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              active={daysFilter === item.id}
              onPress={() => setDaysFilter(item.id)}
            />
          )}
        />
      </View>

      {loading && items.length === 0 ? (
        <ActivityIndicator size="large" color="#9C27B0" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9C27B0" />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="document-text-outline" size={40} color="#C5C9B8" />
              <Text style={styles.emptyText}>Aucune demande pour ces filtres.</Text>
            </View>
          }
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F3' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  backBtn: { padding: 8 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#283106' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  filtersBlock: { paddingHorizontal: 16, paddingBottom: 8 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8 },
  chipsRow: { gap: 8, paddingRight: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#F3E5F5', borderColor: '#CE93D8' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: '#6A1B9A' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  thumb: { width: 72, height: 72, borderRadius: 14 },
  thumbPlaceholder: {
    backgroundColor: '#F0F8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  titleRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  productName: { flex: 1, fontSize: 15, fontWeight: '800', color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  farmName: { fontSize: 13, color: '#2E7D32', fontWeight: '700', marginTop: 4 },
  metaLine: { fontSize: 12, color: '#374151', marginTop: 4 },
  dateLine: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  reviewNote: { fontSize: 11, color: '#C62828', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  rejectText: { color: '#C62828', fontWeight: '700' },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#2E7D32',
  },
  approveText: { color: '#FFFFFF', fontWeight: '700' },
  emptyWrap: { alignItems: 'center', marginTop: 48, gap: 10 },
  emptyText: { color: '#6B7280', fontSize: 14 },
});
