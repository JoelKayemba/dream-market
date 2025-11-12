import React, { useState, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  addService,
  updateService,
  selectAdminServicesLoading,
  selectAdminCategories,
  fetchCategories,
} from '../../../store/admin/servicesSlice';
import SafeAreaWrapper from '../../../components/SafeAreaWrapper';

import { useImagePicker } from '../../../hooks/useImagePicker';
import { storageService } from '../../../backend/services/storageService';

export default function ServiceForm({ route, navigation }) {
  const { mode = 'add', service } = route.params || {};
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const loading = useSelector(selectAdminServicesLoading);
  const categories = useSelector(selectAdminCategories) || [];

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
      email: service?.contact?.email || '',
    },
    features: service?.features?.join('\n') || '',
    is_active: service?.is_active ?? true,
  });

  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (mode === 'edit' && service?.image) {
      setSelectedImages([{ uri: service.image }]);
    }
  }, [service, mode, setSelectedImages]);

  const handleImageSelection = (image) => setSelectedImages([image]);

  const selectCategory = (category) => {
    setFormData((p) => ({ ...p, category_id: category.id }));
    setShowCategorySelector(false);
  };

  const toggleBooleanField = (field) => setFormData((p) => ({ ...p, [field]: !p[field] }));

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.category_id) {
      Alert.alert('Erreur', 'Veuillez remplir le nom, la description et la catégorie');
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter une image pour le service');
      return;
    }

    setIsUploading(true);
    try {
      let imageUrl = selectedImages[0]?.uri;
      if (imageUrl && imageUrl.startsWith('file://')) {
        const uploadResult = await storageService.uploadImage(imageUrl, 'services', '');
        imageUrl = uploadResult.url;
      }

      const payload = {
        ...formData,
        image: imageUrl,
        min_order: formData.min_order ? parseInt(formData.min_order, 10) : null,
        features: formData.features
          ? formData.features.split('\n').map((f) => f.trim()).filter(Boolean)
          : [],
        icon: '🔧',
      };

      if (mode === 'add') {
        await dispatch(addService(payload)).unwrap();
        Alert.alert('Succès', 'Service ajouté avec succès');
      } else {
        await dispatch(updateService({ id: service.id, serviceData: payload })).unwrap();
        Alert.alert('Succès', 'Service modifié avec succès');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erreur sauvegarde service:', error);
      Alert.alert('Erreur', `Impossible de sauvegarder le service: ${error?.message || error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const PrimaryButton = memo(function PrimaryButton({ title, onPress, loading: loadingBtn, disabled, style }) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        disabled={disabled || loadingBtn}
        style={[
          styles.btnPrimary,
          (disabled || loadingBtn) && styles.btnDisabled,
          style,
        ]}
      >
        {loadingBtn ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.btnPrimaryText}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  });

  const OutlineButton = memo(function OutlineButton({ title, onPress, disabled, style }) {
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

  const SectionTitle = memo(function SectionTitle({ children }) {
    return (
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{children}</Text>
        <View style={styles.sectionHairline} />
      </View>
    );
  });

  const FOOTER_HEIGHT = 60; // hauteur visuelle (hors safe-area)

  return (
    <SafeAreaWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#283106" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {mode === 'add' ? 'Nouveau service' : 'Modifier le service'}
        </Text>

        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.content,
            // On laisse de la place pour le footer ABSOLU pour éviter l’overlap
            { paddingBottom: FOOTER_HEIGHT + insets.bottom + 12 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* IMAGE */}
          <View style={styles.card}>
            <SectionTitle>Image du service</SectionTitle>
            <TouchableOpacity
              style={styles.imageDrop}
              activeOpacity={0.85}
              onPress={() => showImagePickerOptions(handleImageSelection)}
            >
              <View style={styles.imageDropRow}>
                <View style={styles.imageIconWrap}>
                  <Ionicons name="camera-outline" size={22} color="#283106" />
                </View>
                <View style={{ flex: 1 }}>
                  {selectedImages.length > 0 ? (
                    <>
                      <Text style={styles.imageTitle}>Image sélectionnée</Text>
                      <Text style={styles.imageHint} numberOfLines={1}>
                        {String(selectedImages[0]?.uri || '—')}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.imageTitle}>Ajouter une image</Text>
                      <Text style={styles.imageHint}>JPEG/PNG – Poids raisonnable</Text>
                    </>
                  )}
                </View>
                {selectedImages.length > 0 ? (
                  <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#777E5C" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* INFOS PRINCIPALES */}
          <View style={styles.card}>
            <SectionTitle>Informations principales</SectionTitle>

            <View style={styles.field}>
              <Text style={styles.label}>Nom du service *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(t) => setFormData((p) => ({ ...p, name: t }))}
                placeholder="Livraison à domicile"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description courte *</Text>
              <TextInput
                style={styles.input}
                value={formData.short_description}
                onChangeText={(t) => setFormData((p) => ({ ...p, short_description: t }))}
                placeholder="En quelques mots"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description complète *</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(t) => setFormData((p) => ({ ...p, description: t }))}
                placeholder="Détaillez le service, les conditions, etc."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Catégorie *</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowCategorySelector(true)}
                  style={styles.select}
                >
                  <Text style={styles.selectText}>
                    {formData.category_id
                      ? (categories.find((c) => c.id === formData.category_id)?.name || 'Sélectionner…')
                      : 'Sélectionner…'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#777E5C" />
                </TouchableOpacity>
              </View>

              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Prix</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(t) => setFormData((p) => ({ ...p, price: t }))}
                  placeholder="ex: a partir de 2000 Fc"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Détails du prix</Text>
              <TextInput
                style={styles.input}
                value={formData.price_details}
                onChangeText={(t) => setFormData((p) => ({ ...p, price_details: t }))}
                placeholder="ex: 2000 Fc/heure"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* LIVRAISON */}
          <View style={styles.card}>
            <SectionTitle>Livraison</SectionTitle>

            <View style={styles.row}>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Délai</Text>
                <TextInput
                  style={styles.input}
                  value={formData.delivery_time}
                  onChangeText={(t) => setFormData((p) => ({ ...p, delivery_time: t }))}
                  placeholder="24–48 h"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Commande minimum</Text>
                <TextInput
                  style={styles.input}
                  value={formData.min_order}
                  onChangeText={(t) => setFormData((p) => ({ ...p, min_order: t }))}
                  placeholder="1"
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Zone de couverture</Text>
              <TextInput
                style={styles.input}
                value={formData.coverage}
                onChangeText={(t) => setFormData((p) => ({ ...p, coverage: t }))}
                placeholder="Ex: Pays de la Loire, Bretagne"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* CONTACT */}
          <View style={styles.card}>
            <SectionTitle>Contact</SectionTitle>

            <View style={styles.row}>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Téléphone</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contact.phone}
                  onChangeText={(t) =>
                    setFormData((p) => ({ ...p, contact: { ...p.contact, phone: t } }))
                  }
                  placeholder="02 40 12 34 56"
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.contact.email}
                  onChangeText={(t) =>
                    setFormData((p) => ({ ...p, contact: { ...p.contact, email: t } }))
                  }
                  placeholder="service@exemple.fr"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* FONCTIONNALITÉS */}
          <View style={styles.card}>
            <SectionTitle>Fonctionnalités</SectionTitle>
            <View style={styles.field}>
              <Text style={styles.label}>Une par ligne</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={formData.features}
                onChangeText={(t) => setFormData((p) => ({ ...p, features: t }))}
                placeholder={'Livraison 24–48 h\nSuivi en temps réel\nEmballages éco'}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* OPTIONS */}
          <View style={styles.card}>
            <SectionTitle>Options</SectionTitle>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => toggleBooleanField('is_active')}
              style={styles.toggleRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Service actif</Text>
                <Text style={styles.toggleHint}>Disponible pour les clients</Text>
              </View>
              <View style={[styles.toggle, formData.is_active && styles.toggleActive]}>
                <View style={[styles.thumb, formData.is_active && styles.thumbActive]} />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FOOTER collé en bas */}
      <View
        style={[
          styles.footer,
          {
            height: FOOTER_HEIGHT + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <OutlineButton
          title="Annuler"
          onPress={() => navigation.goBack()}
          disabled={isUploading}
          style={{ flex: 1 }}
        />
        <PrimaryButton
          title={mode === 'add' ? 'Créer le service' : 'Enregistrer'}
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
            <ActivityIndicator size="large" color="#283106" />
            <Text style={styles.overlayText}>Enregistrement…</Text>
          </View>
        </View>
      ) : null}

      {/* MODAL catégories */}
      {showCategorySelector ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
              <TouchableOpacity onPress={() => setShowCategorySelector(false)} style={styles.iconBtn}>
                <Ionicons name="close" size={20} color="#283106" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              {categories.length > 0 ? (
                categories.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.optionRow}
                    activeOpacity={0.9}
                    onPress={() => selectCategory(c)}
                  >
                    <Text style={styles.optionEmoji}>{String(c.emoji || '🏷️')}</Text>
                    <Text style={styles.optionText}>{String(c.name)}</Text>
                    <Ionicons name="chevron-forward" size={18} color="#777E5C" />
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

/* ===== Palette conservée ===== */
const COLORS = {
  bg: '#f5f5f5',
  ink: '#283106',
  muted: '#777E5C',
  accent: '#4CAF50',
  border: '#E0E0E0',
  card: '#FFFFFF',
};

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

  sectionHeaderRow: { marginBottom: 8 },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  sectionHairline: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.9,
  },

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

  imageDrop: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 14,
  },
  imageDropRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  imageIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(40,49,6,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTitle: { color: COLORS.ink, fontWeight: '700' },
  imageHint: { color: COLORS.muted, fontSize: 12, marginTop: 2 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  toggleTitle: { color: COLORS.ink, fontWeight: '700' },
  toggleHint: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    padding: 3,
    justifyContent: 'center',
  },
  toggleActive: { backgroundColor: '#4CAF50' },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  thumbActive: { alignSelf: 'flex-end' },

  /* Footer ABSOLU (colle en bas) */
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,            // colle au bas
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
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 10 },
  optionEmoji: { fontSize: 18 },
  optionText: { flex: 1, color: COLORS.ink, fontWeight: '600' },
  emptyState: { paddingVertical: 24, alignItems: 'center' },
  emptyStateText: { color: COLORS.muted, fontStyle: 'italic' },
});
