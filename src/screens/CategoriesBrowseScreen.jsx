import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenWrapper, ProductCard } from '../components/ui';
import { ProductCardSkeleton } from '../components/Skeleton';
import {
  selectClientProducts,
  selectClientCategories,
  selectClientProductsLoading,
  selectClientProductsLoadingMore,
  selectClientProductsPagination,
  fetchCategories,
  fetchProducts,
} from '../store/client';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_PADDING * 2 - CARD_GAP) / 2;

export default function CategoriesBrowseScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const routeCategoryName = route.params?.categoryName ?? null;

  const categories = useSelector(selectClientCategories);
  const products = useSelector(selectClientProducts);
  const loading = useSelector(selectClientProductsLoading);
  const loadingMore = useSelector(selectClientProductsLoadingMore);
  const pagination = useSelector(selectClientProductsPagination);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [routeSynced, setRouteSynced] = useState(() => !routeCategoryName);
  const [refreshing, setRefreshing] = useState(false);

  const sortedCategories = useMemo(
    () =>
      [...(categories || [])].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' })
      ),
    [categories]
  );

  useEffect(() => {
    dispatch(fetchCategories())
      .unwrap()
      .catch(() => {})
      .finally(() => setCategoriesReady(true));
  }, [dispatch]);

  useEffect(() => {
    setRouteSynced(!routeCategoryName);
    setSelectedCategoryId(null);
  }, [routeCategoryName]);

  /** Résout categoryName → id après chargement des rayons (pas de fetch « tous » avant la résolution) */
  useEffect(() => {
    if (routeSynced) return;
    if (!routeCategoryName) return;
    if (!categoriesReady) return;
    const cat = (categories || []).find((c) => c.name === routeCategoryName);
    setSelectedCategoryId(cat?.id ?? null);
    setRouteSynced(true);
  }, [routeCategoryName, categories, categoriesReady, routeSynced]);

  useEffect(() => {
    if (!routeSynced) return;
    dispatch(
      fetchProducts({
        page: 0,
        refresh: true,
        categoryId: selectedCategoryId,
      })
    );
  }, [dispatch, selectedCategoryId, routeSynced]);

  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && pagination.hasMore) {
      dispatch(
        fetchProducts({
          page: pagination.page + 1,
          refresh: false,
          categoryId: selectedCategoryId,
        })
      );
    }
  }, [loadingMore, pagination.hasMore, pagination.page, selectedCategoryId, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchCategories());
      await dispatch(
        fetchProducts({
          page: 0,
          refresh: true,
          categoryId: selectedCategoryId,
        })
      );
    } finally {
      setRefreshing(false);
    }
  };

  const selectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setRouteSynced(true);
  };

  const renderChip = (category, categoryId, _isAll) => {
    const selected = _isAll ? selectedCategoryId === null : selectedCategoryId === categoryId;
    const label = _isAll ? 'Tous' : category?.name;
    const emoji = _isAll ? '🛒' : category?.emoji || '🏷️';

    return (
      <TouchableOpacity
        key={_isAll ? 'all' : categoryId}
        style={[styles.chip, selected && styles.chipSelected]}
        onPress={() => selectCategory(categoryId)}
        activeOpacity={0.85}
      >
        <Text style={styles.chipEmoji}>{emoji}</Text>
        <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const chipsHeader = (
    <View style={styles.chipsSection}>
      <Text style={styles.chipsHint}>Filtrer par rayon</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {renderChip(null, null, true)}
        {sortedCategories.map((cat) => renderChip(cat, cat.id, false))}
      </ScrollView>
    </View>
  );

  const renderProductRow = ({ item }) => (
    <ProductCard
      product={item}
      navigation={navigation}
      variant="default"
      size="medium"
      fullWidth={false}
      style={[styles.productCard, { width: CARD_WIDTH }]}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6B735A" />
      </View>
    );
  };

  const showSkeleton =
    !routeSynced || (loading && !refreshing && products.length === 0);

  return (
    <ScreenWrapper style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color="#2C2C28" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Catégories</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      {showSkeleton ? (
        <>
          {chipsHeader}
          <View style={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={`sk-${i}`} width={CARD_WIDTH} />
            ))}
          </View>
        </>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductRow}
          numColumns={2}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={chipsHeader}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Ionicons name="leaf-outline" size={36} color="#B8C4A8" />
                <Text style={styles.emptyTitle}>Aucun produit dans ce rayon</Text>
                <Text style={styles.emptyHint}>Essayez « Tous » ou un autre rayon.</Text>
              </View>
            ) : null
          }
          ListFooterComponent={renderFooter}
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B735A" />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E0DA',
    backgroundColor: '#F7F6F3',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    width: 44,
    height: 44,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C2C28',
    letterSpacing: -0.2,
  },
  chipsSection: {
    paddingBottom: 16,
    paddingTop: 4,
  },
  chipsHint: {
    fontSize: 12,
    fontWeight: '500',
    color: '#86857D',
    marginBottom: 10,
    paddingHorizontal: CARD_PADDING,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: CARD_PADDING,
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E0DA',
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipSelected: {
    backgroundColor: '#EEF2EA',
    borderColor: '#B8C4A8',
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3D3D38',
  },
  chipLabelSelected: {
    color: '#3D4D38',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: CARD_PADDING,
    paddingBottom: 32,
  },
  columnWrap: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  productCard: {
    marginBottom: 0,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: CARD_PADDING,
    gap: CARD_GAP,
  },
  footerLoader: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C28',
    textAlign: 'center',
  },
  emptyHint: {
    marginTop: 6,
    fontSize: 13,
    color: '#86857D',
    textAlign: 'center',
  },
});
