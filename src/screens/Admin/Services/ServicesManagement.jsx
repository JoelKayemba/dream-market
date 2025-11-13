import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchServices,
  deleteService,
  toggleServiceStatus,
  selectAdminServices,
  selectAdminServicesLoading,
  selectAdminServicesLoadingMore,
  selectAdminServicesPagination,
  selectAdminServicesError,
  selectAdminServicesFilters,
  selectFilteredServices,
  selectServiceStats,
  selectAdminCategories,
  setCategoryFilter,
  setStatusFilter,
  setSearchQuery,
  fetchCategories,
} from '../../../store/admin/servicesSlice';

/* ============================
   Sous-composants et helpers
   ============================ */

const ServiceCard = memo(function ServiceCard({
  service,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const serviceImage = service.image || null;
  const isActive = !!service.is_active;

  return (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => onView(service)}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.serviceImageContainer}>
        {serviceImage ? (
          <Image source={{ uri: serviceImage }} style={styles.serviceImage} resizeMode="cover" />
        ) : (
          <View style={styles.serviceImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#CBD5E0" />
          </View>
        )}
        <View style={styles.imageBadges}>
          {!isActive && (
            <View style={[styles.badge, styles.badgeInactive]}>
              <Ionicons name="pause-circle" size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>Inactif</Text>
            </View>
          )}
        </View>
      </View>

      {/* Infos */}
      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName} numberOfLines={2}>
              {service.name || 'Service sans nom'}
            </Text>
            <View style={styles.serviceMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="grid-outline" size={14} color="#777E5C" />
                <Text style={styles.metaText}>
                  {service.categories?.name || 'Non catégorisé'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Prix + rating */}
        <View style={styles.serviceFooter}>
          <View style={styles.priceContainer}>
            <Ionicons name="cash-outline" size={16} color="#4CAF50" />
            <Text style={styles.servicePrice}>{service.price || 'Sur devis'}</Text>
          </View>
          {service.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FF9800" />
              <Text style={styles.ratingText}>
                {Number(service.rating).toFixed(1)} ({service.review_count || 0})
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.serviceActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonEdit]}
            onPress={(e) => {
              e.stopPropagation();
              onEdit(service);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color="#2196F3" />
            <Text style={styles.actionButtonText}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              isActive ? styles.actionButtonDisable : styles.actionButtonEnable,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onToggleStatus(service);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? 'pause-outline' : 'play-outline'}
              size={18}
              color={isActive ? '#F44336' : '#4CAF50'}
            />
            <Text
              style={[
                styles.actionButtonText,
                isActive ? styles.actionButtonTextDisable : styles.actionButtonTextEnable,
              ]}
            >
              {isActive ? 'Désactiver' : 'Activer'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDelete]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete(service);
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
});

const ListEmpty = memo(function ListEmpty({ filters, onCreate }) {
  const isAll =
    (filters.category === 'all' || !filters.category) && (filters.status === 'all' || !filters.status);

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="construct-outline" size={80} color="#777E5C" />
      <Text style={styles.emptyTitle}>Aucun service</Text>
      <Text style={styles.emptySubtitle}>
        {isAll
          ? "Aucun service n'a été créé"
          : "Aucun service ne correspond aux filtres sélectionnés"}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onCreate}>
        <Text style={styles.emptyButtonText}>Créer un service</Text>
      </TouchableOpacity>
    </View>
  );
});

const FixedHeader = memo(function FixedHeader({
  navigation,
  topInset,
  searchQuery,
  onChangeSearch,
  showFilters,
  onToggleFilters,
  onAddService,
}) {
  return (
    <>
      {/* Barre supérieure */}
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Services</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddService} activeOpacity={0.7}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche (fixe) */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#777E5C" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un service..."
            value={searchQuery}
            onChangeText={onChangeSearch}
            placeholderTextColor="#999999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onChangeSearch('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#777E5C" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onToggleFilters} style={styles.filterToggleButton}>
            <Ionicons
              name={showFilters ? 'filter' : 'filter-outline'}
              size={20}
              color={showFilters ? '#4CAF50' : '#777E5C'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
});

