import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert, Linking, FlatList } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

import { Ionicons } from '@expo/vector-icons';
import { Button, ScreenWrapper, ImagePreviewModal } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { selectClientProducts } from '../store/client';
import ProductCard from '../components/ui/ProductCard';
import { useFavorites } from '../hooks/useFavorites';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { trackInteractionWithUserId } from '../utils/interactionTracker';

const { width } = Dimensions.get('window');

export default function FarmDetailScreen({ route, navigation }) {
  const { farm } = route.params;
  const dispatch = useDispatch();
  const products = useSelector(selectClientProducts);
  const userId = useSelector((state) => state.auth?.user?.id);
  const [selectedTab, setSelectedTab] = useState('products');
  const { toggleFarmFavorite, isFarmFavorite } = useFavorites();
  const { requireAuth } = useRequireAuth();
  const isFavorite = isFarmFavorite(farm.id);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

  useEffect(() => {
    if (!userId || !farm?.id) return;
    trackInteractionWithUserId(userId, {
      type: 'farm_view',
      itemType: 'farm',
      farmId: farm.id,
      searchQuery: farm.specialty || farm.location || farm.city,
    });
  }, [userId, farm?.id]);

  // Vérification de sécurité
  if (!farm) {
    return (
    <ScreenWrapper style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ferme non trouvée</Text>
          <Button 
            title="Retour" 
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </ScreenWrapper>
  );
  }

  const farmImageUri = farm.main_image || farm.cover_image || farm.image || null;
  const farmCoverUri = farm.cover_image || farm.main_image || farm.image || null;

  // Filtrer les produits de cette ferme avec useMemo pour éviter les recalculs
  const farmProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter(product => product.farm_id === farm.id);
  }, [farm.id, products]);

  // prendre juste l'année de la date d'établissement par exemple 2025 - 2020 = 5 ans
  const actualYear = new Date().getFullYear();
  // juste prendre l'année de la date d'établissement par exemple 2020 dans 2025-01-10
  const establishedYear = new Date(farm.established).getFullYear();
  
  const yearsActive = farm.established ? `${actualYear - establishedYear} ans` : null;

  const highlightChips = [
    farm.location ? { label: farm.location, icon: 'navigate-outline' } : null,
    farm.specialty ? { label: farm.specialty, icon: 'leaf-outline' } : null,
  ].filter(Boolean);

  const metricsData = [
    { icon: 'storefront-outline', label: 'Produits', value: farmProducts.length.toString() },
    farm.size ? { icon: 'resize-outline', label: 'Taille', value: `${farm.size} ha` } : null,
    farm.established ? { 
      icon: 'calendar-outline', 
      label: 'Établie en', 
      value: typeof farm.established === 'number' 
        ? farm.established.toString() 
        : new Date(farm.established).getFullYear().toString() 
    } : null,
  ].filter(Boolean);

  const { openWhatsApp, openPhoneCall, openEmail } = require('../utils/contactInfo');
  
  // Construire les lignes de contact avec les informations spécifiques de la ferme
  const contactRows = [];
  
  if (farm.contact?.phone) {
    contactRows.push({
      icon: 'call-outline',
      label: 'Téléphone',
      value: farm.contact.phone,
      action: () => openPhoneCall(farm.contact.phone)
    });
    contactRows.push({
      icon: 'logo-whatsapp',
      label: 'WhatsApp',
      value: farm.contact.phone,
      action: () => openWhatsApp(farm.contact.phone, `Bonjour, je souhaite des informations concernant ${farm.name}`)
    });
  }
  
  if (farm.contact?.email) {
    contactRows.push({
      icon: 'mail-outline',
      label: 'Email',
      value: farm.contact.email,
      action: () => openEmail(farm.contact.email, `Demande d'informations - ${farm.name}`)
    });
  }
  
  if (farm.contact?.website) {
    contactRows.push({
      icon: 'globe-outline',
      label: 'Site web',
      value: farm.contact.website,
      action: () => {
        const url = farm.contact.website.startsWith('http') ? farm.contact.website : `https://${farm.contact.website}`;
        Linking.openURL(url).catch(err => console.error('Erreur ouverture URL:', err));
      }
    });
  }
  
  if (farm.location) {
    contactRows.push({
      icon: 'location-outline',
      label: 'Localisation',
      value: farm.location,
      action: null
    });
  }
  
  if (farm.region) {
    contactRows.push({
      icon: 'map-outline',
      label: 'Région',
      value: farm.region,
      action: null
    });
  }

  const certificationChips = (farm.certifications || []).map((cert) => ({
    label: cert,
    icon: 'shield-checkmark-outline',
  }));

  const heroSubtitle = farm.tagline || 'Producteur partenaire Dream Market';

  const handleFavoriteToggle = () => {
    requireAuth(() => {
      const wasFavorite = isFavorite;
      toggleFarmFavorite(farm);
      
      // Afficher une notification différente selon l'action
      if (wasFavorite) {
        Alert.alert(
          'Retiré des favoris',
          `${farm.name} a été retiré de vos favoris.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Ajouté aux favoris !',
          `${farm.name} a été ajouté à vos favoris.`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    });
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{farm.name}</Text>
          {farm.location ? (
            <Text style={styles.headerSubtitle}>{farm.location}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.headerButton, isFavorite && styles.headerButtonActive]}
          onPress={handleFavoriteToggle}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isFavorite ? "#EF4444" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setImagePreviewVisible(true)}
          >
            {farmCoverUri ? (
              <Image
                source={{ uri: farmCoverUri }}
                style={styles.farmImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.farmImagePlaceholder}>
                <Ionicons name="business-outline" size={48} color="#8A917E" />
              </View>
            )}
          </TouchableOpacity>
          <ExpoLinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.imageGradient}
          >
            <View style={styles.imageChipRow}>
              {highlightChips.map((chip, index) => (
                <View
                  key={`${chip.label}-${index}`}
                  style={styles.imageChip}
                >
                  <Ionicons name={chip.icon} size={14} color="#FFFFFF" />
                  <Text style={styles.imageChipText}>{chip.label}</Text>
                </View>
              ))}
            </View>
          </ExpoLinearGradient>
        </View>

        <View style={styles.heroWrapper}>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>{farm.name}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaChip}>
                <Ionicons name="storefront-outline" size={14} color="#6B7280" />
                <Text style={styles.heroMetaText}>{farmProducts.length} produit{farmProducts.length > 1 ? 's' : ''}</Text>
              </View>
              {yearsActive ? (
                <View style={styles.heroMetaChip}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.heroMetaText}>{yearsActive}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.metricsRow}>
          {metricsData.map((metric, index) => (
            <View key={`${metric.label}-${index}`} style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Ionicons name={metric.icon} size={18} color="#6B7280" />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            onPress={() => setSelectedTab('info')}
            style={[styles.tabButton, selectedTab === 'info' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, selectedTab === 'info' && styles.tabButtonTextActive]}>
              Informations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTab('products')}
            style={[styles.tabButton, selectedTab === 'products' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, selectedTab === 'products' && styles.tabButtonTextActive]}>
              Produits ({farmProducts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'info' ? (
          <>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeading}>À propos</Text>
              {farm.description ? (
                <Text style={styles.sectionBodyText}>{farm.description}</Text>
              ) : (
                <Text style={styles.sectionBodyTextMuted}>
                  Les informations détaillées de cette ferme seront bientôt disponibles.
                </Text>
              )}
            </View>

            {farm.story ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>Notre histoire</Text>
                <Text style={styles.sectionBodyText}>{farm.story}</Text>
              </View>
            ) : null}

            {(farm.specialty || certificationChips.length > 0) ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>Expertises & certifications</Text>
                <View style={styles.chipsGrid}>
                  {farm.specialty ? (
                    <View style={styles.infoChip}>
                      <Ionicons name="leaf-outline" size={14} color="#6B7280" />
                      <Text style={styles.infoChipText}>{farm.specialty}</Text>
                    </View>
                  ) : null}
                  {certificationChips.map((chip, index) => (
                    <View
                      key={`${chip.label}-${index}`}
                      style={styles.infoChip}
                    >
                      <Ionicons name={chip.icon} size={14} color="#6B7280" />
                      <Text style={styles.infoChipText}>{chip.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {(farm.sustainable_practices || farm.sustainablePractices) && (farm.sustainable_practices?.length > 0 || farm.sustainablePractices?.length > 0) ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>Pratiques durables</Text>
                <View style={styles.chipsGrid}>
                  {(farm.sustainable_practices || farm.sustainablePractices || []).map((practice, index) => (
                    <View
                      key={`practice-${index}`}
                      style={styles.infoChip}
                    >
                      <Ionicons name="leaf-outline" size={14} color="#6B7280" />
                      <Text style={styles.infoChipText}>{practice}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {(farm.delivery || farm.pickup || farm.farm_shop || farm.farmShop) ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>Services disponibles</Text>
                <View style={styles.servicesList}>
                  {farm.delivery ? (
                    <View style={styles.serviceItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#6B7280" />
                      <Text style={styles.serviceItemText}>Livraison</Text>
                    </View>
                  ) : null}
                  {farm.pickup ? (
                    <View style={styles.serviceItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#6B7280" />
                      <Text style={styles.serviceItemText}>Retrait sur place</Text>
                    </View>
                  ) : null}
                  {(farm.farm_shop || farm.farmShop) ? (
                    <View style={styles.serviceItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#6B7280" />
                      <Text style={styles.serviceItemText}>Magasin à la ferme</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}

            {contactRows.length > 0 ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>Contacts & accès</Text>
                {contactRows.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.label}-${index}`}
                    style={[styles.sectionRow, index === contactRows.length - 1 && styles.sectionRowLast, !item.action && styles.sectionRowDisabled]}
                    onPress={item.action || undefined}
                    disabled={!item.action}
                    activeOpacity={item.action ? 0.7 : 1}
                  >
                    <View style={styles.sectionRowLeft}>
                      <Ionicons name={item.icon} size={16} color="#6B8E6F" />
                      <Text style={styles.sectionRowLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.sectionRowValue}>{item.value}</Text>
                    {item.action && (
                      <Ionicons name="chevron-forward-outline" size={16} color="#6B8E6F" style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.sectionCard}>
            <View style={styles.productsHeaderRow}>
              <Text style={styles.sectionHeading}>Produits disponibles</Text>
              <View style={styles.productsBadge}>
                <Ionicons name="leaf-outline" size={14} color="#6B7280" />
                <Text style={styles.productsBadgeText}>{farmProducts.length}</Text>
              </View>
            </View>

            {farmProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={48} color="#6B8E6F" />
                <Text style={styles.emptyTitle}>Pas encore de produits</Text>
                <Text style={styles.emptySubtitle}>
                  Revenez bientôt pour découvrir les nouveautés de cette ferme.
                </Text>
              </View>
            ) : (
              <FlatList
                data={farmProducts}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    navigation={navigation}
                    variant="default"
                    size="medium"
                    fullWidth={false}
                    style={styles.productCard}
                  />
                )}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productsRow}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="leaf-outline" size={48} color="#6B8E6F" />
                    <Text style={styles.emptyTitle}>Pas encore de produits</Text>
                    <Text style={styles.emptySubtitle}>
                      Revenez bientôt pour découvrir les nouveautés de cette ferme.
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      <ImagePreviewModal
        visible={imagePreviewVisible}
        images={farmImageUri ? [farmImageUri] : []}
        initialIndex={0}
        onClose={() => setImagePreviewVisible(false)}
        title={farm.name}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E4DD',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonActive: {
    backgroundColor: '#FEF2F2',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
  },
  headerTitle: {
    color: '#20251A',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#6B6F5D',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    height: 270,
    overflow: 'hidden',
    backgroundColor: '#EDECE8',
  },
  farmImage: {
    width: '100%',
    height: '100%',
  },
  farmImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDECE8',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  imageChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderColor: 'rgba(255,255,255,0.22)',
  },
  imageChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroWrapper: {
    paddingHorizontal: 16,
    marginTop: -34,
    zIndex: 2,
  },
  heroCard: {
    borderRadius: 26,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E4DD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  heroTitle: {
    color: '#20251A',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.35,
  },
  heroSubtitle: {
    color: '#6B6F5D',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 20,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  heroMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F6F6F3',
    borderWidth: 1,
    borderColor: '#E6E4DD',
  },
  heroMetaText: {
    color: '#3D4236',
    fontSize: 13,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E4DD',
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 16,
    backgroundColor: '#F6F6F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#20251A',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B6F5D',
    marginTop: 4,
    fontWeight: '500',
  },
  tabSwitcher: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 22,
  },
  tabButton: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E4DD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabButtonActive: {
    backgroundColor: '#283106',
    borderColor: '#283106',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.2,
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6E4DD',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#20251A',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  sectionBodyText: {
    fontSize: 14,
    color: '#3D4236',
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  sectionBodyTextMuted: {
    fontSize: 14,
    color: '#7C806F',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F6F6F3',
    borderWidth: 1,
    borderColor: '#E6E4DD',
  },
  infoChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3D4236',
  },
  servicesList: {
    gap: 12,
    marginTop: 4,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  serviceItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3D4236',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(209, 213, 219, 0.45)',
    gap: 14,
  },
  sectionRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  sectionRowDisabled: {
    opacity: 0.7,
  },
  sectionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionRowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D4236',
  },
  sectionRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#20251A',
    textAlign: 'right',
    flexShrink: 1,
  },
  productsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F6F6F3',
    borderWidth: 1,
    borderColor: '#E6E4DD',
  },
  productsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3D4236',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3B1F',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B8E6F',
    textAlign: 'center',
    lineHeight: 20,
  },
  productsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginBottom: 12,
    gap: 12,
  },
  productCard: {
    flex: 1,
    marginBottom: 0,
  },
  bottomSpacer: {
    height: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#283106',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 10,
  },
});
