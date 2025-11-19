import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SafeAreaWrapper from '../../../components/SafeAreaWrapper';


import {
  addProduct,
  updateProduct,
  selectAdminProductsLoading,
  fetchCategories,
  selectAdminCategories,
} from '../../../store/admin/productSlice';
import { selectAllFarms, fetchFarms } from '../../../store/admin/farmSlice';
import { useImagePicker } from '../../../hooks/useImagePicker';
import { storageService } from '../../../backend/services/storageService';

/* ===== Palette conservée ===== */
const COLORS = {
  bg: '#f5f5f5',
  ink: '#283106',
  muted: '#777E5C',
  accent: '#4CAF50',
  border: '#E0E0E0',
  card: '#FFFFFF',
};

export default function ProductForm({ route, navigation }) {
  const { mode = 'add', product, farmId } = route.params || {};
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const loading = useSelector(selectAdminProductsLoading);
  const farms = useSelector(selectAllFarms) || [];
  const categories = useSelector(selectAdminCategories) || [];

  const { showImagePickerOptions, selectedImages, setSelectedImages } = useImagePicker();

  const [formData, setFormData] = React.useState({
    name: product?.name || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: product?.price?.toString() || '',
    old_price: product?.old_price?.toString() || '',
    currency: product?.currency || 'CDF',
    unit: product?.unit || 'kg',
    category_id: product?.category_id || null,
    farm_id: farmId || product?.farm_id || null,
    stock: product?.stock?.toString() || '0',
    is_organic: product?.is_organic || false,
    is_new: product?.is_new || false,
    is_popular: product?.is_popular || false,
    discount: product?.discount?.toString() || '0',
    tags: product?.tags?.join(', ') || '',
  });

  const [showFarmSelector, setShowFarmSelector] = React.useState(false);
  const [showCategorySelector, setShowCategorySelector] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchFarms());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Précharger les images en édition
  React.useEffect(() => {
    if (mode === 'edit' && product?.images) {
      setSelectedImages(product.images.map((uri) => ({ uri })));
    }
  }, [mode, product, setSelectedImages]);

  const handleImageSelection = (image) => {
    if (selectedImages.length < 4) {
      setSelectedImages([...selectedImages, image]);
    } else {
      Alert.alert('Limite atteinte', 'Vous ne pouvez ajouter que 4 images maximum');
    }
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const toggleBooleanField = (field) => {
    setFormData((p) => ({ ...p, [field]: !p[field] }));
  };

  const selectFarm = (farm) => {
    setFormData((p) => ({ ...p, farm_id: farm.id }));
    setShowFarmSelector(false);
  };

  const selectCategory = (category) => {
    setFormData((p) => ({ ...p, category_id: category.id }));
    setShowCategorySelector(false);
  };

  const handleSave = async () => {
    // Validations basiques
    if (!formData.name || !formData.price) {
      Alert.alert('Erreur', 'Veuillez remplir le nom et le prix');
      return;
    }
    
    // Vérifier que category_id est valide (pas null, undefined ou chaîne vide)
    if (!formData.category_id || formData.category_id === '') {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }
    
    if (selectedImages.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins une image');
      return;
    }

    setIsUploading(true);
    try {
      // Upload des images (4 max)
      const imageUrls = [];
      for (const image of selectedImages) {
        const uri = image?.uri || '';
        if (!uri) continue;
        if (uri.startsWith('file://')) {
          const res = await storageService.uploadImage(uri, 'products', '');
          imageUrls.push(res.url);
        } else {
          imageUrls.push(uri);
        }
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        stock: parseInt(formData.stock, 10) || 0,
        discount: parseInt(formData.discount, 10) || 0,
        // Convertir les chaînes vides en null pour les UUID (Supabase n'accepte pas les chaînes vides)
        category_id: (formData.category_id && formData.category_id !== '') ? formData.category_id : null,
        farm_id: (formData.farm_id && formData.farm_id !== '') ? formData.farm_id : null,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        images: imageUrls,
        is_active: product?.is_active ?? true,
        rating: product?.rating || 0,
        review_count: product?.review_count || 0,
      };

      if (mode === 'add') {
        await dispatch(addProduct(payload)).unwrap();
        Alert.alert('Succès', 'Produit ajouté avec succès');
      } else {
        await dispatch(updateProduct({ id: product.id, productData: payload })).unwrap();
        Alert.alert('Succès', 'Produit modifié avec succès');
      }

      navigation.goBack();
    } catch (err) {
      console.error('[ProductForm] Save error:', err);
      Alert.alert('Erreur', 'Impossible de sauvegarder le produit.');
    } finally {
      setIsUploading(false);
    }
  };

  /* ====== petits composants ====== */
  const PrimaryButton = React.memo(function PrimaryButton({ title, onPress, loading: load, disabled, style }) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        disabled={disabled || load}
        style={[styles.btnPrimary, (disabled || load) && styles.btnDisabled, style]}
      >
        {load ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.btnPrimaryText}>{title}</Text>}
      </TouchableOpacity>
    );
  });

  const OutlineButton = React.memo(function OutlineButton({ title, onPress, disabled, style }) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        disabled={disabled}
        style={[styles.btnOutline, disabled && styles.btnOutlineDisabled, style]}
      >
        <Text style={styles.btnOutlineText}>{title}</Text>
      </TouchableOpacity>
    );
  });

  const SectionTitle = React.memo(function SectionTitle({ children }) {
    return (
      <View style={{ marginBottom: 10 }}>
        <Text style={styles.sectionTitle}>{children}</Text>
        <View style={styles.sectionHairline} />
      </View>
    );
  });

  const FOOTER_HEIGHT = 60;

  return (
      <SafeAreaWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{mode === 'add' ? 'Ajouter un produit' : 'Modifier le produit'}</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 0 : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: FOOTER_HEIGHT + insets.bottom + 12 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* IMAGES */}
          <View style={styles.card}>
            <SectionTitle>Images ({selectedImages.length}/4)</SectionTitle>

            {selectedImages.length > 0 ? (
              <View style={styles.imagesGrid}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={styles.imageItem}>
                    <Image source={{ uri: image.uri }} style={styles.previewImage} resizeMode="cover" />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                      <Ionicons name="close-circle" size={22} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.imageDrop}>
                <Ionicons name="camera-outline" size={28} color={COLORS.muted} />
                <Text style={styles.imageDropText}>Ajouter des images</Text>
              </View>
            )}

            {selectedImages.length < 4 && (
              <TouchableOpacity style={styles.imageAddBtn} onPress={() => showImagePickerOptions(handleImageSelection)} activeOpacity={0.9}>
                <Ionicons name="camera" size={18} color={COLORS.accent} />
                <Text style={styles.imageAddText}>Ajouter une image ({selectedImages.length}/4)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* INFOS PRINCIPALES */}
          <View style={styles.card}>
            <SectionTitle>Informations principales</SectionTitle>

            <View style={styles.field}>
              <Text style={styles.label}>Nom du produit *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(t) => setFormData((p) => ({ ...p, name: t }))}
                placeholder="Entrez le nom du produit"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={formData.description}
                onChangeText={(t) => setFormData((p) => ({ ...p, description: t }))}
                placeholder="Description complète du produit"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description courte</Text>
              <TextInput
                style={styles.input}
                value={formData.short_description}
                onChangeText={(t) => setFormData((p) => ({ ...p, short_description: t }))}
                placeholder="Max 100 caractères"
                placeholderTextColor="#9CA3AF"
                maxLength={100}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Prix *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(t) => setFormData((p) => ({ ...p, price: t }))}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Ancien prix</Text>
                <TextInput
                  style={styles.input}
                  value={formData.old_price}
                  onChangeText={(t) => setFormData((p) => ({ ...p, old_price: t }))}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Devise *</Text>
                <View style={styles.currencySelector}>
                  <TouchableOpacity
                    style={[styles.currencyOption, formData.currency === 'CDF' && styles.currencyOptionActive]}
                    onPress={() => setFormData((p) => ({ ...p, currency: 'CDF' }))}
                  >
                    <Text style={[styles.currencyText, formData.currency === 'CDF' && styles.currencyTextActive]}>FC</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.currencyOption, formData.currency === 'USD' && styles.currencyOptionActive]}
                    onPress={() => setFormData((p) => ({ ...p, currency: 'USD' }))}
                  >
                    <Text style={[styles.currencyText, formData.currency === 'USD' && styles.currencyTextActive]}>$</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Unité</Text>
                <TextInput
                  style={styles.input}
                  value={formData.unit}
                  onChangeText={(t) => setFormData((p) => ({ ...p, unit: t }))}
                  placeholder="kg, L, pièce..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Catégorie *</Text>
                <TouchableOpacity
                  style={styles.select}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (categories.length === 0) {
                      Alert.alert('Chargement', 'Les catégories sont en cours de chargement…');
                      return;
                    }
                    setShowCategorySelector(true);
                  }}
                >
                  <Text style={styles.selectText}>
                    {formData.category_id
                      ? categories.find((c) => c.id === formData.category_id)?.name || 'Sélectionner une catégorie'
                      : 'Sélectionner une catégorie'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={COLORS.muted} />
                </TouchableOpacity>
              </View>

              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Stock</Text>
                <TextInput
                  style={styles.input}
                  value={formData.stock}
                  onChangeText={(t) => setFormData((p) => ({ ...p, stock: t }))}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Ferme (si pas fixé par route) */}
            {!farmId && (
              <View style={styles.field}>
                <Text style={styles.label}>Ferme *</Text>
                <TouchableOpacity style={styles.select} activeOpacity={0.85} onPress={() => setShowFarmSelector(true)}>
                  <Text style={styles.selectText}>
                    {formData.farm_id
                      ? farms.find((f) => f.id === formData.farm_id)?.name || 'Sélectionner une ferme'
                      : 'Sélectionner une ferme'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
            )}

            {/* Tags */}
            <View style={styles.field}>
              <Text style={styles.label}>Étiquettes</Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={(t) => setFormData((p) => ({ ...p, tags: t }))}
                placeholder="Bio, Premium, Local (séparés par des virgules)"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* OPTIONS */}
          <View style={styles.card}>
            <SectionTitle>Options</SectionTitle>
            <TouchableOpacity
              style={[styles.optionItem, formData.is_organic && styles.optionItemActive]}
              onPress={() => toggleBooleanField('is_organic')}
              activeOpacity={0.9}
            >
              <Ionicons
                name={formData.is_organic ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={22}
                color={formData.is_organic ? COLORS.accent : '#E0E0E0'}
              />
              <Text style={styles.optionText}>Produit biologique</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, formData.is_new && styles.optionItemActive]}
              onPress={() => toggleBooleanField('is_new')}
              activeOpacity={0.9}
            >
              <Ionicons
                name={formData.is_new ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={22}
                color={formData.is_new ? COLORS.accent : '#E0E0E0'}
              />
              <Text style={styles.optionText}>Nouveau produit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, formData.is_popular && styles.optionItemActive]}
              onPress={() => toggleBooleanField('is_popular')}
              activeOpacity={0.9}
            >
              <Ionicons
                name={formData.is_popular ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={22}
                color={formData.is_popular ? COLORS.accent : '#E0E0E0'}
              />
              <Text style={styles.optionText}>Produit populaire</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER collé en bas */}
      <View style={[styles.footer, { height: FOOTER_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
        <OutlineButton title="Annuler" onPress={() => navigation.goBack()} disabled={isUploading} style={{ flex: 1 }} />
        <PrimaryButton
          title={mode === 'add' ? 'Ajouter' : 'Enregistrer'}
          onPress={handleSave}
          loading={loading || isUploading}
          disabled={isUploading}
          style={{ flex: 1 }}
        />
      </View>

      {/* Overlay progression */}
      {isUploading ? (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={COLORS.ink} />
            <Text style={styles.overlayText}>Enregistrement…</Text>
          </View>
        </View>
      ) : null}

      {/* MODAL — Ferme */}
      {showFarmSelector ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une ferme</Text>
              <TouchableOpacity onPress={() => setShowFarmSelector(false)} style={styles.iconBtn}>
                <Ionicons name="close" size={20} color={COLORS.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 360 }}>
              {farms.map((f) => (
                <TouchableOpacity key={f.id} style={styles.optionRow} activeOpacity={0.9} onPress={() => selectFarm(f)}>
                  <Text style={styles.optionTextStrong}>{String(f.name)}</Text>
                  <Text style={styles.optionSub}>{String(f.location || '')}</Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {/* MODAL — Catégorie */}
      {showCategorySelector ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
              <TouchableOpacity onPress={() => setShowCategorySelector(false)} style={styles.iconBtn}>
                <Ionicons name="close" size={20} color={COLORS.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 360 }}>
              {categories.length > 0 ? (
                categories.map((c) => (
                  <TouchableOpacity key={c.id} style={styles.optionRow} activeOpacity={0.9} onPress={() => selectCategory(c)}>
                    <Text style={styles.optionEmoji}>{String(c.emoji || '🏷️')}</Text>
                    <Text style={styles.optionTextStrong}>{String(c.name)}</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Chargement des catégories…</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      ) : null}
    </SafeAreaWrapper>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(40,49,6,0.06)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  content: { padding: 16 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sectionTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  sectionHairline: { height: 1, backgroundColor: COLORS.border, opacity: 0.9 },

  field: { marginBottom: 12 },
  label: { color: COLORS.muted, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.ink,
  },
  textarea: { minHeight: 110, textAlignVertical: 'top' },

  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },

  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
  },
  selectText: { color: COLORS.ink, fontSize: 15 },

  /* Images */
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  imageItem: { position: 'relative', width: '48%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  removeImageButton: { position: 'absolute', top: 6, right: 6, backgroundColor: '#FFF', borderRadius: 12 },

  imageDrop: {
    height: 160,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imageDropText: { marginTop: 8, color: COLORS.muted, fontWeight: '600' },

  imageAddBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 10,
  },
  imageAddText: { color: COLORS.accent, fontWeight: '700' },

  /* Currency */
  currencySelector: { flexDirection: 'row', gap: 8 },
  currencyOption: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencyOptionActive: { backgroundColor: COLORS.accent },
  currencyText: { color: COLORS.ink, fontSize: 15, fontWeight: '700' },
  currencyTextActive: { color: '#FFFFFF' },

  /* Options */
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginBottom: 8,
  },
  optionItemActive: { backgroundColor: '#E8F5E8' },
  optionText: { color: COLORS.ink, fontWeight: '600' },

  /* Footer ABSOLU collé en bas */
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  btnPrimary: {
    backgroundColor: COLORS.ink,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  btnDisabled: { opacity: 0.6 },
  btnOutline: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  btnOutlineText: { color: COLORS.ink, fontSize: 15, fontWeight: '700' },
  btnOutlineDisabled: { opacity: 0.6 },

  /* Overlay */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 22,
    minWidth: 220,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overlayText: { marginTop: 10, color: COLORS.ink, fontWeight: '700' },

  /* Modals */
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    width: '90%',
    maxWidth: 520,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { flex: 1, color: COLORS.ink, fontWeight: '800', fontSize: 16, letterSpacing: 0.2 },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  optionEmoji: { fontSize: 18 },
  optionTextStrong: { flex: 1, color: COLORS.ink, fontWeight: '700' },
  optionSub: { color: COLORS.muted, fontSize: 12 },

  emptyState: { paddingVertical: 24, alignItems: 'center' },
  emptyStateText: { color: COLORS.muted, fontStyle: 'italic' },
});
