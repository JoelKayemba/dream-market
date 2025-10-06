import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Container, Button } from '../../../components/ui';
import { selectAllFarms } from '../../../store/admin/farmSlice';
import { products } from '../../../data/products';

export default function FarmProducts({ route, navigation }) {
  const { farm: initialFarm } = route.params;
  const farms = useSelector(selectAllFarms);
  const [farmProducts, setFarmProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Récupérer la ferme mise à jour depuis le store
  const farm = farms.find(f => f.id === initialFarm.id) || initialFarm;

  useEffect(() => {
    loadFarmProducts();
  }, [farm]);

  const loadFarmProducts = () => {
    // Simuler un chargement
    setLoading(true);
    
    // Filtrer les produits par farmId et créer une copie profonde
    const productsByFarm = products
      .filter(product => product.farmId === farm.id)
      .map(product => ({ ...product }));
    
    setTimeout(() => {
      setFarmProducts(productsByFarm);
      setLoading(false);
    }, 1000);
  };

  const filteredProducts = farmProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = () => {
    navigation.navigate('ProductForm', { 
      mode: 'add', 
      farmId: farm.id,
      farmName: farm.name 
    });
  };

  const handleEditProduct = (product) => {
    navigation.navigate('ProductForm', { 
      mode: 'edit', 
      product,
      farmId: farm.id,
      farmName: farm.name 
    });
  };

  const handleViewProduct = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const ProductCard = ({ product }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: product.images?.[0] || product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {product.isOrganic && (
          <View style={styles.organicBadge}>
            <Text style={styles.organicText}>Bio</Text>
          </View>
        )}
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        
        <View style={styles.productDetails}>
          <View style={styles.priceContainer}>
            {product.oldPrice && (
              <Text style={styles.oldPrice}>{product.oldPrice}€</Text>
            )}
            <Text style={styles.productPrice}>{product.price}€</Text>
          </View>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star} 
                  name="star" 
                  size={12} 
                  color={star <= (product.rating || 0) ? "#FFD700" : "#E0E0E0"} 
                />
              ))}
            </View>
            {product.reviewCount && (
              <Text style={styles.reviewCount}>({product.reviewCount})</Text>
            )}
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: product.status === 'active' ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.statusText}>
              {product.status === 'active' ? 'Actif' : 'Inactif'}
            </Text>
          </View>
          
          <Text style={styles.stockText}>
            Stock: {product.stock || 'N/A'}
          </Text>
        </View>
      </View>
      
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewProduct(product)}
        >
          <Ionicons name="eye-outline" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditProduct(product)}
        >
          <Ionicons name="pencil-outline" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteProduct(product)}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Supprimer le produit',
      `Voulez-vous vraiment supprimer "${product.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implémenter la suppression
            setFarmProducts(prev => prev.filter(p => p.id !== product.id));
            Alert.alert('Succès', 'Produit supprimé avec succès');
          }
        }
      ]
    );
  };

  const toggleProductStatus = (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    setFarmProducts(prev => 
      prev.map(p => 
        p.id === product.id 
          ? { ...p, status: newStatus }
          : p
      )
    );
    Alert.alert('Succès', `Produit ${newStatus === 'active' ? 'activé' : 'désactivé'} avec succès`);
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Produits de la ferme</Text>
          <Text style={styles.headerSubtitle}>{farm.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ProductsManagement', { farmId: farm.id })}
        >
          <Ionicons name="list" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Informations de la ferme */}
      <View style={styles.farmInfoSection}>
        <View style={styles.farmInfoCard}>
          <View style={styles.farmMainInfo}>
            <Text style={styles.farmName}>{farm.name}</Text>
            <Text style={styles.farmLocation}>📍 {farm.location}</Text>
            <Text style={styles.farmSpecialty}>🏷️ {farm.specialty}</Text>
          </View>
          <View style={styles.farmStats}>
            <Text style={styles.farmStatNumber}>{farmProducts.length}</Text>
            <Text style={styles.farmStatLabel}>Produits</Text>
          </View>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#777E5C" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#777E5C"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#777E5C" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Liste des Produits</Text>
            <Text style={styles.sectionSubtitle}>
              {filteredProducts.length} produit(s) trouvé(s)
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des produits...</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Aucun produit trouvé' : 'Aucun produit'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Essayez avec d\'autres mots-clés' 
                  : 'Commencez par ajouter un produit à cette ferme'
                }
              </Text>
              {!searchQuery && (
                <Button
                  title="Ajouter un produit"
                  onPress={handleAddProduct}
                  variant="primary"
                  style={styles.addFirstButton}
                />
              )}
            </View>
          ) : (
            <View style={styles.productsList}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>
          )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  addButton: {
    padding: 8,
  },
  farmInfoSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  farmInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  farmMainInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  farmLocation: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 2,
  },
  farmSpecialty: {
    fontSize: 14,
    color: '#777E5C',
  },
  farmStats: {
    alignItems: 'center',
    marginLeft: 16,
  },
  farmStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  farmStatLabel: {
    fontSize: 12,
    color: '#777E5C',
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#283106',
  },
  content: {
    flex: 1,
  },
  productsSection: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#777E5C',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#777E5C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    minWidth: 150,
  },
  productsList: {
    gap: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  organicBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  organicText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  oldPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: 12,
    color: '#777E5C',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stockText: {
    fontSize: 12,
    color: '#777E5C',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});
