import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button, Badge } from '../components/ui';
import { useFavorites } from '../hooks/useFavorites';

const { width } = Dimensions.get('window');

export default function ServiceDetailScreen({ route, navigation }) {
  const { service } = route.params;
  const [isContactPressed, setIsContactPressed] = useState(false);
  const { toggleServiceFavorite, isServiceFavorite } = useFavorites();
  const isFavorite = isServiceFavorite(service.id);

  // Vérification de sécurité
  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Service non trouvé</Text>
          <Button 
            title="Retour" 
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleContact = () => {
    setIsContactPressed(true);
    // Pour l'instant, on ne fait rien avec le bouton
    setTimeout(() => setIsContactPressed(false), 2000);
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{service.name}</Text>
          <Text style={styles.headerSubtitle}>{service.category}</Text>
        </View>

        <TouchableOpacity
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
          onPress={handleFavoriteToggle}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isFavorite ? "#FF6B6B" : "#777E5C"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.containerContent}>
          {/* Image du service */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: service.image }} style={styles.serviceImage} />
            <View style={styles.iconOverlay}>
              <Text style={styles.serviceIcon}>{service.icon}</Text>
            </View>
          </View>

          {/* Informations principales */}
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Tarif :</Text>
              <Text style={styles.priceValue}>{service.price}</Text>
              {service.priceDetails && (
                <Text style={styles.priceDetails}>{service.priceDetails}</Text>
              )}
            </View>

            {/* Badge de catégorie */}
            <View style={styles.categoryContainer}>
              <Badge text={service.category} variant="primary" size="medium" />
            </View>
          </View>

          {/* Fonctionnalités */}
          {service.features && service.features.length > 0 && (
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Fonctionnalités</Text>
              <View style={styles.featuresList}>
                {service.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Informations de couverture */}
          {service.coverage && (
            <View style={styles.coverageSection}>
              <Text style={styles.sectionTitle}>Zone de couverture</Text>
              <View style={styles.coverageItem}>
                <Ionicons name="location-outline" size={20} color="#777E5C" />
                <Text style={styles.coverageText}>{service.coverage}</Text>
              </View>
            </View>
          )}

          {/* Informations de commande */}
          <View style={styles.orderInfoSection}>
            <Text style={styles.sectionTitle}>Informations de commande</Text>
            <View style={styles.orderInfoGrid}>
              {service.minOrder && (
                <View style={styles.orderInfoItem}>
                  <Ionicons name="cart-outline" size={20} color="#4CAF50" />
                  <Text style={styles.orderInfoLabel}>Commande minimum</Text>
                  <Text style={styles.orderInfoValue}>{service.minOrder} $</Text>
                </View>
              )}
              {service.deliveryTime && (
                <View style={styles.orderInfoItem}>
                  <Ionicons name="time-outline" size={20} color="#4CAF50" />
                  <Text style={styles.orderInfoLabel}>Délai de livraison</Text>
                  <Text style={styles.orderInfoValue}>{service.deliveryTime}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Contact */}
          {service.contact && (
            <View style={styles.contactSection}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <View style={styles.contactInfo}>
                {service.contact.phone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={20} color="#777E5C" />
                    <Text style={styles.contactText}>{service.contact.phone}</Text>
                  </View>
                )}
                {service.contact.email && (
                  <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={20} color="#777E5C" />
                    <Text style={styles.contactText}>{service.contact.email}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Évaluation */}
          {service.rating && (
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Évaluation</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.ratingStars}>
                  {[...Array(5)].map((_, index) => (
                    <Ionicons
                      key={index}
                      name={index < Math.floor(service.rating) ? "star" : "star-outline"}
                      size={20}
                      color="#FFD700"
                    />
                  ))}
                </View>
                <Text style={styles.ratingValue}>{service.rating}/5</Text>
                <Text style={styles.ratingCount}>({service.reviewCount} avis)</Text>
              </View>
            </View>
          )}
        </Container>
      </ScrollView>

      {/* Footer avec bouton de contact */}
      <View style={styles.footer}>
        <Button
          title={isContactPressed ? "Demande envoyée !" : "Nous contacter"}
          onPress={handleContact}
          variant="primary"
          style={styles.contactButton}
          disabled={isContactPressed}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
   
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
    marginLeft: 8,
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  containerContent: {
    paddingVertical: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  serviceImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  iconOverlay: {
    position: 'absolute',
    top: 10,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 16,
  },
  priceContainer: {
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#777E5C',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  priceDetails: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 4,
  },
  categoryContainer: {
    marginTop: 8,
  },
  featuresSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  coverageSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  coverageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coverageText: {
    fontSize: 14,
    color: '#555',
  },
  orderInfoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderInfoGrid: {
    gap: 12,
  },
  orderInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#777E5C',
    flex: 1,
  },
  orderInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contactInfo: {
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#555',
  },
  ratingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
  },
  ratingCount: {
    fontSize: 14,
    color: '#777E5C',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  contactButton: {
    width: '100%',
    paddingVertical: 16,
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
