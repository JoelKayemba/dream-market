import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Container, Button , ScreenWrapper } from '../../../components/ui';

export default function UsersManagement({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    // TODO: Remplacer par un appel API réel
    setUsers([
      { id: 1, name: 'Jean Dupont', email: 'jean@example.com', role: 'client', status: 'active', joinDate: '2024-01-10' },
      { id: 2, name: 'Marie Martin', email: 'marie@example.com', role: 'fermier', status: 'active', joinDate: '2024-01-08' },
      { id: 3, name: 'Pierre Durand', email: 'pierre@example.com', role: 'admin', status: 'active', joinDate: '2024-01-05' },
    ]);
    setLoading(false);
  };

  const handleAddUser = () => {
    navigation.navigate('UserForm', { mode: 'add' });
  };

  const handleEditUser = (user) => {
    navigation.navigate('UserForm', { mode: 'edit', user });
  };

  const handleToggleUserStatus = (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    Alert.alert(
      `${newStatus === 'active' ? 'Activer' : 'Désactiver'} l'utilisateur`,
      `Êtes-vous sûr de vouloir ${newStatus === 'active' ? 'activer' : 'désactiver'} "${user.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: newStatus === 'active' ? 'Activer' : 'Désactiver', 
          onPress: () => {
            // TODO: Implémenter le changement de statut
          }
        }
      ]
    );
  };

  const UserCard = ({ user }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <View style={styles.userStatus}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: user.status === 'active' ? '#4CAF50' : '#FF6B6B' }
          ]}>
            <Text style={styles.statusText}>
              {user.status === 'active' ? 'Actif' : 'Inactif'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.userDetails}>
        <Text style={styles.userRole}>Rôle: {user.role}</Text>
        <Text style={styles.userJoinDate}>Inscrit le: {user.joinDate}</Text>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditUser(user)}
        >
          <Ionicons name="pencil-outline" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleToggleUserStatus(user)}
        >
          <Ionicons 
            name={user.status === 'active' ? 'pause-circle-outline' : 'play-circle-outline'} 
            size={20} 
            color={user.status === 'active' ? '#FF9800' : '#4CAF50'} 
          />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
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
        <Text style={styles.headerTitle}>Gestion des Utilisateurs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddUser}
        >
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.usersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Liste des Utilisateurs</Text>
            <Text style={styles.sectionSubtitle}>{users.length} utilisateur(s)</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des utilisateurs...</Text>
            </View>
          ) : (
            <View style={styles.usersList}>
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </View>
          )}
        </Container>
      </ScrollView>
    </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  usersSection: {
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
  usersList: {
    gap: 12,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#777E5C',
  },
  userStatus: {
    marginLeft: 8,
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
  userDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userRole: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  userJoinDate: {
    fontSize: 14,
    color: '#777E5C',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});




