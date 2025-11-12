import React, { useState, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchProducts,
  deleteProduct,
  toggleProductStatus,
  selectAdminProducts,
  selectAdminProductsLoading,
  selectAdminProductsError,
  setSearch,
  setStatusFilter,
  setCategoryFilter,
  setFarmFilter,
  selectAdminProductsFilters,
  selectFilteredProducts,
  selectAdminCategories,
  fetchCategories,
} from '../../../store/admin/productSlice';
import { selectAllFarms, fetchFarms } from '../../../store/admin/farmSlice';

export default function ProductsManagement({ navigation, route }) {
  const dispatch = useDispatch();
  const { farmId } = (route && route.params) || {};

  // Local UI state
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Redux selectors
  const products = useSelector(selectAdminProducts);
  const filteredProducts = useSelector(selectFilteredProducts);
  const loading = useSelector(selectAdminProductsLoading);
  const error = useSelector(selectAdminProductsError);
  const filters = useSelector(selectAdminProductsFilters);
  const categories = useSelector(selectAdminCategories) || [];
  const farms = useSelector(selectAllFarms) || [];

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchFarms());
  }, [dispatch]);

  // Sync search to store
  useEffect(() => {
    dispatch(setSearch(searchQuery));
  }, [searchQuery, dispatch]);

  const handleSearchChange = (text) => setSearchQueryLocal(text);

  const handleAddProduct = () => {
    navigation.navigate('ProductForm', { mode: 'add', farmId });
  };

  const handleViewProduct = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Supprimer le produit',
      `Voulez-vous vraiment supprimer le produit "${product?.name || ''}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteProduct(product.id));
            Alert.alert('Succès', 'Produit supprimé avec succès');
          },
        },
      ]
    );
  };

  const handleToggleStatus = (product) => {
    const action = product.is_active ? 'désactiver' : 'activer';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} le produit`,
      `Voulez-vous ${action} le produit "${product?.name || ''}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: () => {
            dispatch(
              toggleProductStatus({
                productId: product.id,
                isActive: !product.is_active,
              })
            );
            Alert.alert(
              'Succès',
              `Produit ${action === 'activer' ? 'activé' : 'désactivé'} avec succès`
            );
          },
        },
      ]
    );
  };

  // Apply optional farm filter from route
  let displayProducts = filteredProducts || [];
  if (farmId) {
    displayProducts = displayProducts.filter((p) => p.farm_id === farmId);
  }

  // --- Helpers ---------------------------------------------------
  const money = (price, currency) => {
    const p = Number(price || 0);
    if (currency === 'USD') return `$${p.toFixed(2)}`;
    return `${Math.round(p).toString()} FC`;
  };

  // --- UI subcomponents -----------------------------------------
  const StatCard = memo(function StatCard({ icon, color, value, label }) {
    return (
      <View style={styles.statCard}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statValue}>{String(value)}</Text>
        <Text style={styles.statLabel}>{String(label)}</Text>
      </View>
    );
  });

  const FilterChip = memo(function FilterChip({
    active,
    icon,
    text,
    onPress,
    activeColor = '#4CAF50',
  }) {
    return (
      <TouchableOpacity
        style={[styles.filterChip, active && styles.filterChipActive]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name={icon} size={16} color={active ? activeColor : '#777E5C'} />
        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
          {String(text)}
        </Text>
      </TouchableOpacity>
    );
  });

  const ProductCard = memo(function ProductCard({ product }) {
    const categoryName = product.category_id
      ? (categories.find((c) => c.id === product.category_id)?.name || 'Non catégorisé')
      : 'Non catégorisé';

    const productImage = (product.images && product.images[0]) || product.image || null;
    const stock = Number(product.stock || 0);
    const hasStock = stock > 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleViewProduct(product)}
        activeOpacity={0.8}
      >
        {/* Image */}
        <View style={styles.productImageContainer}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={styles.productImage} resizeMode="cover" />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Ionicons name="image-outline" size={32} color="#CBD5E0" />
              <Text style={styles.placeholderMiniText}>Aucune image</Text>
            </View>
          )}

          <View style={styles.imageBadges}>
            {!product.is_active && (
              <View style={[styles.badge, styles.badgeInactive]}>
                <Ionicons name="pause-circle" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>Inactif</Text>
              </View>
            )}
            {!hasStock && (
              <View style={[styles.badge, styles.badgeOutOfStock]}>
                <Ionicons name="close-circle" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>Rupture</Text>
              </View>
            )}
            {Array.isArray(product.images) && product.images.length > 1 && (
              <View style={[styles.badge, styles.badgeImageCount]}>
                <Ionicons name="images" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>{String(product.images.length)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contenu */}
        <View style={styles.productContent}>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text numberOfLines={2} style={styles.productName}>
                {String(product.name || 'Produit sans nom')}
              </Text>

              <View style={styles.productMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="grid-outline" size={14} color="#777E5C" />
                  <Text style={styles.metaText}>{String(categoryName)}</Text>
                </View>
                {product?.farms?.name ? (
                  <View style={styles.metaItem}>
                    <Ionicons name="business-outline" size={14} color="#777E5C" />
                    <Text numberOfLines={1} style={styles.metaText}>
                      {String(product.farms.name)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Prix / Stock */}
          <View style={styles.productFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>{money(product.price, product.currency)}</Text>
              {product.old_price ? (
                <Text style={styles.oldPrice}>{money(product.old_price, product.currency)}</Text>
              ) : null}
            </View>

            <View style={styles.stockContainer}>
              <Ionicons
                name={hasStock ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={hasStock ? '#4CAF50' : '#F44336'}
              />
              <Text style={[styles.stockText, !hasStock && styles.stockTextOut]}>
                {`${String(stock)} ${String(product.unit || 'kg')}`}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.productActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonEdit]}
              onPress={(e) => {
                e.stopPropagation?.();
                navigation.navigate('ProductForm', { mode: 'edit', product });
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={18} color="#2196F3" />
              <Text style={styles.actionButtonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                product.is_active ? styles.actionButtonDisable : styles.actionButtonEnable,
              ]}
              onPress={(e) => {
                e.stopPropagation?.();
                handleToggleStatus(product);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={product.is_active ? 'pause-outline' : 'play-outline'}
                size={18}
                color={product.is_active ? '#F44336' : '#4CAF50'}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  product.is_active ? styles.actionButtonTextDisable : styles.actionButtonTextEnable,
                ]}
              >
                {product.is_active ? 'Désactiver' : 'Activer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDelete]}
              onPress={(e) => {
                e.stopPropagation?.();
                handleDeleteProduct(product);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color="#F44336" />
              <Text style={styles.actionButtonTextDelete}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  // --- Render ----------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {farmId ? 'Produits de la Ferme' : 'Gestion des Produits'}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Ionicons name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#777E5C" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQueryLocal('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#777E5C" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() => setShowFilters((v) => !v)}
            style={styles.filterToggleButton}
          >
            <Ionicons
              name={showFilters ? 'filter' : 'filter-outline'}
              size={20}
              color={showFilters ? '#4CAF50' : '#777E5C'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters ? (
        <>
          {/* Farm filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filtrer par ferme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <FilterChip
                icon="list-outline"
                text="Toutes"
                active={!filters.farm}
                onPress={() => dispatch(setFarmFilter(null))}
              />
              {farms.map((f) => (
                <FilterChip
                  key={f.id}
                  icon="business-outline"
                  text={f.name}
                  active={filters.farm === f.id}
                  onPress={() => dispatch(setFarmFilter(f.id))}
                />
              ))}
            </ScrollView>
          </View>

          {/* Category filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filtrer par catégorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <FilterChip
                icon="list-outline"
                text="Toutes"
                active={!filters.category}
                onPress={() => dispatch(setCategoryFilter(null))}
              />
              {categories.map((c) => (
                <FilterChip
                  key={c.id}
                  icon="grid-outline"
                  text={c.name}
                  active={filters.category === c.id}
                  onPress={() => dispatch(setCategoryFilter(c.id))}
                />
              ))}
            </ScrollView>
          </View>

          {/* Status filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filtrer par statut</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <FilterChip
                icon="list-outline"
                text="Tous"
                active={filters.status === 'all'}
                onPress={() => dispatch(setStatusFilter('all'))}
              />
              <FilterChip
                icon="checkmark-circle-outline"
                text="Actifs"
                active={filters.status === 'active'}
                onPress={() => dispatch(setStatusFilter('active'))}
              />
              <FilterChip
                icon="pause-circle-outline"
                text="Inactifs"
                active={filters.status === 'inactive'}
                onPress={() => dispatch(setStatusFilter('inactive'))}
                activeColor="#F44336"
              />
            </ScrollView>
          </View>
        </>
      ) : null}

      {/* Body */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon="cube-outline" color="#4CAF50" value={displayProducts.length} label="Total" />
          <StatCard
            icon="checkmark-circle-outline"
            color="#4CAF50"
            value={displayProducts.filter((p) => p.is_active).length}
            label="Actifs"
          />
          <StatCard
            icon="close-circle-outline"
            color="#F44336"
            value={displayProducts.filter((p) => !p.is_active).length}
            label="Inactifs"
          />
        </View>

        {/* Error (optionnel) */}
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color="#C62828" />
            <Text style={styles.errorText}>
              {String(error?.message || 'Une erreur est survenue.')}
            </Text>
          </View>
        ) : null}

        {/* Loading / Empty / List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass-outline" size={48} color="#4CAF50" />
            <Text style={styles.loadingText}>Chargement des produits...</Text>
          </View>
        ) : displayProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color="#CBD5E0" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Aucun produit trouvé' : 'Aucun produit'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? "Essayez avec d'autres mots-clés" : 'Commencez par ajouter un produit'}
            </Text>
            {!searchQuery ? (
              <TouchableOpacity style={styles.addFirstButton} onPress={handleAddProduct}>
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.addFirstButtonText}>Ajouter un produit</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={styles.productsList}>
            {displayProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuButton: { padding: 8 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
  },
  addButton: { padding: 4 },

  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#283106', paddingVertical: 12 },
  clearButton: { padding: 4, marginLeft: 8 },
  filterToggleButton: { padding: 4, marginLeft: 8 },

  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterSectionTitle: { fontSize: 13, fontWeight: '600', color: '#777E5C', marginBottom: 8 },
  filterScroll: { paddingLeft: 0 },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  filterChipActive: { borderColor: '#4CAF50', backgroundColor: '#F0FDF4' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#777E5C' },
  filterChipTextActive: { color: '#4CAF50' },

  content: { flex: 1 },

  statsContainer: { flexDirection: 'row', padding: 20, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#283106', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#777E5C', marginTop: 4, fontWeight: '500' },

  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: { color: '#C62828', fontWeight: '600', flexShrink: 1 },

  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 16, color: '#777E5C', marginTop: 16 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#666666', marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#999999', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  productsList: { padding: 20, gap: 16 },

  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productImageContainer: { width: '100%', height: 180, backgroundColor: '#F8FAFC', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  placeholderMiniText: { marginTop: 6, color: '#9AA4B2', fontSize: 12 },

  imageBadges: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeInactive: { backgroundColor: 'rgba(244, 67, 54, 0.9)' },
  badgeOutOfStock: { backgroundColor: 'rgba(244, 67, 54, 0.9)' },
  badgeImageCount: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  productContent: { padding: 16 },
  productHeader: { marginBottom: 12 },
  productInfo: { gap: 8 },
  productName: { fontSize: 18, fontWeight: '700', color: '#283106', lineHeight: 24 },

  productMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#777E5C', fontWeight: '500' },

  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productPrice: { fontSize: 18, fontWeight: '700', color: '#4CAF50' },
  oldPrice: { fontSize: 14, color: '#999999', textDecorationLine: 'line-through', fontWeight: '500' },

  stockContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockText: { fontSize: 14, color: '#4CAF50', fontWeight: '600' },
  stockTextOut: { color: '#F44336' },

  productActions: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonEdit: { backgroundColor: '#E3F2FD' },
  actionButtonDisable: { backgroundColor: '#FFEBEE' },
  actionButtonEnable: { backgroundColor: '#E8F5E9' },
  actionButtonDelete: { backgroundColor: '#FFEBEE' },

  actionButtonText: { fontSize: 13, fontWeight: '600', color: '#2196F3' },
  actionButtonTextDisable: { color: '#F44336' },
  actionButtonTextEnable: { color: '#4CAF50' },
  actionButtonTextDelete: { color: '#F44336' },
});
