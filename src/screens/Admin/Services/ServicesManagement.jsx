import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Alert, Image } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container , ScreenWrapper } from '../../../components/ui';
import { 
  fetchServices, 
  deleteService,
  toggleServiceStatus,
  selectAdminServices,
  selectAdminServicesLoading,
  selectAdminServicesError,
  selectAdminServicesFilters,
  selectFilteredServices,
  selectServiceStats,
  selectAdminCategories,
  setCategoryFilter,
  setStatusFilter,
  setSearchQuery,
  fetchCategories
} from '../../../store/admin/servicesSlice';

export default function ServicesManagement({ navigation }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQueryLocal] = useState('');
  
  // Sélecteurs Redux
  const services = useSelector(selectAdminServices);
  const loading = useSelector(selectAdminServicesLoading);
  const error = useSelector(selectAdminServicesError);
  const filters = useSelector(selectAdminServicesFilters);
  const filteredServices = useSelector(selectFilteredServices);
  const stats = useSelector(selectServiceStats);
  const categories = useSelector(selectAdminCategories);

  // Charger les services et catégories au montage du composant
  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Gestion de la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setSearchQuery(searchQuery));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch]);

  const categoryOptions = [
    { id: 'all', label: 'Toutes', icon: 'list-outline', count: stats.total },
    ...categories.map(category => ({
      id: category.id,
      label: category.name,
      icon: 'folder-outline',
      emoji: category.emoji,
      count: services.filter(s => s.category_id === category.id).length
    }))
  ];

  const statusOptions = [
    { id: 'all', label: 'Tous', icon: 'list-outline', count: stats.total },
    { id: 'active', label: 'Actifs', icon: 'checkmark-circle-outline', count: stats.active },
    { id: 'inactive', label: 'Inactifs', icon: 'close-circle-outline', count: stats.inactive }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewService = (service) => {
    navigation.navigate('AdminServiceDetail', { service });
  };

  const handleEditService = (service) => {
    navigation.navigate('AdminServiceForm', { mode: 'edit', service });
  };

  const handleDeleteService = (service) => {
    Alert.alert(
      'Supprimer le service',
      `Voulez-vous vraiment supprimer le service "${service.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteService(service.id));
            Alert.alert('Succès', 'Service supprimé avec succès');
          }
        }
      ]
    );
  };

  const handleToggleStatus = (service) => {
    const action = service.is_active ? 'désactiver' : 'activer';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} le service`,
      `Voulez-vous ${action} le service "${service.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: action.charAt(0).toUpperCase() + action.slice(1), 
          onPress: () => {
            dispatch(toggleServiceStatus({ 
              serviceId: service.id, 
              isActive: !service.is_active 
            }));
            Alert.alert('Succès', `Service ${action === 'activer' ? 'activé' : 'désactivé'} avec succès`);
          }
        }
      ]
    );
  };

  const ServiceCard = ({ service }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => handleViewService(service)}
    >
      <View style={styles.serviceHeader}>
        <Image 
          source={{ uri: service.image }} 
          style={styles.serviceImage}
          resizeMode="cover"
        />
        <View style={styles.serviceInfo}>
          <View style={styles.serviceTitleRow}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: service.is_active ? '#4CAF50' + '20' : '#F44336' + '20' }
            ]}>
              <Text style={[
                styles.statusText, 
                { color: service.is_active ? '#4CAF50' : '#F44336' }
              ]}>
                {service.is_active ? 'Actif' : 'Inactif'}
              </Text>
            </View>
          </View>
          <Text style={styles.serviceCategory}>{service.categories?.name || 'Non catégorisé'}</Text>
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {service.short_description || service.description}
          </Text>
        </View>
      </View>

      <View style={styles.serviceDetails}>
        <View style={styles.serviceDetail}>
          <Ionicons name="cash-outline" size={16} color="#777E5C" />
          <Text style={styles.serviceDetailText}>{service.price}</Text>
        </View>
        <View style={styles.serviceDetail}>
          <Ionicons name="star-outline" size={16} color="#777E5C" />
          <Text style={styles.serviceDetailText}>
            {service.rating ? `${(service.rating || 0).toFixed(1)} (${service.review_count || 0})` : 'Pas d\'avis'}
          </Text>
        </View>
        <View style={styles.serviceDetail}>
          <Ionicons name="time-outline" size={16} color="#777E5C" />
          <Text style={styles.serviceDetailText}>{service.delivery_time || 'Non spécifié'}</Text>
        </View>
      </View>

      <View style={styles.serviceActions}>
        <View style={styles.serviceActionsRow}>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleViewService(service)}
          >
            <Ionicons name="eye-outline" size={16} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Voir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditService(service)}
          >
            <Ionicons name="pencil-outline" size={16} color="#2196F3" />
            <Text style={styles.actionButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.serviceActionsRow}>
        
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: service.is_active ? '#FFEBEE' : '#E8F5E8' }]}
            onPress={() => handleToggleStatus(service)}
          >
            <Ionicons 
              name={service.is_active ? 'pause-outline' : 'play-outline'} 
              size={16} 
              color={service.is_active ? '#F44336' : '#4CAF50'} 
            />
            <Text style={[
              styles.actionButtonText, 
              { color: service.is_active ? '#F44336' : '#4CAF50' }
            ]}>
              {service.is_active ? 'Désactiver' : 'Activer'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FFEBEE' }]}
            onPress={() => handleDeleteService(service)}
          >
            <Ionicons name="trash-outline" size={16} color="#F44336" />
            <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct-outline" size={80} color="#777E5C" />
      <Text style={styles.emptyTitle}>Aucun service</Text>
      <Text style={styles.emptySubtitle}>
        {filters.category === 'all' && filters.status === 'all'
          ? "Aucun service n'a été créé"
          : "Aucun service ne correspond aux filtres sélectionnés"
        }
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={() => navigation.navigate('AdminServiceForm', { mode: 'add' })}
      >
        <Text style={styles.emptyButtonText}>Créer un service</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && services.length === 0) {
    return (
    <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des services...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gestion des Services</Text>
          <Text style={styles.headerSubtitle}>{stats.total} service(s) • {stats.active} actif(s)</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AdminServiceForm', { mode: 'add' })}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Statistiques */}
        <Container style={styles.section}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.active}</Text>
              <Text style={styles.statLabel}>Actifs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.categories}</Text>
              <Text style={styles.statLabel}>Catégories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{(stats.avgRating || 0).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Note moy.</Text>
            </View>
          </View>
        </Container>

        {/* Barre de recherche */}
        <Container style={styles.section}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#777E5C" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par nom, description, catégorie..."
              value={searchQuery}
              onChangeText={setSearchQueryLocal}
              placeholderTextColor="#999"
            />
          </View>
        </Container>

        {/* Filtres par catégorie */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Filtrer par catégorie</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilters}
          >
            {categoryOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.categoryFilter,
                  filters.category === option.id && styles.selectedCategoryFilter
                ]}
                onPress={() => dispatch(setCategoryFilter(option.id))}
              >
                <Ionicons 
                  name={option.icon} 
                  size={16} 
                  color={filters.category === option.id ? '#FFFFFF' : '#777E5C'} 
                />
                <Text style={[
                  styles.categoryFilterText,
                  filters.category === option.id && styles.selectedCategoryFilterText
                ]}>
                  {option.label}
                </Text>
                <View style={[
                  styles.categoryCount,
                  filters.category === option.id && styles.selectedCategoryCount
                ]}>
                  <Text style={[
                    styles.categoryCountText,
                    filters.category === option.id && styles.selectedCategoryCountText
                  ]}>
                    {option.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Container>

        {/* Filtres par statut */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Filtrer par statut</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statusFilters}
          >
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.statusFilter,
                  filters.status === option.id && styles.selectedStatusFilter
                ]}
                onPress={() => dispatch(setStatusFilter(option.id))}
              >
                <Ionicons 
                  name={option.icon} 
                  size={16} 
                  color={filters.status === option.id ? '#FFFFFF' : '#777E5C'} 
                />
                <Text style={[
                  styles.statusFilterText,
                  filters.status === option.id && styles.selectedStatusFilterText
                ]}>
                  {option.label}
                </Text>
                <View style={[
                  styles.statusCount,
                  filters.status === option.id && styles.selectedStatusCount
                ]}>
                  <Text style={[
                    styles.statusCountText,
                    filters.status === option.id && styles.selectedStatusCountText
                  ]}>
                    {option.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Container>

        {/* Liste des services */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>
            Services ({filteredServices.length})
          </Text>
          
          {filteredServices.length > 0 ? (
            <View style={styles.servicesList}>
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </View>
          ) : (
            renderEmptyState()
          )}
        </Container>

        {/* Espacement */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
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
  headerSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  // Statistiques
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#777E5C',
    textAlign: 'center',
    marginTop: 4,
  },
  // Recherche
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#283106',
    marginLeft: 12,
  },
  // Filtres de catégorie
  categoryFilters: {
    marginTop: 8,
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryFilter: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#777E5C',
    marginLeft: 6,
    marginRight: 8,
  },
  selectedCategoryFilterText: {
    color: '#FFFFFF',
  },
  categoryCount: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  selectedCategoryCount: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  categoryCountText: {
    fontSize: 12,
    color: '#777E5C',
    fontWeight: '600',
  },
  selectedCategoryCountText: {
    color: '#FFFFFF',
  },
  // Filtres de statut
  statusFilters: {
    marginTop: 8,
  },
  statusFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedStatusFilter: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#777E5C',
    marginLeft: 6,
    marginRight: 8,
  },
  selectedStatusFilterText: {
    color: '#FFFFFF',
  },
  statusCount: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  selectedStatusCount: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statusCountText: {
    fontSize: 12,
    color: '#777E5C',
    fontWeight: '600',
  },
  selectedStatusCountText: {
    color: '#FFFFFF',
  },
  // Liste des services
  servicesList: {
    marginTop: 8,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#283106',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceCategory: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#777E5C',
    lineHeight: 20,
  },
  serviceDetails: {
    marginBottom: 12,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceDetailText: {
    fontSize: 14,
    color: '#777E5C',
    marginLeft: 8,
  },
  serviceActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
   
  },
  serviceActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    gap: 4,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  // État vide
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});