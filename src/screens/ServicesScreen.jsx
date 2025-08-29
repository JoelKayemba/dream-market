import React, { useState } from 'react';
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

export default function ServicesScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const serviceCategories = [
    { id: 'all', name: 'Tous', emoji: '🔧', color: '#777E5C' },
    { id: 'delivery', name: 'Livraison', emoji: '🚚', color: '#4CAF50' },
    { id: 'consulting', name: 'Conseil', emoji: '🌱', color: '#8BC34A' },
    { id: 'digital', name: 'Digital', emoji: '📱', color: '#2196F3' },
    { id: 'certification', name: 'Certification', emoji: '🔒', color: '#9C27B0' },
    { id: 'training', name: 'Formation', emoji: '🎓', color: '#FF9800' },
  ];

  const services = [
    {
      id: 1,
      name: 'Livraison à Domicile',
      category: 'delivery',
      description: 'Service de livraison rapide et sécurisée de vos produits agricoles directement chez vous.',
      shortDescription: 'Livraison en 24h',
      price: 'À partir de 5.90 €',
      priceDetails: 'Gratuit à partir de 50€ d\'achat',
      features: [
        'Livraison en 24h/48h',
        'Suivi en temps réel',
        'Livraison sécurisée',
        'Horaires flexibles'
      ],
      coverage: 'Toute la France métropolitaine',
      minOrder: '20€',
      deliveryTime: '24-48h',
      rating: 4.7,
      reviewCount: 342,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      isActive: true,
      isPopular: true,
      isNew: false
    },
    {
      id: 2,
      name: 'Conseil Agricole',
      category: 'consulting',
      description: 'Accompagnement personnalisé pour optimiser votre production agricole et améliorer la qualité.',
      shortDescription: 'Expertise agricole',
      price: 'À partir de 80€/h',
      priceDetails: 'Première consultation gratuite',
      features: [
        'Audit de votre exploitation',
        'Plan d\'amélioration',
        'Formation du personnel',
        'Suivi sur mesure'
      ],
      coverage: 'France et Europe',
      minOrder: '2h minimum',
      deliveryTime: 'Sous 7 jours',
      rating: 4.9,
      reviewCount: 156,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
      isActive: true,
      isPopular: true,
      isNew: true
    },
    {
      id: 3,
      name: 'Plateforme de Vente',
      category: 'digital',
      description: 'Mise en place d\'une boutique en ligne personnalisée pour vendre vos produits agricoles.',
      shortDescription: 'E-commerce agricole',
      price: 'À partir de 99€/mois',
      priceDetails: 'Sans commission sur les ventes',
      features: [
        'Site web personnalisé',
        'Gestion des commandes',
        'Paiements sécurisés',
        'Support technique 24/7'
      ],
      coverage: 'Mondial',
      minOrder: '99€/mois',
      deliveryTime: '15 jours',
      rating: 4.6,
      reviewCount: 89,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
      isActive: true,
      isPopular: false,
      isNew: true
    },
    {
      id: 4,
      name: 'Certification Qualité',
      category: 'certification',
      description: 'Accompagnement pour obtenir les certifications Bio, HVE, AOP et autres labels de qualité.',
      shortDescription: 'Certifications agricoles',
      price: 'À partir de 1500€',
      priceDetails: 'Paiement en plusieurs fois possible',
      features: [
        'Audit de conformité',
        'Préparation du dossier',
        'Accompagnement audit',
        'Suivi post-certification'
      ],
      coverage: 'France et Europe',
      minOrder: '1500€',
      deliveryTime: '3-6 mois',
      rating: 4.8,
      reviewCount: 67,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
      isActive: true,
      isPopular: false,
      isNew: false
    },
    {
      id: 5,
      name: 'Analyse de Marché',
      category: 'consulting',
      description: 'Études de marché et analyses concurrentielles pour optimiser votre stratégie commerciale.',
      shortDescription: 'Études de marché',
      price: 'À partir de 2500€',
      priceDetails: 'Rapport détaillé inclus',
      features: [
        'Analyse concurrentielle',
        'Étude de la demande',
        'Recommandations stratégiques',
        'Suivi des tendances'
      ],
      coverage: 'Mondial',
      minOrder: '2500€',
      deliveryTime: '4-6 semaines',
      rating: 4.5,
      reviewCount: 43,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
      isActive: true,
      isPopular: false,
      isNew: false
    },
    {
      id: 6,
      name: 'Formation & Événements',
      category: 'training',
      description: 'Organisation d\'événements, formations et salons pour développer votre réseau professionnel.',
      shortDescription: 'Formation et networking',
      price: 'À partir de 45€/personne',
      priceDetails: 'Tarifs de groupe disponibles',
      features: [
        'Formations techniques',
        'Salons professionnels',
        'Networking',
        'Certificats de formation'
      ],
      coverage: 'France',
      minOrder: '45€/personne',
      deliveryTime: 'Selon calendrier',
      rating: 4.4,
      reviewCount: 78,
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop',
      isActive: true,
      isPopular: false,
      isNew: false
    }
  ];

  const handleSearch = () => {
    navigation.navigate('Search', { searchQuery: '' });
  };

  const handleServicePress = (service) => {
    console.log('Service sélectionné:', service.name);
    // Navigation vers la page de détail du service
  };

  const handleContact = (service) => {
    console.log('Contacter pour:', service.name);
    // Navigation vers la page de contact
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const getFilteredServices = () => {
    if (selectedCategory === 'all') {
      return services;
    }
    return services.filter(service => service.category === selectedCategory);
  };

  const getPopularServices = () => {
    return services.filter(service => service.isPopular);
  };

  const getNewServices = () => {
    return services.filter(service => service.isNew);
  };

  const filteredServices = getFilteredServices();
  const popularServices = getPopularServices();
  const newServices = getNewServices();

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

      {/* Filtres par catégorie */}
      <Container style={styles.filtersSection}>
        <SectionHeader
          title="Filtrer par catégorie"
          subtitle="Trouvez le service qui correspond à vos besoins"
          onActionPress={() => console.log('Voir toutes les catégories')}
          style={styles.fullWidthHeader}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {serviceCategories.map((category) => (
            <View
              key={category.id}
              style={[
                styles.categoryFilter,
                selectedCategory === category.id && styles.selectedCategory
              ]}
            >
              <TouchableOpacity
                onPress={() => handleCategoryFilter(category.id)}
                style={[
                  styles.categoryButton,
                  { borderColor: category.color }
                ]}
              >
                <Text style={[styles.categoryEmoji, { color: category.color }]}>
                  {category.emoji}
                </Text>
                <Text style={[styles.categoryName, { color: category.color }]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </Container>

      <Divider />

      {/* Section Services populaires */}
      <Container style={styles.section}>
        <SectionHeader
          title="Services populaires"
          subtitle="Les services les plus demandés par nos clients"
          onActionPress={() => console.log('Voir tous les services populaires')}
          style={styles.fullWidthHeader}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
        >
          {popularServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={handleServicePress}
              onContact={handleContact}
              variant="featured"
              style={styles.serviceCard}
            />
          ))}
        </ScrollView>
      </Container>

      <Divider />

      {/* Section Nouveaux services */}
      <Container style={styles.section}>
        <SectionHeader
          title="Nouveaux services"
          subtitle="Découvrez nos dernières offres"
          onActionPress={() => console.log('Voir tous les nouveaux services')}
          style={styles.fullWidthHeader}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesContainer}
        >
          {newServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={handleServicePress}
              onContact={handleContact}
              variant="default"
              style={styles.serviceCard}
            />
          ))}
        </ScrollView>
      </Container>

      <Divider />

      {/* Section Tous les services */}
      <Container style={styles.section}>
        <SectionHeader
          title={`Tous nos services (${filteredServices.length})`}
          subtitle="Explorez notre gamme complète de services"
          onActionPress={() => console.log('Voir tous les services')}
          style={styles.fullWidthHeader}
        />
        
        <View style={styles.allServicesGrid}>
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={handleServicePress}
              onContact={handleContact}
              variant="default"
              style={styles.gridServiceCard}
            />
          ))}
        </View>
      </Container>

      <Divider />

      {/* Section Contact */}
      <Container style={styles.contactSection}>
        <Text style={styles.contactTitle}>
          💬 Besoin d'un service personnalisé ?
        </Text>
        <Text style={styles.contactText}>
          Nos experts sont là pour vous accompagner dans tous vos projets agricoles.
          Contactez-nous pour un devis personnalisé.
        </Text>
        
        <Button
          title="Demander un devis"
          onPress={() => console.log('Demander devis personnalisé')}
          variant="primary"
          size="large"
          style={styles.contactButton}
        />
      </Container>
    </ScrollView>
  );
}

