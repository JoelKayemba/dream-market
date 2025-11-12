import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Text, RefreshControl } from 'react-native';
import { 
  Container, 
  SearchBar,
  SectionHeader,
  Divider,
  Badge,
  Rating,
  Button,
  ScreenWrapper 
} from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectClientServices, 
  selectClientServicesLoading,
  fetchServices
} from '../store/client';
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';

export default function ServicesScreen({ navigation }) {
  const dispatch = useDispatch();
  const services = useSelector(selectClientServices);
  const loading = useSelector(selectClientServicesLoading);

  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loadDataIfNeeded = async () => {
      try {
        if (!hasLoaded && (!services || services.length === 0)) {
          setHasLoaded(true);
          await dispatch(fetchServices());
        } else if (services && services.length > 0) {
          setHasLoaded(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
        setHasLoaded(false);
      }
    };
    
    loadDataIfNeeded();
  }, [dispatch, hasLoaded]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchServices());
    } catch (error) {
      console.error('Erreur lors du refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleServicePress = (service) => {
    navigation.navigate('ServiceDetail', { service });
  };

  const handleContact = (service) => {
    const { showContactMenu } = require('../utils/contactInfo');
    showContactMenu(service.name);
  };

  const getServiceIcon = (category) => {
    const icons = {
      'maintenance': 'build',
      'réparation': 'handyman',
      'conseil': 'psychology',
      'formation': 'school',
      'installation': 'engineering',
      'default': 'handyman'
    };
    return icons[category?.toLowerCase()] || icons.default;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="handyman" size={64} color="#4CAF50" />
        <Text style={styles.loadingText}>Chargement des services...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Header avec titre et barre de recherche */}
        <View style={styles.headerContainer}>
          <Container style={styles.header}>
            <View style={styles.titleContainer}>
              <MaterialIcons name="handyman" size={32} color="#4CAF50" style={styles.titleIcon} />
              <View>
                <Text style={styles.title}>
                  Nos Services
                </Text>
                <Text style={styles.subtitle}>
                  Solutions complètes pour professionnels agricoles
                </Text>
              </View>
            </View>
            
            {/* Barre de recherche */}
            <Container style={styles.searchSection}>
              <SearchBar
                placeholder="Rechercher des services, catégories..."
                onPress={(query) => navigation.navigate('Search', { initialQuery: query })}
              />
            </Container>
          </Container>
        </View>

        <Divider style={styles.divider} />

        

        

        {/* Section Tous les services */}
        <Container style={styles.section}>
          <SectionHeader
            title="Tous nos services"
            subtitle="Découvrez nos solutions professionnelles"
            style={styles.fullWidthHeader}
            icon="list"
          />
          
          <View style={styles.servicesGrid}>
            {(services || []).map((service, index) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  index % 2 === 0 ? styles.cardEven : styles.cardOdd
                ]}
                onPress={() => handleServicePress(service)}
              >
                <View style={styles.serviceImageContainer}>
                  {service.image ? (
                    <Image
                      source={{ uri: service.image }}
                      style={styles.serviceImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.serviceImagePlaceholder}>
                      <MaterialIcons 
                        name={getServiceIcon(service.category)} 
                        size={48} 
                        color="#4CAF50" 
                      />
                    </View>
                  )}
                  
                  {/* Badges */}
                  <View style={styles.badges}>
                    {service.is_active && (
                      <Badge 
                        text="Actif" 
                        variant="success" 
                        size="small" 
                        icon="check-circle"
                      />
                    )}
                    {service.category && (
                      <Badge 
                        text={service.category} 
                        variant="outline" 
                        size="small"
                      />
                    )}
                  </View>

                  {/* Overlay de favori */}
                  <TouchableOpacity style={styles.favoriteButton}>
                    <MaterialIcons name="favorite-border" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.serviceContent}>
                  <Text style={styles.serviceName} numberOfLines={2}>
                    {service.name}
                  </Text>
                  
                  <Text style={styles.serviceDescription} numberOfLines={3}>
                    {service.short_description || service.description}
                  </Text>

                  <View style={styles.serviceMeta}>
                    <View style={styles.servicePrice}>
                      <Text style={styles.priceText}>{service.price}</Text>
                      {service.price_details && (
                        <Text style={styles.priceDetails}>{service.price_details}</Text>
                      )}
                    </View>
                    
                    <View style={styles.duration}>
                      <MaterialIcons name="schedule" size={14} color="#777E5C" />
                      <Text style={styles.durationText}>
                        {service.duration || 'Sur devis'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.serviceFooter}>
                    <View style={styles.ratingContainer}>
                      <Rating value={service.rating} size="small" />
                      <Text style={styles.reviewCount}>({service.review_count || 0})</Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.contactButton}
                      onPress={() => handleContact(service)}
                    >
                      <MaterialIcons name="chat" size={16} color="#FFFFFF" />
                      <Text style={styles.contactButtonText}>Contacter</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* État vide */}
          {(services || []).length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="handyman" size={64} color="#CCCCCC" />
              <Text style={styles.emptyStateTitle}>Aucun service disponible</Text>
              <Text style={styles.emptyStateText}>
                Aucun service n'est disponible pour le moment.
              </Text>
            </View>
          )}
        </Container>

        {/* Call to Action */}
        <Container style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <MaterialIcons name="business-center" size={48} color="#4CAF50" />
            <Text style={styles.ctaTitle}>Vous proposez un service ?</Text>
            <Text style={styles.ctaText}>
              Rejoignez notre plateforme et proposez vos services aux agriculteurs
            </Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => {
                const { showContactMenu } = require('../utils/contactInfo');
                showContactMenu();
              }}
            >
              <MaterialIcons name="add-business" size={20} color="#FFFFFF" />
              <Text style={styles.ctaButtonText}>Proposer un service</Text>
            </TouchableOpacity>
          </View>
        </Container>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#F8FDF8',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
  },
  header: {
    paddingVertical: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#777E5C',
    lineHeight: 22,
  },
  searchSection: {
    paddingHorizontal: 0,
  },
  divider: {
    marginVertical: 8,
  },
  statsSection: {
    paddingVertical: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#777E5C',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
  section: {
    paddingVertical: 24,
  },
  fullWidthHeader: {
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardEven: {
    backgroundColor: '#FFFFFF',
  },
  cardOdd: {
    backgroundColor: '#FAFFFA',
  },
  serviceImageContainer: {
    position: 'relative',
    height: 160,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badges: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceContent: {
    padding: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 8,
    lineHeight: 22,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  servicePrice: {
    flex: 1,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 2,
  },
  priceDetails: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#777E5C',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  contactButton: {
    backgroundColor: '#283106',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#283106',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
    fontStyle: 'italic',
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaSection: {
    paddingVertical: 24,
    paddingHorizontal: 10,
    
  },
  ctaCard: {
    backgroundColor: '#F0F8F0',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});