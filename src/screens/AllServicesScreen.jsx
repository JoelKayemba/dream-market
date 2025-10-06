import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Badge, Button, SearchBar } from '../components/ui';
import { services } from '../data/services';
import { serviceCategories } from '../data/categories';

export default function AllServicesScreen({ navigation, route }) {
  const { filter } = route.params || {};
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rating', 'price'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Utiliser les catégories centralisées
  const categories = serviceCategories;

  // Initialiser les services au chargement avec le filtre reçu
  useEffect(() => {
    if (services && services.length > 0) {
      applyInitialFilter();
    }
  }, [filter]);

  useEffect(() => {
    if (services && services.length > 0) {
      applyFilters();
    }
  }, [searchQuery, sortBy, selectedCategory]);

  const applyInitialFilter = () => {
    if (!services || !Array.isArray(services)) {
      setFilteredServices([]);
      return;
    }

    let filtered = [...services];

    // Appliquer le filtre initial reçu
    switch (filter) {
      case 'popular':
        filtered = filtered.filter(service => service.rating >= 4.5);
        break;
      case 'new':
        filtered = filtered.filter(service => new Date(service.createdAt).getFullYear() >= 2024);
        break;
      case 'logistics':
        filtered = filtered.filter(service => service.category === 'Logistique');
        break;
      case 'all':
      default:
        // Pas de filtre, tous les services
        break;
    }

    setFilteredServices(filtered);
  };

  const applyFilters = () => {
    if (!services || !Array.isArray(services)) {
      setFilteredServices([]);
      return;
    }

    let filtered = [...services];

    // Appliquer le filtre initial reçu
    switch (filter) {
      case 'popular':
        filtered = filtered.filter(service => service.rating >= 4.5);
        break;
      case 'new':
        filtered = filtered.filter(service => new Date(service.createdAt).getFullYear() >= 2024);
        break;
      case 'logistics':
        filtered = filtered.filter(service => service.category === 'Logistique');
        break;
      case 'all':
      default:
        // Pas de filtre, tous les services
        break;
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery) ||
        service.shortDescription.toLowerCase().includes(lowerQuery) ||
        service.category.toLowerCase().includes(lowerQuery) ||
        service.coverage.toLowerCase().includes(lowerQuery) ||
        (service.features && service.features.some(feature => feature.toLowerCase().includes(lowerQuery)))
      );
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory.name);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price':
          // Pour les services, on trie par ordre alphabétique du prix
          return a.price.localeCompare(b.price);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredServices(filtered);
  };

  const getHeaderTitle = () => {
    if (filter) {
      switch (filter) {
        case 'popular':
          return 'Services Populaires';
        case 'new':
          return 'Nouveaux Services';
        case 'logistics':
          return 'Services de Logistique';
        default:
          return 'Tous nos Services';
      }
    }
    return 'Tous nos Services';
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceCard} 
      onPress={() => navigation.navigate('ServiceDetail', { service: item })}
    >
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceIcon}>{item.icon}</Text>
          <Badge text={item.category} variant="primary" size="small" />
        </View>
        
        <Text style={styles.serviceName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.serviceDescription} numberOfLines={2}>{item.shortDescription}</Text>
        
        <View style={styles.serviceFooter}>
          <Text style={styles.servicePrice}>{item.price}</Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
          <Text style={styles.serviceCount}>
            {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={24} color="#283106" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Rechercher des services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onPress={(query) => navigation.navigate('Search', { initialQuery: query })}
        />
      </View>

      {/* Filtres */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Filtres par catégorie */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Catégorie</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory?.id === category.id && styles.selectedCategoryButton,
                    { borderColor: category.color }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[styles.categoryEmoji, { color: category.color }]}>
                    {category.emoji}
                  </Text>
                  <Text style={[styles.categoryName, { color: category.color }]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tri */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Trier par</Text>
            <View style={styles.sortButtons}>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'name' && styles.activeSortButton]}
                onPress={() => setSortBy('name')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'name' && styles.activeSortButtonText]}>
                  Nom
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'rating' && styles.activeSortButton]}
                onPress={() => setSortBy('rating')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.activeSortButtonText]}>
                  Note
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'price' && styles.activeSortButton]}
                onPress={() => setSortBy('price')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'price' && styles.activeSortButtonText]}>
                  Prix
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Liste des services */}
      <FlatList
        data={filteredServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={1}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="construct-outline" size={64} color="#777E5C" />
            <Text style={styles.emptyTitle}>Aucun service trouvé</Text>
            <Text style={styles.emptySubtitle}>
              Essayez de modifier vos critères de recherche
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
  },
  serviceCount: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    minWidth: 80,
    justifyContent: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#F0F8F0',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeSortButton: {
    backgroundColor: '#4CAF50',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  serviceContent: {
    gap: 8,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 24,
  },
});
