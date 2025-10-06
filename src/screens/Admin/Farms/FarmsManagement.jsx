import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button } from '../../../components/ui';
import { 
  fetchFarms, 
  deleteFarm,
  selectAllFarms,
  selectFarmsLoading,
  selectFarmsError,
  setSearchQuery,
  selectSearchQuery
} from '../../../store/admin/farmSlice';

export default function FarmsManagement({ navigation }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQueryLocal] = useState('');
  
  // Selectors Redux
  const farms = useSelector(selectAllFarms);
  const loading = useSelector(selectFarmsLoading);
  const error = useSelector(selectFarmsError);

  useEffect(() => {
    dispatch(fetchFarms());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setSearchQuery(searchQuery));
  }, [searchQuery, dispatch]);

  const handleSearchChange = (text) => {
    setSearchQueryLocal(text);
  };

  const handleAddFarm = () => {
    navigation.navigate('FarmForm', { mode: 'add' });
  };

  const handleViewFarm = (farm) => {
    navigation.navigate('FarmDetail', { farm });
  };

  const handleDeleteFarm = (farm) => {
    Alert.alert(
      'Supprimer la ferme',
      `Voulez-vous vraiment supprimer la ferme "${farm.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteFarm(farm.id));
            Alert.alert('Succès', 'Ferme supprimée avec succès');
          }
        }
      ]
    );
  };

  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const FarmCard = ({ farm }) => (
    <TouchableOpacity 
      style={styles.farmCard}
      onPress={() => handleViewFarm(farm)}
    >
      <View style={styles.farmHeader}>
        <View style={styles.farmInfo}>
          <Text style={styles.farmName}>{farm.name}</Text>
          <Text style={styles.farmLocation}>📍 {farm.location}</Text>
          <Text style={styles.farmSpecialty}>🏷️ {farm.specialty}</Text>
        </View>
        <View style={styles.farmStats}>
          <View style={[styles.statusBadge, { backgroundColor: farm.verified ? '#4CAF50' : '#FF9800' }]}>
            <Text style={styles.statusText}>
              {farm.verified ? 'Vérifiée' : 'En attente'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.farmDetails}>
        <Text style={styles.farmRating}>⭐ {farm.rating || 'N/A'} ({farm.reviewCount || 0} avis)</Text>
        <Text style={styles.farmProducts}>{farm.products?.length || 0} produits</Text>
      </View>
      
      <View style={styles.farmActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('FarmProducts', { farm })}
        >
          <Ionicons name="eye-outline" size={20} color="#2196F3" />
          <Text style={styles.actionText}>Produits</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteFarm(farm);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Gestion des Fermes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddFarm}
        >
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#777E5C" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une ferme..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#777E5C"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQueryLocal('')}>
              <Ionicons name="close-circle" size={20} color="#777E5C" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.farmsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Liste des Fermes</Text>
            <Text style={styles.sectionSubtitle}>{filteredFarms.length} ferme(s)</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button
                title="Réessayer"
                onPress={() => dispatch(fetchFarms())}
                variant="secondary"
                style={styles.retryButton}
              />
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des fermes...</Text>
            </View>
          ) : filteredFarms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Aucune ferme trouvée' : 'Aucune ferme'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Essayez avec d\'autres mots-clés' 
                  : 'Commencez par ajouter une ferme'
                }
              </Text>
              {!searchQuery && (
                <Button
                  title="Ajouter une ferme"
                  onPress={handleAddFarm}
                  variant="primary"
                  style={styles.addFirstButton}
                />
              )}
            </View>
          ) : (
            <View style={styles.farmsList}>
              {filteredFarms.map((farm) => (
                <FarmCard key={farm.id} farm={farm} />
              ))}
            </View>
          )}
        </Container>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
  
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#283106',
  },
  content: {
    flex: 1,
  },
  farmsSection: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#777E5C',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    minWidth: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#777E5C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    minWidth: 150,
  },
  farmsList: {
    gap: 12,
  },
  farmCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  farmInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  farmLocation: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 2,
  },
  farmSpecialty: {
    fontSize: 14,
    color: '#777E5C',
  },
  farmStats: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  farmDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  farmRating: {
    fontSize: 14,
    color: '#777E5C',
  },
  farmProducts: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  farmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 4,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  deleteText: {
    color: '#F44336',
  },
});