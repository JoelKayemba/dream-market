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

const { width } = Dimensions.get('window');

export default function FarmsScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const specialties = [
    { id: 'all', name: 'Toutes', emoji: '🌾', color: '#777E5C' },
    { id: 'organic', name: 'Bio', emoji: '🌱', color: '#4CAF50' },
    { id: 'fruits', name: 'Fruits', emoji: '🍎', color: '#FF9800' },
    { id: 'cereals', name: 'Céréales', emoji: '🌾', color: '#8BC34A' },
    { id: 'dairy', name: 'Laitiers', emoji: '🥛', color: '#2196F3' },
    { id: 'wine', name: 'Vins', emoji: '🍷', color: '#9C27B0' },
    { id: 'herbs', name: 'Herbes', emoji: '🌿', color: '#795548' },
  ];

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

  const handleSpecialtyFilter = (specialtyId) => {
    setSelectedSpecialty(specialtyId);
  };

  const getFilteredFarms = () => {
    let filtered = farms;
    
    if (selectedSpecialty !== 'all') {
      filtered = getFarmsBySpecialty(selectedSpecialty);
    }
    
    if (searchQuery.trim()) {
      filtered = searchFarms(searchQuery);
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

      {/* Filtres par spécialité */}
      <Container style={styles.filtersSection}>
        <SectionHeader
          title="Filtrer par spécialité"
          subtitle="Trouvez la ferme qui correspond à vos besoins"
          onActionPress={() => console.log('Voir toutes les spécialités')}
          style={styles.fullWidthHeader}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialtiesContainer}
        >
          {specialties.map((specialty) => (
            <View
              key={specialty.id}
              style={[
                styles.specialtyFilter,
                selectedSpecialty === specialty.id && styles.selectedSpecialty
              ]}
            >
              <TouchableOpacity
                onPress={() => handleSpecialtyFilter(specialty.id)}
                style={[
                  styles.specialtyButton,
                  { borderColor: specialty.color }
                ]}
              >
                <Text style={[styles.specialtyEmoji, { color: specialty.color }]}>
                  {specialty.emoji}
                </Text>
                <Text style={[styles.specialtyName, { color: specialty.color }]}>
                  {specialty.name}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </Container>

      <Divider />

      {/* Section Fermes populaires */}
      <Container style={styles.section}>
        <SectionHeader
          title="Fermes populaires"
          subtitle="Les fermes les plus appréciées par nos clients"
          onActionPress={() => console.log('Voir toutes les fermes populaires')}
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
          onActionPress={() => console.log('Voir toutes les nouvelles fermes')}
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
          title={`Toutes nos fermes (${filteredFarms.length})`}
          subtitle="Explorez notre réseau de fermes partenaires"
          onActionPress={() => console.log('Voir toutes les fermes')}
          style={styles.fullWidthHeader}
        />
        
        <View style={styles.allFarmsGrid}>
          {filteredFarms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
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
  },
  selectedSpecialty: {
    backgroundColor: '#F0F8F0',
  },
  specialtyEmoji: {
    fontSize: 24,
    marginBottom: 4,
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
