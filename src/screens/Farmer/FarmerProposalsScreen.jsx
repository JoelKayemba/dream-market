import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui';
import { useFarmerDataRefresh } from '../../hooks/useFarmerDataRefresh';
import {
  fetchFarmerProducts,
  submitFarmerProposal,
  selectFarmerProducts,
  selectFarmerProductsLoading,
  selectFarmerSubmittingProposalId,
} from '../../store/farmer/farmerSlice';

const statusMeta = {
  draft: { label: 'Brouillon', color: '#6B7280', bg: '#F3F4F6' },
  pending_review: { label: 'En attente', color: '#E65100', bg: '#FFF3E0' },
  rejected: { label: 'Refusé', color: '#C62828', bg: '#FFEBEE' },
  image_pending: { label: 'Photos en attente', color: '#E65100', bg: '#FFF3E0' },
};

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'pending_review', label: 'En attente' },
  { key: 'rejected', label: 'Refusés' },
  { key: 'draft', label: 'Brouillons' },
];

const formatPrice = (product) => {
  const amount = Number(product.proposed_price ?? product.price) || 0;
  const currency = (product.currency || 'CDF').toUpperCase();
  if (currency === 'USD') return `$${amount.toFixed(2)}`;
  return `${Math.round(amount).toLocaleString('fr-FR')} CDF`;
};

const getProductImage = (product) => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  if (product.image) return product.image;
  return null;
};

