import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, FlatList, Dimensions, TouchableOpacity, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { 
  Container, 
  SearchBar,
  SectionHeader,
  Divider,
  FarmCard,
  ScreenWrapper 
} from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectClientFarms, 
  selectClientFarmsLoading,
  selectClientFarmsLoadingMore,
  selectClientFarmsPagination,
  fetchFarms
} from '../store/client';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function FarmsScreen({ navigation }) {
  const dispatch = useDispatch();
  const farms = useSelector(selectClientFarms);
  const loading = useSelector(selectClientFarmsLoading);
  const loadingMore = useSelector(selectClientFarmsLoadingMore);
  const pagination = useSelector(selectClientFarmsPagination);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData(0, true);
  }, [dispatch]);

  const loadData = async (page = 0, refresh = false) => {
    try {
      console.log(`📥 [FarmsScreen] Loading farms - page: ${page}, refresh: ${refresh}, search: ${searchQuery || 'none'}`);
      const result = await dispatch(fetchFarms({
        page,
        refresh,
        search: searchQuery || null
      }));
      console.log(`✅ [FarmsScreen] Farms loaded:`, result.payload);
    } catch (error) {
      console.error('❌ [FarmsScreen] Erreur lors du chargement des données:', error);
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

  // Charger plus d'éléments
  const loadMore = useCallback(() => {
    if (!loadingMore && pagination.hasMore && !refreshing) {
      loadData(pagination.page + 1, false);
    }
  }, [loadingMore, pagination.hasMore, pagination.page, refreshing, searchQuery]);

  // Footer pour le chargement
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  const handleFarmPress = (farm) => {
    navigation.navigate('FarmDetail', { farm: farm });
  };

  const handleViewProducts = (farm) => {
    navigation.navigate('AllProducts', { farmId: farm.id });
  };

  const handleContact = (farm) => {
    const { openWhatsApp, openPhoneCall, openEmail } = require('../utils/contactInfo');
    const { Linking } = require('react-native');
    const { Alert } = require('react-native');
    
    // Construire les options de contact avec les informations spécifiques de la ferme
    const options = [];
    
    if (farm.contact?.phone) {
      options.push({
        text: 'Appeler',
        onPress: () => openPhoneCall(farm.contact.phone),
        style: 'default',
      });
      options.push({
        text: 'WhatsApp',
        onPress: () => openWhatsApp(farm.contact.phone, `Bonjour, je souhaite des informations concernant ${farm.name}`),
        style: 'default',
      });
    }
    
    if (farm.contact?.email) {
      options.push({
        text: 'Email',
        onPress: () => openEmail(farm.contact.email, `Demande d'informations - ${farm.name}`),
        style: 'default',
      });
    }
    
    if (farm.contact?.website) {
      options.push({
        text: 'Site web',
        onPress: () => {
          const url = farm.contact.website.startsWith('http') ? farm.contact.website : `https://${farm.contact.website}`;
          Linking.openURL(url).catch(err => console.error('Erreur ouverture URL:', err));
        },
        style: 'default',
      });
    }
    
    if (options.length === 0) {
      Alert.alert(
        'Contact non disponible',
        'Les informations de contact de cette ferme ne sont pas disponibles.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    options.push({
      text: 'Annuler',
      style: 'cancel',
    });
    
    Alert.alert(
      `Contacter ${farm.name}`,
      'Comment souhaitez-vous contacter cette ferme ?',
      options,
      { cancelable: true }
    );
  };

  const getFilteredFarms = () => {
    if (!farms || !Array.isArray(farms)) {
      console.log('⚠️ [FarmsScreen] farms is not an array:', farms);
      return [];
    }
    console.log(`✅ [FarmsScreen] Total farms loaded: ${farms.length}`, farms.map(f => ({ id: f.id, name: f.name })));
    // Si on a une recherche locale, filtrer côté client
    // Sinon, les données sont déjà filtrées côté serveur
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = farms.filter(farm =>
        farm.name?.toLowerCase().includes(lowerQuery) ||
        (farm.description && farm.description.toLowerCase().includes(lowerQuery)) ||
        (farm.specialty && farm.specialty.toLowerCase().includes(lowerQuery)) ||
        (farm.location && farm.location.toLowerCase().includes(lowerQuery)) ||
        (farm.region && farm.region.toLowerCase().includes(lowerQuery))
      );
      console.log(`🔍 [FarmsScreen] Filtered farms: ${filtered.length}`);
      return filtered;
    }
    return farms;
  };

  // Recharger quand la recherche change
  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        loadData(0, true);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="agriculture" size={64} color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des fermes...</Text>
      </View>
    );
  }

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
        {/* Header avec titre et barre de recherche */}
        <View style={styles.headerContainer}>
          <Container style={styles.header}>
            <View style={styles.titleContainer}>
              <MaterialIcons name="agriculture" size={32} color="#4CAF50" style={styles.titleIcon} />
              <Text style={styles.title}>
                Nos Fermes Partenaires
              </Text>
            </View>
            <Text style={styles.subtitle}>
              Découvrez des fermes familiales passionnées et leurs produits d'exception
            </Text>
            
            {/* Barre de recherche */}
            <Container style={styles.searchSection}>
              <SearchBar
                placeholder="Rechercher des fermes, produits, régions..."
                onPress={(query) => navigation.navigate('Search', { initialQuery: query })}
              />
            </Container>
          </Container>
        </View>

        

       

        <Divider style={styles.divider} />

        {/* Section Toutes les fermes */}
        <Container style={styles.section}>
          <SectionHeader
            title="Toutes nos fermes"
            subtitle="Explorez notre réseau de fermes partenaires"
            style={styles.fullWidthHeader}
            icon="grid"
          />
          
          <FlatList
            data={getFilteredFarms()}
            renderItem={({ item, index }) => (
              <FarmCard
                farm={item}
                navigation={navigation}
                onPress={handleFarmPress}
                onViewProducts={handleViewProducts}
                onContact={handleContact}
                variant="featured"
                style={[
                  styles.gridFarmCard,
                  index % 2 === 0 ? styles.cardEven : styles.cardOdd
                ]}
              />
            )}
            keyExtractor={(item) => String(item.id || item.name || Math.random())}
            numColumns={2}
            scrollEnabled={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={64} color="#CCCCCC" />
                <Text style={styles.emptyStateTitle}>Aucune ferme trouvée</Text>
                <Text style={styles.emptyStateText}>
                  Aucune ferme n'est disponible pour le moment.
                </Text>
              </View>
            }
          />
        </Container>

        {/* Call to Action */}
        <Container style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <MaterialIcons name="contact-support" size={48} color="#4CAF50" />
            <Text style={styles.ctaTitle}>Vous êtes producteur ?</Text>
            <Text style={styles.ctaText}>
              Rejoignez notre réseau de fermes partenaires et valorisez vos produits
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
        </Container>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#F8FDF8',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    color: '#283106',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    color: '#777E5C',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  searchSection: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    width: '100%',
  },
  divider: {
    marginVertical: 8,
  },
  statsSection: {
    paddingVertical: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    color: '#283106',
    fontWeight: '700',
    fontSize: 20,
    textAlign: 'center',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    color: '#283106',
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    color: '#777E5C',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
  section: {
    paddingVertical: 24,
  },
  fullWidthHeader: {
    width: '100%',
  },
  allFarmsGrid: {
    flexDirection: 'column',
    gap: 16,
    marginTop: 16,
  },
  gridFarmCard: {
    marginBottom: 8,
    width: '100%',
  },
  cardEven: {
    backgroundColor: '#FAFFFA',
  },
  cardOdd: {
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
    fontStyle: 'italic',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoaderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#777E5C',
  },
  ctaSection: {
    paddingVertical: 24,
    paddingHorizontal: 0,
  },
  ctaCard: {
    backgroundColor: '#F0F8F0',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 20,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});