// Composant ServiceCard
function ServiceCard({ service, onPress, onContact, variant = 'default', style }) {
  const getCardStyle = () => {
    switch (variant) {
      case 'featured':
        return styles.featuredCard;
      case 'compact':
        return styles.compactCard;
      default:
        return styles.defaultCard;
    }
  };

  const getImageStyle = () => {
    switch (variant) {
      case 'featured':
        return styles.featuredImage;
      case 'compact':
        return styles.compactImage;
      default:
        return styles.defaultImage;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(service)}
      activeOpacity={0.9}
      style={[styles.serviceCardContainer, style]}
    >
      <View style={[styles.serviceCard, getCardStyle()]}>
        {/* Image du service */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: service.image }}
            style={[styles.image, getImageStyle()]}
            resizeMode="cover"
          />
          
          {/* Badges */}
          <View style={styles.badgesContainer}>
            {service.isPopular && (
              <Badge text="Populaire" variant="success" size="small" style={styles.badge} />
            )}
            {service.isNew && (
              <Badge text="Nouveau" variant="primary" size="small" style={styles.badge} />
            )}
            <Badge 
              text={service.isActive ? 'Disponible' : 'Indisponible'} 
              variant={service.isActive ? 'success' : 'error'}
              size="small" 
              style={styles.badge} 
            />
          </View>

          {/* Note et avis */}
          <View style={styles.ratingContainer}>
            <Rating value={service.rating} size="small" />
            <Text style={styles.reviewCount}>({service.reviewCount})</Text>
          </View>
        </View>

        {/* Informations du service */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {service.name}
            </Text>
            <Text style={styles.serviceShortDesc} numberOfLines={1}>
              {service.shortDescription}
            </Text>
          </View>

          {/* Description */}
          {variant !== 'compact' && (
            <Text style={styles.description} numberOfLines={2}>
              {service.description}
            </Text>
          )}

          {/* Prix */}
          {variant !== 'compact' && (
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{service.price}</Text>
              <Text style={styles.priceDetails}>{service.priceDetails}</Text>
            </View>
          )}

          {/* Fonctionnalités */}
          {variant !== 'compact' && (
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Fonctionnalités :</Text>
              <View style={styles.featuresList}>
                {service.features.slice(0, 2).map((feature, index) => (
                  <Text key={index} style={styles.feature}>
                    ✓ {feature}
                  </Text>
                ))}
                {service.features.length > 2 && (
                  <Text style={styles.feature}>
                    +{service.features.length - 2} autres
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Actions */}
          {variant !== 'compact' && (
            <View style={styles.actions}>
              <Button
                title="Voir détails"
                onPress={() => onPress(service)}
                variant="outline"
                size="small"
                style={styles.detailsButton}
              />
              <Button
                title="Nous contacter"
                onPress={() => onContact(service)}
                variant="primary"
                size="small"
                style={styles.contactButton}
              />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: -20,
  },
  header: {
    paddingVertical: 0,
    alignItems: 'center',
  },
  title: {
    color: '#283106',
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 28,
    lineHeight: 32,
    textAlign: 'center',
  },
  subtitle: {
    color: '#777E5C',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  searchBar: {
    width: '100%',
    maxWidth: 450,
  },
  searchSection: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  filtersSection: {
    paddingVertical: 20,
  },
  fullWidthHeader: {
    width: '100%',
  },
  categoriesContainer: {
    paddingHorizontal: 4,
    gap: 12,
  },
  categoryFilter: {
    marginRight: 8,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: '#F0F8F0',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingVertical: 24,
  },
  servicesContainer: {
    paddingHorizontal: 4,
  },
  serviceCard: {
    marginRight: 16,
  },
  allServicesGrid: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 4,
  },
  gridServiceCard: {
    marginBottom: 16,
  },
  contactSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  contactTitle: {
    color: '#283106',
    fontWeight: 'bold',
    marginBottom: 16,
    fontSize: 20,
    textAlign: 'center',
  },
  contactText: {
    color: '#777E5C',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  contactButton: {
    minWidth: 200,
  },
  // Styles pour ServiceCard
  serviceCardContainer: {
    margin: 2,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  defaultCard: {
    width: 320,
    minHeight: 280,
  },
  featuredCard: {
    width: 350,
    minHeight: 320,
  },
  compactCard: {
    width: 280,
    minHeight: 200,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
  },
  featuredImage: {
    height: 160,
  },
  compactImage: {
    height: 100,
  },
  badgesContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 4,
  },
  badge: {
    marginBottom: 4,
  },
  ratingContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewCount: {
    color: '#777E5C',
    fontSize: 11,
    fontWeight: '500',
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 8,
  },
  serviceName: {
    color: '#283106',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 18,
    lineHeight: 22,
  },
  serviceShortDesc: {
    color: '#777E5C',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  description: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceContainer: {
    marginBottom: 12,
  },
  price: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  priceDetails: {
    color: '#777E5C',
    fontSize: 12,
    fontStyle: 'italic',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    color: '#777E5C',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  featuresList: {
    gap: 2,
  },
  feature: {
    color: '#555',
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
  },
  contactButton: {
    flex: 1,
  },
});
