import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button } from '../../../components/ui';
import { addProduct, updateProduct, selectAdminProductsLoading, selectAdminProducts } from '../../../store/admin/productSlice';
import { selectAllFarms, fetchFarms } from '../../../store/admin/farmSlice';
import { useImagePicker } from '../../../hooks/useImagePicker';
import { productCategories, getCategoryById } from '../../../data/categories';

export default function ProductForm({ route, navigation }) {
  const { mode = 'add', product, farmId } = route.params || {};
  const dispatch = useDispatch();
  const loading = useSelector(selectAdminProductsLoading);
  const farms = useSelector(selectAllFarms);
  const { showImagePickerOptions, selectedImages, setSelectedImages } = useImagePicker();
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    oldPrice: product?.oldPrice?.toString() || '',
    currency: product?.currency || 'CDF',
    unit: product?.unit || 'kg',
    categoryId: product?.categoryId || '',
    farmId: farmId || product?.farmId || '',
    stock: product?.stock?.toString() || '0',
    isOrganic: product?.isOrganic || false,
    isNew: product?.isNew || false,
    isPopular: product?.isPopular || false,
    tags: product?.tags?.join(', ') || '',
  });

  const [showFarmSelector, setShowFarmSelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Charger les fermes
  React.useEffect(() => {
    dispatch(fetchFarms());
  }, [dispatch]);

  // Initialiser les images si on est en mode édition
  React.useEffect(() => {
    if (mode === 'edit' && product?.images) {
      const images = product.images.map(uri => ({ uri }));
      setSelectedImages(images);
    }
  }, [product, mode]);

  const units = ['kg', 'g', 'L', 'ml', 'pièce', 'sachet', 'boîte', 'bouteille'];

  const handleSave = () => {
    // Validation
    if (!formData.name || !formData.price || !formData.categoryId) {
      Alert.alert('Erreur', 'Veuillez remplir le nom, le prix et la catégorie');
      return;
    }

    const selectedCategory = getCategoryById(parseInt(formData.categoryId));
    const selectedFarm = farms.find(f => f.id === formData.farmId);

    const productData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
      stock: parseInt(formData.stock) || 0,
      categoryId: parseInt(formData.categoryId),
      category: selectedCategory?.name || '',
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      images: selectedImages.map(img => img.uri),
      farm: selectedFarm?.name || product?.farm || '',
      rating: product?.rating || 0,
      reviewCount: product?.reviewCount || 0,
      discount: product?.discount || null,
      isFavorite: product?.isFavorite || false,
    };

    if (mode === 'add') {
      dispatch(addProduct(productData));
      Alert.alert('Succès', 'Produit ajouté avec succès');
    } else {
      dispatch(updateProduct({ id: product.id, productData }));
      Alert.alert('Succès', 'Produit modifié avec succès');
    }
    
    navigation.goBack();
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
    setFormData({ ...formData, farmId: farm.id });
    setShowFarmSelector(false);
  };

  const selectCategory = (category) => {
    setFormData({ ...formData, categoryId: category.id });
    setShowCategorySelector(false);
  };

  return (
    <SafeAreaView style={styles.container}>
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
              placeholder="Description du produit"
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
              textAlignVertical="top"
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
                value={formData.oldPrice}
                onChangeText={(text) => setFormData({ ...formData, oldPrice: text })}
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
                onPress={() => setShowCategorySelector(true)}
              >
                <Text style={styles.categorySelectorText}>
                  {formData.categoryId 
                    ? getCategoryById(parseInt(formData.categoryId))?.name || 'Sélectionner une catégorie'
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

          {/* Sélection de ferme - seulement si pas de farmId */}
          {!farmId && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ferme *</Text>
              <TouchableOpacity
                style={styles.farmSelector}
                onPress={() => setShowFarmSelector(true)}
              >
                <Text style={styles.farmSelectorText}>
                  {formData.farmId 
                    ? farms.find(f => f.id === formData.farmId)?.name || 'Sélectionner une ferme'
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
              style={[styles.optionItem, formData.isOrganic && styles.optionItemActive]}
              onPress={() => toggleBooleanField('isOrganic')}
            >
              <Ionicons 
                name={formData.isOrganic ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={formData.isOrganic ? "#4CAF50" : "#E0E0E0"} 
              />
              <Text style={styles.optionText}>Produit biologique</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, formData.isNew && styles.optionItemActive]}
              onPress={() => toggleBooleanField('isNew')}
            >
              <Ionicons 
                name={formData.isNew ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={formData.isNew ? "#4CAF50" : "#E0E0E0"} 
              />
              <Text style={styles.optionText}>Nouveau produit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, formData.isPopular && styles.optionItemActive]}
              onPress={() => toggleBooleanField('isPopular')}
            >
              <Ionicons 
                name={formData.isPopular ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={formData.isPopular ? "#4CAF50" : "#E0E0E0"} 
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
        />
        <Button
          title={mode === 'add' ? 'Ajouter' : 'Modifier'}
          onPress={handleSave}
          variant="primary"
          style={styles.saveButton}
          loading={loading}
        />
      </View>

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
              {productCategories.filter(cat => cat.id !== 0).map((category) => (
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
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
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
});