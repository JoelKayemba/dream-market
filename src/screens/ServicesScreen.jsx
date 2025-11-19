import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Dimensions, TouchableOpacity, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { 
  ServiceCard,
  Divider,
  ScreenWrapper 
} from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectClientServices, 
  selectClientServicesLoading,
  selectClientServicesLoadingMore,
  selectClientServicesPagination,
  fetchServices
} from '../store/client';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_PADDING * 2 - CARD_GAP) / 2;

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
        <ActivityIndicator size="small" color="#4CAF50" />
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
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Header simple et élégant */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Services</Text>
              <Text style={styles.subtitle}>Solutions professionnelles</Text>
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Ionicons name="search-outline" size={22} color="#283106" />
            </TouchableOpacity>
          </View>
        </View>

        <Divider />

        {/* Section Tous les services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Tous les services</Text>
              <Text style={styles.sectionSubtitle}>Solutions complètes</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('AllServices')}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>Tout voir</Text>
              <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </View>
          
          {loading && services.length === 0 ? (
            <View style={styles.skeletonContainer}>
              {Array.from({ length: 4 }).map((_, index) => (
                <View key={`service-skeleton-${index}`} style={styles.skeletonCard} />
              ))}
            </View>
          ) : (
            <FlatList
              data={services || []}
              renderItem={({ item }) => (
                <View style={styles.serviceCardWrapper}>
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
                  <Ionicons name="construct-outline" size={48} color="#E0E0E0" />
                  <Text style={styles.emptyStateTitle}>Aucun service</Text>
                  <Text style={styles.emptyStateText}>
                    Aucun service disponible pour le moment.
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Ionicons name="business-outline" size={40} color="#4CAF50" />
            <Text style={styles.ctaTitle}>Vous proposez un service ?</Text>
            <Text style={styles.ctaText}>
              Rejoignez notre plateforme et proposez vos services
            </Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => {
                const { showContactMenu } = require('../utils/contactInfo');
                showContactMenu();
              }}
            >
              <Text style={styles.ctaButtonText}>Nous contacter</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F8F0',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4CAF50',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
  },
  serviceCardWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  serviceCard: {
    width: '100%',
  },
  skeletonCard: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  ctaCard: {
    backgroundColor: '#F0F8F0',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F0E0',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  spacer: {
    height: 24,
  },
});
