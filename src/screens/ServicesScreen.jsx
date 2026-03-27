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
import { ServiceCard, ScreenWrapper } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectClientServices,
  selectClientServicesLoading,
  selectClientServicesLoadingMore,
  selectClientServicesPagination,
  fetchServices,
} from '../store/client';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#2F8F46';

export default function ServicesScreen({ navigation }) {
  const dispatch = useDispatch();
  const services = useSelector(selectClientServices);
  const loading = useSelector(selectClientServicesLoading);
  const loadingMore = useSelector(selectClientServicesLoadingMore);
  const pagination = useSelector(selectClientServicesPagination);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData(0, true);
  }, []);

  const loadData = async (page = 0, refresh = false) => {
    try {
      await dispatch(fetchServices({ page, refresh }));
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData(0, true);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && pagination?.hasMore && !refreshing) {
      loadData((pagination?.page ?? 0) + 1, false);
    }
  }, [loadingMore, pagination, refreshing]);

  const handleServicePress = (service) => {
    navigation.navigate('ServiceDetail', { service });
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={GREEN} />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
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
          <View style={[styles.heroIconWrap, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="construct" size={26} color="#2563EB" />
          </View>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroTitle}>Services pro</Text>
            <Text style={styles.heroSubtitle}>Accompagnement, logistique et solutions sur mesure</Text>
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
            <Text style={styles.sectionTitle}>Nos services</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllServices')}
              style={styles.seeAll}
              activeOpacity={0.75}
            >
              <Text style={styles.seeAllText}>Tout voir</Text>
              <Ionicons name="chevron-forward" size={18} color={GREEN} />
            </TouchableOpacity>
          </View>

          {loading && services.length === 0 ? (
            <View style={styles.skeletonBlock}>
              {[0, 1, 2].map((k) => (
                <View key={k} style={[styles.skeletonCard, k < 2 && { marginBottom: 14 }]} />
              ))}
            </View>
          ) : (
            <FlatList
              data={services || []}
              renderItem={({ item }) => (
                <View style={styles.cardPad}>
                  <ServiceCard
                    service={item}
                    navigation={navigation}
                    onPress={handleServicePress}
                    variant="default"
                    fullWidth={true}
                    style={styles.serviceCard}
                  />
                </View>
              )}
              keyExtractor={(item) => String(item.id)}
              numColumns={1}
              scrollEnabled={false}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Ionicons name="construct-outline" size={40} color="#2563EB" style={{ opacity: 0.45 }} />
                  </View>
                  <Text style={styles.emptyTitle}>Aucun service pour le moment</Text>
                  <Text style={styles.emptyText}>Les offres seront bientôt disponibles.</Text>
                </View>
              }
            />
          )}
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Vous proposez un service ?</Text>
          <Text style={styles.ctaText}>Listez votre activité sur Dream Market.</Text>
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
  serviceCard: {
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
