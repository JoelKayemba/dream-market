import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui';
import { useFarmerDataRefresh } from '../../hooks/useFarmerDataRefresh';
import {
  fetchFarmerProducts,
  fetchFarmerDashboard,
  updateFarmerProductStock,
  selectFarmerProducts,
  selectFarmerProductsLoading,
  selectFarmerUpdatingProductId,
  selectFarmerFarmProfile,
} from '../../store/farmer/farmerSlice';
import { computeCommissionAmounts, formatMoney as formatCommissionMoney } from '../../utils/commission';

const formatPrice = (product) => {
  const amount = Number(product.price) || 0;
  const currency = (product.currency || 'CDF').toUpperCase();
  if (currency === 'USD') return `$${amount.toFixed(2)}`;
  return `${Math.round(amount).toLocaleString('fr-FR')} CDF`;
};

function ProductStockEditor({ product, onSave, saving }) {
  const [stock, setStock] = useState(String(product.stock ?? 0));
  const [isActive, setIsActive] = useState(product.is_active !== false);

  const adjustStock = (delta) => {
    const next = Math.max(0, (parseInt(stock, 10) || 0) + delta);
    setStock(String(next));
    if (next === 0) setIsActive(false);
  };

  const toggleRupture = (value) => {
    setIsActive(!value);
    if (value) setStock('0');
  };

  const handleSave = () => {
    const parsedStock = Math.max(0, parseInt(stock, 10) || 0);
    const nextActive = parsedStock === 0 ? false : isActive;
    onSave(product.id, parsedStock, nextActive);
  };

  return (
    <View style={styles.editor}>
      <View style={styles.stockRow}>
        <Text style={styles.editorLabel}>Stock</Text>
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => adjustStock(-1)}>
            <Ionicons name="remove" size={18} color="#283106" />
          </TouchableOpacity>
          <Text style={styles.stockValue}>{stock}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => adjustStock(1)}>
            <Ionicons name="add" size={18} color="#283106" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchTextWrap}>
          <Text style={styles.editorLabel}>Rupture temporaire</Text>
          <Text style={styles.switchHint}>Masque le produit côté client</Text>
        </View>
        <Switch
          value={!isActive || parseInt(stock, 10) === 0}
          onValueChange={toggleRupture}
          trackColor={{ false: '#E5E7EB', true: '#FFCDD2' }}
          thumbColor={!isActive ? '#E53935' : '#FFFFFF'}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Enregistrer</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function FarmerProductsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const products = useSelector(selectFarmerProducts);
  const farmProfile = useSelector(selectFarmerFarmProfile);
  const commissionRate = Number(farmProfile?.farm?.commission_rate) || 0;
  const loading = useSelector(selectFarmerProductsLoading);
  const updatingProductId = useSelector(selectFarmerUpdatingProductId);
  const { refreshing, onRefresh } = useFarmerDataRefresh(fetchFarmerProducts);

  useFocusEffect(
    useCallback(() => {
      if (!farmProfile?.farm) {
        dispatch(fetchFarmerDashboard());
      }
    }, [dispatch, farmProfile?.farm])
  );

  const publishedProducts = useMemo(
    () => products.filter((p) => !p.review_status || p.review_status === 'published'),
    [products]
  );

  const pendingProposalsCount = useMemo(
    () => products.filter((p) => p.review_status === 'pending_review' || p.images_review_status === 'pending').length,
    [products]
  );

  const rejectedProposalsCount = useMemo(
    () => products.filter((p) => p.review_status === 'rejected' || p.images_review_status === 'rejected').length,
    [products]
  );

  const handleSaveStock = async (productId, stock, isActive) => {
    try {
      await dispatch(updateFarmerProductStock({ productId, stock, isActive })).unwrap();
      Alert.alert('Enregistré', 'Stock mis à jour avec succès.');
    } catch (error) {
      Alert.alert('Erreur', error || 'Impossible de mettre à jour le stock.');
    }
  };

  const renderItem = ({ item }) => {
    const imageUri = item.images?.[0] || item.image || item.main_image || null;
    const inStock = item.is_active !== false && (typeof item.stock !== 'number' || item.stock > 0);
    const currency = item.currency || 'CDF';
    const line = computeCommissionAmounts(Number(item.price) || 0, commissionRate);

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>🌿</Text>
            </View>
          )}
          <View style={styles.cardBody}>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.price}>{formatPrice(item)}</Text>
            {commissionRate > 0 ? (
              <Text style={styles.netPrice}>
                Votre part (−{commissionRate} %) : {formatCommissionMoney(line.farmer_payout_amount, currency)}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <View style={[styles.badge, inStock ? styles.badgeOk : styles.badgeOut]}>
                <Text style={styles.badgeText}>{inStock ? 'En ligne' : 'Rupture'}</Text>
              </View>
              {item.images_review_status === 'pending' ? (
                <View style={[styles.badge, styles.badgePhotoPending]}>
                  <Text style={styles.badgeText}>Photos en attente</Text>
                </View>
              ) : null}
              <Text style={styles.stockText}>Stock actuel : {item.stock ?? 0}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('FarmerProductProposal', { product: item })}
        >
          <Ionicons name="create-outline" size={16} color="#2E7D32" />
          <Text style={styles.editBtnText}>Modifier les infos</Text>
        </TouchableOpacity>

        <ProductStockEditor
          product={item}
          onSave={handleSaveStock}
          saving={updatingProductId === item.id}
        />
      </View>
    );
  };

  return (
    <ScreenWrapper style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes produits</Text>
        <Text style={styles.subtitle}>
          {publishedProducts.length} produit(s) publié(s) · gérez le stock et les ruptures.
        </Text>
        <TouchableOpacity
          style={styles.proposalsLink}
          onPress={() => navigation.navigate('FarmerProposals')}
        >
          <Ionicons name="document-text-outline" size={18} color="#2E7D32" />
          <Text style={styles.proposalsLinkText}>Mes propositions et demandes</Text>
          {(pendingProposalsCount > 0 || rejectedProposalsCount > 0) ? (
            <View style={styles.proposalsBadge}>
              <Text style={styles.proposalsBadgeText}>
                {pendingProposalsCount > 0 ? `${pendingProposalsCount} en attente` : `${rejectedProposalsCount} refusé(s)`}
              </Text>
            </View>
          ) : null}
          <Ionicons name="chevron-forward" size={16} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.newProposalBtn}
          onPress={() => navigation.navigate('FarmerProductProposal')}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.newProposalBtnText}>Proposer un nouveau produit</Text>
        </TouchableOpacity>
      </View>

      {loading && publishedProducts.length === 0 ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={publishedProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun produit publié pour votre ferme.</Text>
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
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  proposalsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  proposalsLinkText: { flex: 1, color: '#2E7D32', fontWeight: '700', fontSize: 13 },
  proposalsBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  proposalsBadgeText: { fontSize: 10, fontWeight: '800', color: '#E65100' },
  newProposalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#2E7D32',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  newProposalBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  list: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E6E1',
    marginBottom: 14,
  },
  cardTop: { flexDirection: 'row' },
  image: { width: 88, height: 88 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDECE8' },
  placeholderText: { fontSize: 28 },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '800', color: '#2E7D32', marginBottom: 4 },
  netPrice: { fontSize: 11, color: '#6B7280', marginBottom: 6, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  badgeOk: { backgroundColor: '#E8F5E9' },
  badgeOut: { backgroundColor: '#FFEBEE' },
  badgePhotoPending: { backgroundColor: '#FFF3E0' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#374151' },
  stockText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F1F8F1',
  },
  editBtnText: { color: '#2E7D32', fontWeight: '700', fontSize: 13 },
  editor: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 14,
    gap: 12,
    backgroundColor: '#FAFAF9',
  },
  stockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editorLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockValue: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  switchTextWrap: { flex: 1 },
  switchHint: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    borderRadius: 999,
    paddingVertical: 11,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  empty: { textAlign: 'center', color: '#9CA3AF', marginTop: 40, fontSize: 14 },
});
