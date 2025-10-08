import React, { useState} from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button , ScreenWrapper } from '../../../components/ui';
import { deleteFarm, verifyFarm, selectAllFarms } from '../../../store/admin/farmSlice';

export default function FarmDetail({ route, navigation }) {
  const { farm: initialFarm } = route.params;
  const dispatch = useDispatch();
  const farms = useSelector(selectAllFarms);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Récupérer la ferme mise à jour depuis le store
  const farm = farms.find(f => f.id === initialFarm.id) || initialFarm;

  const handleEditFarm = () => {
    navigation.navigate('FarmForm', { mode: 'edit', farm });
  };

  const handleViewProducts = () => {
    navigation.navigate('FarmProducts', { farm });
  };

  const handleDeleteFarm = () => {
    Alert.alert(
      'Supprimer la ferme',
      `Voulez-vous vraiment supprimer la ferme "${farm.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteFarm(farm.id));
            Alert.alert('Succès', 'Ferme supprimée avec succès');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleVerifyFarm = () => {
    Alert.alert(
      'Vérifier la ferme',
      `Voulez-vous vérifier la ferme "${farm.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Vérifier', 
          onPress: () => {
            dispatch(verifyFarm(farm.id));
            Alert.alert('Succès', 'Ferme vérifiée avec succès');
          }
        }
      ]
    );
  };

  const InfoRow = ({ label, value, icon }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        {icon && <Ionicons name={icon} size={16} color="#777E5C" />}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </ View>
  );

  const CertificationBadge = ({ certification }) => (
    <View style={styles.certificationBadge}>
      <Text style={styles.certificationText}>{certification || ''}</Text>
    </View>
  );

  const ServiceToggle = ({ service, enabled }) => (
    <View style={styles.serviceItem}>
      <Ionicons 
        name={enabled ? "checkmark-circle" : "close-circle"} 
        size={20} 
        color={enabled ? "#4CAF50" : "#E0E0E0"} 
      />
      <Text style={[styles.serviceText, { color: enabled ? "#4CAF50" : "#777E5C" }]}>
        {service}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la Ferme</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditFarm}
        >
          <Ionicons name="pencil" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {(farm.main_image || farm.image) ? (
          <View style={styles.imageSection}>
            <Image
              source={{ uri: farm.main_image || farm.image }}
              style={styles.farmImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <View style={[styles.statusBadge, { backgroundColor: farm.verified ? '#4CAF50' : '#FF9800' }]}>
                <Ionicons 
                  name={farm.verified ? "checkmark-circle" : "time-outline"} 
                  size={14} 
                  color="#FFFFFF" 
                />
                <Text style={styles.statusText}>
                  {farm.verified ? 'Vérifiée' : 'En attente'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={64} color="#E0E0E0" />
            <Text style={styles.placeholderText}>Aucune image</Text>
          </View>
        )}

        <Container style={styles.detailsSection}>
         
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Générales</Text>
            
            <InfoRow label="Nom" value={farm.name || ''} icon="business-outline" />
            <InfoRow label="Localisation" value={farm.location || ''} icon="location-outline" />
            <InfoRow label="Région" value={farm.region || ''} icon="map-outline" />
            <InfoRow label="Spécialité" value={farm.specialty || ''} icon="leaf-outline" />
            <InfoRow label="Année d'établissement" value={farm.established?.toString() || ''} icon="calendar-outline" />
           
            
            {farm.rating && (
              <InfoRow 
                label="Note" 
                value={`${farm.rating}/5 (${farm.reviewCount || 0} avis)`} 
                icon="star-outline" 
              />
            )}
          </View>

          
          {farm.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{farm.description}</Text>
            </View>
          )}

          
          {farm.story && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Histoire</Text>
              <Text style={styles.descriptionText}>{farm.story}</Text>
            </View>
          )}

         
          {farm.certifications && farm.certifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <View style={styles.certificationsContainer}>
                {farm.certifications.map((certification, index) => (
                  <CertificationBadge key={index} certification={certification} />
                ))}
              </View>
            </View>
          )}

        
          {farm.sustainablePractices && farm.sustainablePractices.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pratiques Durables</Text>
              <View style={styles.practicesContainer}>
                {farm.sustainablePractices.map((practice, index) => (
                  <Text key={index} style={styles.practiceItem}>• {practice}</Text>
                ))}
              </View>
            </View>
          )}

          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesContainer}>
              <ServiceToggle service="Livraison" enabled={farm.delivery} />
              <ServiceToggle service="Retrait sur place" enabled={farm.pickup} />
              <ServiceToggle service="Magasin à la ferme" enabled={farm.farm_shop} />
            </View>
          </View>

         
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            {farm.contact?.phone && (
              <InfoRow label="Téléphone" value={farm.contact.phone || ''} icon="call-outline" />
            )}
            {farm.contact?.email && (
              <InfoRow label="Email" value={farm.contact.email || ''} icon="mail-outline" />
            )}
            {farm.contact?.website && (
              <InfoRow label="Site web" value={farm.contact.website || ''} icon="globe-outline" />
            )}
          </View>

         
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{farm.products?.length || 0}</Text>
                <Text style={styles.statLabel}>Produits</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{farm.rating || 'N/A'}</Text>
                <Text style={styles.statLabel}>Note</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{farm.reviewCount || 0}</Text>
                <Text style={styles.statLabel}>Avis</Text>
              </View>
            </View>
          </View>
        </Container>
      </ScrollView>

      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.productsButton}
          onPress={handleViewProducts}
        >
          <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
          <Text style={styles.productsButtonText}>Voir les Produits</Text>
        </TouchableOpacity>
        
        <View style={styles.actionButtons}>
          {!farm.verified && (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerifyFarm}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteFarm}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 50,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    height: 250,
    marginBottom: 16,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  farmImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#777E5C',
    marginTop: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
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
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  certificationBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  certificationText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  practicesContainer: {
    gap: 4,
  },
  practiceItem: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  servicesContainer: {
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '500',
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  productsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  productsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  verifyButton: {
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  deleteButton: {
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
});