const ScrollingHeader = memo(function ScrollingHeader({
  showFilters,
  filters,
  categoryOptions,
  statusOptions,
  stats,
  pagination,
  onSelectCategory,
  onSelectStatus,
}) {
  return (
    <View>
      {/* Filtres par catégorie */}
      {showFilters && (
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Filtrer par catégorie</Text>
          <FlatList
            data={categoryOptions}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: option }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filters.category === option.id && styles.filterChipActive,
                ]}
                onPress={() => onSelectCategory(option.id)}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={filters.category === option.id ? '#4CAF50' : '#777E5C'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    filters.category === option.id && styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                <View
                  style={[
                    styles.filterChipCount,
                    filters.category === option.id && styles.filterChipCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipCountText,
                      filters.category === option.id && styles.filterChipCountTextActive,
                    ]}
                  >
                    {option.count}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Filtres par statut */}
      {showFilters && (
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Filtrer par statut</Text>
          <FlatList
            data={statusOptions}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item: option }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filters.status === option.id && styles.filterChipActive,
                ]}
                onPress={() => onSelectStatus(option.id)}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={filters.status === option.id ? '#4CAF50' : '#777E5C'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    filters.status === option.id && styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                <View
                  style={[
                    styles.filterChipCount,
                    filters.status === option.id && styles.filterChipCountActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipCountText,
                      filters.status === option.id && styles.filterChipCountTextActive,
                    ]}
                  >
                    {option.count}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="construct-outline" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{pagination?.total ?? stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>Actifs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="close-circle-outline" size={24} color="#F44336" />
          <Text style={styles.statValue}>{stats.inactive}</Text>
          <Text style={styles.statLabel}>Inactifs</Text>
        </View>
      </View>
    </View>
  );
});

/* ============================
   Composant principal
   ============================ */

export default function ServicesManagement({ navigation }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQueryLocal] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  // Redux selectors
  const services = useSelector(selectAdminServices);
  const loading = useSelector(selectAdminServicesLoading);
  const loadingMore = useSelector(selectAdminServicesLoadingMore);
  const pagination = useSelector(selectAdminServicesPagination);
  const error = useSelector(selectAdminServicesError);
  const filters = useSelector(selectAdminServicesFilters);
  const filteredServices = useSelector(selectFilteredServices);
  const stats = useSelector(selectServiceStats);
  const categories = useSelector(selectAdminCategories) || [];

  // Load services + categories on mount
  useEffect(() => {
    dispatch(fetchServices({ page: 0, refresh: true }));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Debounced search -> Redux
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(setSearchQuery(searchQuery));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchServices({ page: 0, refresh: true }));
    setRefreshing(false);
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && pagination?.hasMore && !refreshing) {
      dispatch(fetchServices({ page: (pagination?.page ?? 0) + 1, refresh: false }));
    }
  }, [dispatch, loadingMore, pagination, refreshing]);

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 8 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.footerLoaderText}>Chargement...</Text>
      </View>
    );
  };

  const categoryOptions = [
    { id: 'all', label: 'Toutes', icon: 'list-outline', count: stats.total },
    ...categories.map((category) => ({
      id: category.id,
      label: category.name,
      icon: 'folder-outline',
      emoji: category.emoji,
      count: services.filter((s) => s.category_id === category.id).length,
    })),
  ];

  const statusOptions = [
    { id: 'all', label: 'Tous', icon: 'list-outline', count: stats.total },
    { id: 'active', label: 'Actifs', icon: 'checkmark-circle-outline', count: stats.active },
    { id: 'inactive', label: 'Inactifs', icon: 'close-circle-outline', count: stats.inactive },
  ];

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
          },
        },
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
            dispatch(
              toggleServiceStatus({
                serviceId: service.id,
                isActive: !service.is_active,
              })
            );
            Alert.alert(
              'Succès',
              `Service ${action === 'activer' ? 'activé' : 'désactivé'} avec succès`
            );
          },
        },
      ]
    );
  };

  if (loading && services.length === 0) {
    return (
      <View style={styles.container}>
        <FixedHeader
          navigation={navigation}
          topInset={insets.top}
          searchQuery={searchQuery}
          onChangeSearch={setSearchQueryLocal}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onAddService={() => navigation.navigate('AdminServiceForm', { mode: 'add' })}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des services...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barre supérieure + Search (fixe) */}
      <FixedHeader
        navigation={navigation}
        topInset={insets.top}
        searchQuery={searchQuery}
        onChangeSearch={setSearchQueryLocal}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onAddService={() => navigation.navigate('AdminServiceForm', { mode: 'add' })}
      />

      {/* Liste défilante */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            onView={handleViewService}
            onEdit={handleEditService}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteService}
          />
        )}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.servicesList}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <ScrollingHeader
            showFilters={showFilters}
            filters={filters}
            categoryOptions={categoryOptions}
            statusOptions={statusOptions}
            stats={stats}
            pagination={pagination}
            onSelectCategory={(id) => dispatch(setCategoryFilter(id))}
            onSelectStatus={(id) => dispatch(setStatusFilter(id))}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <ListEmpty
            filters={filters}
            onCreate={() => navigation.navigate('AdminServiceForm', { mode: 'add' })}
          />
        }
      />
    </View>
  );
}