export default function FarmerProposalsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const products = useSelector(selectFarmerProducts);
  const loading = useSelector(selectFarmerProductsLoading);
  const submittingId = useSelector(selectFarmerSubmittingProposalId);
  const [filter, setFilter] = useState('all');
  const { refreshing, onRefresh } = useFarmerDataRefresh(fetchFarmerProducts);

  const proposals = useMemo(
    () => products.filter((p) =>
      ['draft', 'pending_review', 'rejected'].includes(p.review_status) ||
      p.images_review_status === 'pending' ||
      p.images_review_status === 'rejected'
    ),
    [products]
  );

  const getProposalStatus = (item) => {
    if (item.images_review_status === 'pending') return 'image_pending';
    if (item.images_review_status === 'rejected') return 'rejected';
    return item.review_status;
  };

  const counts = useMemo(
    () => ({
      all: proposals.length,
      pending_review: proposals.filter((p) => p.review_status === 'pending_review' || p.images_review_status === 'pending').length,
      rejected: proposals.filter((p) => p.review_status === 'rejected' || p.images_review_status === 'rejected').length,
      draft: proposals.filter((p) => p.review_status === 'draft').length,
    }),
    [proposals]
  );

  const filteredProposals = useMemo(() => {
    if (filter === 'all') return proposals;
    if (filter === 'pending_review') {
      return proposals.filter((p) => p.review_status === 'pending_review' || p.images_review_status === 'pending');
    }
    if (filter === 'rejected') {
      return proposals.filter((p) => p.review_status === 'rejected' || p.images_review_status === 'rejected');
    }
    return proposals.filter((p) => p.review_status === filter);
  }, [proposals, filter]);

  const handleSubmit = (item) => {
    Alert.alert(
      'Soumettre à Dream Field',
      `Envoyer « ${item.name} » pour validation ? Vous ne pourrez plus le modifier tant qu'il est en attente.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Soumettre',
          onPress: async () => {
            try {
              await dispatch(submitFarmerProposal(item.id)).unwrap();
              Alert.alert('Envoyé', 'Votre proposition est en cours de validation par Dream Field.');
            } catch (error) {
              Alert.alert('Erreur', error || 'Impossible de soumettre la proposition.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const proposalStatus = getProposalStatus(item);
    const meta = statusMeta[proposalStatus] || statusMeta.draft;
    const canEdit = ['draft', 'rejected'].includes(item.review_status) || item.review_status === 'published';
    const canSubmit = ['draft', 'rejected'].includes(item.review_status);
    const isImagePending = item.images_review_status === 'pending';
    const imageUri = getProductImage(item);
    const description = item.short_description || item.description;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Ionicons name="image-outline" size={22} color="#9CA3AF" />
            </View>
          )}

          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <View style={[styles.badge, { backgroundColor: meta.bg }]}>
                <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
              </View>
            </View>

            <Text style={styles.price}>Prix souhaité : {formatPrice(item)}</Text>
            {item.unit ? <Text style={styles.unit}>Unité : {item.unit}</Text> : null}
            {description ? (
              <Text style={styles.description} numberOfLines={3}>{description}</Text>
            ) : null}
          </View>
        </View>

        {item.review_status === 'pending_review' || isImagePending ? (
          <View style={styles.pendingBox}>
            <Ionicons name="hourglass-outline" size={18} color="#E65100" />
            <Text style={styles.pendingText}>
              {isImagePending
                ? 'Vos informations sont à jour. Les nouvelles photos seront visibles après validation Dream Field.'
                : 'Dream Field examine votre demande. Vous serez notifié dès qu\'elle sera traitée.'}
            </Text>
          </View>
        ) : null}

        {(item.review_status === 'rejected' || item.images_review_status === 'rejected') && item.review_note ? (
          <View style={styles.rejectedBox}>
            <Ionicons name="close-circle-outline" size={18} color="#C62828" />
            <View style={styles.rejectedContent}>
              <Text style={styles.rejectedTitle}>Motif du refus</Text>
              <Text style={styles.rejectedText}>{item.review_note}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.actions}>
          {canEdit ? (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('FarmerProductProposal', { product: item })}
            >
              <Ionicons name="create-outline" size={16} color="#2E7D32" />
              <Text style={styles.secondaryBtnText}>
                {item.review_status === 'rejected' ? 'Corriger et renvoyer' : 'Modifier'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {canSubmit ? (
            <TouchableOpacity
              style={[styles.primaryBtn, submittingId === item.id && styles.primaryBtnDisabled]}
              onPress={() => handleSubmit(item)}
              disabled={submittingId === item.id}
            >
              {submittingId === item.id ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Soumettre</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#283106" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mes propositions</Text>
          <Text style={styles.subtitle}>
            Suivez vos demandes en attente et consultez les motifs de refus.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate('FarmerProductProposal')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
        <Text style={styles.createBtnText}>Nouvelle proposition</Text>
      </TouchableOpacity>

      <View style={styles.filtersWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((item) => {
            const active = filter === item.key;
            const count = counts[item.key] || 0;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilter(item.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {item.label}{count > 0 ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && proposals.length === 0 ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          style={styles.listContainer}
          data={filteredProposals}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {filter === 'all'
                ? 'Aucune proposition pour le moment.'
                : 'Aucune proposition dans cette catégorie.'}
            </Text>
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F3' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  backBtn: { padding: 8, marginTop: 4 },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', color: '#283106' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#2E7D32',
    borderRadius: 999,
    paddingVertical: 12,
  },
  createBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  filtersWrap: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  filterChipTextActive: { color: '#FFFFFF' },
  listContainer: { flex: 1 },
  list: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  thumbnail: { width: 72, height: 72, borderRadius: 14 },
  thumbnailPlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  price: { fontSize: 13, color: '#374151', marginTop: 6 },
  unit: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  description: { fontSize: 12, color: '#6B7280', marginTop: 6, lineHeight: 17 },
  pendingBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF3E0',
  },
  pendingText: { flex: 1, fontSize: 12, color: '#E65100', lineHeight: 17, fontWeight: '600' },
  rejectedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
  },
  rejectedContent: { flex: 1 },
  rejectedTitle: { fontSize: 11, fontWeight: '800', color: '#C62828', textTransform: 'uppercase' },
  rejectedText: { fontSize: 13, color: '#B71C1C', marginTop: 4, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    backgroundColor: '#F1F8F1',
  },
  secondaryBtnText: { color: '#2E7D32', fontWeight: '700', fontSize: 13 },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#2E7D32',
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  empty: { textAlign: 'center', color: '#6B7280', marginTop: 40, fontSize: 14 },
});
