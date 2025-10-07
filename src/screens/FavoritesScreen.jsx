import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  RefreshControl,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  Container, 
  SectionHeader,
  Divider,
  ProductCard,
  FarmCard,
  ServiceCard,
  Button
 , ScreenWrapper } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectFavorites,
  selectFavoriteProducts,
  selectFavoriteFarms,
  selectFavoriteServices,
  selectFavoritesLoading,
  selectFavoritesError,
  fetchUserFavorites,
  removeFromFavorites,
  clearFavorites,
  clearError
} from '../store/favoritesSlice';
import { useAuth } from '../hooks/useAuth';

export default function FavoritesScreen({ navigation }) {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'products', 'farms', 'services'
  
  // Redux selectors
  const favorites = useSelector(selectFavorites);
  const favoriteProducts = useSelector(selectFavoriteProducts);
  const favoriteFarms = useSelector(selectFavoriteFarms);
  const favoriteServices = useSelector(selectFavoriteServices);
  const loading = useSelector(selectFavoritesLoading);
  const error = useSelector(selectFavoritesError);
  
  // Auth
  const { user } = useAuth();

  // Charger les favoris au montage du composant
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserFavorites(user.id));
    }
  }, [dispatch, user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.id) {
        await dispatch(fetchUserFavorites(user.id)).unwrap();
      }
    } catch (error) {
      console.error('Erreur lors du refresh des favoris:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Vider les favoris',
      'Êtes-vous sûr de vouloir supprimer tous vos favoris ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Vider', 
          style: 'destructive',
          onPress: () => {
            dispatch(clearFavorites());
            Alert.alert('Favoris vidés', 'Tous vos favoris ont été supprimés.');
          }
        }
      ]
    );
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleFarmPress = (farm) => {
    navigation.navigate('FarmDetail', { farm });
  };

  const handleServicePress = (service) => {
    navigation.navigate('ServiceDetail', { service });
  };

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  // Afficher un état de chargement si les données ne sont pas encore chargées
  if (loading && favorites.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement de vos favoris...</Text>
      </View>
  );
  }

  const tabs = [
    { id: 'all', label: 'Tous', count: favorites.length },
    { id: 'products', label: 'Produits', count: favoriteProducts.length },
    { id: 'farms', label: 'Fermes', count: favoriteFarms.length },
    { id: 'services', label: 'Services', count: favoriteServices.length },
  ];

  const renderContent = () => {
    if (favorites.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez des produits, fermes ou services à vos favoris pour les retrouver facilement.
          </Text>
          
        </View>
      );
    }

    switch (activeTab) {
      case 'products':
        return (
          <View style={styles.content}>
            {favoriteProducts.length === 0 ? (
              <View style={styles.emptyTabContainer}>
                <Ionicons name="basket-outline" size={60} color="#E0E0E0" />
                <Text style={styles.emptyTabTitle}>Aucun produit favori</Text>
                <Text style={styles.emptyTabSubtitle}>
                  Explorez nos produits et ajoutez-les à vos favoris.
                </Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {favoriteProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => handleProductPress(product)}
                    navigation={navigation}
                    style={styles.gridItem}
                  />
                ))}
              </View>
            )}
          </View>
        );

      case 'farms':
        return (
          <View style={styles.content}>
            {favoriteFarms.length === 0 ? (
              <View style={styles.emptyTabContainer}>
                <Ionicons name="leaf-outline" size={60} color="#E0E0E0" />
                <Text style={styles.emptyTabTitle}>Aucune ferme favorite</Text>
                <Text style={styles.emptyTabSubtitle}>
                  Découvrez nos fermes partenaires et ajoutez-les à vos favoris.
                </Text>
              </View>
            ) : (
              <View style={styles.farmsContainer}>
                {favoriteFarms.map((farm) => (
                  <FarmCard
                    key={farm.id}
                    farm={farm}
                    onPress={() => handleFarmPress(farm)}
                    navigation={navigation}
                    style={styles.farmItem}
                  />
                ))}
              </View>
            )}
          </View>
        );

      case 'services':
        return (
          <View style={styles.content}>
            {favoriteServices.length === 0 ? (
              <View style={styles.emptyTabContainer}>
                <Ionicons name="construct-outline" size={60} color="#E0E0E0" />
                <Text style={styles.emptyTabTitle}>Aucun service favori</Text>
                <Text style={styles.emptyTabSubtitle}>
                  Explorez nos services et ajoutez-les à vos favoris.
                </Text>
              </View>
            ) : (
              <View style={styles.servicesContainer}>
                {favoriteServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onPress={() => handleServicePress(service)}
                    style={styles.serviceItem}
                  />
                ))}
              </View>
            )}
          </View>
        );

      default: // 'all'
        return (
          <View style={styles.content}>
            {favoriteProducts.length > 0 && (
              <>
                <SectionHeader
                  title="Produits favoris"
                  subtitle={`${favoriteProducts.length} produit${favoriteProducts.length > 1 ? 's' : ''}`}
                  style={styles.sectionHeader}
                />
                <View style={styles.gridContainer}>
                  {favoriteProducts.slice(0, 4).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onPress={() => handleProductPress(product)}
                      navigation={navigation}
                      style={styles.gridItem}
                    />
                  ))}
                </View>
                {favoriteProducts.length > 4 && (
                  <TouchableOpacity
                    style={styles.seeMoreButton}
                    onPress={() => setActiveTab('products')}
                  >
                    <Text style={styles.seeMoreText}>
                      Voir tous les produits ({favoriteProducts.length})
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                )}
                <Divider style={styles.divider} />
              </>
            )}

            {favoriteFarms.length > 0 && (
              <>
                <SectionHeader
                  title="Fermes favorites"
                  subtitle={`${favoriteFarms.length} ferme${favoriteFarms.length > 1 ? 's' : ''}`}
                  style={styles.sectionHeader}
                />
                <View style={styles.farmsContainer}>
                  {favoriteFarms.slice(0, 2).map((farm) => (
                    <FarmCard
                      key={farm.id}
                      farm={farm}
                      onPress={() => handleFarmPress(farm)}
                      navigation={navigation}
                      style={styles.farmItem}
                    />
                  ))}
                </View>
                {favoriteFarms.length > 2 && (
                  <TouchableOpacity
                    style={styles.seeMoreButton}
                    onPress={() => setActiveTab('farms')}
                  >
                    <Text style={styles.seeMoreText}>
                      Voir toutes les fermes ({favoriteFarms.length})
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                )}
                <Divider style={styles.divider} />
              </>
            )}

            {favoriteServices.length > 0 && (
              <>
                <SectionHeader
                  title="Services favoris"
                  subtitle={`${favoriteServices.length} service${favoriteServices.length > 1 ? 's' : ''}`}
                  style={styles.sectionHeader}
                />
                <View style={styles.servicesContainer}>
                  {favoriteServices.slice(0, 2).map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onPress={() => handleServicePress(service)}
                      style={styles.serviceItem}
                    />
                  ))}
                </View>
                {favoriteServices.length > 2 && (
                  <TouchableOpacity
                    style={styles.seeMoreButton}
                    onPress={() => setActiveTab('services')}
                  >
                    <Text style={styles.seeMoreText}>
                      Voir tous les services ({favoriteServices.length})
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        );
    }
  };

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header avec titre et actions */}
      <Container style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Mes Favoris</Text>
            <Text style={styles.subtitle}>
              {favorites.length} élément{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
            </Text>
          </View>
          {favorites.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearAll}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          )}
        </View>
      </Container>

      <Divider />

      {/* Onglets */}
      {favorites.length > 0 && (
        <>
          <Container style={styles.tabsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsContent}
            >
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    activeTab === tab.id && styles.activeTab
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab === tab.id && styles.activeTabText
                  ]}>
                    {tab.label}
                  </Text>
                  <View style={[
                    styles.tabBadge,
                    activeTab === tab.id && styles.activeTabBadge
                  ]}>
                    <Text style={[
                      styles.tabBadgeText,
                      activeTab === tab.id && styles.activeTabBadgeText
                    ]}>
                      {tab.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Container>
          <Divider />
        </>
      )}

      {/* Contenu */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#777E5C',
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
  },
  tabsContainer: {
    paddingVertical: 16,
  },
  tabsContent: {
    paddingHorizontal: 0,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#777E5C',
    marginRight: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777E5C',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    minWidth: 200,
  },
  emptyTabContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTabTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyTabSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gridItem: {
    width: '47%',
  },
  farmsContainer: {
    gap: 16,
    marginBottom: 16,
  },
  farmItem: {
    marginBottom: 0,
  },
  servicesContainer: {
    gap: 16,
    marginBottom: 16,
  },
  serviceItem: {
    marginBottom: 0,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
    marginRight: 4,
  },
  divider: {
    marginVertical: 16,
  },
});