import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button , ScreenWrapper } from '../../../components/ui';
import { addService, updateService, selectAdminServicesLoading, selectAdminCategories, fetchCategories } from '../../../store/admin/servicesSlice';
import { useImagePicker } from '../../../hooks/useImagePicker';

export default function ServiceForm({ route, navigation }) {
  const { mode = 'add', service } = route.params || {};
  const dispatch = useDispatch();
  const loading = useSelector(selectAdminServicesLoading);
  const categories = useSelector(selectAdminCategories);
  const { showImagePickerOptions, selectedImages, setSelectedImages } = useImagePicker();
  
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    short_description: service?.short_description || '',
    price: service?.price || '',
    price_details: service?.price_details || '',
    category_id: service?.category_id || '',
    coverage: service?.coverage || '',
    min_order: service?.min_order?.toString() || '',
    delivery_time: service?.delivery_time || '',
    contact: {
      phone: service?.contact?.phone || '',
      email: service?.contact?.email || ''
    },
    features: service?.features?.join('\n') || '',
    is_active: service?.is_active ?? true,
  });

  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Charger les catégories au montage
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Initialiser les images en mode édition
  useEffect(() => {
    if (mode === 'edit' && service?.image) {
      setSelectedImages([{ uri: service.image }]);
    }
  }, [service, mode]);

  const handleSave = () => {
    // Validation
    if (!formData.name || !formData.description || !formData.category_id) {
      Alert.alert('Erreur', 'Veuillez remplir le nom, la description et la catégorie');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter une image pour le service');
      return;
    }

    const serviceData = {
      ...formData,
      image: selectedImages[0]?.uri || null,
      min_order: formData.min_order ? parseInt(formData.min_order) : null,
      features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
      icon: '🔧', // Icône par défaut
    };

    if (mode === 'add') {
      dispatch(addService(serviceData));
      Alert.alert('Succès', 'Service ajouté avec succès');
    } else {
      dispatch(updateService({ id: service.id, serviceData }));
      Alert.alert('Succès', 'Service modifié avec succès');
    }
    
    navigation.goBack();
  };

  const handleImageSelection = (image) => {
    setSelectedImages([image]);
  };

  const selectCategory = (category) => {
    setFormData({ ...formData, category_id: category.id });
    setShowCategorySelector(false);
  };

  const toggleBooleanField = (field) => {
    setFormData({ ...formData, [field]: !formData[field] });
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
          {mode === 'add' ? 'Nouveau Service' : 'Modifier le Service'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Container style={styles.formSection}>
            {/* Section Image */}
            <Text style={styles.sectionTitle}>Image du Service</Text>
            
            <View style={styles.imageSection}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => showImagePickerOptions(handleImageSelection)}
              >
                {selectedImages.length > 0 ? (
                  <View style={styles.imagePreview}>
                    <Text style={styles.imagePreviewText}>Image sélectionnée</Text>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={48} color="#E0E0E0" />
                    <Text style={styles.imagePlaceholderText}>Ajouter une image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Informations principales */}
            <Text style={styles.sectionTitle}>Informations Principales</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom du service *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Livraison à domicile"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description courte *</Text>
              <TextInput
                style={styles.input}
                value={formData.short_description}
                onChangeText={(text) => setFormData({ ...formData, short_description: text })}
                placeholder="Description en quelques mots"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description complète *</Text>
              <TextInput
                style={styles.textArea}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Description détaillée du service"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Catégorie *</Text>
                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={() => setShowCategorySelector(true)}
                >
                  <Text style={styles.categorySelectorText}>
                    {formData.category_id 
                      ? categories.find(cat => cat.id === formData.category_id)?.name || 'Sélectionner une catégorie'
                      : 'Sélectionner une catégorie'
                    }
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#777E5C" />
                </TouchableOpacity>
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Prix</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  placeholder="À partir de 50€"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Détails du prix</Text>
              <TextInput
                style={styles.input}
                value={formData.price_details}
                onChangeText={(text) => setFormData({ ...formData, price_details: text })}
                placeholder="50€/heure de consultation"
                placeholderTextColor="#999"
              />
            </View>

            {/* Informations de livraison */}
            <Text style={styles.sectionTitle}>Informations de Livraison</Text>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Délai de livraison</Text>
                <TextInput
                  style={styles.input}
                  value={formData.delivery_time}
                  onChangeText={(text) => setFormData({ ...formData, delivery_time: text })}
                  placeholder="24-48h"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Commande minimum</Text>
                <TextInput
                  style={styles.input}
                  value={formData.min_order}
                  onChangeText={(text) => setFormData({ ...formData, min_order: text })}
                  placeholder="1"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Zone de couverture</Text>
              <TextInput
                style={styles.input}
                value={formData.coverage}
                onChangeText={(text) => setFormData({ ...formData, coverage: text })}
                placeholder="Pays de la Loire et Bretagne"
                placeholderTextColor="#999"
              />
            </View>

            {/* Contact */}
            <Text style={styles.sectionTitle}>Informations de Contact</Text>
            
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contact.phone}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    contact: { ...formData.contact, phone: text }
                  })}
                  placeholder="02 40 12 34 56"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contact.email}
                  onChangeText={(text) => setFormData({ 
                    ...formData, 
                    contact: { ...formData.contact, email: text }
                  })}
                  placeholder="service@dreammarket.fr"
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Fonctionnalités */}
            <Text style={styles.sectionTitle}>Fonctionnalités</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Fonctionnalités (une par ligne)</Text>
              <TextInput
                style={styles.textArea}
                value={formData.features}
                onChangeText={(text) => setFormData({ ...formData, features: text })}
                placeholder="Livraison sous 24-48h&#10;Suivi en temps réel&#10;Emballages écologiques"
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Options */}
            <Text style={styles.sectionTitle}>Options</Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => toggleBooleanField('is_active')}
              >
                <View style={styles.optionInfo}>
                  <Text style={styles.optionLabel}>Service actif</Text>
                  <Text style={styles.optionDescription}>Le service est disponible pour les clients</Text>
                </View>
                <View style={[
                  styles.toggle,
                  formData.is_active && styles.toggleActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    formData.is_active && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
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
          title={mode === 'add' ? 'Créer le service' : 'Modifier le service'}
          onPress={handleSave}
          loading={loading}
        />
      </View>

      {/* Modal sélection catégorie */}
      {showCategorySelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
              <TouchableOpacity
                onPress={() => setShowCategorySelector(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#283106" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoryList}>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => selectCategory(category)}
                  >
                    <View style={styles.categoryItem}>
                      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      <Text style={styles.categoryOptionText}>{category.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Chargement des catégories...</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
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
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
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
  imageButton: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    alignItems: 'center',
  },
  imagePreviewText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#777E5C',
    marginTop: 8,
  },
  // Form styles
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#283106',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#283106',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#283106',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#283106',
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  // Options
  optionsContainer: {
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#283106',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#777E5C',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    minWidth: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
  },
  modalCloseButton: {
    padding: 4,
  },
  categoryList: {
    maxHeight: 300,
  },
  categoryOption: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#283106',
    fontWeight: '500',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
    fontStyle: 'italic',
  },
});