/* ============================
   Styles
   ============================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  /* Header fixe */
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
  menuButton: { padding: 8 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  /* Barre de recherche fixe */
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#283106',
    paddingVertical: 12,
  },
  clearButton: { padding: 4, marginLeft: 8 },
  filterToggleButton: { padding: 4, marginLeft: 8 },

  /* Header défilant (dans la FlatList) */
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777E5C',
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  filterChipActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0FDF4',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777E5C',
  },
  filterChipTextActive: { color: '#4CAF50' },
  filterChipCount: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterChipCountActive: { backgroundColor: '#D1FAE5' },
  filterChipCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#777E5C',
  },
  filterChipCountTextActive: { color: '#4CAF50' },

  /* Stats */
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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

  /* Liste et cartes */
  servicesList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    rowGap: 16,
  },
  serviceCard: {
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
    marginBottom: 16,
  },
  serviceImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  serviceImage: { width: '100%', height: '100%' },
  serviceImagePlaceholder: {
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
  badgeInactive: { backgroundColor: 'rgba(244, 67, 54, 0.9)' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  serviceContent: { padding: 16 },
  serviceHeader: { marginBottom: 12 },
  serviceInfo: { gap: 8 },
  serviceName: { fontSize: 18, fontWeight: '700', color: '#283106', lineHeight: 24 },

  serviceMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#777E5C', fontWeight: '500' },

  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  servicePrice: { fontSize: 16, fontWeight: '700', color: '#4CAF50' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 14, color: '#777E5C', fontWeight: '600' },

  serviceActions: {
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
  actionButtonEdit: { backgroundColor: '#E3F2FD' },
  actionButtonDisable: { backgroundColor: '#FFEBEE' },
  actionButtonEnable: { backgroundColor: '#E8F5E9' },
  actionButtonDelete: { backgroundColor: '#FFEBEE' },
  actionButtonText: { fontSize: 13, fontWeight: '600', color: '#2196F3' },
  actionButtonTextDisable: { color: '#F44336' },
  actionButtonTextEnable: { color: '#4CAF50' },
  actionButtonTextDelete: { color: '#F44336' },

  /* Loading & Empty */
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 16, color: '#777E5C', marginTop: 16 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
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
  emptyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  /* Footer loader */
  footerLoader: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' },
  footerLoaderText: { marginTop: 8, fontSize: 12, color: '#777E5C' },
});
