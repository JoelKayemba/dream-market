import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, ScreenWrapper, ImagePreviewModal } from '../components/ui';
import { useFavorites } from '../hooks/useFavorites';
import { useRequireAuth } from '../hooks/useRequireAuth';

const { width } = Dimensions.get('window');

export default function ServiceDetailScreen({ route, navigation }) {
  const { service } = route.params;
  const { toggleServiceFavorite, isServiceFavorite } = useFavorites();
  const { requireAuth } = useRequireAuth();
  const isFavorite = isServiceFavorite(service.id);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

  // Vérification de sécurité
  if (!service) {
    return (
    <ScreenWrapper style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Service non trouvé</Text>
          <Button 
            title="Retour" 
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </ScreenWrapper>
  );
  }

  const handleContact = () => {
    const { showContactMenu } = require('../utils/contactInfo');
    showContactMenu(service.name);
  };

  const handleFavoriteToggle = () => {
    requireAuth(() => {
      const wasFavorite = isFavorite;
      toggleServiceFavorite(service);
      
      // Afficher une notification différente selon l'action
      if (wasFavorite) {
        Alert.alert(
          'Retiré des favoris',
          `${service.name} a été retiré de vos favoris.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Ajouté aux favoris !',
          `${service.name} a été ajouté à vos favoris.`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const heroSubtitle = service.tagline || 'Service premium Dream Market';
  const priceDetails = service.price_details || service.priceDetails;
  const deliveryTime = service.delivery_time || service.deliveryTime;
  const minOrder = service.min_order || service.minOrder;
  const reviewCount = service.review_count || service.reviewCount || 0;

  const highlightChips = [
    service.category ? { label: service.category, icon: 'layers-outline' } : null,
    deliveryTime ? { label: deliveryTime, icon: 'time-outline' } : null,
    service.coverage ? { label: service.coverage, icon: 'navigate-outline' } : null,
  ].filter(Boolean);

  const metricsData = [
    { icon: 'cash-outline', label: 'Tarif', value: service.price || '—' },

  ];

  const orderInfoItems = [
    { icon: 'cart-outline', label: 'Commande minimum', value: minOrder },
    { icon: 'timer-outline', label: 'Disponibilité', value: service.availability || 'Immédiate' },
  ].filter((item) => item.value);

  const { CONTACT_INFO, openWhatsApp, openPhoneCall, openEmail } = require('../utils/contactInfo');
  
  const contactRows = [
    { 
      icon: 'call-outline', 
      label: 'Téléphone', 
      value: CONTACT_INFO.phone1Display,
      action: () => openPhoneCall(CONTACT_INFO.phone1)
    },
    { 
      icon: 'logo-whatsapp', 
      label: 'WhatsApp', 
      value: CONTACT_INFO.phone1Display,
      action: () => openWhatsApp(CONTACT_INFO.phone1, `Bonjour, je souhaite des informations concernant ${service.name}`)
    },
    { 
      icon: 'mail-outline', 
      label: 'Email', 
      value: CONTACT_INFO.email,
      action: () => openEmail(CONTACT_INFO.email, `Demande d'informations - ${service.name}`)
    },
    { 
      icon: 'location-outline', 
      label: 'Adresse', 
      value: CONTACT_INFO.address,
      action: null
    },
    { 
      icon: 'time-outline', 
      label: '', 
      value: CONTACT_INFO.hours,
      action: null
    },
  ];

  const featureList = Array.isArray(service.features) ? service.features : [];

  const ratingValue = service.rating ? Number(service.rating).toFixed(1) : null;

  const FeatureItem = ({ feature }) => (
    <View style={styles.featureChip}>
      <Ionicons name="checkmark-circle-outline" size={12} color="#6B7280" />
      <Text style={styles.featureChipText}>{feature}</Text>
    </View>
  );

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
          <Text style={styles.headerTitle}>{service.name}</Text>
          {service.category ? (
            <Text style={styles.headerSubtitle}>{service.category}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.headerButton, isFavorite && styles.headerButtonActive]}
          onPress={handleFavoriteToggle}
          activeOpacity={0.85}
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
            <Image source={{ uri: service.image }} style={styles.serviceImage} />
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
                  <Ionicons name={chip.icon} size={14} color="#111827" />
                  <Text style={styles.imageChipText}>{chip.label}</Text>
                </View>
              ))}
            </View>
          </ExpoLinearGradient>
        </View>

        <View style={styles.heroWrapper}>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>{service.name}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
            <View style={styles.heroMetaRow}>
              {service.price ? (
                <View style={styles.heroMetaChip}>
                  <Ionicons name="cash-outline" size={16} color="#6B7280" />
                  <Text style={styles.heroMetaText}>{service.price}</Text>
                </View>
              ) : null}
              {priceDetails ? (
                <View style={styles.heroMetaChip}>
                  <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                  <Text style={styles.heroMetaText}>{priceDetails}</Text>
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

        {service.description ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>À propos</Text>
            <Text style={styles.sectionBodyText}>{service.description}</Text>
          </View>
        ) : null}

        {featureList.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Fonctionnalités</Text>
            <View style={styles.featuresGrid}>
              {featureList.map((feature, index) => (
                <FeatureItem key={`${feature}-${index}`} feature={feature} />
              ))}
            </View>
          </View>
        ) : null}

        {service.coverage ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Zone de couverture</Text>
            <View style={styles.sectionRow}>
              <View style={styles.sectionRowLeft}>
                <Ionicons name="location-outline" size={16} color="#6B8E6F" />
                <Text style={styles.sectionRowLabel}>Zones desservies</Text>
              </View>
              <Text style={styles.sectionRowValue}>{service.coverage}</Text>
            </View>
          </View>
        ) : null}

        {orderInfoItems.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Informations de commande</Text>
            {orderInfoItems.map((item, index) => (
              <View
                key={`${item.label}-${index}`}
                style={[styles.sectionRow, index === orderInfoItems.length - 1 && styles.sectionRowLast]}
              >
                <View style={styles.sectionRowLeft}>
                  <Ionicons name={item.icon} size={16} color="#6B8E6F" />
                  <Text style={styles.sectionRowLabel}>{item.label}</Text>
                </View>
                <Text style={styles.sectionRowValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {contactRows.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Contact</Text>
            {contactRows.map((item, index) => (
              <TouchableOpacity
                key={`${item.label || item.icon}-${index}`}
                style={[styles.sectionRow, index === contactRows.length - 1 && styles.sectionRowLast, !item.action && styles.sectionRowDisabled]}
                onPress={item.action || undefined}
                disabled={!item.action}
                activeOpacity={item.action ? 0.7 : 1}
              >
                <View style={styles.sectionRowLeft}>
                  <Ionicons name={item.icon} size={16} color="#6B8E6F" />
                  {item.label ? (
                    <Text style={styles.sectionRowLabel}>{item.label}</Text>
                  ) : null}
                </View>
                <Text style={styles.sectionRowValue}>{item.value}</Text>
                {item.action && (
                  <Ionicons name="chevron-forward-outline" size={16} color="#6B8E6F" style={{ marginLeft: 8 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={handleContact}
          activeOpacity={0.85}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={18}
            color="#fff"
          />
          <Text style={styles.footerButtonText}>
            Nous contacter
          </Text>
        </TouchableOpacity>
      </View>
      <ImagePreviewModal
        visible={imagePreviewVisible}
        images={[service.image]}
        initialIndex={0}
        onClose={() => setImagePreviewVisible(false)}
        title={service.name}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
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
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    height: 240,
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  imageChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  imageChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  heroWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  heroTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    color: '#6B7280',
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
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  heroMetaText: {
    color: '#374151',
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
    minWidth: (width - 16 * 2 - 12 * 2) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3B1F',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B8E6F',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  sectionBodyText: {
    fontSize: 14,
    color: '#405243',
    lineHeight: 22,
    letterSpacing: 0.2,
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
    color: '#3B4F40',
  },
  sectionRowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
    flexShrink: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(47, 143, 70, 0.06)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'flex-start',
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3B1F',
  },
  statLabel: {
    fontSize: 11,
    color: '#5F7164',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
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
