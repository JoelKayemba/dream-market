import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Divider  , ScreenWrapper } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function SettingsScreen({ navigation }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    marketing: false,
    updates: true,
    orders: true,
    promotions: false,
  });

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };


  const handleChangePassword = () => {
    navigation.navigate('PasswordChange');
  };

  const handleNotificationsSettings = () => {
    navigation.navigate('NotificationsSettings');
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Paramètres de confidentialité',
      'Cette fonctionnalité sera disponible prochainement.',
      [{ text: 'OK' }]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export des données',
      'Cette fonctionnalité sera disponible prochainement.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront supprimées définitivement.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmation',
              'Êtes-vous absolument sûr de vouloir supprimer votre compte ?',
              [
                { text: 'Non', style: 'cancel' },
                { text: 'Oui, supprimer', style: 'destructive' }
              ]
            );
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent, 
    danger = false,
    iconColor = '#283106'
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, danger && styles.dangerItem]} 
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={danger ? '#FF6B6B' : iconColor} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, danger && styles.dangerSubtext]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent || (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={danger ? '#FF6B6B' : '#777E5C'} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper >
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Container style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#283106" />
          </TouchableOpacity>
          <Text style={styles.title}>Paramètres</Text>
          <View style={styles.placeholder} />
        </View>
      </Container>

      {/* Compte */}
      <Container style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        
        
        <SettingItem
          icon="lock-closed-outline"
          title="Changer le mot de passe"
          subtitle="Mettre à jour votre mot de passe"
          onPress={handleChangePassword}
        />
        
        <Divider style={styles.divider} />
        
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Gérer vos préférences de notification"
          onPress={handleNotificationsSettings}
          rightComponent={
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {Object.values(notifications).filter(Boolean).length}
              </Text>
            </View>
          }
        />
      </Container>

      {/* Confidentialité et sécurité */}
      <Container style={styles.section}>
        <Text style={styles.sectionTitle}>Confidentialité et sécurité</Text>
        
        <SettingItem
          icon="shield-checkmark-outline"
          title="Paramètres de confidentialité"
          subtitle="Gérer vos données personnelles"
          onPress={handlePrivacySettings}
        />
        
        <Divider style={styles.divider} />
        
     
      </Container>

      {/* Notifications rapides */}
      <Container style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications rapides</Text>
        
        <View style={styles.switchContainer}>
          <View style={styles.switchLeft}>
            <Ionicons name="phone-portrait-outline" size={20} color="#283106" />
            <Text style={styles.switchTitle}>Notifications push</Text>
          </View>
          <Switch
            value={notifications.push}
            onValueChange={() => handleNotificationChange('push')}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={notifications.push ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.switchContainer}>
          <View style={styles.switchLeft}>
            <Ionicons name="mail-outline" size={20} color="#283106" />
            <Text style={styles.switchTitle}>Notifications email</Text>
          </View>
          <Switch
            value={notifications.email}
            onValueChange={() => handleNotificationChange('email')}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={notifications.email ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.switchContainer}>
          <View style={styles.switchLeft}>
            <Ionicons name="megaphone-outline" size={20} color="#283106" />
            <Text style={styles.switchTitle}>Promotions et offres</Text>
          </View>
          <Switch
            value={notifications.promotions}
            onValueChange={() => handleNotificationChange('promotions')}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={notifications.promotions ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </Container>

      {/* Danger Zone */}
      <Container style={styles.section}>
        <Text style={styles.sectionTitle}>Zone de danger</Text>
        
        <SettingItem
          icon="trash-outline"
          title="Supprimer le compte"
          subtitle="Supprimer définitivement votre compte"
          onPress={handleDeleteAccount}
          danger={true}
        />
      </Container>

      <View style={{ height: 40 }} />
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
    
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  title: {
    
    fontWeight: 'bold',
    fontSize: 20,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: '#FFE6E6',
    backgroundColor: '#FFF8F8',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
  },
  dangerText: {
    color: '#FF6B6B',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  dangerSubtext: {
    color: '#FF9999',
  },
  divider: {
    marginVertical: 5,
  },
  notificationBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginLeft: 15,
  },
});
