import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Switch, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Container, ScreenWrapper } from '../components/ui';

export default function NotificationsSettingsScreen({ navigation }) {
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'état des notifications au démarrage
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      const savedState = await AsyncStorage.getItem('pushNotificationsEnabled');
      
      // Si les permissions sont accordées et l'état sauvegardé est true
      const isEnabled = status === 'granted' && savedState === 'true';
      setPushNotificationsEnabled(isEnabled);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePushNotifications = async (value) => {
    if (value) {
      // Activer les notifications - Demander l'autorisation
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Alert.alert(
            'Autorisation refusée',
            'Vous devez autoriser les notifications dans les paramètres de votre appareil pour recevoir des notifications.',
            [
              { text: 'OK', style: 'cancel' }
            ]
          );
          setPushNotificationsEnabled(false);
          await AsyncStorage.setItem('pushNotificationsEnabled', 'false');
          return;
        }

        // Autorisation accordée
        setPushNotificationsEnabled(true);
        await AsyncStorage.setItem('pushNotificationsEnabled', 'true');
        
        Alert.alert(
          'Notifications activées',
          'Vous recevrez désormais des notifications pour vos commandes et les nouveautés.',
          [{ text: 'OK' }]
        );
      } catch (error) {
        console.error('Erreur lors de l\'activation des notifications:', error);
        Alert.alert('Erreur', 'Impossible d\'activer les notifications.');
        setPushNotificationsEnabled(false);
      }
    } else {
      // Désactiver les notifications
      setPushNotificationsEnabled(false);
      await AsyncStorage.setItem('pushNotificationsEnabled', 'false');
      
      Alert.alert(
        'Notifications désactivées',
        'Vous ne recevrez plus de notifications push.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScreenWrapper >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Icône de notification */}
        <View style={styles.iconContainer}>
          <View style={[
            styles.iconCircle,
            { backgroundColor: pushNotificationsEnabled ? '#4CAF50' : '#E0E0E0' }
          ]}>
            <Ionicons 
              name={pushNotificationsEnabled ? "notifications" : "notifications-off"} 
              size={60} 
              color="#FFFFFF" 
            />
          </View>
        </View>

        {/* Titre et description */}
        <Text style={styles.mainTitle}>Notifications Push</Text>
        <Text style={styles.description}>
          {pushNotificationsEnabled
            ? "Vous recevez des notifications pour vos commandes, nouveaux produits et promotions."
            : "Activez les notifications pour rester informé de vos commandes et des nouveautés."}
        </Text>

        {/* Switch de notification */}
        <Container style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Ionicons 
                name="phone-portrait-outline" 
                size={24} 
                color={pushNotificationsEnabled ? '#4CAF50' : '#777E5C'} 
              />
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Notifications Push</Text>
                <Text style={styles.switchSubtitle}>
                  {pushNotificationsEnabled ? 'Activées' : 'Désactivées'}
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={handleTogglePushNotifications}
              disabled={isLoading}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor='#FFFFFF'
              ios_backgroundColor="#E0E0E0"
            />
          </View>
        </Container>

        {/* Informations sur les notifications */}
        <Container style={styles.infoContainer}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
            <Text style={styles.infoTitle}>Types de notifications</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Confirmations de commande</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Statut de livraison</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Nouveaux produits</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Promotions spéciales</Text>
            </View>
          </View>
        </Container>

        {/* Note de confidentialité */}
        <View style={styles.privacyNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#777E5C" />
          <Text style={styles.privacyText}>
            Vos données sont sécurisées. Vous pouvez désactiver les notifications à tout moment.
          </Text>
        </View>
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  switchContainer: {
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchText: {
    marginLeft: 15,
    flex: 1,
  },
  switchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#777E5C',
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginLeft: 8,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#555',
    marginLeft: 10,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: '#777E5C',
    marginLeft: 8,
    lineHeight: 18,
  },
});
