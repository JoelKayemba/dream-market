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
  addFarm,
  updateFarm,
  selectFarmsLoading,
  selectFarmsUploading,
  selectFarmsError,
} from '../../../store/admin/farmSlice';
import { useImagePicker } from '../../../hooks/useImagePicker';
import { storageService } from '../../../backend/services/storageService';

/* ==== Palette conservée ==== */
const COLORS = {
  bg: '#f5f5f5',
  ink: '#283106',
  muted: '#777E5C',
  accent: '#4CAF50',
  border: '#E0E0E0',
  card: '#FFFFFF',
};

export default function FarmForm({ route, navigation }) {
  const { mode = 'add', farm } = route.params || {};
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const loading = useSelector(selectFarmsLoading);
  const uploading = useSelector(selectFarmsUploading);
  const error = useSelector(selectFarmsError);

  const { showImagePickerOptions, selectedImages, setSelectedImages } = useImagePicker();

  const [formData, setFormData] = React.useState({
    name: farm?.name || '',
    location: farm?.location || '',
    region: farm?.region || '',
    description: farm?.description || '',
    specialty: farm?.specialty || '',
    established: farm?.established?.toString() || new Date().getFullYear().toString(),
    size: farm?.size?.toString() || '',
    family_members: farm?.family_members?.toString() || farm?.familyMembers?.toString() || '',
    delivery: !!farm?.delivery,
    pickup: !!farm?.pickup,
    farm_shop: farm?.farm_shop ?? farm?.farmShop ?? false,
    certifications: farm?.certifications || [],
    sustainable_practices: farm?.sustainable_practices || farm?.sustainablePractices || [],
    story: farm?.story || '',
    contact: {
      phone: farm?.contact?.phone || '',
      email: farm?.contact?.email || '',
      website: farm?.contact?.website || '',
    },
  });

  // Précharger images si édition (main + cover si dispo)
  React.useEffect(() => {
    if (mode === 'edit' && farm) {
      const images = [];
      if (farm.main_image) images.push({ uri: farm.main_image });
      if (farm.cover_image) images.push({ uri: farm.cover_image });
      setSelectedImages(images.length ? images : []);
    }
  }, [mode, farm, setSelectedImages]);

  const availableCertifications = [
    'Bio',
    'HVE',
    'Nature & Progrès',
    'Label Rouge',
    'AOC',
    'AOP',
    'Filière Qualité',
    'GAP',
  ];

  const availablePractices = [
    'Rotation des cultures',
    'Compostage',
    'Énergie solaire',
    'Pâturage extensif',
    'Traite à la main',
    'Fromages affinés',
    'Pâturage ovin',
    'Hôtels à insectes',
    "Gestion de l'eau",
    'Agriculture de conservation',
    'Couverts végétaux',
    'Réduction des intrants',
    'Vendanges manuelles',
    'Élevage en fûts',
    'Biodynamie',
  ];

  const handleImageSelection = (image) => {
    // Une image principale (ou remplace)
    setSelectedImages([image]);
  };

  const toggleBooleanField = (field) => {
    setFormData((p) => ({ ...p, [field]: !p[field] }));
  };

  const toggleCertification = (cert) => {
    setFormData((p) => {
      const exists = p.certifications.includes(cert);
      return {
        ...p,
        certifications: exists
          ? p.certifications.filter((c) => c !== cert)
          : [...p.certifications, cert],
      };
    });
  };

  const togglePractice = (pr) => {
    setFormData((p) => {
      const exists = p.sustainable_practices.includes(pr);
      return {
        ...p,
        sustainable_practices: exists
          ? p.sustainable_practices.filter((x) => x !== pr)
          : [...p.sustainable_practices, pr],
      };
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        Alert.alert('Erreur', 'Le nom de la ferme est obligatoire');
        return;
      }
      if (selectedImages.length === 0) {
        Alert.alert('Erreur', 'Veuillez ajouter au moins une image');
        return;
      }

      const year = parseInt(formData.established, 10);
      const establishedISO = Number.isFinite(year) ? new Date(year, 0, 1).toISOString() : null;

      // Upload image(s)
      const imageUrls = [];
      for (const image of selectedImages) {
        const uri = image?.uri || '';
        if (!uri) continue;
        if (uri.startsWith('file://')) {
          const uploadResult = await storageService.uploadImage(uri, 'farms', '');
          imageUrls.push(uploadResult.url);
        } else {
          imageUrls.push(uri);
        }
      }

      const payload = {
        name: formData.name,
        location: formData.location,
        region: formData.region,
        description: formData.description,
        specialty: formData.specialty,
        established: establishedISO,
        size: formData.size ? parseInt(formData.size, 10) : null,
        family_members: formData.family_members ? parseInt(formData.family_members, 10) : null,
        story: formData.story,
        delivery: formData.delivery,
        pickup: formData.pickup,
        farm_shop: formData.farm_shop,
        certifications: formData.certifications,
        sustainable_practices: formData.sustainable_practices,
        contact: formData.contact,
        images: imageUrls, // URLs Supabase
      };

      if (mode === 'edit') {
        await dispatch(updateFarm({ id: farm.id, farmData: payload })).unwrap();
        Alert.alert('Succès', 'Ferme mise à jour avec succès');
      } else {
        await dispatch(addFarm(payload)).unwrap();
        Alert.alert('Succès', 'Ferme créée avec succès');
      }

      navigation.goBack();
    } catch (err) {
      console.error('Erreur sauvegarde ferme:', err);
      Alert.alert('Erreur', err?.message || 'Une erreur est survenue');
    }
  };

  /* ===== UI Reusable Buttons ===== */
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

  const Chip = ({ label, active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const FOOTER_HEIGHT = 60;

  return (
    <SafeAreaWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{mode === 'add' ? 'Ajouter une ferme' : 'Modifier la ferme'}</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: FOOTER_HEIGHT + insets.bottom + 12 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Images */}
          <View style={styles.card}>
            <SectionTitle>Image principale</SectionTitle>
            <View style={styles.imagePreview}>
              {selectedImages.length > 0 ? (
                <Image source={{ uri: selectedImages[0].uri }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={styles.imageDrop}>
                  <Ionicons name="camera-outline" size={28} color={COLORS.muted} />
                  <Text style={styles.imageDropText}>Ajouter une image</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.imageAddBtn}
              onPress={() => showImagePickerOptions(handleImageSelection)}
              activeOpacity={0.9}
            >
              <Ionicons name="camera" size={18} color={COLORS.accent} />
              <Text style={styles.imageAddText}>{selectedImages.length > 0 ? "Changer l'image" : 'Ajouter une image'}</Text>
            </TouchableOpacity>
          </View>

          {/* Infos principales */}
          <View style={styles.card}>
            <SectionTitle>Informations principales</SectionTitle>

            <View style={styles.field}>
              <Text style={styles.label}>Nom de la ferme *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(t) => setFormData((p) => ({ ...p, name: t }))}
                placeholder="Entrez le nom de la ferme"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Localisation *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(t) => setFormData((p) => ({ ...p, location: t }))}
                placeholder="Ville, région"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Région</Text>
              <TextInput
                style={styles.input}
                value={formData.region}
                onChangeText={(t) => setFormData((p) => ({ ...p, region: t }))}
                placeholder="Région administrative"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Spécialité</Text>
              <TextInput
                style={styles.input}
                value={formData.specialty}
                onChangeText={(t) => setFormData((p) => ({ ...p, specialty: t }))}
                placeholder="Bio, Fruits, Céréales, etc."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Année d'établissement</Text>
                <TextInput
                  style={styles.input}
                  value={formData.established}
                  onChangeText={(t) => setFormData((p) => ({ ...p, established: t }))}
                  keyboardType="numeric"
                  placeholder="1985"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.field, styles.col]}>
                <Text style={styles.label}>Taille (hectares)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.size}
                  onChangeText={(t) => setFormData((p) => ({ ...p, size: t }))}
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre de membres de famille</Text>
              <TextInput
                style={styles.input}
                value={formData.family_members}
                onChangeText={(t) => setFormData((p) => ({ ...p, family_members: t }))}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={formData.description}
                onChangeText={(t) => setFormData((p) => ({ ...p, description: t }))}
                placeholder="Description de la ferme"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Histoire</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={formData.story}
                onChangeText={(t) => setFormData((p) => ({ ...p, story: t }))}
                placeholder="L'histoire de la ferme"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Services */}
          <View style={styles.card}>
            <SectionTitle>Services</SectionTitle>

            <TouchableOpacity
              style={[styles.optionItem, formData.delivery && styles.optionItemActive]}
              onPress={() => toggleBooleanField('delivery')}
              activeOpacity={0.9}
            >
              <Ionicons
                name={formData.delivery ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={22}
                color={formData.delivery ? COLORS.accent : '#E0E0E0'}
              />
              <Text style={styles.optionText}>Livraison</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, formData.pickup && styles.optionItemActive]}
              onPress={() => toggleBooleanField('pickup')}
              activeOpacity={0.9}
            >
              <Ionicons
                name={formData.pickup ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={22}
                color={formData.pickup ? COLORS.accent : '#E0E0E0'}
              />
              <Text style={styles.optionText}>Retrait sur place</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionItem, formData.farm_shop && styles.optionItemActive]}
              onPress={() => toggleBooleanField('farm_shop')}
              activeOpacity={0.9}
            >
              <Ionicons
                name={formData.farm_shop ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={22}
                color={formData.farm_shop ? COLORS.accent : '#E0E0E0'}
              />
              <Text style={styles.optionText}>Magasin à la ferme</Text>
            </TouchableOpacity>
          </View>

          {/* Certifications */}
          <View style={styles.card}>
            <SectionTitle>Certifications</SectionTitle>
            <View style={styles.chipsWrap}>
              {availableCertifications.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={formData.certifications.includes(c)}
                  onPress={() => toggleCertification(c)}
                />
              ))}
            </View>
          </View>

          {/* Pratiques durables */}
          <View style={styles.card}>
            <SectionTitle>Pratiques durables</SectionTitle>
            <View style={styles.chipsWrap}>
              {availablePractices.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  active={formData.sustainable_practices.includes(p)}
                  onPress={() => togglePractice(p)}
                />
              ))}
            </View>
          </View>

          {/* Contact */}
          <View style={styles.card}>
            <SectionTitle>Contact</SectionTitle>

            <View style={styles.field}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.contact.phone}
                onChangeText={(t) =>
                  setFormData((p) => ({ ...p, contact: { ...p.contact, phone: t } }))
                }
                placeholder="Numéro de téléphone"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.contact.email}
                onChangeText={(t) =>
                  setFormData((p) => ({ ...p, contact: { ...p.contact, email: t } }))
                }
                placeholder="Adresse email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Site web</Text>
              <TextInput
                style={styles.input}
                value={formData.contact.website}
                onChangeText={(t) =>
                  setFormData((p) => ({ ...p, contact: { ...p.contact, website: t } }))
                }
                placeholder="https://exemple.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer collé en bas */}
      <View style={[styles.footer, { height: FOOTER_HEIGHT + insets.bottom, paddingBottom: insets.bottom }]}>
        <OutlineButton title="Annuler" onPress={() => navigation.goBack()} disabled={uploading} style={{ flex: 1 }} />
        <PrimaryButton
          title={mode === 'add' ? 'Ajouter' : 'Enregistrer'}
          onPress={handleSave}
          loading={uploading || loading}
          disabled={uploading || loading}
          style={{ flex: 1 }}
        />
      </View>

      {/* Overlay d'enregistrement */}
      {(uploading) && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={COLORS.ink} />
            <Text style={styles.overlayText}>Enregistrement…</Text>
          </View>
        </View>
      )}
    </SafeAreaWrapper>
  );
}

/* ==== Styles ==== */
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

  /* Images */
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  previewImage: { width: '100%', height: '100%' },

  imageDrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

  /* Options & chips */
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

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  chipActive: { borderColor: COLORS.accent, backgroundColor: '#F0FDF4' },
  chipText: { color: COLORS.muted, fontWeight: '700', fontSize: 12 },
  chipTextActive: { color: COLORS.accent },

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
});
