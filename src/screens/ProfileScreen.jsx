import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  Container, 
  Divider,
  Button
} from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [quickActions] = useState([
    {
      id: 1,
      title: 'Mes Commandes',
      subtitle: 'Suivre et gérer',
      icon: 'receipt-outline',
      color: '#4CAF50',
      route: 'Orders'
    },
    {
      id: 2,
      title: 'Mes Favoris',
      subtitle: 'Produits sauvegardés',
      icon: 'heart-outline',
      color: '#FF6B6B',
      route: 'Favorites'
    },
    {
      id: 3,
      title: 'Support',
      subtitle: 'Aide et contact',
      icon: 'help-circle-outline',
      color: '#2196F3',
      route: 'Support'
    },
    {
      id: 4,
      title: 'Informations',
      subtitle: 'Modifier profil',
      icon: 'person-outline',
      color: '#FF9800',
      route: 'PersonalInfo'
    },
    {
      id: 5,
      title: 'Paramètres',
      subtitle: 'Notifications, email, mot de passe',
      icon: 'cog-outline',
      color: '#9C27B0',
      route: 'Settings'
    }
  ]);

  const handleQuickAction = (action) => {
    if (action.route === 'Orders') {
      navigation.navigate('Orders');
    } else if (action.route === 'Support') {
      navigation.navigate('Support');
    } else if (action.route === 'Favorites') {
      navigation.navigate('Favorites');
        } else if (action.route === 'PersonalInfo') {
          navigation.navigate('PersonalInfo');
        } else if (action.route === 'Settings') {
          navigation.navigate('Settings');
        }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.replace('Welcome');
          }
        }
      ]
    );
  };

  // Afficher un message si pas d'utilisateur (sans redirection)
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Profil en cours de chargement...</Text>
        <Text style={{ marginBottom: 20, color: '#777E5C', textAlign: 'center', paddingHorizontal: 20 }}>
          Si le problème persiste, veuillez vous reconnecter.
        </Text>
        <Button
          title="Se reconnecter"
          onPress={() => {
            logout();
            navigation.replace('Welcome');
          }}
          variant="outline"
          style={{ width: 200 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header du profil */}
      <Container style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color="#777E5C" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
            
          </View>
        </View>
      </Container>

      <Divider />

      {/* Actions rapides */}
      <Container style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Actions Rapides</Text>
        
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => handleQuickAction(action)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Container>

      <Divider />

      {/* Bouton de déconnexion */}
      <Container style={styles.logoutSection}>
        <Button
          title="Se déconnecter"
          onPress={handleLogout}
          size="large"
          style={styles.logoutButton}
          variant="warning"
        />
        
        {/* Bouton d'accès admin (discret) */}
        {user.role === 'admin' && (
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <Text style={styles.adminButtonText}>Accès Administration</Text>
          </TouchableOpacity>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  userDetails: {
    alignItems: 'center',
  },
  userName: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
  },
  userEmail: {
    color: '#777E5C',
    fontSize: 14,
    marginBottom: 4,
  },
  userPhone: {
    color: '#777E5C',
    fontSize: 14,
    marginBottom: 4,
  },
  userAddress: {
    color: '#777E5C',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  memberSince: {
    color: '#777E5C',
    fontSize: 12,
    fontStyle: 'italic',
  },
  quickActionsSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 4,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#283106',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: '#777E5C',
    fontSize: 12,
    textAlign: 'center',
  },
  logoutSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  logoutButton: {
    minWidth: 200,
    borderColor: '#FF6B6B',
    marginBottom: 16,
  },
  adminButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  adminButtonText: {
    color: '#777E5C',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
