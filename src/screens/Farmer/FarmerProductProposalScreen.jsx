import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui';
import { categoryService } from '../../backend/services/categoryService';
import { storageService } from '../../backend/services/storageService';
import { useImagePicker } from '../../hooks/useImagePicker';
import {
  saveFarmerProposal,
  selectFarmerSavingProposal,
} from '../../store/farmer/farmerSlice';

export default function FarmerProductProposalScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const saving = useSelector(selectFarmerSavingProposal);
  const existing = route.params?.product;

  const isPublished = existing?.review_status === 'published';
  const isImagePending = existing?.images_review_status === 'pending';

  const { showImagePickerOptions, selectedImages, setSelectedImages } = useImagePicker();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: existing?.name || '',
    description: existing?.description || '',
    shortDescription: existing?.short_description || '',
    proposedPrice: existing?.proposed_price?.toString() || existing?.price?.toString() || '',
    currency: existing?.currency || 'CDF',
    unit: existing?.unit || 'kg',
    categoryId: existing?.category_id || null,
    stock: existing?.stock?.toString() || '0',
  });

  const initialImageUris = useMemo(() => {
    if (existing?.images?.length) return existing.images;
    return [];
  }, [existing?.id]);

  useEffect(() => {
    categoryService.getCategoriesByType('product').then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (initialImageUris.length) {
      setSelectedImages(initialImageUris.map((uri) => ({ uri })));
    }
  }, [initialImageUris, setSelectedImages]);

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (asDraft = false) => {
    if (!form.name.trim()) {
      Alert.alert('Erreur', 'Le nom du produit est requis.');
      return;
    }
    if (!asDraft && (!form.proposedPrice || Number(form.proposedPrice) <= 0)) {
      Alert.alert('Erreur', 'Indiquez un prix valide.');
      return;
    }

    setUploading(true);
    try {
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

      const result = await dispatch(
        saveFarmerProposal({
          productId: existing?.id,
          name: form.name.trim(),
          description: form.description.trim(),
          shortDescription: form.shortDescription.trim(),
          proposedPrice: Number(form.proposedPrice),
          currency: form.currency,
          unit: form.unit.trim() || 'kg',
          categoryId: form.categoryId,
          stock: Number(form.stock) || 0,
          images: imageUrls,
          submit: !asDraft,
        })
      ).unwrap();

      const needsAdminReview = result?.needsAdminReview;
      if (asDraft) {
        Alert.alert('Enregistré', 'Brouillon sauvegardé.');
      } else if (needsAdminReview) {
        Alert.alert(
          'Envoyé à Dream Field',
          isPublished
            ? 'Vos informations ont été mises à jour. Les nouvelles photos seront visibles après validation.'
            : 'Votre proposition est en cours de validation.'
        );
      } else {
        Alert.alert(
          'Enregistré',
          isPublished ? 'Vos modifications ont été appliquées.' : 'Votre produit est en ligne.'
        );
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', error || 'Impossible d’enregistrer.');
    } finally {
      setUploading(false);
    }
  };

  const busy = saving || uploading;
  const screenTitle = existing
    ? isPublished
      ? 'Modifier mon produit'
      : 'Modifier la proposition'
    : 'Nouvelle proposition';

  return (
    <ScreenWrapper style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#283106" />
          </TouchableOpacity>
          <Text style={styles.title}>{screenTitle}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.hint}>
            {isPublished
              ? 'Nom, description, prix et stock sont appliqués immédiatement. Seul un changement de photos nécessite une validation Dream Field.'
              : 'Sans photo, le produit est publié directement. Avec photos, Dream Field valide avant mise en ligne.'}
          </Text>

          {isImagePending ? (
            <View style={styles.pendingBanner}>
              <Ionicons name="hourglass-outline" size={18} color="#E65100" />
              <Text style={styles.pendingBannerText}>
                Des photos sont déjà en attente de validation. Les infos texte seront mises à jour tout de suite.
              </Text>
            </View>
          ) : null}

          <Text style={styles.label}>Nom du produit *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(v) => updateField('name', v)}
            placeholder="Ex. Tomates bio"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.description}
            onChangeText={(v) => updateField('description', v)}
            placeholder="Décrivez votre produit..."
            multiline
          />

          <Text style={styles.label}>Prix *</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={form.proposedPrice}
              onChangeText={(v) => updateField('proposedPrice', v)}
              keyboardType="numeric"
              placeholder="5000"
            />
            <TouchableOpacity
              style={styles.currencyBtn}
              onPress={() => updateField('currency', form.currency === 'CDF' ? 'USD' : 'CDF')}
            >
              <Text style={styles.currencyText}>{form.currency}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Unité</Text>
          <TextInput
            style={styles.input}
            value={form.unit}
            onChangeText={(v) => updateField('unit', v)}
            placeholder="kg, botte, pièce..."
          />

          {!isPublished ? (
            <>
              <Text style={styles.label}>Stock initial</Text>
              <TextInput
                style={styles.input}
                value={form.stock}
                onChangeText={(v) => updateField('stock', v)}
                keyboardType="numeric"
              />
            </>
          ) : null}

          <Text style={styles.label}>Catégorie</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setShowCategories((v) => !v)}>
            <Text style={styles.selectorText}>
              {selectedCategory ? `${selectedCategory.emoji || ''} ${selectedCategory.name}` : 'Choisir une catégorie'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#6B7280" />
          </TouchableOpacity>

          {showCategories ? (
            <View style={styles.categoryList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => {
                    updateField('categoryId', cat.id);
                    setShowCategories(false);
                  }}
                >
                  <Text style={styles.categoryItemText}>{cat.emoji || '🏷️'} {cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <Text style={styles.label}>Photos {isPublished ? '(validation si modifiées)' : '(validation requise)'}</Text>
          <View style={styles.imagesRow}>
            {selectedImages.map((img, index) => (
              <View key={`${img.uri}-${index}`} style={styles.imageWrap}>
                <Image source={{ uri: img.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {selectedImages.length < 3 ? (
              <TouchableOpacity style={styles.addImage} onPress={() => showImagePickerOptions(handleImageSelection)}>
                <Ionicons name="camera-outline" size={22} color="#2E7D32" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, busy && styles.saveBtnDisabled]}
            onPress={() => handleSave(false)}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isPublished ? 'Enregistrer les modifications' : 'Soumettre'}
              </Text>
            )}
          </TouchableOpacity>

          {!isPublished ? (
            <TouchableOpacity
              style={[styles.draftBtn, busy && styles.saveBtnDisabled]}
              onPress={() => handleSave(true)}
              disabled={busy}
            >
              <Text style={styles.draftBtnText}>Enregistrer en brouillon</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );

  function handleImageSelection(image) {
    if (selectedImages.length < 3) {
      setSelectedImages([...selectedImages, image]);
    }
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F3' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 8,
  },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: '800', color: '#283106', flex: 1 },
  form: { padding: 20, paddingBottom: 40 },
  hint: { fontSize: 13, color: '#6B7280', marginBottom: 12, lineHeight: 18 },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  pendingBannerText: { flex: 1, fontSize: 12, color: '#E65100', lineHeight: 17, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  currencyBtn: {
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  currencyText: { fontWeight: '800', color: '#2E7D32' },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectorText: { fontSize: 15, color: '#111827' },
  categoryList: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  categoryItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  categoryItemText: { fontSize: 14, color: '#111827' },
  imagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  imageWrap: { position: 'relative' },
  image: { width: 72, height: 72, borderRadius: 12 },
  removeImage: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#C62828',
    borderRadius: 999,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F8F1',
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: '#2E7D32',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  draftBtn: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    backgroundColor: '#F1F8F1',
  },
  draftBtnText: { color: '#2E7D32', fontWeight: '700', fontSize: 14 },
});
