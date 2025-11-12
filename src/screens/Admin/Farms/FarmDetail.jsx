import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { deleteFarm, verifyFarm, selectAllFarms } from '../../../store/admin/farmSlice';

export default function FarmDetail({ route, navigation }) {
  const { farm: initialFarm = {} } = route.params || {};
  const dispatch = useDispatch();
  const farms = useSelector(selectAllFarms);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Ferme à jour depuis le store (fallback sur initialFarm)
  const farm = farms.find((f) => f.id === initialFarm.id) || initialFarm;

  const handleEditFarm = () => {
    navigation.navigate('FarmForm', { mode: 'edit', farm });
  };

  const handleViewProducts = () => {
    navigation.navigate('FarmProducts', { farm });
  };

  const handleDeleteFarm = () => {
    Alert.alert(
      'Supprimer la ferme',
      `Voulez-vous vraiment supprimer la ferme "${farm?.name || ''}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteFarm(farm.id));
            Alert.alert('Succès', 'Ferme supprimée avec succès');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleVerifyFarm = () => {
    Alert.alert(
      'Vérifier la ferme',
      `Voulez-vous vérifier la ferme "${farm?.name || ''}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vérifier',
          onPress: () => {
            dispatch(verifyFarm(farm.id));
            Alert.alert('Succès', 'Ferme vérifiée avec succès');
          },
        },
      ]
    );
  };

  // Lignes d'infos
  const InfoRow = ({ label, value, icon }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        {icon ? <Ionicons name={icon} size={16} color="#777E5C" /> : null}
        <Text style={styles.infoLabel}>{String(label || '')}</Text>
      </View>
      <Text style={styles.infoValue}>{String(value ?? '')}</Text>
    </View>
  );

  // Badges certification
  const CertificationBadge = ({ certification }) => (
    <View style={styles.certificationBadge}>
      <Text style={styles.certificationText}>{String(certification || '')}</Text>
    </View>
  );

  // Services on/off
  const ServiceToggle = ({ service, enabled }) => (
    <View style={styles.serviceItem}>
      <Ionicons
        name={enabled ? 'checkmark-circle' : 'close-circle'}
        size={20}
        color={enabled ? '#4CAF50' : '#E0E0E0'}
      />
      <Text style={[styles.serviceText, { color: enabled ? '#4CAF50' : '#777E5C' }]}>
        {String(service || '')}
      </Text>
    </View>
  );

  const mainImage = farm?.main_image || farm?.image || null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la Ferme</Text>
        <TouchableOpacity style={[styles.iconBtn, styles.editBtn]} onPress={handleEditFarm}>
          <Ionicons name="pencil" size={18} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image / placeholder */}
        {mainImage ? (
          <View style={styles.imageSection}>
            <Image source={{ uri: mainImage }} style={styles.farmImage} resizeMode="cover" />
            <View style={styles.imageOverlay}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: farm?.verified ? '#4CAF50' : '#FF9800' },
                ]}
              >
                <Ionicons
                  name={farm?.verified ? 'checkmark-circle' : 'time-outline'}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.statusText}>
                  {farm?.verified ? 'Vérifiée' : 'En attente'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={56} color="#E0E0E0" />
            <Text style={styles.placeholderText}>Aucune image</Text>
          </View>
        )}

        {/* Informations générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Générales</Text>
          <InfoRow label="Nom" value={farm?.name} icon="business-outline" />
          <InfoRow label="Localisation" value={farm?.location} icon="location-outline" />
          <InfoRow label="Région" value={farm?.region} icon="map-outline" />
          <InfoRow label="Spécialité" value={farm?.specialty} icon="leaf-outline" />
          <InfoRow
            label="Année d'établissement"
            value={farm?.established != null ? String(farm.established) : ''}
            icon="calendar-outline"
          />
          {farm?.rating != null ? (
            <InfoRow
              label="Note"
              value={`${farm.rating}/5 (${farm?.reviewCount || 0} avis)`}
              icon="star-outline"
            />
          ) : null}
        </View>

        {/* Description */}
        {farm?.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{String(farm.description)}</Text>
          </View>
        ) : null}

        {/* Histoire */}
        {farm?.story ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histoire</Text>
            <Text style={styles.descriptionText}>{String(farm.story)}</Text>
          </View>
        ) : null}

        {/* Certifications */}
        {Array.isArray(farm?.certifications) && farm.certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.certificationsContainer}>
              {farm.certifications.map((c, idx) => (
                <CertificationBadge key={`cert-${idx}`} certification={c} />
              ))}
            </View>
          </View>
        ) : null}

        {/* Pratiques durables */}
        {Array.isArray(farm?.sustainablePractices) && farm.sustainablePractices.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pratiques Durables</Text>
            <View style={styles.practicesContainer}>
              {farm.sustainablePractices.map((p, idx) => (
                <Text key={`practice-${idx}`} style={styles.practiceItem}>
                  {`• ${String(p)}`}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesContainer}>
            <ServiceToggle service="Livraison" enabled={!!farm?.delivery} />
            <ServiceToggle service="Retrait sur place" enabled={!!farm?.pickup} />
            <ServiceToggle service="Magasin à la ferme" enabled={!!farm?.farm_shop} />
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          {farm?.contact?.phone ? (
            <InfoRow label="Téléphone" value={farm.contact.phone} icon="call-outline" />
          ) : null}
          {farm?.contact?.email ? (
            <InfoRow label="Email" value={farm.contact.email} icon="mail-outline" />
          ) : null}
          {farm?.contact?.website ? (
            <InfoRow label="Site web" value={farm.contact.website} icon="globe-outline" />
          ) : null}
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{String(farm?.products?.length || 0)}</Text>
              <Text style={styles.statLabel}>Produits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{farm?.rating != null ? String(farm.rating) : 'N/A'}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{String(farm?.reviewCount || 0)}</Text>
              <Text style={styles.statLabel}>Avis</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Actions bas de page */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.productsButton} onPress={handleViewProducts} activeOpacity={0.9}>
          <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
          <Text style={styles.productsButtonText}>Voir les Produits</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          {!farm?.verified ? (
            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyFarm} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteFarm} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iconBtn: { padding: 8 },
  editBtn: { borderWidth: 1, borderColor: '#4CAF50', borderRadius: 20 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
  },

  content: { flex: 1 },

  imageSection: {
    position: 'relative',
    height: 250,
    backgroundColor: '#F5F5F5',
    marginBottom: 16,
  },
  farmImage: { width: '100%', height: '100%' },
  imagePlaceholder: {
    height: 250,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: { fontSize: 14, color: '#777E5C', marginTop: 10 },

  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#283106', marginBottom: 10 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  infoLabel: { fontSize: 14, color: '#777E5C' },
  infoValue: { fontSize: 14, color: '#283106', fontWeight: '500' },

  descriptionText: { fontSize: 14, color: '#555', lineHeight: 22 },

  certificationsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  certificationBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  certificationText: { color: '#4CAF50', fontSize: 12, fontWeight: '700' },

  practicesContainer: { gap: 4 },
  practiceItem: { fontSize: 14, color: '#555', lineHeight: 20 },

  servicesContainer: { gap: 8 },
  serviceItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  serviceText: { fontSize: 14, fontWeight: '600' },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#4CAF50' },
  statLabel: { fontSize: 12, color: '#777E5C', marginTop: 4 },

  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  productsButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
  },
  productsButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  actionButtons: { flexDirection: 'row', gap: 8 },
  verifyButton: { padding: 10, backgroundColor: '#E3F2FD', borderRadius: 8 },
  deleteButton: { padding: 10, backgroundColor: '#FFEBEE', borderRadius: 8 },
});
