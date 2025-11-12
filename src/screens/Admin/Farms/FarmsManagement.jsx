import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchFarms, 
  deleteFarm,
  selectAllFarms,
  selectFarmsLoading,
  selectFarmsError,
  setSearchQuery,
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
    farm.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farm.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const FarmCard = ({ farm }) => {
    // Récupérer l'image comme dans FarmDetail.jsx
    const farmImage = farm?.main_image || farm?.image || null;
    const verified = farm.verified || false;
    
    return (
    <TouchableOpacity 
      style={styles.farmCard}
      onPress={() => handleViewFarm(farm)}
        activeOpacity={0.7}
      >
        {/* Image de la ferme */}
        <View style={styles.farmImageContainer}>
          {farmImage ? (
            <Image
              source={{ uri: farmImage }}
              style={styles.farmImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.farmImagePlaceholder}>
              <Ionicons name="image-outline" size={32} color="#CBD5E0" />
            </View>
          )}
          
          {/* Badges overlay */}
          <View style={styles.imageBadges}>
            {!verified && (
              <View style={[styles.badge, styles.badgePending]}>
                <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>En attente</Text>
              </View>
            )}
            {verified && (
              <View style={[styles.badge, styles.badgeVerified]}>
                <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>Vérifiée</Text>
        </View>
            )}
          </View>
        </View>
        
        {/* Informations de la ferme */}
        <View style={styles.farmContent}>
          <View style={styles.farmHeader}>
            <View style={styles.farmInfo}>
              <Text style={styles.farmName} numberOfLines={2}>
                {farm.name || 'Ferme sans nom'}
              </Text>
              <View style={styles.farmMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#777E5C" />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {farm.location || 'Localisation non spécifiée'}
                  </Text>
                </View>
                {farm.specialty && (
                  <View style={styles.metaItem}>
                    <Ionicons name="leaf-outline" size={14} color="#777E5C" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {farm.specialty}
                    </Text>
                  </View>
                )}
          </View>
        </View>
      </View>
      
          {/* Statistiques */}
          <View style={styles.farmFooter}>
            <View style={styles.statItem}>
              <Ionicons name="cube-outline" size={16} color="#4CAF50" />
              <Text style={styles.statText}>
                {farm.products?.length || 0} produits
              </Text>
            </View>
            {farm.rating && (
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color="#FF9800" />
                <Text style={styles.statText}>
                  {farm.rating.toFixed(1)} ({farm.reviewCount || 0})
                </Text>
              </View>
            )}
      </View>
      
          {/* Actions */}
      <View style={styles.farmActions}>
        <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonView]}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate('FarmProducts', { farm });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="cube-outline" size={18} color="#2196F3" />
              <Text style={styles.actionButtonText}>Produits</Text>
        </TouchableOpacity>
            
        <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDelete]}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteFarm(farm);
          }}
              activeOpacity={0.7}
        >
              <Ionicons name="trash-outline" size={18} color="#F44336" />
              <Text style={styles.actionButtonTextDelete}>Supprimer</Text>
        </TouchableOpacity>
          </View>
      </View>
    </TouchableOpacity>
  );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Fermes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddFarm}
        >
          <Ionicons name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#777E5C" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une ferme..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#999999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQueryLocal('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#777E5C" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="business-outline" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{filteredFarms.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>
              {filteredFarms.filter(f => f.verified).length}
            </Text>
            <Text style={styles.statLabel}>Vérifiées</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color="#FF9800" />
            <Text style={styles.statValue}>
              {filteredFarms.filter(f => !f.verified).length}
            </Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
            </View>

          {loading ? (
            <View style={styles.loadingContainer}>
            <Ionicons name="hourglass-outline" size={48} color="#4CAF50" />
            <Text style={styles.loadingText}>Chargement des fermes...</Text>
            </View>
          ) : filteredFarms.length === 0 ? (
            <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color="#CBD5E0" />
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
              <TouchableOpacity
                style={styles.addFirstButton}
                  onPress={handleAddFarm}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.addFirstButtonText}>Ajouter une ferme</Text>
              </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.farmsList}>
              {filteredFarms.map((farm) => (
                <FarmCard key={farm.id} farm={farm} />
              ))}
            </View>
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 4,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#283106',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#283106',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#777E5C',
    marginTop: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  farmsList: {
    padding: 20,
    gap: 16,
  },
  farmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  farmImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  farmImage: {
    width: '100%',
    height: '100%',
  },
  farmImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  imageBadges: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgePending: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
  },
  badgeVerified: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  farmContent: {
    padding: 16,
  },
  farmHeader: {
    marginBottom: 12,
  },
  farmInfo: {
    gap: 8,
  },
  farmName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#283106',
    lineHeight: 24,
  },
  farmMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#777E5C',
    fontWeight: '500',
  },
  farmFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '600',
  },
  farmActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonView: {
    backgroundColor: '#E3F2FD',
  },
  actionButtonDelete: {
    backgroundColor: '#FFEBEE',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196F3',
  },
  actionButtonTextDelete: {
    color: '#F44336',
  },
});
