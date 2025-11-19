import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import SafeAreaWrapper from '../../../components/SafeAreaWrapper';

import {
  fetchProducts,
  deleteProduct,
  toggleProductStatus,
  selectAdminProducts,
  selectAdminProductsLoading,
  selectAdminProductsLoadingMore,
  selectAdminProductsError,
  selectAdminProductsPagination,
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

/* ============================
   Helpers & sous-composants
   ============================ */

const money = (price, currency) => {
  const p = Number(price || 0);
  if (currency === 'USD') return `$${p.toFixed(2)}`;
  return `${Math.round(p).toString()} FC`;
};

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

const ProductCard = memo(function ProductCard({
  product,
  categories,
  navigation,
  onToggleStatus,
  onDelete,
}) {
  const categoryName = product.category_id
    ? (categories.find((c) => c.id === product.category_id)?.name || 'Non catégorisé')
    : 'Non catégorisé';

  const productImage = (product.images && product.images[0]) || product.image || null;
  const stock = Number(product.stock || 0);
  const hasStock = stock > 0;

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product })}
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
              onToggleStatus(product);
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
              onDelete(product);
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

function FixedHeader({
  navigation,
  farmId,
  searchQuery,
  onChangeSearch,
  showFilters,
  onToggleFilters,
  onAddProduct,
}) {
  return (
    <>
      {/* Top bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {farmId ? 'Produits de la Ferme' : 'Gestion des Produits'}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddProduct}>
          <Ionicons name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#777E5C" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={onChangeSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => onChangeSearch('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#777E5C" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={onToggleFilters} style={styles.filterToggleButton}>
            <Ionicons
              name={showFilters ? 'filter' : 'filter-outline'}
              size={20}
              color={showFilters ? '#4CAF50' : '#777E5C'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

function ScrollingHeader({
  showFilters,
  filters,
  farms,
  categories,
  onSetFarmFilter,
  onSetCategoryFilter,
  onSetStatusFilter,
  displayProducts,
  pagination,
  error,
}) {
  return (
    <View>
      {/* Filters */}
      {showFilters ? (
        <>
          {/* Farm filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filtrer par ferme</Text>
            <FlatList
              data={[{ id: '__all__', name: 'Toutes' }, ...farms]}
              keyExtractor={(item) => String(item.id || item.name)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const isAll = item.id === '__all__';
                const active = isAll ? !filters.farm : filters.farm === item.id;
                return (
                  <FilterChip
                    icon={isAll ? 'list-outline' : 'business-outline'}
                    text={isAll ? 'Toutes' : item.name}
                    active={active}
                    onPress={() => onSetFarmFilter(isAll ? null : item.id)}
                  />
                );
              }}
            />
          </View>

          {/* Category filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filtrer par catégorie</Text>
            <FlatList
              data={[{ id: '__all__', name: 'Toutes' }, ...categories]}
              keyExtractor={(item) => String(item.id || item.name)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const isAll = item.id === '__all__';
                const active = isAll ? !filters.category : filters.category === item.id;
                return (
                  <FilterChip
                    icon="grid-outline"
                    text={isAll ? 'Toutes' : item.name}
                    active={active}
                    onPress={() => onSetCategoryFilter(isAll ? null : item.id)}
                  />
                );
              }}
            />
          </View>

          {/* Status filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filtrer par statut</Text>
            <FlatList
              data={[
                { id: 'all', label: 'Tous', icon: 'list-outline' },
                { id: 'active', label: 'Actifs', icon: 'checkmark-circle-outline' },
                {
                  id: 'inactive',
                  label: 'Inactifs',
                  icon: 'pause-circle-outline',
                  color: '#F44336',
                },
                {
                  id: 'out_of_stock',
                  label: 'Rupture de stock',
                  icon: 'alert-circle-outline',
                  color: '#FF9800',
                },
              ]}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <FilterChip
                  icon={item.icon}
                  text={item.label}
                  active={filters.status === item.id}
                  onPress={() => onSetStatusFilter(item.id)}
                  activeColor={item.color || '#4CAF50'}
                />
              )}
            />
          </View>
        </>
      ) : null}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="cube-outline"
          color="#4CAF50"
          value={pagination?.total ?? displayProducts.length}
          label="Total"
        />
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
        <StatCard
          icon="alert-circle-outline"
          color="#FF9800"
          value={displayProducts.filter((p) => {
            const stock = p.stock;
            return stock !== null && stock !== undefined && stock === 0;
          }).length}
          label="Rupture"
        />
      </View>

      {/* Error banner */}
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color="#C62828" />
          <Text style={styles.errorText}>
            {String(error?.message || 'Une erreur est survenue.')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function ListEmpty({ searchQuery, onAddProduct }) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="leaf-outline" size={64} color="#CBD5E0" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Aucun produit trouvé' : 'Aucun produit'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? "Essayez avec d'autres mots-clés" : 'Commencez par ajouter un produit'}
      </Text>
      {!searchQuery ? (
        <TouchableOpacity style={styles.addFirstButton} onPress={onAddProduct}>
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.addFirstButtonText}>Ajouter un produit</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

/* ============================
   Composant principal
   ============================ */

export default function ProductsManagement({ navigation, route }) {
  const dispatch = useDispatch();
  const { farmId } = (route && route.params) || {};

  // Local UI state
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Redux selectors
  const products = useSelector(selectAdminProducts);
  const filteredProducts = useSelector(selectFilteredProducts);
  const loading = useSelector(selectAdminProductsLoading);
  const loadingMore = useSelector(selectAdminProductsLoadingMore);
  const pagination = useSelector(selectAdminProductsPagination);
  const error = useSelector(selectAdminProductsError);
  const filters = useSelector(selectAdminProductsFilters);
  const categories = useSelector(selectAdminCategories) || [];
  const farms = useSelector(selectAllFarms) || [];

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchProducts({ page: 0, refresh: true }));
    dispatch(fetchCategories());
    dispatch(fetchFarms());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchProducts({ page: 0, refresh: true }));
    setRefreshing(false);
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && pagination?.hasMore && !refreshing) {
      dispatch(fetchProducts({ page: (pagination?.page ?? 0) + 1, refresh: false }));
    }
  }, [loadingMore, pagination, refreshing, dispatch]);

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 8 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  // Sync search to store
  useEffect(() => {
    dispatch(setSearch(searchQuery));
  }, [searchQuery, dispatch]);

  const handleSearchChange = (text) => setSearchQueryLocal(text);

  const handleAddProduct = () => {
    navigation.navigate('ProductForm', { mode: 'add', farmId });
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

  return (
    <SafeAreaWrapper style={styles.container}>
      {/* Header + Search FIXES */}
      <FixedHeader
        navigation={navigation}
        farmId={farmId}
        searchQuery={searchQuery}
        onChangeSearch={handleSearchChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onAddProduct={handleAddProduct}
      />

      {/* Liste défilante */}
      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={48} color="#4CAF50" />
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      ) : (
        <FlatList
          data={displayProducts}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              categories={categories}
              navigation={navigation}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteProduct}
            />
          )}
          keyExtractor={(item) => String(item.id)}
          numColumns={1}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <ScrollingHeader
              showFilters={showFilters}
              filters={filters}
              farms={farms}
              categories={categories}
              onSetFarmFilter={(id) => dispatch(setFarmFilter(id))}
              onSetCategoryFilter={(id) => dispatch(setCategoryFilter(id))}
              onSetStatusFilter={(id) => dispatch(setStatusFilter(id))}
              displayProducts={displayProducts}
              pagination={pagination}
              error={error}
            />
          }
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <ListEmpty searchQuery={searchQuery} onAddProduct={handleAddProduct} />
          }
          removeClippedSubviews
          initialNumToRender={8}
          windowSize={10}
        />
      )}
    </SafeAreaWrapper>
  );
}

/* ============================
   Styles
   ============================ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  /* Fixed header */
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

  /* Fixed search */
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

  /* Scrolling header */
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterSectionTitle: { fontSize: 13, fontWeight: '600', color: '#777E5C', marginBottom: 8 },

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

  /* Stats */
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

  /* Error banner */
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

  /* List & items */
  productsList: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, rowGap: 16 },
  footerLoader: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  footerLoaderText: { marginTop: 8, fontSize: 12, color: '#777E5C' },

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
    marginBottom: 16,
  },
  productImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
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

  productActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
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

  /* Loading & Empty */
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 16, color: '#777E5C', marginTop: 16 },

  emptyContainer: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
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
});
