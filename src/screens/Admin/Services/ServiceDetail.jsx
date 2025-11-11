import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button , ScreenWrapper } from '../../../components/ui';
import { 
  toggleServiceStatus,
  selectServiceById
} from '../../../store/admin/servicesSlice';

export default function ServiceDetail({ route, navigation }) {
  const { service: initialService } = route.params;
  const dispatch = useDispatch();
  
  // Récupérer le service mis à jour depuis le store
  const service = useSelector((state) => selectServiceById(state, initialService.id)) || initialService;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleStatus = () => {
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

  const handleEditService = () => {
    navigation.navigate('AdminServiceForm', { mode: 'edit', service });
  };

  const handleContactService = (method) => {
    const actions = {
      call: () => Alert.alert('Appel', `Appel vers ${service.contact.phone}`),
      email: () => Alert.alert('Email', `Envoi d'email à ${service.contact.email}`)
    };
    
    if (actions[method]) {
      actions[method]();
    }
  };

  const InfoRow = ({ label, value, icon }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        {icon ? <Ionicons name={icon} size={16} color="#777E5C" /> : null}
        <Text style={styles.infoLabel}>{String(label ?? '')}</Text>
      </View>
      <Text style={styles.infoValue}>{String(value ?? '')}</Text>
    </View>
  );

  const FeatureItem = ({ feature }) => (
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

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
          <Text style={styles.headerTitle}>Détails du Service</Text>
          <Text style={styles.headerSubtitle}>{service.category}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditService}
        >
          <Ionicons name="pencil" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image et statut */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: service.image }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
          <View style={styles.statusOverlay}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: service.is_active ? '#4CAF50' : '#F44336' }
            ]}>
              <Text style={styles.statusBadgeText}>
                {service.is_active ? 'Actif' : 'Inactif'}
              </Text>
            </View>
          </View>
        </View>

        <Container style={styles.detailsSection}>
          {/* Informations principales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Générales</Text>
            
            <InfoRow label="Nom" value={service.name} icon="construct-outline" />
            <InfoRow label="Catégorie" value={service.category} icon="grid-outline" />
            <InfoRow label="Prix" value={service.price} icon="cash-outline" />
            {service.priceDetails && (
              <InfoRow label="Détails prix" value={service.priceDetails} icon="information-circle-outline" />
            )}
            <InfoRow label="Délai" value={service.deliveryTime} icon="time-outline" />
            <InfoRow label="Zone de couverture" value={service.coverage} icon="location-outline" />
            {service.minOrder && (
              <InfoRow label="Commande minimum" value={service.minOrder.toString()} icon="basket-outline" />
            )}
          </View>

          {/* Description */}
          {service.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{service.description}</Text>
            </View>
          )}

          {/* Fonctionnalités */}
          {service.features && service.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fonctionnalités</Text>
              <View style={styles.featuresContainer}>
                {service.features.map((feature, index) => (
                  <FeatureItem key={index} feature={feature} />
                ))}
              </View>
            </View>
          )}

          {/* Contact */}
          {service.contact && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              {service.contact.phone && (
                <InfoRow label="Téléphone" value={service.contact.phone} icon="call-outline" />
              )}
              {service.contact.email && (
                <InfoRow label="Email" value={service.contact.email} icon="mail-outline" />
              )}
            </View>
          )}

          {/* Statistiques */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{service.rating ? service.rating.toFixed(1) : 'N/A'}</Text>
                <Text style={styles.statLabel}>Note</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{service.reviewCount || 0}</Text>
                <Text style={styles.statLabel}>Avis</Text>
              </View>
            </View>

          </View>

          {/* Métadonnées */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Système</Text>
            <InfoRow label="Créé le" value={formatDate(service.createdAt)} icon="calendar-outline" />
            <InfoRow label="Modifié le" value={formatDate(service.updatedAt)} icon="time-outline" />
          </View>
        </Container>

        {/* Actions */}
        <Container style={styles.section}>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleContactService('call')}
            >
              <Ionicons name="call" size={20} color="#4CAF50" />
              <Text style={styles.actionButtonText}>Appeler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleContactService('email')}
            >
              <Ionicons name="mail" size={20} color="#2196F3" />
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.toggleButton,
                { backgroundColor: service.is_active ? '#F44336' : '#4CAF50' }
              ]}
              onPress={handleToggleStatus}
            >
              <Ionicons 
                name={service.is_active ? 'pause' : 'play'} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                {service.is_active ? 'Désactiver' : 'Activer'}
              </Text>
            </TouchableOpacity>
          </View>
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    height: 200,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  statusOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsSection: {
    paddingVertical: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777E5C',
  },
  infoValue: {
    fontSize: 14,
    color: '#283106',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#777E5C',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  toggleButton: {
    backgroundColor: '#4CAF50',
  },
});

