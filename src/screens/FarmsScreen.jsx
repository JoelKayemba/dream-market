import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Text, RefreshControl } from 'react-native';
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
  fetchFarms
} from '../store/client';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function FarmsScreen({ navigation }) {
  const dispatch = useDispatch();
  const farms = useSelector(selectClientFarms);
  const loading = useSelector(selectClientFarmsLoading);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loadDataIfNeeded = async () => {
      try {
        if (!hasLoaded && (!farms || farms.length === 0)) {
          setHasLoaded(true);
          await dispatch(fetchFarms());
        } else if (farms && farms.length > 0) {
          setHasLoaded(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setHasLoaded(false);
      }
    };
    
    loadDataIfNeeded();
  }, [dispatch, hasLoaded]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchFarms());
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFarmPress = (farm) => {
    navigation.navigate('FarmDetail', { farm: farm });
  };

  const handleViewProducts = (farm) => {
    navigation.navigate('AllProducts', { farmId: farm.id });
  };

  const handleContact = (farm) => {
    // Navigation vers la page de contact
  };

  const getFilteredFarms = () => {
    if (!farms || !Array.isArray(farms)) return [];
    let filtered = farms;
    
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(farm =>
        farm.name.toLowerCase().includes(lowerQuery) ||
        farm.description.toLowerCase().includes(lowerQuery) ||
        farm.specialty.toLowerCase().includes(lowerQuery) ||
        farm.location.toLowerCase().includes(lowerQuery) ||
        farm.region.toLowerCase().includes(lowerQuery) ||
        (farm.products && farm.products.some(product => product.toLowerCase().includes(lowerQuery))) ||
        (farm.certifications && farm.certifications.some(cert => cert.toLowerCase().includes(lowerQuery)))
      );
    }
    
    return filtered;
  };

  const filteredFarms = getFilteredFarms();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="agriculture" size={64} color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des fermes...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
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
          
          <View style={styles.allFarmsGrid}>
            {(farms || []).map((farm, index) => (
              <FarmCard
                key={farm.id}
                farm={farm}
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
            ))}
          </View>

          {/* Message si aucune ferme */}
          {(farms || []).length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={64} color="#CCCCCC" />
              <Text style={styles.emptyStateTitle}>Aucune ferme trouvée</Text>
              <Text style={styles.emptyStateText}>
                Aucune ferme n'est disponible pour le moment.
              </Text>
            </View>
          )}
        </Container>

        {/* Call to Action */}
        <Container style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <MaterialIcons name="contact-support" size={48} color="#4CAF50" />
            <Text style={styles.ctaTitle}>Vous êtes producteur ?</Text>
            <Text style={styles.ctaText}>
              Rejoignez notre réseau de fermes partenaires et valorisez vos produits
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
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