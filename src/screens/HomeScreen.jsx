import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Animated, 
  Dimensions,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Text,
  Button,
  Badge,
  Divider,
  SearchBar,
  CategoryCard,
  ProductCard,
  SectionHeader
} from '../components/ui';
import { selectCartItemsCount } from '../store/cartSlice';
import { 
  selectClientCategories,
  selectPopularProducts,
  selectNewProducts,
  selectPromotionProducts,
  selectClientProductsLoading,
  fetchCategories,
  fetchPopularProducts,
  fetchNewProducts,
  fetchPromotionProducts
} from '../store/client';
import { useNotifications } from '../hooks/useNotifications';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const [scrollY] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const cartItemsCount = useSelector(selectCartItemsCount);
  const [searchFocused, setSearchFocused] = useState(false);
  const scrollViewRef = useRef(null);

  // Notifications
  const { unreadCount, configurePushNotifications } = useNotifications();

  // Données du backend via Redux
  const categories = useSelector(selectClientCategories);
  const popularProducts = useSelector(selectPopularProducts);
  const newProducts = useSelector(selectNewProducts);
  const promotionProducts = useSelector(selectPromotionProducts);
  const loading = useSelector(selectClientProductsLoading);

  // Demander les permissions de notifications au montage
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      try {
        await configurePushNotifications();
      } catch (error) {
        console.error('Erreur lors de la demande de permissions:', error);
      }
    };

    requestNotificationPermissions();
  }, []);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchCategories()),
        dispatch(fetchPopularProducts()),
        dispatch(fetchNewProducts()),
        dispatch(fetchPromotionProducts())
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Debug: Vérifier les données
  console.log('📊 Categories from backend:', categories);
  console.log('📊 Popular products:', popularProducts);
  console.log('📊 New products:', newProducts);
  console.log('📊 Promotion products:', promotionProducts);
  console.log('📊 Loading state:', loading);
  console.log('📊 Categories length:', categories?.length || 0);
  
  // Debug: Vérifier les données de ferme dans les produits
  if (popularProducts && popularProducts.length > 0) {
    console.log('🏡 First popular product farm data:', popularProducts[0]?.farms);
  }

  // Gestionnaires d'événements
  const handleSearch = (query) => {
    navigation.navigate('Produits', { searchQuery: query });
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('Produits', { categoryName: category.name });
  };

  const handleProductPress = (product) => {
    // Navigation handled by ProductCard
  };

  const handleAddToCart = (product) => {
    // Handled by ProductCard
  };

  const handleAddToFavorites = (product, isFavorite) => {
    // Handled by ProductCard
  };

  const handleViewAllCategories = () => {
    navigation.navigate('Produits');
  };

  const handleViewAllProducts = () => {
    navigation.navigate('Produits');
  };

  const handleViewAllNew = () => {
    navigation.navigate('Produits', { filter: 'new' });
  };

  const handleViewAllDiscounted = () => {
    navigation.navigate('Produits', { filter: 'discounted' });
  };

  // Animation du header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });


  return (
    <View style={styles.container}>
      {/* Header animé */}
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: headerOpacity,
            transform: [{ scale: headerScale }]
          }
        ]}
      >
        <Container style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' }}
              style={styles.logo}
            />
            <View style={styles.logoText}>
              <Text style={styles.appTitle}>
                Dream Market
              </Text>
              <Text style={styles.appSubtitle}>
                Votre marché agricole de confiance
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color="#283106" />
              {unreadCount > 0 && (
                <Badge text={unreadCount.toString()} style={styles.notificationBadge} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Ionicons name="cart-outline" size={20} color="#283106" />
              {cartItemsCount > 0 && (
                <Badge text={cartItemsCount.toString()} style={styles.cartBadge} />
              )}
            </TouchableOpacity>
          </View>
        </Container>
      </Animated.View>

      {/* Barre de recherche */}
      <Container style={styles.searchSection}>
        <SearchBar
          onPress={(query) => navigation.navigate('Search', { initialQuery: query })}
          placeholder="Rechercher des produits, fermes..."
          style={styles.searchBar}
        />
      </Container>

      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Section Hero */}
        <Container style={styles.heroSection}>
          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>
                  🌾 Découvrez nos produits frais
                </Text>
                <Text style={styles.heroSubtitle}>
                  Des produits locaux et bio directement de nos fermes partenaires
                </Text>
                <View style={{ height: 16 }} />
                <Button
                  title="Explorer le catalogue"
                  onPress={() => navigation.navigate('Produits')}
                  variant="primary"
                  size="small"
                />
              </View>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' }}
                style={styles.heroImage}
              />
            </View>
          </View>
        </Container>

        {/* Section Catégories Populaires */}
        <Container style={styles.section}>
          <SectionHeader
            title="Catégories Populaires"
            subtitle="Explorez nos catégories les plus demandées"
            actionText="Voir tout"
            onActionPress={handleViewAllCategories}
          />
          
          <View style={styles.categoriesGrid}>
            {(categories && categories.length > 0) ? categories.slice(0, 4).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
                    <Text style={[styles.categoryIcon, { fontSize: 28, color: category.color }]}>
                      {category.emoji || '❓'}
                    </Text>
                  </View>
                  <Text style={styles.categoryLabel}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
            )) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement des catégories...</Text>
              </View>
            )}
          </View>
        </Container>

        <Divider />

        {/* Section Produits Vedettes */}
        <Container style={styles.section}>
          <SectionHeader
            title="Produits Vedettes"
            subtitle="Nos produits les plus appréciés"
            actionText="Voir tout"
            onActionPress={() => navigation.navigate('AllProducts', { filter: 'featured' })}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          >
            {(popularProducts || []).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigation={navigation}
                variant="featured"
                size="large"
                style={styles.featuredProductCard}
              />
            ))}
          </ScrollView>
        </Container>

        <Divider />

        {/* Section Nouveautés */}
        <Container style={styles.section}>
          <SectionHeader
            title="Nouveautés"
            subtitle="Découvrez nos derniers arrivages"
            actionText="Voir tout"
            onActionPress={() => navigation.navigate('AllProducts', { filter: 'new' })}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          >
            {(newProducts || []).slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigation={navigation}
                variant="featured"
                size="large"
                style={styles.newProductCard}
              />
            ))}
          </ScrollView>
        </Container>

        <Divider />

        {/* Section Promotions */}
        <Container style={styles.section}>
          <SectionHeader
            title="Promotions"
            subtitle="Profitez de nos offres spéciales"
            actionText="Voir tout"
            onActionPress={() => navigation.navigate('AllProducts', { filter: 'promotions' })}
          />
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
          >
            {(promotionProducts || []).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigation={navigation}
                variant="featured"
                size="large"
                style={styles.promotionProductCard}
              />
            ))}
          </ScrollView>
        </Container>

        <Divider />

        {/* Section Services */}
        <Container style={styles.section}>
          <SectionHeader
            title="Nos Services"
            subtitle="Nous vous accompagnons dans vos achats"
            actionText="En savoir plus"
            onActionPress={() => navigation.navigate('Services')}
          />
          
          <View style={styles.servicesGrid}>
            <View style={styles.serviceCard}>
              <Ionicons name="car-outline" size={24} color="#283106" />
              <Text style={styles.serviceTitle}>
                Livraison Rapide
              </Text>
              <Text style={styles.serviceDescription}>
                Livraison à domicile en 24h
              </Text>
            </View>

            <View style={styles.serviceCard}>
              <Ionicons name="leaf-outline" size={24} color="#283106" />
              <Text style={styles.serviceTitle}>
                Produits Bio
              </Text>
              <Text style={styles.serviceDescription}>
                Certification agriculture biologique
              </Text>
            </View>

            <View style={styles.serviceCard}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#283106" />
              <Text style={styles.serviceTitle}>
                Qualité Garantie
              </Text>
              <Text style={styles.serviceDescription}>
                Contrôle qualité rigoureux
              </Text>
            </View>
          </View>
        </Container>

        <View style={{ height: 32 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: -20,
  },
  header: {
    backgroundColor: '#f5f5f5f',
    paddingTop: 5,
    paddingBottom: 5,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  logoText: {
    flex: 1,
  },
  appTitle: {
    color: '#283106',
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 18,
    lineHeight: 20,
  },
  appSubtitle: {
    color: '#777E5C',
    fontSize: 11,
    lineHeight: 13,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -10,
    right: 0,
    backgroundColor: '#FF6B6B',
  },
  cartButton: {
    position: 'relative',
    padding: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -10,
    right: 0,
    backgroundColor: '#4CAF50',
  },
  searchSection: {
    paddingVertical: 5,
    backgroundColor: '#f5f5f5',
    
    
  },
  searchBar: {
    width: '100%',
  },
  scrollView: {
    flex: 1,
    
  },
  scrollContent: {
    paddingBottom: 16,
  },
  heroSection: {
    paddingVertical: 16,
  },
  heroCard: {
    padding: 0,
    overflow: 'hidden',
    marginHorizontal: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 140,
  },
  heroText: {
    flex: 1,
    marginRight: 16,
  },
  heroTitle: {
    color: '#283106',
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
    fontSize: 18,
  },
  heroSubtitle: {
    color: '#777E5C',
    marginBottom: 16,
    lineHeight: 18,
    fontSize: 14,
  },
  heroImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0', // Placeholder for image
  },
  section: {
    paddingVertical: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 8,
  },
  categoryCard: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
    justifyContent: 'center',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 28,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#283106',
    lineHeight: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#777E5C',
    fontStyle: 'italic',
  },
  productsContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 8,
  },
  featuredProductCard: {
    marginRight: 0,
  },
  newProductCard: {
    marginRight: 0,
  },
  promotionProductCard: {
    marginRight: 0,
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    gap: 8,
  },
  serviceCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    minWidth: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitle: {
    color: '#283106',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 16,
  },
  serviceDescription: {
    color: '#777E5C',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 13,
  },
});
