import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Text } from 'react-native';
import { 
  Container, 
  SearchBar,
  SectionHeader,
  Divider,
  FarmCard
} from '../components/ui';
import { 
  farms, 
  getFarmsBySpecialty, 
  getPopularFarms, 
  getNewFarms,
  searchFarms 
} from '../data/farms';
import { farmCategories } from '../data/categories';

const { width } = Dimensions.get('window');

export default function FarmsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  // Utiliser les catégories centralisées
  const specialties = farmCategories;

  const handleSearch = () => {
    navigation.navigate('Search', { searchQuery: searchQuery });
  };

  const handleFarmPress = (farm) => {
    console.log('Ferme sélectionnée:', farm.name);
    // Navigation vers la page de détail de la ferme
  };

  const handleViewProducts = (farm) => {
    console.log('Voir produits de:', farm.name);
    // Navigation vers les produits de la ferme
  };

  const handleContact = (farm) => {
    console.log('Contacter:', farm.name);
    // Navigation vers la page de contact
  };

  const handleSpecialtyFilter = (specialty) => {
    setSelectedSpecialty(specialty);
  };

  const getFilteredFarms = () => {
    let filtered = farms;
    
    // Filtre par spécialité
    if (selectedSpecialty) {
      filtered = filtered.filter(farm => farm.specialty === selectedSpecialty.name);
    }
    
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
  const popularFarms = getPopularFarms();
  const newFarms = getNewFarms();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* Section Catégories */}
      <Container style={styles.section}>
        <SectionHeader
          title="Spécialités"
          subtitle="Parcourez nos différentes spécialités de fermes"
        />
        
        <View style={styles.categoriesGrid}>
          {specialties.map((specialty) => (
            <TouchableOpacity
              key={specialty.id}
              style={[
                styles.categoryCard,
                selectedSpecialty?.id === specialty.id && styles.selectedCategoryCard
              ]}
              onPress={() => handleSpecialtyFilter(specialty)}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: specialty.color + '20' }]}>
                <Text style={[styles.categoryIcon, { fontSize: 28, color: specialty.color }]}>
                  {specialty.emoji || '❓'}
                </Text>
              </View>
              <Text style={styles.categoryLabel}>
                {specialty.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Container>

      <Divider />

      {/* Affichage conditionnel : soit les sections normales, soit les fermes de la spécialité */}
      {!selectedSpecialty || selectedSpecialty.id === 0 ? (
        // Affichage normal avec toutes les sections
        <>
          {/* Section Fermes populaires */}
          <Container style={styles.section}>
            <SectionHeader
              title="Fermes populaires"
              subtitle="Les fermes les plus appréciées par nos clients"
              onActionPress={() => navigation.navigate('AllFarms', { filter: 'popular' })}
              style={styles.fullWidthHeader}
            />
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.farmsContainer}
            >
              {popularFarms.map((farm) => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  navigation={navigation}
                  onPress={handleFarmPress}
                  onViewProducts={handleViewProducts}
                  onContact={handleContact}
                  variant="featured"
                  style={styles.farmCard}
                />
              ))}
            </ScrollView>
          </Container>

          <Divider />

          {/* Section Nouvelles fermes */}
          <Container style={styles.section}>
            <SectionHeader
              title="Nouvelles fermes"
              subtitle="Découvrez nos nouveaux partenaires"
              onActionPress={() => navigation.navigate('AllFarms', { filter: 'new' })}
              style={styles.fullWidthHeader}
            />
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.farmsContainer}
            >
              {newFarms.map((farm) => (
                <FarmCard
                  key={farm.id}
                  farm={farm}
                  navigation={navigation}
                  onPress={handleFarmPress}
                  onViewProducts={handleViewProducts}
                  onContact={handleContact}
                  variant="default"
                  style={styles.farmCard}
                />
              ))}
            </ScrollView>
          </Container>

          <Divider />

          {/* Section Toutes les fermes */}
          <Container style={styles.section}>
            <SectionHeader
              title="Toutes nos fermes"
              subtitle="Explorez notre réseau de fermes partenaires"
              onActionPress={() => navigation.navigate('AllFarms', { filter: 'all' })}
              style={styles.fullWidthHeader}
            />
            
            <View style={styles.allFarmsGrid}>
              {farms.map((farm) => (
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
        </>
      ) : (
        // Affichage des fermes de la spécialité sélectionnée en pleine largeur
        <Container style={styles.section}>
          <SectionHeader
            title={`${selectedSpecialty.name}`}
            subtitle={`Fermes spécialisées en ${selectedSpecialty.name.toLowerCase()}`}
            onActionPress={() => navigation.navigate('AllFarms', { filter: selectedSpecialty.name })}
            style={styles.fullWidthHeader}
          />
          
          <View style={styles.categoryFarmsGrid}>
            {filteredFarms.map((farm) => (
              <FarmCard
                key={farm.id}
                farm={farm}
                navigation={navigation}
                onPress={handleFarmPress}
                onViewProducts={handleViewProducts}
                onContact={handleContact}
                variant="default"
                style={styles.categoryFarmCard}
              />
            ))}
          </View>
        </Container>
      )}

      <Divider />

      {/* Section Statistiques */}
      <Container style={styles.statsSection}>
        <Text style={styles.statsTitle}>
          Notre réseau en chiffres
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {farms.length}
            </Text>
            <Text style={styles.statLabel}>
              Fermes partenaires
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {farms.filter(f => f.certifications.includes('Bio')).length}
            </Text>
            <Text style={styles.statLabel}>
              Fermes bio
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {farms.reduce((acc, farm) => acc + farm.products.length, 0)}
            </Text>
            <Text style={styles.statLabel}>
              Produits différents
            </Text>
          </View>
        </View>
      </Container>
    </ScrollView>
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
