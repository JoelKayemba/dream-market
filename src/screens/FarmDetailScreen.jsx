import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button, Badge } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { selectClientProducts } from '../store/client';
import ProductCard from '../components/ui/ProductCard';
import { useFavorites } from '../hooks/useFavorites';

const { width } = Dimensions.get('window');

export default function FarmDetailScreen({ route, navigation }) {
  const { farm } = route.params;
  const dispatch = useDispatch();
  const products = useSelector(selectClientProducts);
  const [selectedTab, setSelectedTab] = useState('products');
  const { toggleFarmFavorite, isFarmFavorite } = useFavorites();
  const isFavorite = isFarmFavorite(farm.id);

  // Vérification de sécurité
  if (!farm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ferme non trouvée</Text>
          <Button 
            title="Retour" 
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Filtrer les produits de cette ferme avec useMemo pour éviter les recalculs
  const farmProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter(product => product.farm_id === farm.id);
  }, [farm.id, products]);

  const handleFavoriteToggle = () => {
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
  };

  const renderFarmInfo = () => (
    <View style={styles.farmInfo}>
      <View style={styles.farmHeader}>
        <Image source={{ uri: farm.main_image }} style={styles.farmImage} />
        <View style={styles.farmDetails}>
          <Text style={styles.farmName}>{farm.name}</Text>
          <Text style={styles.farmLocation}>📍 {farm.location}</Text>
          <View style={styles.farmStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{farmProducts.length}</Text>
              <Text style={styles.statLabel}>Produits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{farm.rating}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{farm.established ? new Date().getFullYear() - farm.established : 'N/A'}</Text>
              <Text style={styles.statLabel}>Années</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.farmDescription}>
        <Text style={styles.descriptionTitle}>À propos de {farm.name}</Text>
        <Text style={styles.descriptionText}>{farm.description}</Text>
      </View>

      <View style={styles.farmFeatures}>
        <Text style={styles.featuresTitle}>Spécialités</Text>
        <View style={styles.featuresList}>
          {farm.specialty && (
            <Badge text={farm.specialty} variant="primary" size="small" />
          )}
          {farm.certifications && farm.certifications.map((cert, index) => (
            <Badge key={index} text={cert} variant="secondary" size="small" />
          ))}
        </View>
      </View>

      <View style={styles.farmContact}>
        <Text style={styles.contactTitle}>Contact</Text>
        {farm.contact && (
          <>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color="#777E5C" />
              <Text style={styles.contactText}>{farm.contact.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color="#777E5C" />
              <Text style={styles.contactText}>{farm.contact.email}</Text>
            </View>
            {farm.contact.website && (
              <View style={styles.contactItem}>
                <Ionicons name="globe-outline" size={20} color="#777E5C" />
                <Text style={styles.contactText}>{farm.contact.website}</Text>
              </View>
            )}
          </>
        )}
        <View style={styles.contactItem}>
          <Ionicons name="location-outline" size={20} color="#777E5C" />
          <Text style={styles.contactText}>{farm.location}</Text>
        </View>
      </View>
    </View>
  );

  const renderProducts = () => (
    <View style={styles.productsSection}>
      <View style={styles.productsHeader}>
        <Text style={styles.productsTitle}>Produits de {farm.name}</Text>
        <Text style={styles.productsCount}>{farmProducts.length} produit{farmProducts.length > 1 ? 's' : ''}</Text>
      </View>
      
      {farmProducts.length === 0 ? (
        <View style={styles.emptyProducts}>
          <Ionicons name="leaf-outline" size={64} color="#777E5C" />
          <Text style={styles.emptyTitle}>Aucun produit disponible</Text>
          <Text style={styles.emptySubtitle}>
            Cette ferme n'a pas encore de produits disponibles
          </Text>
        </View>
      ) : (
        <View style={styles.productsList}>
          {farmProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              navigation={navigation}
              variant="default"
              size="large"
              fullWidth={true}
            />
          ))}
        </View>
      )}
    </View>
  );

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
          <Text style={styles.headerTitle}>{farm.name}</Text>
          <Text style={styles.headerSubtitle}>{farm.location}</Text>
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

      {/* Onglets */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'info' && styles.activeTab]}
          onPress={() => setSelectedTab('info')}
        >
          <Text style={[styles.tabText, selectedTab === 'info' && styles.activeTabText]}>
            Informations
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'products' && styles.activeTab]}
          onPress={() => setSelectedTab('products')}
        >
          <Text style={[styles.tabText, selectedTab === 'products' && styles.activeTabText]}>
            Produits ({farmProducts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.containerContent}>
          {selectedTab === 'info' ? renderFarmInfo() : renderProducts()}
        </Container>
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#777E5C',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  containerContent: {
    paddingVertical: 16,
  },
  farmInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  farmHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  farmImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  farmDetails: {
    flex: 1,
  },
  farmName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 4,
  },
  farmLocation: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 12,
  },
  farmStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#777E5C',
  },
  farmDescription: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  farmFeatures: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 8,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  farmContact: {
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  productsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    flex: 1,
  },
  productsCount: {
    fontSize: 14,
    color: '#777E5C',
  },
  productsList: {
    gap: 16,
    
    
  },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
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
