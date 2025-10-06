import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Button } from '../../../components/ui';
import { 
  fetchProducts, 
  deleteProduct,
  selectAdminProducts,
  selectAdminProductsLoading,
  selectAdminProductsError,
  setSearch,
  selectAdminProductsFilters
} from '../../../store/admin/productSlice';
import { getCategoryById } from '../../../data/categories';

export default function ProductsManagement({ navigation, route }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQueryLocal] = useState('');
  
  // Récupérer farmId depuis les paramètres si on vient de FarmProducts
  const { farmId } = route.params || {};
  
  // Selectors Redux
  const products = useSelector(selectAdminProducts);
  const loading = useSelector(selectAdminProductsLoading);
  const error = useSelector(selectAdminProductsError);
  const filters = useSelector(selectAdminProductsFilters);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setSearch(searchQuery));
  }, [searchQuery, dispatch]);

  const handleSearchChange = (text) => {
    setSearchQueryLocal(text);
  };

  const handleAddProduct = () => {
    navigation.navigate('ProductForm', { mode: 'add', farmId });
  };

  const handleViewProduct = (product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Supprimer le produit',
      `Voulez-vous vraiment supprimer le produit "${product.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteProduct(product.id));
            Alert.alert('Succès', 'Produit supprimé avec succès');
          }
        }
      ]
    );
  };

  // Filtrer les produits par farmId si spécifié
  let filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (farmId) {
    filteredProducts = filteredProducts.filter(product => product.farmId === farmId);
  }

  const ProductCard = ({ product }) => {
    const categoryName = product.categoryId 
      ? getCategoryById(product.categoryId)?.name || product.category || 'Non catégorisé'
      : product.category || 'Non catégorisé';
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => handleViewProduct(product)}
      >
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name || 'Produit sans nom'}</Text>
            <Text style={styles.productCategory}>📦 {categoryName}</Text>
            <Text style={styles.productFarm}>🏡 {product.farm || 'Ferme non assignée'}</Text>
          </View>
        <View style={styles.productStats}>
          <View style={[styles.statusBadge, { backgroundColor: (product.stock || 0) > 0 ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.statusText}>
              {(product.stock || 0) > 0 ? 'En stock' : 'Rupture'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.productDetails}>
        <Text style={styles.productPrice}>
          {product.currency === 'USD' ? '$' : 'FC'} {product.price || 0}
          {product.oldPrice && (
            <Text style={styles.oldPrice}> {product.currency === 'USD' ? '$' : 'FC'} {product.oldPrice}</Text>
          )}
        </Text>
        <Text style={styles.productStock}>{product.stock || 0} {product.unit || 'kg'}</Text>
      </View>
      
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ProductForm', { mode: 'edit', product })}
        >
          <Ionicons name="pencil-outline" size={20} color="#2196F3" />
          <Text style={styles.actionText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteProduct(product);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={[styles.actionText, styles.deleteText]}>Supprimer</Text>
        </TouchableOpacity>
      </View>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>
          {farmId ? 'Produits de la Ferme' : 'Gestion des Produits'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddProduct}
        >
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#777E5C" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#777E5C"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQueryLocal('')}>
              <Ionicons name="close-circle" size={20} color="#777E5C" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Liste des Produits</Text>
            <Text style={styles.sectionSubtitle}>{filteredProducts.length} produit(s)</Text>
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
                  : 'Commencez par ajouter un produit'
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 8,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    minWidth: 100,
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
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 2,
  },
  productFarm: {
    fontSize: 14,
    color: '#777E5C',
  },
  productStats: {
    marginLeft: 12,
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
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  oldPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  productStock: {
    fontSize: 14,
    color: '#777E5C',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 4,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  deleteText: {
    color: '#F44336',
  },
});