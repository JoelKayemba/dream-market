import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { FarmCard, ScreenWrapper } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectClientFarms,
  selectPersonalizedFarms,
  selectClientFarmsLoading,
  selectClientFarmsLoadingMore,
  selectClientFarmsPagination,
  fetchFarms,
  fetchFarmPersonalization,
} from '../store/client';
import { Ionicons } from '@expo/vector-icons';
import { localPersonalization } from '../utils/localPersonalization';

const ACCENT = '#5C6B52';
const BG = '#F7F6F3';
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;
const FARM_CARD_WIDTH = (Dimensions.get('window').width - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const getFarmProductsCount = (farm) => {
  if (typeof farm?.productCount === 'number') return farm.productCount;
  if (Array.isArray(farm?.products)) {
    if (farm.products.length === 1 && typeof farm.products[0]?.count === 'number') {
      return farm.products[0].count;
    }
    if (farm.products.some((item) => item?.id != null)) return farm.products.length;
  }
  return 0;
};

const getFarmSpecialty = (farm) => farm?.specialty || farm?.category || farm?.type || null;

export default function FarmsScreen({ navigation }) {
  const dispatch = useDispatch();
  const baseFarms = useSelector(selectClientFarms);
  const farms = useSelector(selectPersonalizedFarms);
  const loading = useSelector(selectClientFarmsLoading);
  const loadingMore = useSelector(selectClientFarmsLoadingMore);
  const pagination = useSelector(selectClientFarmsPagination);

  const [refreshing, setRefreshing] = useState(false);

  const verifiedCount = farms.filter((farm) => farm?.verified).length;
  const totalProducts = farms.reduce((sum, farm) => sum + getFarmProductsCount(farm), 0);
  const locations = [...new Set(
    farms
      .map((farm) => farm?.location || farm?.city || farm?.province)
      .filter(Boolean)
  )];
  const featuredFarms = farms.filter((farm) => farm?.verified).slice(0, 4);

  useEffect(() => {
    loadData(0, true);
  }, [dispatch]);

  const userId = useSelector((state) => state.auth?.user?.id);

  useEffect(() => {
    dispatch(fetchFarmPersonalization(userId || null));
  }, [dispatch, userId]);

  useEffect(() => {
    const ids = farms.slice(0, 12).map((farm) => farm.id);
    localPersonalization.markDisplayed(userId || null, 'farm', ids);
  }, [userId, farms]);

  const loadData = async (page = 0, refresh = false) => {
    try {
      await dispatch(
        fetchFarms({
          page,
          refresh,
          search: null,
        })
      );
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData(0, true);
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore && !refreshing) {
      loadData(pagination.page + 1, false);
    }
  }, [loadingMore, pagination.hasMore, pagination.page, refreshing]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={ACCENT} />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  const handleFarmPress = (farm) => {
    navigation.navigate('FarmDetail', { farm });
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[ACCENT]}
            tintColor={ACCENT}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroEyebrow}>Répertoire agricole RDC</Text>
            <Text style={styles.heroTitle}>Fermes référencées</Text>
            <Text style={styles.heroSubtitle}>
              Explorez les exploitations, leurs spécialités et les produits disponibles.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.navigate('Search')}
            accessibilityLabel="Rechercher"
          >
            <Ionicons name="search-outline" size={21} color="#3D3D38" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{farms.length}</Text>
            <Text style={styles.statLabel}>fermes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{verifiedCount}</Text>
            <Text style={styles.statLabel}>référencées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{locations.length}</Text>
            <Text style={styles.statLabel}>zones</Text>
          </View>
          
        </View>

        {featuredFarms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionAccentLine} />
                <View>
                  <Text style={styles.sectionTitle}>Fermes vérifiées</Text>
                  <Text style={styles.sectionSubtitle}>Exploitations avec profil confirmé</Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredRow}
            >
              {featuredFarms.map((farm) => (
                <FarmCard
                  key={`featured-${farm.id}`}
                  farm={farm}
                  navigation={navigation}
                  onPress={handleFarmPress}
                  variant="compact"
                  style={styles.featuredFarmCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccentLine} />
              <View>
                <Text style={styles.sectionTitle}>Toutes les fermes</Text>
                <Text style={styles.sectionSubtitle}>Parcourez le répertoire en grille</Text>
              </View>
            </View>
          </View>

          {loading && baseFarms.length === 0 ? (
            <View style={styles.skeletonGrid}>
              {[0, 1, 2, 3].map((k) => (
                <View key={k} style={styles.skeletonCard} />
              ))}
            </View>
          ) : (
            <FlatList
              data={farms || []}
              renderItem={({ item }) => (
                <View style={styles.cardPad}>
                  <FarmCard
                    farm={item}
                    navigation={navigation}
                    onPress={handleFarmPress}
                    variant="compact"
                    style={styles.farmCard}
                  />
                </View>
              )}
              keyExtractor={(item) => String(item.id || item.name || Math.random())}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              scrollEnabled={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="leaf-outline" size={36} color="#B8C4A8" />
                  </View>
                  <Text style={styles.emptyTitle}>Aucune ferme pour le moment</Text>
                  <Text style={styles.emptyText}>Revenez bientôt ou élargissez votre recherche.</Text>
                </View>
              }
            />
          )}
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Vous êtes producteur ?</Text>
          <Text style={styles.ctaText}>Rejoignez le réseau Dream Market.</Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => {
              const { showContactMenu } = require('../utils/contactInfo');
              showContactMenu();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>Nous contacter</Text>
            <Ionicons name="arrow-forward" size={17} color={ACCENT} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E2E0DA',
  },
  heroTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C2C28',
    letterSpacing: -0.35,
  },
  heroEyebrow: {
    fontSize: 11,
    color: ACCENT,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#86857D',
    marginTop: 5,
    lineHeight: 19,
    fontWeight: '400',
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 20,
    backgroundColor: '#EDECE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E0DA',
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C2C28',
  },
  statLabel: {
    marginTop: 2,
    fontSize: 10,
    color: '#86857D',
    fontWeight: '600',
  },
  section: {
    paddingBottom: 18,
  },
  sectionHead: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  sectionAccentLine: {
    width: 3,
    alignSelf: 'stretch',
    minHeight: 40,
    borderRadius: 2,
    backgroundColor: '#B8C4A8',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C2C28',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#86857D',
    marginTop: 3,
    fontWeight: '400',
  },
  cardPad: {
    width: FARM_CARD_WIDTH,
    marginBottom: 12,
  },
  farmCard: {
    width: '100%',
  },
  featuredRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featuredFarmCard: {
    width: FARM_CARD_WIDTH,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  skeletonGrid: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  skeletonCard: {
    width: FARM_CARD_WIDTH,
    height: 178,
    backgroundColor: '#E8E6E1',
    borderRadius: 22,
    opacity: 0.85,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#86857D',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 100,
    backgroundColor: '#EDECE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2C2C28',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#86857D',
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E0DA',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C28',
    marginBottom: 6,
    letterSpacing: -0.15,
  },
  ctaText: {
    fontSize: 13,
    color: '#86857D',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 19,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C5C9B8',
  },
  ctaBtnText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '600',
  },
});
