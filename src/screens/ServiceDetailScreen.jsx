import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, ScreenWrapper, ImagePreviewModal } from '../components/ui';
import { useFavorites } from '../hooks/useFavorites';

const { width } = Dimensions.get('window');

export default function ServiceDetailScreen({ route, navigation }) {
  const { service } = route.params;
  const { toggleServiceFavorite, isServiceFavorite } = useFavorites();
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
    service.category ? { label: service.category, icon: 'layers-outline', color: '#1E88E5' } : null,
    deliveryTime ? { label: deliveryTime, icon: 'time-outline', color: '#2F8F46' } : null,
    service.coverage ? { label: service.coverage, icon: 'navigate-outline', color: '#9BE7AA' } : null,
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
      label: 'Horaires', 
      value: CONTACT_INFO.hours,
      action: null
    },
  ];

  const featureList = Array.isArray(service.features) ? service.features : [];

  const ratingValue = service.rating ? Number(service.rating).toFixed(1) : null;

  const FeatureItem = ({ feature }) => (
    <View style={styles.featureChip}>
      <Ionicons name="checkmark-circle-outline" size={12} color="#2F8F46" />
      <Text style={styles.featureChipText}>{feature}</Text>
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      <ExpoLinearGradient
        colors={['#1B3A28', '#2F8F46']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
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
            size={20} 
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </ExpoLinearGradient>

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
                  style={[styles.imageChip, { borderColor: chip.color, backgroundColor: `${chip.color}1A` }]}
                >
                  <Ionicons name={chip.icon} size={14} color={chip.color} />
                  <Text style={[styles.imageChipText, { color: chip.color }]}>{chip.label}</Text>
                </View>
              ))}
            </View>
          </ExpoLinearGradient>
        </View>

        <View style={styles.heroWrapper}>
          <ExpoLinearGradient
            colors={['#2F8F46', '#3FB15A', '#59C06C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Text style={styles.heroTitle}>{service.name}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
            <View style={styles.heroMetaRow}>
              {service.price ? (
                <View style={styles.heroMetaChip}>
                  <Ionicons name="cash-outline" size={16} color="#E8F9EC" />
                  <Text style={styles.heroMetaText}>{service.price}</Text>
                </View>
              ) : null}
              {priceDetails ? (
                <View style={styles.heroMetaChip}>
                  <Ionicons name="pricetag-outline" size={16} color="#E8F9EC" />
                  <Text style={styles.heroMetaText}>{priceDetails}</Text>
                </View>
              ) : null}
            </View>
          </ExpoLinearGradient>
        </View>

        <View style={styles.metricsRow}>
          {metricsData.map((metric, index) => (
            <View key={`${metric.label}-${index}`} style={styles.metricCard}>
              <View style={styles.metricIcon}>
                <Ionicons name={metric.icon} size={18} color="#2F8F46" />
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
            color="#0F2A17"
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
    backgroundColor: '#F3F7F4',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.35)',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(47, 143, 70, 0.12)',
  },
  imageChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroWrapper: {
    paddingHorizontal: 16,
    marginTop: -38,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroSubtitle: {
    color: 'rgba(247, 255, 249, 0.85)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  heroMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(13, 52, 25, 0.35)',
  },
  heroMetaText: {
    color: '#E8F9EC',
    fontSize: 12,
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
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(47, 143, 70, 0.1)',
    shadowColor: '#214D31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(47, 143, 70, 0.12)',
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
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(47, 143, 70, 0.08)',
    shadowColor: '#214D31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3B1F',
    marginBottom: 12,
    letterSpacing: 0.3,
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
    borderRadius: 16,
    backgroundColor: 'rgba(47, 143, 70, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(47, 143, 70, 0.18)',
  },
  featureChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F8F46',
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
    borderTopColor: 'rgba(47, 143, 70, 0.12)',
    backgroundColor: '#FFFFFF',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#9BE7AC',
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F2A17',
    letterSpacing: 0.3,
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
