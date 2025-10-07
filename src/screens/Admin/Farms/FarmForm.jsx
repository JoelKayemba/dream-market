import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button , ScreenWrapper } from '../../../components/ui';
import { addFarm, updateFarm, selectFarmsLoading, selectFarmsUploading, selectFarmsError } from '../../../store/admin/farmSlice';
import { useImagePicker } from '../../../hooks/useImagePicker';

export default function FarmForm({ route, navigation }) {
  const { mode = 'add', farm } = route.params || {};
  const dispatch = useDispatch();
  const loading = useSelector(selectFarmsLoading);
  const uploading = useSelector(selectFarmsUploading);
  const error = useSelector(selectFarmsError);
  const { showImagePickerOptions, selectedImages, setSelectedImages } = useImagePicker();
  
  const [formData, setFormData] = useState({
    name: farm?.name || '',
    location: farm?.location || '',
    region: farm?.region || '',
    description: farm?.description || '',
    specialty: farm?.specialty || '',
    established: farm?.established?.toString() || new Date().getFullYear().toString(),
    size: farm?.size?.toString() || '',
    family_members: farm?.family_members?.toString() || farm?.familyMembers?.toString() || '',
    delivery: farm?.delivery || false,
    pickup: farm?.pickup || false,
    farm_shop: farm?.farm_shop || farm?.farmShop || false,
    certifications: farm?.certifications || [],
    sustainable_practices: farm?.sustainable_practices || farm?.sustainablePractices || [],
    story: farm?.story || '',
    contact: {
      phone: farm?.contact?.phone || '',
      email: farm?.contact?.email || '',
      website: farm?.contact?.website || '',
    }
  });

  const [showCertificationsModal, setShowCertificationsModal] = useState(false);
  const [showPracticesModal, setShowPracticesModal] = useState(false);

  // Initialiser les images si on est en mode édition
  React.useEffect(() => {
    if (mode === 'edit' && farm) {
      const images = [];
      if (farm.main_image) images.push({ uri: farm.main_image });
      if (farm.cover_image) images.push({ uri: farm.cover_image });
      setSelectedImages(images);
    }
  }, [farm, mode]);

  const availableCertifications = [
    'Bio', 'HVE', 'Nature & Progrès', 'Label Rouge', 'AOC', 'AOP', 'Filière Qualité', 'GAP'
  ];

  const availablePractices = [
    'Rotation des cultures', 'Compostage', 'Énergie solaire', 'Pâturage extensif',
    'Traite à la main', 'Fromages affinés', 'Pâturage ovin', 'Hôtels à insectes',
    'Gestion de l\'eau', 'Agriculture de conservation', 'Couverts végétaux',
    'Réduction des intrants', 'Vendanges manuelles', 'Élevage en fûts', 'Biodynamie'
  ];


  const handleImageSelection = (image) => {
    setSelectedImages([image]);
  };

  const toggleCertification = (certification) => {
    const updatedCertifications = formData.certifications.includes(certification)
      ? formData.certifications.filter(c => c !== certification)
      : [...formData.certifications, certification];
    
    setFormData({ ...formData, certifications: updatedCertifications });
  };

  const togglePractice = (practice) => {
    const updatedPractices = formData.sustainable_practices.includes(practice)
      ? formData.sustainable_practices.filter(p => p !== practice)
      : [...formData.sustainable_practices, practice];
    
    setFormData({ ...formData, sustainable_practices: updatedPractices });
  };

  const toggleBooleanField = (field) => {
    setFormData({ ...formData, [field]: !formData[field] });
  };

  const handleSave = async () => {
    try {
      // Validation basique
      if (!formData.name.trim()) {
        Alert.alert('Erreur', 'Le nom de la ferme est obligatoire');
        return;
      }

      // Préparer les données avec conversion des types
      const farmData = {
        name: formData.name,
        location: formData.location,
        region: formData.region,
        description: formData.description,
        specialty: formData.specialty,
        established: formData.established ? new Date(formData.established).toISOString() : null,
        size: formData.size ? parseInt(formData.size) : null,
        family_members: formData.family_members ? parseInt(formData.family_members) : null,
        story: formData.story,
        delivery: formData.delivery,
        pickup: formData.pickup,
        farm_shop: formData.farm_shop,
        certifications: formData.certifications,
        sustainable_practices: formData.sustainable_practices,
        contact: formData.contact,
        images: selectedImages.map(img => img.uri) // Ce champ sera traité par le slice
      };

      if (mode === 'edit') {
        await dispatch(updateFarm({ id: farm.id, farmData })).unwrap();
        Alert.alert('Succès', 'Ferme mise à jour avec succès');
      } else {
        await dispatch(addFarm(farmData)).unwrap();
        Alert.alert('Succès', 'Ferme créée avec succès');
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    }
  };

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
        <Text style={styles.headerTitle}>
          {mode === 'add' ? 'Ajouter une Ferme' : 'Modifier la Ferme'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <Container style={styles.formSection}>
          {/* Section Images */}
          <Text style={styles.sectionTitle}>Images</Text>
          
          <View style={styles.imageSection}>
            <View style={styles.imagePreview}>
              {selectedImages.length > 0 ? (
                <Image
                  source={{ uri: selectedImages[0].uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={48} color="#E0E0E0" />
                  <Text style={styles.imagePlaceholderText}>Ajouter une image</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => showImagePickerOptions(handleImageSelection)}
            >
              <Ionicons name="camera" size={20} color="#4CAF50" />
              <Text style={styles.imageButtonText}>
                {selectedImages.length > 0 ? 'Changer l\'image' : 'Ajouter une image'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Informations principales */}
          <Text style={styles.sectionTitle}>Informations Principales</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom de la ferme *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Entrez le nom de la ferme"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Localisation *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="Ville, région"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Région</Text>
            <TextInput
              style={styles.input}
              value={formData.region}
              onChangeText={(text) => setFormData({ ...formData, region: text })}
              placeholder="Région administrative"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Spécialité</Text>
            <TextInput
              style={styles.input}
              value={formData.specialty}
              onChangeText={(text) => setFormData({ ...formData, specialty: text })}
              placeholder="Bio, Fruits, Céréales, etc."
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Année d'établissement</Text>
              <TextInput
                style={styles.input}
                value={formData.established}
                onChangeText={(text) => setFormData({ ...formData, established: text })}
                placeholder="1985"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Taille (hectares)</Text>
              <TextInput
                style={styles.input}
                value={formData.size}
                onChangeText={(text) => setFormData({ ...formData, size: text })}
                placeholder="10"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nombre de membres de famille</Text>
            <TextInput
              style={styles.input}
              value={formData.family_members}
              onChangeText={(text) => setFormData({ ...formData, family_members: text })}
              placeholder="5"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

         

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Description de la ferme"
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Histoire</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.story}
              onChangeText={(text) => setFormData({ ...formData, story: text })}
              placeholder="L'histoire de la ferme"
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>

          {/* Services */}
          <Text style={styles.sectionTitle}>Services</Text>
          
          <View style={styles.servicesContainer}>
            <TouchableOpacity
              style={[styles.serviceOption, formData.delivery && styles.serviceOptionActive]}
              onPress={() => toggleBooleanField('delivery')}
            >
              <Ionicons 
                name={formData.delivery ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={formData.delivery ? "#4CAF50" : "#E0E0E0"} 
              />
              <Text style={styles.serviceText}>Livraison</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.serviceOption, formData.pickup && styles.serviceOptionActive]}
              onPress={() => toggleBooleanField('pickup')}
            >
              <Ionicons 
                name={formData.pickup ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={formData.pickup ? "#4CAF50" : "#E0E0E0"} 
              />
              <Text style={styles.serviceText}>Retrait sur place</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.serviceOption, formData.farmShop && styles.serviceOptionActive]}
              onPress={() => toggleBooleanField('farmShop')}
            >
              <Ionicons 
                name={formData.farmShop ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={formData.farmShop ? "#4CAF50" : "#E0E0E0"} 
              />
              <Text style={styles.serviceText}>Magasin à la ferme</Text>
            </TouchableOpacity>
          </View>

          {/* Contact */}
          <Text style={styles.sectionTitle}>Contact</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={formData.contact.phone}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                contact: { ...formData.contact, phone: text }
              })}
              placeholder="Numéro de téléphone"
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={formData.contact.email}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                contact: { ...formData.contact, email: text }
              })}
              placeholder="Adresse email"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Site web</Text>
            <TextInput
              style={styles.input}
              value={formData.contact.website}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                contact: { ...formData.contact, website: text }
              })}
              placeholder="Site web (optionnel)"
              placeholderTextColor="#999"
            />
          </View>
        </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer avec boutons */}
      <View style={styles.footer}>
        <Button
          title="Annuler"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title={mode === 'add' ? 'Ajouter' : 'Modifier'}
          onPress={handleSave}
          variant="primary"
          style={styles.saveButton}
          loading={uploading || loading}
        />
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
  keyboardAvoidingView: {
    flex: 1,
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 16,
    marginTop: 8,
  },
  // Image section
  imageSection: {
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#777E5C',
    marginTop: 8,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  imageButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  // Form styles
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#283106',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#283106',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Services
  servicesContainer: {
    marginBottom: 16,
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  serviceOptionActive: {
    backgroundColor: '#E8F5E8',
  },
  serviceText: {
    fontSize: 16,
    color: '#283106',
    fontWeight: '500',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});