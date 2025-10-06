import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Container } from '../../../components/ui';
import { deleteProduct, selectAdminProducts } from '../../../store/admin/productSlice';
import { getCategoryById } from '../../../data/categories';

export default function ProductDetail({ route, navigation }) {
  const { product: initialProduct } = route.params;
  const dispatch = useDispatch();
  const products = useSelector(selectAdminProducts);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Récupérer le produit mis à jour depuis le store
  const product = products.find(p => p.id === initialProduct.id) || initialProduct;

  const handleEditProduct = () => {
    navigation.navigate('ProductForm', { mode: 'edit', product });
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Supprimer le produit',
      `Voulez-vous vraiment supprimer le produit "${product.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteProduct(product.id));
            Alert.alert('Succès', 'Produit supprimé avec succès');
            navigation.goBack();
          }
        }
      ]
    );
  };

  // === Composants internes sécurisés ===
  const InfoRow = ({ label, value, icon }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelContainer}>
        {icon ? <Ionicons name={icon} size={16} color="#777E5C" /> : null}
        <Text style={styles.infoLabel}>{String(label ?? '')}</Text>
      </View>
      <Text style={styles.infoValue}>{String(value ?? '')}</Text>
    </View>
  );

  const TagBadge = ({ tag }) => (
    <View style={styles.tagBadge}>
      <Text style={styles.tagText}>{String(tag ?? '')}</Text>
    </View>
  );

  // === Valeurs formatées ===
  const priceStr = `${product.currency === 'USD' ? '$' : 'FC'} ${product.price ?? 0}`;
  const oldPriceStr = product.oldPrice != null
    ? `${product.currency === 'USD' ? '$' : 'FC'} ${product.oldPrice}`
    : null;
  const categoryName = product.categoryId 
    ? getCategoryById(product.categoryId)?.name || product.category || 'Catégorie inconnue'
    : product.category || 'Catégorie inconnue';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails du Produit</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProduct}>
          <Ionicons name="pencil" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images du produit */}
        {product.images && product.images.length > 0 && (
          <View style={styles.imageSection}>
            {product.images.length === 1 ? (
              <Image
                source={{ uri: product.images[0] }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.imagesScrollView}
                contentContainerStyle={styles.imagesScrollContent}
              >
                {product.images.map((imageUri, index) => (
                  <Image
                    key={index}
                    source={{ uri: imageUri }}
                    style={styles.productImageMultiple}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}
            <View style={styles.badgesOverlay}>
              {product.isOrganic ? (
                <View style={[styles.badge, { backgroundColor: '#4CAF50' }]}>
                  <Text style={styles.badgeText}>Bio</Text>
                </View>
              ) : null}
              {product.isNew ? (
                <View style={[styles.badge, { backgroundColor: '#2196F3' }]}>
                  <Text style={styles.badgeText}>Nouveau</Text>
                </View>
              ) : null}
              {product.discount ? (
                <View style={[styles.badge, { backgroundColor: '#FF9800' }]}>
                  <Text style={styles.badgeText}>-{product.discount || 0}%</Text>
                </View>
              ) : null}
              {product.images.length > 1 ? (
                <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <Text style={styles.badgeText}>{product.images.length} photos</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        <Container style={styles.detailsSection}>
          {/* Informations principales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Générales</Text>

             <InfoRow label="Nom" value={product.name} icon="cube-outline" />
             <InfoRow label="Catégorie" value={categoryName} icon="grid-outline" />
             <InfoRow label="Ferme" value={product.farm} icon="leaf-outline" />
            <InfoRow label="Prix" value={priceStr} icon="cash-outline" />
            {oldPriceStr && <InfoRow label="Ancien prix" value={oldPriceStr} icon="pricetag-outline" />}
            <InfoRow label="Unité" value={product.unit} icon="scale-outline" />
            <InfoRow label="Stock" value={`${product.stock ?? 0} ${product.unit ?? ''}`} icon="cube-outline" />

            {product.rating ? (
              <InfoRow
                label="Note"
                value={`${product.rating}/5 (${product.reviewCount || 0} avis)`}
                icon="star-outline"
              />
            ) : null}
          </View>

          {/* Description */}
          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{String(product.description)}</Text>
            </View>
          ) : null}

          {/* Tags */}
          {product.tags && product.tags.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Étiquettes</Text>
              <View style={styles.tagsContainer}>
                {product.tags.map((tag, index) => (
                  <TagBadge key={index} tag={tag} />
                ))}
              </View>
            </View>
          ) : null}

          {/* Statistiques */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{String(product.stock ?? 0)}</Text>
                <Text style={styles.statLabel}>Stock</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{String(product.rating ?? 'N/A')}</Text>
                <Text style={styles.statLabel}>Note</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{String(product.reviewCount ?? 0)}</Text>
                <Text style={styles.statLabel}>Avis</Text>
              </View>
            </View>
          </View>

          {/* Statuts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statuts</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Ionicons 
                  name={product.isOrganic ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={product.isOrganic ? "#4CAF50" : "#E0E0E0"} 
                />
                <Text style={[styles.statusText, { color: product.isOrganic ? "#4CAF50" : "#777E5C" }]}>
                  Produit biologique
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons 
                  name={product.isNew ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={product.isNew ? "#4CAF50" : "#E0E0E0"} 
                />
                <Text style={[styles.statusText, { color: product.isNew ? "#4CAF50" : "#777E5C" }]}>
                  Nouveau produit
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Ionicons 
                  name={product.isPopular ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={product.isPopular ? "#4CAF50" : "#E0E0E0"} 
                />
                <Text style={[styles.statusText, { color: product.isPopular ? "#4CAF50" : "#777E5C" }]}>
                  Produit populaire
                </Text>
              </View>
            </View>
          </View>
        </Container>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProduct}>
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#283106', flex: 1, textAlign: 'center' },
  editButton: { padding: 8, borderWidth: 1, borderColor: '#4CAF50', borderRadius: 8 },
  content: { flex: 1 },
  imageSection: { position: 'relative', height: 200 },
  productImage: { width: '100%', height: '100%' },
  imagesScrollView: { height: 200 },
  imagesScrollContent: { paddingHorizontal: 8 },
  productImageMultiple: { width: 200, height: 200, marginHorizontal: 4, borderRadius: 8 },
  badgesOverlay: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  detailsSection: { paddingVertical: 20 },
  section: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#283106', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  infoLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  infoLabel: { fontSize: 14, color: '#777E5C' },
  infoValue: { fontSize: 14, color: '#283106', fontWeight: '500', flex: 1, textAlign: 'right' },
  descriptionText: { fontSize: 16, color: '#555', lineHeight: 24 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBadge: {
    backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1, borderColor: '#2196F3',
  },
  tagText: { color: '#2196F3', fontSize: 12, fontWeight: '600' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { fontSize: 12, color: '#777E5C', marginTop: 4 },
  statusContainer: { gap: 8 },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { fontSize: 14, fontWeight: '500' },
  actionsContainer: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#E0E0E0',
  },
  deleteButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFEBEE', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 8, gap: 8,
  },
  deleteButtonText: { color: '#F44336', fontSize: 16, fontWeight: '600' },
});
