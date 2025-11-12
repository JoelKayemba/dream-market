import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { feedbackService } from '../../../backend/services/feedbackService';

const FEEDBACK_TYPES = [
  { id: 'all', label: 'Tous', icon: 'list-outline', color: '#777E5C' },
  { id: 'bug', label: 'Bug', icon: 'bug-outline', color: '#DC2626' },
  { id: 'feature', label: 'Fonctionnalité', icon: 'bulb-outline', color: '#2196F3' },
  { id: 'improvement', label: 'Amélioration', icon: 'trending-up-outline', color: '#4CAF50' },
  { id: 'complaint', label: 'Réclamation', icon: 'alert-circle-outline', color: '#FF9800' },
  { id: 'compliment', label: 'Compliment', icon: 'heart-outline', color: '#E91E63' },
  { id: 'other', label: 'Autre', icon: 'ellipsis-horizontal-outline', color: '#9E9E9E' },
];

const STATUS_OPTIONS = [
  { id: 'all', label: 'Tous', icon: 'list-outline', color: '#777E5C' },
  { id: 'pending', label: 'En attente', icon: 'time-outline', color: '#FF9800' },
  { id: 'reviewed', label: 'Examiné', icon: 'eye-outline', color: '#2196F3' },
  { id: 'in_progress', label: 'En cours', icon: 'sync-outline', color: '#9C27B0' },
  { id: 'resolved', label: 'Résolu', icon: 'checkmark-circle-outline', color: '#4CAF50' },
  { id: 'closed', label: 'Fermé', icon: 'close-circle-outline', color: '#9E9E9E' },
];

const PRIORITY_OPTIONS = [
  { id: 'all', label: 'Toutes', color: '#777E5C' },
  { id: 'low', label: 'Basse', color: '#4CAF50' },
  { id: 'normal', label: 'Normale', color: '#2196F3' },
  { id: 'high', label: 'Haute', color: '#FF9800' },
  { id: 'urgent', label: 'Urgente', color: '#DC2626' },
];

