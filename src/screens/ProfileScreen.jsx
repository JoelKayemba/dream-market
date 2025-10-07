import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  Container, 
  Divider,
  Button,
  ScreenWrapper 
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
      subtitle: 'Notifications, sécurité',
      icon: 'settings-outline',
      color: '#9C27B0',
      route: 'Settings'
    },
    /*{
      id: 6,
      title: 'Adresses',
      subtitle: 'Gérer mes adresses',
      icon: 'location-outline',
      color: '#607D8B',
      route: 'Addresses'
    }*/
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
    } else if (action.route === 'Addresses') {
      navigation.navigate('Addresses');
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

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#777E5C" />
        <Text style={styles.loadingTitle}>Profil en cours de chargement...</Text>
        <Text style={styles.loadingSubtitle}>
          Si le problème persiste, veuillez vous reconnecter.
        </Text>
        <Button
          title="Se reconnecter"
          onPress={() => {
            logout();
            navigation.replace('Welcome');
          }}
          variant="outline"
          style={styles.reconnectButton}
        />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color="#FFFFFF" />
              </View>
              {user.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Commandes</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>8</Text>
                  <Text style={styles.statLabel}>Favoris</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>2</Text>
                  <Text style={styles.statLabel}>Adresses</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <Text style={styles.sectionSubtitle}>Gérez votre compte et vos préférences</Text>
          
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => handleQuickAction(action)}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon} size={20} color={action.color} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E0" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

       
        {user.role === 'admin' && (
          <View style={styles.section}>
            <View style={styles.adminSection}>
              <View style={styles.adminHeader}>
                <Ionicons name="shield-checkmark" size={20} color="#9C27B0" />
                <Text style={styles.adminTitle}>Espace Administrateur</Text>
              </View>
              <Text style={styles.adminSubtitle}>
                Accédez au tableau de bord d'administration
              </Text>
              <Button
                title="Accéder à l'administration"
                onPress={() => navigation.navigate('AdminDashboard')}
                variant="primary"
                size="small"
                style={styles.adminButton}
                icon="shield-outline"
              />
            </View>
          </View>
        )}

        
        <View style={styles.section}>
          <View style={styles.logoutSection}>
            <Button
              title="Se déconnecter"
              onPress={handleLogout}
              size="large"
              style={styles.logoutButton}
              variant="warning"
              icon="log-out-outline"
            />
            
            <Text style={styles.versionText}>
              Version 1.0.0 • Dream Market
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  reconnectButton: {
    width: 200,
  },
  header: {

    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  adminBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#9C27B0',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#718096',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 20,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#718096',
  },
  adminSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginLeft: 8,
  },
  adminSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
    lineHeight: 20,
  },
  adminButton: {
    alignSelf: 'flex-start',
  },
  logoutSection: {
    alignItems: 'center',
    paddingTop: 8,
  },
  logoutButton: {
    width: '100%',
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});