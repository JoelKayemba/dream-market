import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Text, RefreshControl } from 'react-native';
import { 
  Container, 
  SearchBar,
  SectionHeader,
  Divider,
  FarmCard
 , ScreenWrapper } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectClientFarms, 
  selectClientFarmsLoading,
  fetchFarms
} from '../store/client';

const { width } = Dimensions.get('window');

export default function FarmsScreen({ navigation }) {
  const dispatch = useDispatch();
  const farms = useSelector(selectClientFarms);
  const loading = useSelector(selectClientFarmsLoading);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Charger les données seulement au montage du composant
  useEffect(() => {
    const loadDataIfNeeded = async () => {
      try {
        // Charger seulement si les données ne sont pas disponibles et qu'on n'a pas encore chargé
        if (!hasLoaded && (!farms || farms.length === 0)) {
          setHasLoaded(true);
          await dispatch(fetchFarms());
        } else if (farms && farms.length > 0) {
          setHasLoaded(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setHasLoaded(false); // Réinitialiser en cas d'erreur pour permettre un nouveau chargement
      }
    };
    
    loadDataIfNeeded();
  }, [dispatch, hasLoaded]); // ✅ Sécurité avec hasLoaded

  // Fonction de pull-to-refresh
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

  const handleSearch = () => {
    navigation.navigate('Search', { searchQuery: searchQuery });
  };

  const handleFarmPress = (farm) => {
    navigation.navigate('FarmDetail', { farm: farm });
    // Navigation vers la page de détail de la ferme
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
    
    // Filtre par recherche
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

 // Afficher un état de chargement si les données ne sont pas encore chargées
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement des fermes...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper >
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
      <Container style={styles.header}>
        <Text style={styles.title}>
          🌾 Nos Fermes Partenaires
        </Text>
        <Text style={styles.subtitle}>
          Découvrez des fermes familiales passionnées et leurs produits d'exception
        </Text>
        
        {/* Barre de recherche */}
        <Container style={styles.searchSection}>
          <SearchBar
            placeholder="Rechercher des fermes..."
            onPress={(query) => navigation.navigate('Search', { initialQuery: query })}
          />
        </Container>
      </Container>

      <Divider />


      {/* Section Toutes les fermes */}
          <Container style={styles.section}>
            <SectionHeader
              title="Toutes nos fermes"
              subtitle="Explorez notre réseau de fermes partenaires"
              
              style={styles.fullWidthHeader}
            />
            
            <View style={styles.allFarmsGrid}>
              {(farms || []).map((farm) => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  navigation={navigation}
                  onPress={handleFarmPress}
                  onViewProducts={handleViewProducts}
                  onContact={handleContact}
                  variant="default"
                  style={styles.gridFarmCard}
                />
              ))}
            </View>
          </Container>

      <Divider />

      {/* Section Statistiques */}
      <Container style={styles.statsSection}>
        <Text style={styles.statsTitle}>
          Notre réseau en chiffres
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(farms || []).length}
            </Text>
            <Text style={styles.statLabel}>
              Fermes partenaires
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(farms || []).filter(f => f.certifications && f.certifications.includes('Bio')).length}
            </Text>
            <Text style={styles.statLabel}>
              Fermes bio
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(farms || []).reduce((acc, farm) => acc + (farm.products ? farm.products.length : 0), 0)}
            </Text>
            <Text style={styles.statLabel}>
              Produits différents
            </Text>
          </View>
        </View>
      </Container>
    </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: -20,
  },
  header: {
    paddingVertical: 0,
    alignItems: 'center',
  },
  title: {
    color: '#283106',
    fontWeight: 'bold',
    marginBottom: 12,
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
  searchBar: {
    width: '100%',
    maxWidth: 450,
  },
  searchSection: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  filtersSection: {
    paddingVertical: 20,
  },
  fullWidthHeader: {
    width: '100%',
  },
  specialtiesContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  specialtyFilter: {
    marginRight: 8,
  },
  specialtyButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    justifyContent: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 8,
  },
  categoryCard: {
    width: '22%',
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
  selectedCategoryCard: {
    backgroundColor: '#F0F8F0',
    borderWidth: 2,
    borderColor: '#4CAF50',
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
  categoryFarmsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryFarmCard: {
    width: '48%',
  },
  specialtyEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  specialtyName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingVertical: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
    fontStyle: 'italic',
  },
  farmsContainer: {
    paddingHorizontal: 4,
  },
  farmCard: {
    marginRight: 16,
  },
  allFarmsGrid: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 4,
  },
  gridFarmCard: {
    marginBottom: 16,
  },
  statsSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  statsTitle: {
    color: '#283106',
    fontWeight: 'bold',
    marginBottom: 24,
    fontSize: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 4,
  },
  statLabel: {
    color: '#777E5C',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
