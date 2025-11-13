import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, Text, RefreshControl, ActivityIndicator, Animated, Easing } from 'react-native';
import { 
  Container, 
  SearchBar,
  SectionHeader,
  Divider,
  Badge,
  Rating,
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
import { MaterialIcons } from '@expo/vector-icons';

export default function ServicesScreen({ navigation }) {
  const dispatch = useDispatch();
  const services = useSelector(selectClientServices);
  const loading = useSelector(selectClientServicesLoading);
  const loadingMore = useSelector(selectClientServicesLoadingMore);
  const pagination = useSelector(selectClientServicesPagination);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleContact = (service) => {
    const { showContactMenu } = require('../utils/contactInfo');
    showContactMenu(service?.name);
  };

  const getServiceIcon = (category) => {
    const icons = {
      'maintenance': 'build',
      'réparation': 'handyman',
      'conseil': 'psychology',
      'formation': 'school',
      'installation': 'engineering',
      'default': 'handyman'
    };
    return icons[category?.toLowerCase()] || icons.default;
  };

  // Header (sera injecté dans ListHeaderComponent)
  const Header = () => (
    <>
      <View style={styles.headerContainer}>
        <Container style={styles.header}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="handyman" size={32} color="#4CAF50" style={styles.titleIcon} />
            <View>
              <Text style={styles.title}>Nos Services</Text>
              <Text style={styles.subtitle}>
                Solutions complètes pour professionnels agricoles
              </Text>
            </View>
          </View>
          <Container style={styles.searchSection}>
            <SearchBar
              placeholder="Rechercher des services, catégories..."
              onPress={(query) => navigation.navigate('Search', { initialQuery: query })}
            />
          </Container>
        </Container>
      </View>
      <Divider style={styles.divider} />
      <Container style={styles.section}>
        <SectionHeader
          title="Tous nos services"
          subtitle="Découvrez nos solutions professionnelles"
          style={styles.fullWidthHeader}
          icon="list"
        />
      </Container>
    </>
  );

  // Footer de fin de liste + CTA
  const Footer = () => (
    <>
      {loadingMore && (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.footerLoaderText}>Chargement...</Text>
        </View>
      )}
      <Container style={styles.ctaSection}>
        <View style={styles.ctaCard}>
          <MaterialIcons name="business-center" size={48} color="#4CAF50" />
          <Text style={styles.ctaTitle}>Vous proposez un service ?</Text>
          <Text style={styles.ctaText}>
            Rejoignez notre plateforme et proposez vos services aux agriculteurs
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => {
              const { showContactMenu } = require('../utils/contactInfo');
              showContactMenu();
            }}
          >
            <MaterialIcons name="add-business" size={20} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>Proposer un service</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </>
  );

  // Élément avec petite animation d’apparition “une par une”
  const AnimatedCard = ({ index, children }) => {
    const translateY = useRef(new Animated.Value(10)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const delay = Math.min(index * 60, 600); // étalement léger
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, delay, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(translateY, { toValue: 0, duration: 220, delay, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      ]).start();
    }, [index, opacity, translateY]);

    return (
      <Animated.View style={{ transform: [{ translateY }], opacity }}>
        {children}
      </Animated.View>
    );
  };

  const renderItem = ({ item, index }) => (
    <AnimatedCard index={index}>
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() => handleServicePress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.serviceImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.serviceImage} resizeMode="cover" />
          ) : (
            <View style={styles.serviceImagePlaceholder}>
              <MaterialIcons name={getServiceIcon(item.category)} size={48} color="#4CAF50" />
            </View>
          )}

          <View style={styles.badges}>
            {item.is_active && (
              <Badge text="Actif" variant="success" size="small" icon="check-circle" />
            )}
            {!!item.category && (
              <Badge text={item.category} variant="outline" size="small" />
            )}
          </View>

          <TouchableOpacity style={styles.favoriteButton}>
            <MaterialIcons name="favorite-border" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.serviceContent}>
          <Text style={styles.serviceName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.serviceDescription} numberOfLines={3}>
            {item.short_description || item.description}
          </Text>

          <View style={styles.serviceMeta}>
            <View style={styles.servicePrice}>
              <Text style={styles.priceText}>{item.price}</Text>
              {!!item.price_details && <Text style={styles.priceDetails}>{item.price_details}</Text>}
            </View>
            <View style={styles.duration}>
              <MaterialIcons name="schedule" size={14} color="#777E5C" />
              <Text style={styles.durationText}>{item.duration || 'Sur devis'}</Text>
            </View>
          </View>

          <View style={styles.serviceFooter}>
            <View style={styles.ratingContainer}>
              <Rating value={item.rating} size="small" />
              <Text style={styles.reviewCount}>({item.review_count || 0})</Text>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={() => handleContact(item)}>
              <MaterialIcons name="chat" size={16} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Contacter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="handyman" size={64} color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des services...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <FlatList
        data={services || []}
        keyExtractor={(item) => String(item.id)}
        // 👉 Choisis 1 pour “une par ligne”, ou 2 pour grille
        numColumns={1}
        // Espace horizontal entre colonnes si > 1
        columnWrapperStyle={undefined} 
        renderItem={renderItem}
        ListHeaderComponent={<Header />}
        ListFooterComponent={<Footer />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="handyman" size={64} color="#CCCCCC" />
            <Text style={styles.emptyStateTitle}>Aucun service disponible</Text>
            <Text style={styles.emptyStateText}>Aucun service n'est disponible pour le moment.</Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28, paddingHorizontal: 12 }}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={10}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: {
    backgroundColor: '#F8FDF8',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  header: { paddingVertical: 20 },
  titleContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  titleIcon: { marginRight: 12, marginTop: 4 },
  title: { fontSize: 28, fontWeight: '700', color: '#283106', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#777E5C', lineHeight: 22, width: '90%' },
  searchSection: { paddingHorizontal: 0 },
  divider: { marginVertical: 8 },
  section: { paddingVertical: 0, paddingHorizontal: 12 },
  fullWidthHeader: { marginBottom: 8 },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16
  },
  serviceImageContainer: { position: 'relative', height: 160 },
  serviceImage: { width: '100%', height: '100%' },
  serviceImagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  badges: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 8 },
  favoriteButton: {
    position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  serviceContent: { padding: 16 },
  serviceName: { fontSize: 18, fontWeight: '700', color: '#283106', marginBottom: 8, lineHeight: 22 },
  serviceDescription: { fontSize: 14, color: '#777E5C', marginBottom: 12, lineHeight: 20 },
  serviceMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  servicePrice: { flex: 1 },
  priceText: { fontSize: 18, fontWeight: '700', color: '#4CAF50', marginBottom: 2 },
  priceDetails: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: { fontSize: 12, color: '#777E5C' },
  serviceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewCount: { fontSize: 12, color: '#999', marginLeft: 4 },
  contactButton: {
    backgroundColor: '#283106', flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
    shadowColor: '#283106', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },
  contactButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20, backgroundColor: '#FFFFFF' },
  loadingText: { fontSize: 16, color: '#777E5C', fontStyle: 'italic', marginTop: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', color: '#666666', marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: '#999999', textAlign: 'center', lineHeight: 20 },
  footerLoader: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  footerLoaderText: { marginTop: 8, fontSize: 12, color: '#777E5C' },
  ctaSection: { paddingVertical: 24, paddingHorizontal: 10 },
  ctaCard: {
    backgroundColor: '#F0F8F0', borderRadius: 20, padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: '#E0F0E0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  ctaTitle: { fontSize: 20, fontWeight: '700', color: '#283106', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  ctaText: { fontSize: 14, color: '#777E5C', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  ctaButton: {
    backgroundColor: '#4CAF50', flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 32, paddingVertical: 12, borderRadius: 25,
    shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  ctaButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
