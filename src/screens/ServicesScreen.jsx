import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
import { 
  Container, 
  SearchBar,
  SectionHeader,
  Divider,
  Badge,
  Rating,
  Button
} from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectClientServices, 
  selectClientServicesLoading,
  fetchServices
} from '../store/client';

export default function ServicesScreen({ navigation }) {
  const dispatch = useDispatch();
  const services = useSelector(selectClientServices);
  const loading = useSelector(selectClientServicesLoading);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchServices());
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
      }
    };
    
    loadData();
  }, [dispatch]);

  const handleServicePress = (service) => {
    navigation.navigate('ServiceDetail', { service });
  };

  const handleContact = (service) => {
    console.log('Contacter pour:', service.name);
    // Navigation vers la page de contact
  };

  // Afficher un état de chargement si les données ne sont pas encore chargées
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement des services...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec titre et barre de recherche */}
      <Container style={styles.header}>
        <Text style={styles.title}>
          🔧 Nos Services
        </Text>
        <Text style={styles.subtitle}>
          Solutions complètes pour professionnels agricoles
        </Text>
        
        {/* Barre de recherche */}
        <Container style={styles.searchSection}>
          <SearchBar
            placeholder="Rechercher des services..."
            onPress={(query) => navigation.navigate('Search', { initialQuery: query })}
          />
        </Container>
      </Container>

      <Divider />

      {/* Section Tous les services */}
      <Container style={styles.section}>
        <SectionHeader
          title="Tous nos services"
          subtitle="Découvrez nos solutions professionnelles"
      
          style={styles.fullWidthHeader}
        />
        
        <View style={styles.servicesGrid}>
          {(services || []).map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => handleServicePress(service)}
            >
              <View style={styles.serviceImageContainer}>
                <Image
                  source={{ uri: service.image }}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
                
                {/* Badges */}
                <View style={styles.badges}>
                  {service.is_active && (
                    <Badge text="Actif" variant="success" size="small" />
                  )}
                </View>
              </View>

              <View style={styles.serviceContent}>
                <Text style={styles.serviceName} numberOfLines={2}>
                  {service.name}
                </Text>
                
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.short_description || service.description}
                </Text>

                <View style={styles.servicePrice}>
                  <Text style={styles.priceText}>{service.price}</Text>
                  {service.price_details && (
                    <Text style={styles.priceDetails}>{service.price_details}</Text>
                  )}
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
                    <Text style={styles.contactButtonText}>Contacter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Container>

      <Divider />

      {/* Section Statistiques */}
      <Container style={styles.statsSection}>
        <Text style={styles.statsTitle}>
          Nos services en chiffres
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(services || []).length}
            </Text>
            <Text style={styles.statLabel}>
              Services disponibles
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(services || []).filter(s => s.is_active).length}
            </Text>
            <Text style={styles.statLabel}>
              Services actifs
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {(services || []).reduce((acc, service) => acc + (service.review_count || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>
              Avis clients
            </Text>
          </View>
        </View>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#777E5C',
    fontStyle: 'italic',
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  searchSection: {
    paddingHorizontal: 0,
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
    paddingHorizontal: 4,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  serviceImageContainer: {
    position: 'relative',
    height: 180,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  badges: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  serviceContent: {
    padding: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
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
  servicePrice: {
    marginBottom: 16,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  priceDetails: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  contactButton: {
    backgroundColor: '#283106',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 16,
  },
});