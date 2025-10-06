import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button, Input } from '../../../components/ui';

export default function UserRoles({ navigation }) {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    // TODO: Remplacer par un appel API réel
    setRoles([
      { id: 1, name: 'client', label: 'Client', description: 'Utilisateur standard', permissions: ['view_products', 'place_orders'], userCount: 1200 },
      { id: 2, name: 'fermier', label: 'Fermier', description: 'Producteur agricole', permissions: ['manage_products', 'view_orders'], userCount: 45 },
      { id: 3, name: 'admin', label: 'Administrateur', description: 'Accès complet', permissions: ['all'], userCount: 3 },
    ]);
    setLoading(false);
  };

  const handleAddRole = () => {
    if (!newRole.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de rôle');
      return;
    }

    const role = {
      id: Date.now(),
      name: newRole.trim().toLowerCase(),
      label: newRole.trim(),
      description: 'Nouveau rôle',
      permissions: [],
      userCount: 0
    };

    setRoles([...roles, role]);
    setNewRole('');
    Alert.alert('Succès', 'Rôle ajouté avec succès');
  };

  const handleDeleteRole = (role) => {
    if (role.userCount > 0) {
      Alert.alert(
        'Impossible de supprimer',
        'Ce rôle est utilisé par des utilisateurs. Veuillez d\'abord réassigner les utilisateurs.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Supprimer le rôle',
      `Êtes-vous sûr de vouloir supprimer le rôle "${role.label}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setRoles(roles.filter(r => r.id !== role.id));
            Alert.alert('Succès', 'Rôle supprimé');
          }
        }
      ]
    );
  };

  const RoleCard = ({ role }) => (
    <View style={styles.roleCard}>
      <View style={styles.roleHeader}>
        <View style={styles.roleInfo}>
          <Text style={styles.roleName}>{role.label}</Text>
          <Text style={styles.roleDescription}>{role.description}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRole(role)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.roleDetails}>
        <Text style={styles.roleUserCount}>
          {role.userCount} utilisateur{role.userCount > 1 ? 's' : ''}
        </Text>
        <Text style={styles.rolePermissions}>
          Permissions: {role.permissions.length > 0 ? role.permissions.join(', ') : 'Aucune'}
        </Text>
      </View>
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
        <Text style={styles.headerTitle}>Gestion des Rôles</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Formulaire d'ajout */}
        <Container style={styles.addSection}>
          <Text style={styles.sectionTitle}>Ajouter un Rôle</Text>
          <View style={styles.addForm}>
            <Input
              value={newRole}
              onChangeText={setNewRole}
              placeholder="Nom du nouveau rôle"
              style={styles.roleInput}
            />
            <Button
              title="Ajouter"
              onPress={handleAddRole}
              variant="primary"
              style={styles.addButton}
            />
          </View>
        </Container>

        {/* Liste des rôles */}
        <Container style={styles.rolesSection}>
          <Text style={styles.sectionTitle}>Rôles Existants</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des rôles...</Text>
            </View>
          ) : (
            <View style={styles.rolesList}>
              {roles.map((role) => (
                <RoleCard key={role.id} role={role} />
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
  roleInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    paddingHorizontal: 20,
  },
  rolesSection: {
    paddingVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  rolesList: {
    gap: 12,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: '#777E5C',
  },
  deleteButton: {
    padding: 8,
  },
  roleDetails: {
    gap: 4,
  },
  roleUserCount: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  rolePermissions: {
    fontSize: 14,
    color: '#777E5C',
  },
});




