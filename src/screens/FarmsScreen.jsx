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
} from 'react-native';
import { FarmCard, ScreenWrapper } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectClientFarms,
  selectClientFarmsLoading,
  selectClientFarmsLoadingMore,
  selectClientFarmsPagination,
  fetchFarms,
} from '../store/client';
import { Ionicons } from '@expo/vector-icons';

const ACCENT = '#5C6B52';
const BG = '#F7F6F3';

export default function FarmsScreen({ navigation }) {
  const dispatch = useDispatch();
  const farms = useSelector(selectClientFarms);
  const loading = useSelector(selectClientFarmsLoading);
  const loadingMore = useSelector(selectClientFarmsLoadingMore);
  const pagination = useSelector(selectClientFarmsPagination);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData(0, true);
  }, [dispatch]);

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
          <View style={styles.heroAccent} />
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>Fermes partenaires</Text>
            <Text style={styles.heroSubtitle}>
              Producteurs locaux — qualité et traçabilité
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

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccentLine} />
              <View>
                <Text style={styles.sectionTitle}>Répertoire</Text>
                <Text style={styles.sectionSubtitle}>Exploitations référencées</Text>
              </View>
            </View>
          </View>

          {loading && farms.length === 0 ? (
            <View style={styles.skeletonBlock}>
              {[0, 1, 2].map((k) => (
                <View key={k} style={[styles.skeletonCard, k < 2 && { marginBottom: 14 }]} />
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
                    variant="minimal"
                    style={styles.farmCard}
                  />
                </View>
              )}
              keyExtractor={(item) => String(item.id || item.name || Math.random())}
              numColumns={1}
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
    marginBottom: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E0DA',
  },
  heroAccent: {
    width: 3,
    alignSelf: 'stretch',
    minHeight: 44,
    borderRadius: 2,
    backgroundColor: '#B8C4A8',
  },
  heroTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2C2C28',
    letterSpacing: -0.35,
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
    borderRadius: 12,
    backgroundColor: '#EDECE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingBottom: 8,
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
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  farmCard: {
    width: '100%',
  },
  skeletonBlock: {
    paddingHorizontal: 16,
  },
  skeletonCard: {
    height: 132,
    backgroundColor: '#E8E6E1',
    borderRadius: 14,
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
    borderRadius: 40,
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
    borderRadius: 14,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C5C9B8',
  },
  ctaBtnText: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '600',
  },
});
