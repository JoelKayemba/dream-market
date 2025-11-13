import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrders,
  updateOrderStatus,
  selectAdminOrders,
  selectAdminOrdersLoading,
  selectAdminOrdersLoadingMore,
  selectAdminOrdersPagination,
  selectAdminOrdersError,
  selectAdminOrdersFilters,
  selectFilteredOrders,
  selectOrderStats,
  setStatusFilter,
  setSearch,
} from '../../../store/admin/ordersSlice';
import { openWhatsApp, openPhoneCall, openEmail } from '../../../utils/contactInfo';
import AdminNotificationCenter from '../../../components/admin/AdminNotificationCenter';
import SafeAreaWrapper from '../../../components/SafeAreaWrapper';

// ────────────────────────────────────────────────────────────────────────────────
// Utils simples
// ────────────────────────────────────────────────────────────────────────────────
const statusLabel = (s) => ({
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}[s] || s);

const statusIcon = (s) => ({
  pending: 'time-outline',
  confirmed: 'checkmark-circle-outline',
  preparing: 'restaurant-outline',
  shipped: 'car-outline',
  delivered: 'checkmark-done-outline',
  cancelled: 'close-circle-outline',
}[s] || 'help-outline');

const statusColor = (s) => ({
  pending: '#FF9800',
  confirmed: '#2196F3',
  preparing: '#9C27B0',
  shipped: '#FF5722',
  delivered: '#4CAF50',
  cancelled: '#F44336',
}[s] || '#777E5C');

