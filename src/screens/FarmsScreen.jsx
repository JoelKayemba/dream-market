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

const GREEN = '#2F8F46';

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
        <ActivityIndicator size="small" color={GREEN} />
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
            colors={[GREEN]}
            tintColor={GREEN}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="leaf" size={26} color={GREEN} />
          </View>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>Fermes partenaires</Text>
            <Text style={styles.heroSubtitle}>Des producteurs locaux sélectionnés pour vous</Text>
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => navigation.navigate('Search')}
            accessibilityLabel="Rechercher"
          >
            <Ionicons name="search-outline" size={22} color="#283106" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>À découvrir</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllFarms')}
              style={styles.seeAll}
              activeOpacity={0.75}
            >
              <Text style={styles.seeAllText}>Tout voir</Text>
              <Ionicons name="chevron-forward" size={18} color={GREEN} />
            </TouchableOpacity>
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
                    <Ionicons name="leaf-outline" size={40} color={GREEN} style={{ opacity: 0.4 }} />
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
            activeOpacity={0.9}
          >
            <Text style={styles.ctaBtnText}>Nous contacter</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
    backgroundColor: '#F4F7F5',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8EDE9',
    shadowColor: '#0F1E13',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTextCol: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingBottom: 8,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN,
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
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    opacity: 0.6,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8EDE9',
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  ctaText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GREEN,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
