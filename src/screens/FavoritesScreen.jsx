import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button } from '../components/ui';

export default function FavoritesScreen({ navigation }) {
  const [favorites] = useState([
    {
      id: 1,
      name: 'Tomates Bio',
      price: 12.50,
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=100&h=100&fit=crop',
      farm: 'Ferme du Soleil Levant',
      isOrganic: true
    },
    {
      id: 2,
      name: 'Pommes Golden',
      price: 18.90,
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=100&h=100&fit=crop',
      farm: 'Verger des Trois Chênes',
      isOrganic: false
    },
    {
      id: 3,
      name: 'Lait Bio',
      price: 12.80,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop',
      farm: 'Ferme de la Vallée',
      isOrganic: true
    }
  ]);

  const handleRemoveFavorite = (productId) => {
    console.log('Retirer des favoris:', productId);
    // Ici on retirerait le produit des favoris
  };

  const handleViewProduct = (product) => {
    console.log('Voir produit:', product.name);
    // Ici on naviguerait vers la page produit
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Container style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Favoris</Text>
        <View style={styles.placeholder} />
      </Container>

      {/* Liste des favoris */}
      <Container style={styles.favoritesSection}>
        {favorites.length > 0 ? (
          <View style={styles.favoritesList}>
            {favorites.map((product) => (
              <View key={product.id} style={styles.favoriteCard}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productFarm}>🏡 {product.farm}</Text>
                  <Text style={styles.productPrice}>{product.price.toFixed(2)} €</Text>
                  
                  {product.isOrganic && (
                    <View style={styles.organicBadge}>
                      <Text style={styles.organicText}>Bio</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFavorite(product.id)}
                  >
                    <Ionicons name="heart-dislike" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                  
                  <Button
                    title="Voir"
                    onPress={() => handleViewProduct(product)}
                    variant="outline"
                    size="small"
                    style={styles.viewButton}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={60} color="#C7C2AB" />
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptySubtitle}>
              Vous n'avez pas encore ajouté de produits à vos favoris
            </Text>
            <Button
              title="Découvrir des produits"
              onPress={() => navigation.navigate('Products')}
              variant="primary"
              size="large"
              style={styles.discoverButton}
            />
          </View>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: -20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 20,
  },
  placeholder: {
    width: 40,
  },
  favoritesSection: {
    paddingVertical: 20,
  },
  favoritesList: {
    gap: 16,
  },
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  productFarm: {
    color: '#777E5C',
    fontSize: 14,
    marginBottom: 4,
  },
  productPrice: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  organicBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  organicText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  removeButton: {
    padding: 8,
  },
  viewButton: {
    minWidth: 60,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#777E5C',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  discoverButton: {
    minWidth: 200,
  },
});
