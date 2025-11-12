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
import { ScreenWrapper } from '../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { feedbackService } from '../backend/services/feedbackService';

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug', icon: 'bug-outline', color: '#DC2626' },
  { id: 'feature', label: 'Nouvelle fonctionnalité', icon: 'bulb-outline', color: '#2196F3' },
  { id: 'improvement', label: 'Amélioration', icon: 'trending-up-outline', color: '#4CAF50' },
  { id: 'complaint', label: 'Réclamation', icon: 'alert-circle-outline', color: '#FF9800' },
  { id: 'compliment', label: 'Compliment', icon: 'heart-outline', color: '#E91E63' },
  { id: 'other', label: 'Autre', icon: 'ellipsis-horizontal-outline', color: '#9E9E9E' },
];

const FEEDBACK_CATEGORIES = [
  'Interface utilisateur',
  'Performance',
  'Fonctionnalités',
  'Paiement',
  'Livraison',
  'Produits',
  'Services',
  'Autre',
];

export default function FeedbackScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('create'); // 'create' ou 'history'
  const [selectedType, setSelectedType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      loadFeedbacks();
    }
  }, [activeTab]);

  const loadFeedbacks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await feedbackService.getUserFeedbacks();
      if (error) {
        Alert.alert('Erreur', error);
        return;
      }
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des feedbacks:', error);
      Alert.alert('Erreur', 'Impossible de charger vos feedbacks');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedbacks();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type de feedback');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un sujet');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un message');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await feedbackService.createFeedback({
        type: selectedType,
        category: selectedCategory,
        subject: subject.trim(),
        message: message.trim(),
        rating: rating > 0 ? rating : null,
      });

      if (error) {
        Alert.alert('Erreur', error);
        return;
      }

      Alert.alert(
        'Merci !',
        'Votre feedback a été envoyé avec succès. Nous l\'examinerons dans les plus brefs délais.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Réinitialiser le formulaire
              setSelectedType(null);
              setSelectedCategory(null);
              setSubject('');
              setMessage('');
              setRating(0);
              // Passer à l'historique
              setActiveTab('history');
              loadFeedbacks();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le feedback. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
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
    return FEEDBACK_TYPES.find(t => t.id === type) || FEEDBACK_TYPES[FEEDBACK_TYPES.length - 1];
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retours & Feedback</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.tabActive]}
          onPress={() => setActiveTab('create')}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={activeTab === 'create' ? '#4CAF50' : '#777E5C'}
          />
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
            Nouveau feedback
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={activeTab === 'history' ? '#4CAF50' : '#777E5C'}
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Historique
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          activeTab === 'history' ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {activeTab === 'create' ? (
          <View style={styles.formContainer}>
            {/* Type de feedback */}
            <Text style={styles.label}>Type de feedback *</Text>
            <View style={styles.typesGrid}>
              {FEEDBACK_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    selectedType === type.id && styles.typeCardSelected,
                    selectedType === type.id && { borderColor: type.color }
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={selectedType === type.id ? type.color : '#777E5C'}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === type.id && { color: type.color }
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Catégorie (optionnelle) */}
            <Text style={styles.label}>Catégorie (optionnel)</Text>
            <View style={styles.categoriesGrid}>
              {FEEDBACK_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipSelected
                  ]}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category ? null : category
                  )}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.categoryTextSelected
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sujet */}
            <Text style={styles.label}>Sujet *</Text>
            <TextInput
              style={styles.input}
              placeholder="Décrivez brièvement votre feedback"
              value={subject}
              onChangeText={setSubject}
              maxLength={255}
            />

            {/* Message */}
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Détaillez votre feedback, suggestion ou problème..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            {/* Rating (optionnel) */}
            <Text style={styles.label}>Note de satisfaction (optionnel)</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= rating ? '#FFD700' : '#CBD5E0'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && 'Très insatisfait'}
                {rating === 2 && 'Insatisfait'}
                {rating === 3 && 'Neutre'}
                {rating === 4 && 'Satisfait'}
                {rating === 5 && 'Très satisfait'}
              </Text>
            )}

            {/* Bouton d'envoi */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Envoi en cours...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Envoyer le feedback</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.historyContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="hourglass-outline" size={48} color="#4CAF50" />
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : feedbacks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color="#CBD5E0" />
                <Text style={styles.emptyTitle}>Aucun feedback</Text>
                <Text style={styles.emptyText}>
                  Vous n'avez pas encore envoyé de feedback.
                </Text>
              </View>
            ) : (
              feedbacks.map((feedback) => {
                const typeInfo = getTypeInfo(feedback.type);
                return (
                  <View key={feedback.id} style={styles.feedbackCard}>
                    <View style={styles.feedbackHeader}>
                      <View style={styles.feedbackHeaderLeft}>
                        <View style={[styles.typeIcon, { backgroundColor: `${typeInfo.color}15` }]}>
                          <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
                        </View>
                        <View style={styles.feedbackTitleContainer}>
                          <Text style={styles.feedbackSubject} numberOfLines={1}>
                            {feedback.subject}
                          </Text>
                          <Text style={styles.feedbackType}>{typeInfo.label}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(feedback.status)}15` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(feedback.status) }]}>
                          {getStatusLabel(feedback.status)}
                        </Text>
                      </View>
                    </View>

                    {feedback.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{feedback.category}</Text>
                      </View>
                    )}

                    <Text style={styles.feedbackMessage} numberOfLines={3}>
                      {feedback.message}
                    </Text>

                    {feedback.rating && (
                      <View style={styles.feedbackRating}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.feedbackRatingText}>{feedback.rating}/5</Text>
                      </View>
                    )}

                    <View style={styles.feedbackFooter}>
                      <Text style={styles.feedbackDate}>
                        {new Date(feedback.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                      {feedback.status === 'pending' && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => {
                            Alert.alert(
                              'Supprimer',
                              'Êtes-vous sûr de vouloir supprimer ce feedback ?',
                              [
                                { text: 'Annuler', style: 'cancel' },
                                {
                                  text: 'Supprimer',
                                  style: 'destructive',
                                  onPress: async () => {
                                    const { error } = await feedbackService.deleteFeedback(feedback.id);
                                    if (error) {
                                      Alert.alert('Erreur', error);
                                    } else {
                                      loadFeedbacks();
                                    }
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777E5C',
  },
  tabTextActive: {
    color: '#4CAF50',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
    marginTop: 8,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  typeCard: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  typeCardSelected: {
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777E5C',
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#777E5C',
  },
  categoryTextSelected: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#283106',
    marginBottom: 20,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historyContainer: {
    padding: 20,
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
    marginBottom: 16,
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
  feedbackType: {
    fontSize: 12,
    color: '#777E5C',
    fontWeight: '500',
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
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
  },
  feedbackMessage: {
    fontSize: 14,
    color: '#777E5C',
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  feedbackRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#999999',
  },
  deleteButton: {
    padding: 4,
  },
});

