import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { feedbackService } from '../../../backend/services/feedbackService';

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug', icon: 'bug-outline', color: '#DC2626' },
  { id: 'feature', label: 'Nouvelle fonctionnalité', icon: 'bulb-outline', color: '#2196F3' },
  { id: 'improvement', label: 'Amélioration', icon: 'trending-up-outline', color: '#4CAF50' },
  { id: 'complaint', label: 'Réclamation', icon: 'alert-circle-outline', color: '#FF9800' },
  { id: 'compliment', label: 'Compliment', icon: 'heart-outline', color: '#E91E63' },
  { id: 'other', label: 'Autre', icon: 'ellipsis-horizontal-outline', color: '#9E9E9E' },
];

const STATUS_OPTIONS = [
  { id: 'pending', label: 'En attente', icon: 'time-outline', color: '#FF9800' },
  { id: 'reviewed', label: 'Examiné', icon: 'eye-outline', color: '#2196F3' },
  { id: 'in_progress', label: 'En cours', icon: 'sync-outline', color: '#9C27B0' },
  { id: 'resolved', label: 'Résolu', icon: 'checkmark-circle-outline', color: '#4CAF50' },
  { id: 'closed', label: 'Fermé', icon: 'close-circle-outline', color: '#9E9E9E' },
];

const PRIORITY_OPTIONS = [
  { id: 'low', label: 'Basse', color: '#4CAF50' },
  { id: 'normal', label: 'Normale', color: '#2196F3' },
  { id: 'high', label: 'Haute', color: '#FF9800' },
  { id: 'urgent', label: 'Urgente', color: '#DC2626' },
];

export default function FeedbackDetail({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { feedback: initialFeedback } = route.params;
  const [feedback, setFeedback] = useState(initialFeedback);
  const [selectedStatus, setSelectedStatus] = useState(feedback.status);
  const [adminNotes, setAdminNotes] = useState(feedback.admin_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleUpdateStatus = async () => {
    if (selectedStatus === feedback.status && adminNotes === (feedback.admin_notes || '')) {
      Alert.alert('Information', 'Aucune modification à enregistrer');
      return;
    }

    setIsUpdating(true);
    try {
      const { data, error } = await feedbackService.updateFeedbackStatus(
        feedback.id,
        selectedStatus,
        adminNotes.trim() || null
      );

      if (error) {
        Alert.alert('Erreur', error);
        return;
      }

      setFeedback(data);
      Alert.alert('Succès', 'Le statut du feedback a été mis à jour');
      navigation.goBack();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    } finally {
      setIsUpdating(false);
    }
  };

  const typeInfo = getTypeInfo(feedback.type);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du Feedback</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Informations principales */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.typeIcon, { backgroundColor: `${typeInfo.color}15` }]}>
              <Ionicons name={typeInfo.icon} size={24} color={typeInfo.color} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.subject}>{feedback.subject}</Text>
              <Text style={styles.typeLabel}>{typeInfo.label}</Text>
            </View>
          </View>

          {feedback.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{feedback.category}</Text>
            </View>
          )}

          <Text style={styles.message}>{feedback.message}</Text>

          {feedback.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Note de satisfaction:</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= feedback.rating ? 'star' : 'star-outline'}
                    size={20}
                    color={star <= feedback.rating ? '#FFD700' : '#CBD5E0'}
                  />
                ))}
                <Text style={styles.ratingValue}>{feedback.rating}/5</Text>
              </View>
            </View>
          )}
        </View>

        {/* Informations utilisateur */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations utilisateur</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#777E5C" />
            <Text style={styles.infoText}>
              {feedback.profiles
                ? `${feedback.profiles.first_name || ''} ${feedback.profiles.last_name || ''}`.trim() ||
                  'Nom non disponible'
                : 'Utilisateur inconnu'}
            </Text>
          </View>
          {feedback.profiles?.email && (
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color="#777E5C" />
              <Text style={styles.infoText}>{feedback.profiles.email}</Text>
            </View>
          )}
        </View>

        {/* Métadonnées */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Métadonnées</Text>
          <View style={styles.metadataGrid}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Statut actuel</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(feedback.status)}15` },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(feedback.status) }]}>
                  {getStatusLabel(feedback.status)}
                </Text>
              </View>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Priorité</Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: `${getPriorityColor(feedback.priority)}15` },
                ]}
              >
                <Text
                  style={[styles.priorityText, { color: getPriorityColor(feedback.priority) }]}
                >
                  {getPriorityLabel(feedback.priority)}
                </Text>
              </View>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Créé le</Text>
              <Text style={styles.metadataValue}>{formatDate(feedback.created_at)}</Text>
            </View>
            {feedback.updated_at && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Modifié le</Text>
                <Text style={styles.metadataValue}>{formatDate(feedback.updated_at)}</Text>
              </View>
            )}
            {feedback.resolved_at && (
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Résolu le</Text>
                <Text style={styles.metadataValue}>{formatDate(feedback.resolved_at)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Gestion du statut */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Gérer le statut</Text>
          <Text style={styles.sectionSubtitle}>Sélectionnez le nouveau statut</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status.id}
                style={[
                  styles.statusOption,
                  selectedStatus === status.id && styles.statusOptionActive,
                  selectedStatus === status.id && { borderColor: status.color },
                ]}
                onPress={() => setSelectedStatus(status.id)}
              >
                <Ionicons
                  name={status.icon}
                  size={20}
                  color={selectedStatus === status.id ? status.color : '#777E5C'}
                />
                <Text
                  style={[
                    styles.statusOptionText,
                    selectedStatus === status.id && { color: status.color },
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes admin */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes administrateur</Text>
          <Text style={styles.sectionSubtitle}>
            Ajoutez des notes internes (non visibles par l'utilisateur)
          </Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Ajoutez vos notes ici..."
            value={adminNotes}
            onChangeText={setAdminNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Bouton de mise à jour */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
            onPress={handleUpdateStatus}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                <Text style={styles.updateButtonText}>Mise à jour...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.updateButtonText}>Mettre à jour le statut</Text>
              </>
            )}
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  subject: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 14,
    color: '#777E5C',
    fontWeight: '500',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  message: {
    fontSize: 15,
    color: '#777E5C',
    lineHeight: 24,
    marginBottom: 16,
  },
  ratingContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#777E5C',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#283106',
    flex: 1,
  },
  metadataGrid: {
    gap: 16,
  },
  metadataItem: {
    marginBottom: 8,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#777E5C',
    marginBottom: 6,
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: 14,
    color: '#283106',
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: 8,
    minWidth: '45%',
  },
  statusOptionActive: {
    borderWidth: 2,
    backgroundColor: '#F8FAFC',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#777E5C',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#283106',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

