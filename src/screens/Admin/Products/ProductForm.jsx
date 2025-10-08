import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Alert, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button , ScreenWrapper } from '../../../components/ui';
import { addProduct, updateProduct, selectAdminProductsLoading, selectAdminProducts, selectAdminCategories, fetchCategories } from '../../../store/admin/productSlice';
import { selectAllFarms, fetchFarms } from '../../../store/admin/farmSlice';
import { useImagePicker } from '../../../hooks/useImagePicker';
import { storageService } from '../../../backend/services/storageService';

export default function ProductForm({ route, navigation }) {
  const { mode = 'add', product, farmId } = route.params || {};
  const dispatch = useDispatch();
  const loading = useSelector(selectAdminProductsLoading);
  const farms = useSelector(selectAllFarms);
  const categories = useSelector(selectAdminCategories);
  const { showImagePickerOptions, selectedImages, setSelectedImages } = useImagePicker();
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: product?.price?.toString() || '',
    old_price: product?.old_price?.toString() || '',
    currency: product?.currency || 'CDF',
    unit: product?.unit || 'kg',
    category_id: product?.category_id || '',
    farm_id: farmId || product?.farm_id || '',
    stock: product?.stock?.toString() || '0',
    is_organic: product?.is_organic || false,
    is_new: product?.is_new || false,
    is_popular: product?.is_popular || false,
    discount: product?.discount?.toString() || '0',
    tags: product?.tags?.join(', ') || '',
  });

  const [showFarmSelector, setShowFarmSelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Charger les fermes et catégories
  React.useEffect(() => {
    dispatch(fetchFarms());
    dispatch(fetchCategories());
  }, [dispatch]);

  

  // Initialiser les images si on est en mode édition
  React.useEffect(() => {
    if (mode === 'edit' && product?.images) {
      const images = product.images.map(uri => ({ uri }));
      setSelectedImages(images);
    }
  }, [product, mode]);

  const units = ['kg', 'g', 'L', 'ml', 'pièce', 'sachet', 'boîte', 'bouteille'];

  const handleSave = async () => {
    
    
    // Validation
    if (!formData.name || !formData.price || !formData.category_id) {
      Alert.alert('Erreur', 'Veuillez remplir le nom, le prix et la catégorie');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins une image');
      return;
    }

 
    setIsUploading(true);

    try {
      // 📤 Upload des images vers Supabase
      const imageUrls = [];
      
      
      for (const image of selectedImages) {
        
        
        // Si l'image commence par "file://", c'est une nouvelle image à uploader
        if (image.uri.startsWith('file://')) {
          
          const uploadResult = await storageService.uploadImage(
            image.uri,
            'products',  // Type de bucket
            ''           // Pas de dossier spécifique (sera généré avec ID unique)
          );
          
          imageUrls.push(uploadResult.url);
        } else {
          // Image déjà sur Supabase (mode édition)
          
          imageUrls.push(image.uri);
        }
      }

      
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        stock: parseInt(formData.stock) || 0,
        discount: parseInt(formData.discount) || 0,
        category_id: formData.category_id,
        farm_id: formData.farm_id,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        images: imageUrls,  // ✅ URLs Supabase
        is_active: true,
        rating: product?.rating || 0,
        review_count: product?.review_count || 0,
      };

      console.log('💾 [ProductForm] Données produit préparées:', JSON.stringify(productData, null, 2));

      if (mode === 'add') {
       
        const result = await dispatch(addProduct(productData)).unwrap();
        
        Alert.alert('Succès', 'Produit ajouté avec succès');
      } else {
        
        const result = await dispatch(updateProduct({ id: product.id, productData })).unwrap();
        
        Alert.alert('Succès', 'Produit modifié avec succès');
      }
      
      
      navigation.goBack();
    } catch (error) {
      c
      Alert.alert('Erreur', `Impossible de sauvegarder le produit`);
    } finally {
      
      setIsUploading(false);
    }
  };

  const handleImageSelection = (image) => {
    if (selectedImages.length < 4) {
      setSelectedImages([...selectedImages, image]);
    } else {
      Alert.alert('Limite atteinte', 'Vous ne pouvez ajouter que 4 images maximum');
    }
  };

  const handleMultipleImageSelection = (images) => {
    const totalImages = selectedImages.length + images.length;
    if (totalImages <= 4) {
      setSelectedImages([...selectedImages, ...images]);
    } else {
      Alert.alert('Limite atteinte', 'Vous ne pouvez ajouter que 4 images maximum');
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
  };

  const toggleBooleanField = (field) => {
    setFormData({ ...formData, [field]: !formData[field] });
  };

  const selectFarm = (farm) => {
    setFormData({ ...formData, farm_id: farm.id });
    setShowFarmSelector(false);
  };

  const selectCategory = (category) => {
    setFormData({ ...formData, category_id: category.id });
    setShowCategorySelector(false);
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
          {mode === 'add' ? 'Ajouter un Produit' : 'Modifier le Produit'}
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
          <Text style={styles.sectionTitle}>Images ({selectedImages.length}/4)</Text>
          
          <View style={styles.imageSection}>
            {selectedImages.length > 0 ? (
              <View style={styles.imagesGrid}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imageItem}>
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.imagePreview}>
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={48} color="#E0E0E0" />
                  <Text style={styles.imagePlaceholderText}>Ajouter des images</Text>
                </View>
              </View>
            )}
            
            {selectedImages.length < 4 && (
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => showImagePickerOptions(handleImageSelection)}
              >
                <Ionicons name="camera" size={20} color="#4CAF50" />
                <Text style={styles.imageButtonText}>
                  Ajouter une image ({selectedImages.length}/4)
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Informations principales */}
          <Text style={styles.sectionTitle}>Informations Principales</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom du produit *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Entrez le nom du produit"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Description complète du produit"
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description courte</Text>
            <TextInput
              style={styles.input}
              value={formData.short_description}
              onChangeText={(text) => setFormData({ ...formData, short_description: text })}
              placeholder="Description courte (max 100 caractères)"
              maxLength={100}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Prix *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Ancien prix</Text>
              <TextInput
                style={styles.input}
                value={formData.old_price}
                onChangeText={(text) => setFormData({ ...formData, old_price: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Devise *</Text>
              <View style={styles.currencySelector}>
                <TouchableOpacity
                  style={[styles.currencyOption, formData.currency === 'CDF' && styles.currencyOptionActive]}
                  onPress={() => setFormData({ ...formData, currency: 'CDF' })}
                >
                  <Text style={styles.currencyText}>FC</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.currencyOption, formData.currency === 'USD' && styles.currencyOptionActive]}
                  onPress={() => setFormData({ ...formData, currency: 'USD' })}
                >
                  <Text style={styles.currencyText}>$</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Unité</Text>
              <View style={styles.unitSelector}>
                <TextInput
                  style={styles.input}
                  value={formData.unit}
                  onChangeText={(text) => setFormData({ ...formData, unit: text })}
                  placeholder="kg, L, pièce..."
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Catégorie *</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => {
                  if (categories.length === 0) {
                    Alert.alert('Chargement', 'Les catégories sont en cours de chargement...');
                    return;
                  }
                  setShowCategorySelector(true);
                }}
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
              <Text style={styles.label}>Stock</Text>
              <TextInput
                style={styles.input}
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Remise (%)</Text>
            <TextInput
              style={styles.input}
              value={formData.discount}
              onChangeText={(text) => setFormData({ ...formData, discount: text })}
              placeholder="0"
              keyboardType="numeric"
              maxLength={3}
              placeholderTextColor="#999"
            />
          </View>

          {/* Sélection de ferme - seulement si pas de farmId */}
          {!farmId && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ferme *</Text>
              <TouchableOpacity
                style={styles.farmSelector}
                onPress={() => setShowFarmSelector(true)}
              >
                <Text style={styles.farmSelectorText}>
                  {formData.farm_id 
                    ? farms.find(f => f.id === formData.farm_id)?.name || 'Sélectionner une ferme'
                    : 'Sélectionner une ferme'
                  }
                </Text>
                <Ionicons name="chevron-down" size={20} color="#777E5C" />
              </TouchableOpacity>
            </View>
          )}

          {/* Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Étiquettes</Text>
            <TextInput
              style={styles.input}
              value={formData.tags}
              onChangeText={(text) => setFormData({ ...formData, tags: text })}
              placeholder="Bio, Premium, Local (séparés par des virgules)"
              placeholderTextColor="#999"
            />
          </View>

          {/* Options */}
          <Text style={styles.sectionTitle}>Options</Text>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionItem, formData.is_organic && styles.optionItemActive]}
              onPress={() => toggleBooleanField('is_organic')}
            >
              <Ionicons 
                name={formData.is_organic ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={formData.is_organic ? "#4CAF50" : "#E0E0E0"} 
              />
              <Text style={styles.optionText}>Produit biologique</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, formData.is_new && styles.optionItemActive]}
              onPress={() => toggleBooleanField('is_new')}
            >
              <Ionicons 
                name={formData.is_new ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={formData.is_new ? "#4CAF50" : "#E0E0E0"} 
              />
              <Text style={styles.optionText}>Nouveau produit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, formData.is_popular && styles.optionItemActive]}
              onPress={() => toggleBooleanField('is_popular')}
            >
              <Ionicons 
                name={formData.is_popular ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={formData.is_popular ? "#4CAF50" : "#E0E0E0"} 
              />
              <Text style={styles.optionText}>Produit populaire</Text>
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
          disabled={isUploading}
        />
        <Button
          title={mode === 'add' ? 'Ajouter' : 'Modifier'}
          onPress={handleSave}
          variant="primary"
          style={styles.saveButton}
          loading={loading || isUploading}
        />
      </View>

      {/* Modal de chargement */}
      {isUploading && (
        <View style={styles.uploadModalOverlay}>
          <View style={styles.uploadModalContent}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.uploadModalText}>Enregistrement...</Text>
          </View>
        </View>
      )}

      {/* Modal de sélection de ferme */}
      {showFarmSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une ferme</Text>
              <TouchableOpacity
                onPress={() => setShowFarmSelector(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#283106" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.farmList}>
              {farms.map((farm) => (
                <TouchableOpacity
                  key={farm.id}
                  style={styles.farmItem}
                  onPress={() => selectFarm(farm)}
                >
                  <Text style={styles.farmItemName}>{farm.name}</Text>
                  <Text style={styles.farmItemLocation}>{farm.location}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

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
            <ScrollView style={styles.farmList}>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.farmItem}
                    onPress={() => selectCategory(category)}
                  >
                    <View style={styles.categoryItem}>
                      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      <Text style={styles.farmItemName}>{category.name}</Text>
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

      {/* Modal de sélection de ferme */}
      {showFarmSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une ferme</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFarmSelector(false)}
              >
                <Ionicons name="close" size={24} color="#283106" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.farmList}>
              {farms.map((farm) => (
                <TouchableOpacity
                  key={farm.id}
                  style={styles.farmItem}
                  onPress={() => {
                    setFormData({ ...formData, farm_id: farm.id });
                    setShowFarmSelector(false);
                  }}
                >
                  <Text style={styles.farmItemName}>{farm.name}</Text>
                  <Text style={styles.farmItemLocation}>{farm.location}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Modal de sélection de catégorie */}
      {showCategorySelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategorySelector(false)}
              >
                <Ionicons name="close" size={24} color="#283106" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.farmList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.farmItem}
                  onPress={() => {
                    setFormData({ ...formData, category_id: category.id });
                    setShowCategorySelector(false);
                  }}
                >
                  <View style={styles.categoryItem}>
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text style={styles.farmItemName}>{category.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
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
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  imageItem: {
    position: 'relative',
    width: '48%',
    aspectRatio: 1,
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
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
  // Currency selector
  currencySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyOption: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencyOptionActive: {
    backgroundColor: '#4CAF50',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
  },
  // Farm selector
  farmSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  farmSelectorText: {
    fontSize: 16,
    color: '#283106',
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  optionItemActive: {
    backgroundColor: '#E8F5E8',
  },
  optionText: {
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
  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
  },
  modalCloseButton: {
    padding: 4,
  },
  farmList: {
    maxHeight: 300,
  },
  farmItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  farmItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  farmItemLocation: {
    fontSize: 14,
    color: '#777E5C',
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
  uploadModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  uploadModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 250,
  },
  uploadModalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#283106',
    marginTop: 12,
    textAlign: 'center',
  },
});