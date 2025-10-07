import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Container, Button, Input , ScreenWrapper } from '../../../components/ui';

export default function ServiceCategories({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    // TODO: Remplacer par un appel API réel
    setCategories([
      { id: 1, name: 'Livraison', serviceCount: 8, icon: '🚚' },
      { id: 2, name: 'Installation', serviceCount: 5, icon: '🔧' },
      { id: 3, name: 'Conseil', serviceCount: 12, icon: '💡' },
      { id: 4, name: 'Maintenance', serviceCount: 6, icon: '🛠️' },
    ]);
    setLoading(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de catégorie');
      return;
    }

    const category = {
      id: Date.now(),
      name: newCategory.trim(),
      serviceCount: 0,
      icon: '⚙️'
    };

    setCategories([...categories, category]);
    setNewCategory('');
    Alert.alert('Succès', 'Catégorie ajoutée avec succès');
  };

  const handleDeleteCategory = (category) => {
    if (category.serviceCount > 0) {
      Alert.alert(
        'Impossible de supprimer',
        'Cette catégorie contient des services. Veuillez d\'abord déplacer ou supprimer les services.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Supprimer la catégorie',
      `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setCategories(categories.filter(c => c.id !== category.id));
            Alert.alert('Succès', 'Catégorie supprimée');
          }
        }
      ]
    );
  };

  const CategoryCard = ({ category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCategory(category)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
      <Text style={styles.serviceCount}>
        {category.serviceCount} service{category.serviceCount > 1 ? 's' : ''}
      </Text>
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catégories de Services</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Formulaire d'ajout */}
        <Container style={styles.addSection}>
          <Text style={styles.sectionTitle}>Ajouter une Catégorie</Text>
          <View style={styles.addForm}>
            <Input
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Nom de la nouvelle catégorie"
              style={styles.categoryInput}
            />
            <Button
              title="Ajouter"
              onPress={handleAddCategory}
              variant="primary"
              style={styles.addButton}
            />
          </View>
        </Container>

        {/* Liste des catégories */}
        <Container style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Catégories Existantes</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des catégories...</Text>
            </View>
          ) : (
            <View style={styles.categoriesList}>
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </View>
          )}
        </Container>
      </ScrollView>
    </ScreenWrapper>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  addSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 16,
  },
  addForm: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  categoryInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    paddingHorizontal: 20,
  },
  categoriesSection: {
    paddingVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  categoriesList: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
  },
  deleteButton: {
    padding: 8,
  },
  serviceCount: {
    fontSize: 14,
    color: '#777E5C',
  },
});