export default function FeedbacksManagement({ navigation }) {
  const insets = useSafeAreaInsets();
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    byType: {},
    byStatus: {},
  });

  useEffect(() => {
    loadFeedbacks();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [feedbacks, selectedType, selectedStatus, selectedPriority, searchQuery]);

  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await feedbackService.getAllFeedbacks();
      if (error) {
        Alert.alert('Erreur', error);
        return;
      }
      setFeedbacks(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des feedbacks:', error);
      Alert.alert('Erreur', 'Impossible de charger les feedbacks');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (feedbacksList) => {
    const newStats = {
      total: feedbacksList.length,
      pending: 0,
      byType: {},
      byStatus: {},
    };

    feedbacksList.forEach((feedback) => {
      newStats.byType[feedback.type] = (newStats.byType[feedback.type] || 0) + 1;
      newStats.byStatus[feedback.status] = (newStats.byStatus[feedback.status] || 0) + 1;
      if (feedback.status === 'pending') newStats.pending++;
    });

    setStats(newStats);
  };

  const filterFeedbacks = () => {
    let filtered = [...feedbacks];

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter((f) => f.type === selectedType);
    }

    // Filtre par statut
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((f) => f.status === selectedStatus);
    }

    // Filtre par priorité
    if (selectedPriority !== 'all') {
      filtered = filtered.filter((f) => f.priority === selectedPriority);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.subject.toLowerCase().includes(query) ||
          f.message.toLowerCase().includes(query) ||
          (f.profiles?.email && f.profiles.email.toLowerCase().includes(query))
      );
    }

    setFilteredFeedbacks(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedbacks();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      reviewed: '#2196F3',
      in_progress: '#9C27B0',
      resolved: '#4CAF50',
      closed: '#9E9E9E',
    };
    return colors[status] || '#9E9E9E';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      reviewed: 'Examiné',
      in_progress: 'En cours',
      resolved: 'Résolu',
      closed: 'Fermé',
    };
    return labels[status] || status;
  };

  const getTypeInfo = (type) => {
    return FEEDBACK_TYPES.find((t) => t.id === type) || FEEDBACK_TYPES[FEEDBACK_TYPES.length - 1];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4CAF50',
      normal: '#2196F3',
      high: '#FF9800',
      urgent: '#DC2626',
    };
    return colors[priority] || '#777E5C';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Basse',
      normal: 'Normale',
      high: 'Haute',
      urgent: 'Urgente',
    };
    return labels[priority] || priority;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const handleViewFeedback = (feedback) => {
    navigation.navigate('FeedbackDetailAdmin', { feedback });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Feedbacks</Text>
        <View style={styles.headerRight}>
          <Text style={styles.statsText}>
            {stats.pending > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stats.pending}</Text>
              </View>
            )}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="document-text-outline" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
        </View>

        {/* Recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#777E5C" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par sujet, message ou email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#777E5C" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres Type */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {FEEDBACK_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.filterChip,
                  selectedType === type.id && styles.filterChipActive,
                  selectedType === type.id && { borderColor: type.color },
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Ionicons
                  name={type.icon}
                  size={16}
                  color={selectedType === type.id ? type.color : '#777E5C'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedType === type.id && { color: type.color },
                  ]}
                >
                  {type.label}
                </Text>
                {type.id !== 'all' && stats.byType[type.id] && (
                  <View style={[styles.filterBadge, { backgroundColor: `${type.color}15` }]}>
                    <Text style={[styles.filterBadgeText, { color: type.color }]}>
                      {stats.byType[type.id]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Filtres Statut */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Statut</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status.id}
                style={[
                  styles.filterChip,
                  selectedStatus === status.id && styles.filterChipActive,
                  selectedStatus === status.id && { borderColor: status.color },
                ]}
                onPress={() => setSelectedStatus(status.id)}
              >
                <Ionicons
                  name={status.icon}
                  size={16}
                  color={selectedStatus === status.id ? status.color : '#777E5C'}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedStatus === status.id && { color: status.color },
                  ]}
                >
                  {status.label}
                </Text>
                {status.id !== 'all' && stats.byStatus[status.id] && (
                  <View style={[styles.filterBadge, { backgroundColor: `${status.color}15` }]}>
                    <Text style={[styles.filterBadgeText, { color: status.color }]}>
                      {stats.byStatus[status.id]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Filtres Priorité */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Priorité</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {PRIORITY_OPTIONS.map((priority) => (
              <TouchableOpacity
                key={priority.id}
                style={[
                  styles.filterChip,
                  selectedPriority === priority.id && styles.filterChipActive,
                  selectedPriority === priority.id && { borderColor: priority.color },
                ]}
                onPress={() => setSelectedPriority(priority.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedPriority === priority.id && { color: priority.color },
                  ]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Liste des feedbacks */}
        <View style={styles.feedbacksContainer}>
          {isLoading && feedbacks.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={48} color="#4CAF50" />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          ) : filteredFeedbacks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#CBD5E0" />
              <Text style={styles.emptyTitle}>Aucun feedback</Text>
              <Text style={styles.emptyText}>
                {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Aucun feedback ne correspond aux filtres sélectionnés.'
                  : 'Aucun feedback pour le moment.'}
              </Text>
            </View>
          ) : (
            filteredFeedbacks.map((feedback) => {
              const typeInfo = getTypeInfo(feedback.type);
              return (
                <TouchableOpacity
                  key={feedback.id}
                  style={styles.feedbackCard}
                  onPress={() => handleViewFeedback(feedback)}
                  activeOpacity={0.7}
                >
                  <View style={styles.feedbackHeader}>
                    <View style={styles.feedbackHeaderLeft}>
                      <View
                        style={[
                          styles.typeIcon,
                          { backgroundColor: `${typeInfo.color}15` },
                        ]}
                      >
                        <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
                      </View>
                      <View style={styles.feedbackTitleContainer}>
                        <Text style={styles.feedbackSubject} numberOfLines={1}>
                          {feedback.subject}
                        </Text>
                        <Text style={styles.feedbackUser}>
                          {feedback.profiles
                            ? `${feedback.profiles.first_name || ''} ${feedback.profiles.last_name || ''}`.trim() ||
                              feedback.profiles.email
                            : 'Utilisateur inconnu'}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(feedback.status)}15` },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: getStatusColor(feedback.status) }]}
                      >
                        {getStatusLabel(feedback.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.feedbackMessage} numberOfLines={2}>
                    {feedback.message}
                  </Text>

                  <View style={styles.feedbackFooter}>
                    <View style={styles.feedbackMeta}>
                      {feedback.priority && (
                        <View
                          style={[
                            styles.priorityBadge,
                            { backgroundColor: `${getPriorityColor(feedback.priority)}15` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.priorityText,
                              { color: getPriorityColor(feedback.priority) },
                            ]}
                          >
                            {getPriorityLabel(feedback.priority)}
                          </Text>
                        </View>
                      )}
                      {feedback.rating && (
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={styles.ratingText}>{feedback.rating}/5</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.feedbackDate}>{formatDate(feedback.created_at)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
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
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsText: {
    fontSize: 14,
    color: '#777E5C',
  },
  scrollView: {
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
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
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  filterScroll: {
    paddingLeft: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    borderWidth: 1.5,
    backgroundColor: '#F8FAFC',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#777E5C',
  },
  filterBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  feedbacksContainer: {
    padding: 20,
    paddingTop: 0,
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
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  feedbackHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackTitleContainer: {
    flex: 1,
  },
  feedbackSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 4,
  },
  feedbackUser: {
    fontSize: 12,
    color: '#777E5C',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  feedbackMessage: {
    fontSize: 14,
    color: '#777E5C',
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  feedbackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#283106',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#999999',
  },
});