const fmtDate = (d) => {
  if (!d) return 'Date inconnue';
  const x = new Date(d);
  if (isNaN(x)) return 'Date invalide';
  return x.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const fmtPrice = (amount, currency = 'CDF') => {
  const n = Number(amount);
  if (Number.isNaN(n)) return currency === 'USD' ? '$0.00' : '0 FC';
  return currency === 'USD' ? `$${n.toFixed(2)}` : `${n.toFixed(0)} FC`;
};

// ────────────────────────────────────────────────────────────────────────────────
// Carte commande (simple)
// ────────────────────────────────────────────────────────────────────────────────
const OrderCard = memo(function OrderCard({ order, onView, onUpdateStatus, onContact }) {
  const c = statusColor(order.status);
  return (
    <TouchableOpacity style={styles.orderCard} onPress={() => onView(order)} activeOpacity={0.8}>
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderNumber}>#{order.orderNumber || order.order_number}</Text>
          <Text style={styles.customerName}>{order.customerName || 'Client inconnu'}</Text>
          <Text style={styles.orderDate}>{fmtDate(order.date || order.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: c + '20' }]}>
          <Ionicons name={statusIcon(order.status)} size={14} color={c} />
          <Text style={[styles.statusText, { color: c }]}>{statusLabel(order.status)}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#777E5C" />
          <Text style={styles.detailText} numberOfLines={1}>
            {order.customerPhone || order.phone_number || 'Non renseigné'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={16} color="#777E5C" />
          <Text style={styles.detailText}>{order.items?.length || 0} article(s)</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#4CAF50" />
          <Text style={styles.detailPrice}>
            {order.totals && Object.keys(order.totals).length > 0
              ? Object.entries(order.totals).map(([cur, amt]) => fmtPrice(amt, cur)).join(' + ')
              : '0 FC'}
          </Text>
        </View>
      </View>

      {!!order.items?.length && (
        <View style={styles.previewRow}>
          {order.items.slice(0, 4).map((it, i) => (
            <View key={`${order.id}-p-${i}`} style={styles.previewItem}>
              {it.product_image ? (
                <Image source={{ uri: it.product_image }} style={styles.previewImage} />
              ) : (
                <View style={styles.previewEmpty}>
                  <Ionicons name="image-outline" size={18} color="#CBD5E0" />
                </View>
              )}
            </View>
          ))}
          {order.items.length > 4 && (
            <View style={styles.previewMore}>
              <Text style={styles.previewMoreText}>+{order.items.length - 4}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.btn, styles.btnContact]} onPress={() => onContact(order)} activeOpacity={0.8}>
          <Ionicons name="call-outline" size={18} color="#4CAF50" />
          <Text style={styles.btnTextContact}>Contacter</Text>
        </TouchableOpacity>

        {order.status === 'pending' && (
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => onUpdateStatus(order, 'confirmed')} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#2196F3" />
            <Text style={styles.btnTextPrimary}>Confirmer</Text>
          </TouchableOpacity>
        )}
        {order.status === 'confirmed' && (
          <TouchableOpacity style={[styles.btn, styles.btnPurple]} onPress={() => onUpdateStatus(order, 'preparing')} activeOpacity={0.8}>
            <Ionicons name="restaurant-outline" size={18} color="#9C27B0" />
            <Text style={styles.btnTextPurple}>Préparer</Text>
          </TouchableOpacity>
        )}
        {order.status === 'preparing' && (
          <TouchableOpacity style={[styles.btn, styles.btnWarn]} onPress={() => onUpdateStatus(order, 'shipped')} activeOpacity={0.8}>
            <Ionicons name="car-outline" size={18} color="#FF5722" />
            <Text style={styles.btnTextWarn}>Expédier</Text>
          </TouchableOpacity>
        )}
        {order.status === 'shipped' && (
          <TouchableOpacity style={[styles.btn, styles.btnContact]} onPress={() => onUpdateStatus(order, 'delivered')} activeOpacity={0.8}>
            <Ionicons name="checkmark-done-outline" size={18} color="#4CAF50" />
            <Text style={styles.btnTextContact}>Livrer</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

// ────────────────────────────────────────────────────────────────────────────────
// Écran principal (simplifié)
// ────────────────────────────────────────────────────────────────────────────────
export default function OrdersManagement({ navigation }) {
  const dispatch = useDispatch();

  const orders = useSelector(selectAdminOrders);
  const filtered = useSelector(selectFilteredOrders);
  const loading = useSelector(selectAdminOrdersLoading);
  const loadingMore = useSelector(selectAdminOrdersLoadingMore);
  const pagination = useSelector(selectAdminOrdersPagination);
  const error = useSelector(selectAdminOrdersError);
  const filters = useSelector(selectAdminOrdersFilters);
  const stats = useSelector(selectOrderStats);

  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders({ page: 0, refresh: true }));
  }, [dispatch]);

  // Débounce pour la recherche
  useEffect(() => {
    const trimmedSearch = searchText.trim();
    const t = setTimeout(() => {
      dispatch(setSearch(trimmedSearch));
    }, 300);
    return () => clearTimeout(t);
  }, [searchText, dispatch]);

  // Refetch quand les filtres changent (mais pas immédiatement après setSearch)
  useEffect(() => {
    // Attendre un peu pour éviter les appels multiples
    const t = setTimeout(() => {
      dispatch(fetchOrders({ page: 0, refresh: true }));
    }, 100);
    return () => clearTimeout(t);
  }, [filters.status, filters.search, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchOrders({ page: 0, refresh: true }));
    setRefreshing(false);
  };

  const loadMore = useCallback(() => {
    if (loadingMore || !pagination?.hasMore) return;
    dispatch(fetchOrders({ page: (pagination.page ?? 0) + 1, refresh: false }));
  }, [dispatch, loadingMore, pagination]);

  const handleView = (order) => navigation.navigate('OrderDetailAdmin', { order });

  const handleUpdateStatus = (order, next) => {
    Alert.alert(
      'Changer le statut',
      `Passer #${order.orderNumber || order.order_number} à "${statusLabel(next)}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => dispatch(updateOrderStatus({ orderId: order.id, status: next })),
        },
      ],
    );
  };

  const handleContact = (order) => {
    const customerPhone = order.customerPhone || order.phone_number;
    const customerEmail = order.customerEmail || order.profiles?.email;
    const customerName = order.customerName || 'le client';
    
    const options = [];
    
    if (customerPhone) {
      options.push({
        text: 'Appeler',
        onPress: () => openPhoneCall(customerPhone),
        style: 'default',
      });
      options.push({
        text: 'WhatsApp',
        onPress: () => openWhatsApp(customerPhone, `Bonjour, concernant votre commande ${order.orderNumber || order.order_number || ''}`),
        style: 'default',
      });
    }
    
    if (customerEmail) {
      options.push({
        text: 'Email',
        onPress: () => openEmail(customerEmail, `Commande ${order.orderNumber || order.order_number || ''}`, `Bonjour,\n\nConcernant votre commande ${order.orderNumber || order.order_number || ''}...`),
        style: 'default',
      });
    }
    
    if (options.length === 0) {
      Alert.alert(
        'Contact non disponible',
        'Les informations de contact de ce client ne sont pas disponibles.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    options.push({
      text: 'Annuler',
      style: 'cancel',
    });
    
    Alert.alert(
      'Contacter le client',
      `Comment souhaitez-vous contacter ${customerName} ?`,
      options,
      { cancelable: true }
    );
  };

  const statusChips = [
    { id: 'all', label: 'Toutes' },
    { id: 'pending', label: 'En attente' },
    { id: 'confirmed', label: 'Confirmées' },
    { id: 'preparing', label: 'Préparation' },
    { id: 'shipped', label: 'Expédiées' },
    { id: 'delivered', label: 'Livrées' },
    { id: 'cancelled', label: 'Annulées' },
  ];
  // 

  const ListHeader = () => (
    <View>
      {showFilters && (
        <View style={styles.filtersRow}>
          {statusChips.map((o) => {
            const active = filters.status === o.id;
            return (
              <TouchableOpacity
                key={o.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => dispatch(setStatusFilter(o.id))}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={20} color="#FF9800" />
          <Text style={styles.statValue}>{stats.pending || 0}</Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2196F3" />
          <Text style={styles.statValue}>{stats.confirmed || 0}</Text>
          <Text style={styles.statLabel}>Confirmées</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done-outline" size={20} color="#4CAF50" />
          <Text style={styles.statValue}>{stats.delivered || 0}</Text>
          <Text style={styles.statLabel}>Livrées</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#C62828" />
          <Text style={styles.errorText}>{String(error?.message || 'Une erreur est survenue.')}</Text>
        </View>
      ) : null}
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="receipt-outline" size={64} color="#A0AEC0" />
      <Text style={styles.emptyTitle}>
        {filters.status === 'all' ? 'Aucune commande' : `Aucune commande "${statusLabel(filters.status)}"`}
      </Text>
      <Text style={styles.emptySub}>Essayez un autre filtre ou une autre recherche.</Text>
    </View>
  );

  return (
    <SafeAreaWrapper style={styles.container}>
      {/* Header fixe */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#283106" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginHorizontal: 8 }}>
          <Text style={styles.title}>Gestion des Commandes</Text>
          <Text style={styles.subtitle}>
            {stats.total || 0} commande(s) • {fmtPrice(stats.totalRevenue || 0)}
          </Text>
        </View>

        {/* Composant de notification avec modal */}
        <AdminNotificationCenter navigation={navigation} />
      </View>

      {/* Barre de recherche fixe */}
      <View style={styles.searchBarWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#777E5C" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Rechercher une commande..."
            placeholderTextColor="#9BA3AF"
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.iconBtnSmall} activeOpacity={0.8}>
              <Ionicons name="close-circle" size={18} color="#777E5C" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowFilters((v) => !v)} style={styles.iconBtnSmall} activeOpacity={0.8}>
            <Ionicons name={showFilters ? 'filter' : 'filter-outline'} size={18} color={showFilters ? '#4CAF50' : '#777E5C'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste (tout le reste défile) */}
      {loading && orders.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => String(item.id || `${item.order_number || item.orderNumber}-${i}`)}
          renderItem={({ item }) => (
            <OrderCard order={item} onView={handleView} onUpdateStatus={handleUpdateStatus} onContact={handleContact} />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" />
                <Text style={styles.footerText}>Chargement…</Text>
              </View>
            ) : <View style={{ height: 8 }} />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} tintColor="#4CAF50" />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaWrapper>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Styles compacts
// ────────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconBtn: { padding: 6 },
  iconBtnSmall: { padding: 4, marginLeft: 6 },

  title: { fontSize: 18, fontWeight: '700', color: '#283106' },
  subtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  searchBarWrap: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#283106', paddingVertical: 10 },

  // Header de liste
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  chipActive: { borderColor: '#4CAF50', backgroundColor: '#F0FDF4' },
  chipText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  chipTextActive: { color: '#4CAF50' },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#283106', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#777E5C', marginTop: 2 },

  errorBox: {
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: { color: '#C62828', fontWeight: '600', flexShrink: 1 },

  listContent: { padding: 14, paddingTop: 10 },

  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderNumber: { fontSize: 16, fontWeight: '700', color: '#283106' },
  customerName: { fontSize: 14, fontWeight: '600', color: '#4CAF50', marginTop: 2 },
  orderDate: { fontSize: 12, color: '#777E5C', marginTop: 2 },

  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, gap: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },

  orderDetails: { paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', marginBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  detailText: { fontSize: 13, color: '#6B7280', flex: 1 },
  detailPrice: { fontSize: 14, fontWeight: '700', color: '#4CAF50' },

  previewRow: { flexDirection: 'row', gap: 8, marginBottom: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  previewItem: { width: 52, height: 52, borderRadius: 10, overflow: 'hidden', backgroundColor: '#F8FAFC' },
  previewImage: { width: '100%', height: '100%' },
  previewEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  previewMore: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  previewMoreText: { fontSize: 12, fontWeight: '700', color: '#4CAF50' },

  actionsRow: { flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  btnContact: { backgroundColor: '#E8F5E9' },
  btnPrimary: { backgroundColor: '#E3F2FD' },
  btnPurple: { backgroundColor: '#F3E5F5' },
  btnWarn: { backgroundColor: '#FFEBEE' },
  btnTextContact: { fontSize: 13, fontWeight: '700', color: '#4CAF50' },
  btnTextPrimary: { fontSize: 13, fontWeight: '700', color: '#2196F3' },
  btnTextPurple: { fontSize: 13, fontWeight: '700', color: '#9C27B0' },
  btnTextWarn: { fontSize: 13, fontWeight: '700', color: '#FF5722' },

  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 10, color: '#6B7280' },

  footerLoader: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  footerText: { marginTop: 6, fontSize: 12, color: '#6B7280' },

  emptyBox: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#6B7280', marginTop: 6, textAlign: 'center' },
});
