import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Divider } from '../components/ui';

export default function NotificationsSettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState({
    // Notifications générales
    push: true,
    email: true,
    sms: false,
    
    // Notifications de commandes
    orderUpdates: true,
    orderConfirmations: true,
    orderDeliveries: true,
    orderCancellations: true,
    
    // Notifications de produits
    productUpdates: false,
    priceDrops: true,
    newProducts: true,
    stockAlerts: true,
    
    // Notifications marketing
    promotions: false,
    newsletters: false,
    specialOffers: false,
    
    // Notifications de compte
    accountUpdates: true,
    securityAlerts: true,
    paymentReminders: false,
    
    // Notifications sociales
    farmUpdates: false,
    reviews: false,
    recommendations: true,
  });

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Réinitialiser',
      'Voulez-vous réinitialiser toutes les notifications aux paramètres par défaut ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          onPress: () => {
            setNotifications({
              push: true,
              email: true,
              sms: false,
              orderUpdates: true,
              orderConfirmations: true,
              orderDeliveries: true,
              orderCancellations: true,
              productUpdates: false,
              priceDrops: true,
              newProducts: true,
              stockAlerts: true,
              promotions: false,
              newsletters: false,
              specialOffers: false,
              accountUpdates: true,
              securityAlerts: true,
              paymentReminders: false,
              farmUpdates: false,
              reviews: false,
              recommendations: true,
            });
          }
        }
      ]
    );
  };

  const NotificationGroup = ({ title, children }) => (
    <Container style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      {children}
    </Container>
  );

  const NotificationItem = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onValueChange, 
    type = 'switch',
    color = '#283106'
  }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationLeft}>
        <Ionicons name={icon} size={20} color={color} />
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.notificationSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
          thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : (
        <TouchableOpacity style={styles.selectButton}>
          <Text style={styles.selectButtonText}>Choisir</Text>
          <Ionicons name="chevron-forward" size={16} color="#777E5C" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
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
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetToDefaults}
          >
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>
      </Container>

      {/* Notifications générales */}
      <NotificationGroup title="Notifications générales">
        <NotificationItem
          icon="phone-portrait-outline"
          title="Notifications push"
          subtitle="Recevoir des notifications sur votre appareil"
          value={notifications.push}
          onValueChange={() => handleNotificationChange('push')}
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="mail-outline"
          title="Notifications email"
          subtitle="Recevoir des notifications par email"
          value={notifications.email}
          onValueChange={() => handleNotificationChange('email')}
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="chatbubble-outline"
          title="Notifications SMS"
          subtitle="Recevoir des notifications par SMS"
          value={notifications.sms}
          onValueChange={() => handleNotificationChange('sms')}
        />
      </NotificationGroup>

      {/* Notifications de commandes */}
      <NotificationGroup title="Commandes">
        <NotificationItem
          icon="receipt-outline"
          title="Mises à jour de commande"
          subtitle="Suivi de vos commandes"
          value={notifications.orderUpdates}
          onValueChange={() => handleNotificationChange('orderUpdates')}
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="checkmark-circle-outline"
          title="Confirmations de commande"
          subtitle="Confirmation de vos nouvelles commandes"
          value={notifications.orderConfirmations}
          onValueChange={() => handleNotificationChange('orderConfirmations')}
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="car-outline"
          title="Livraisons"
          subtitle="Notifications de livraison"
          value={notifications.orderDeliveries}
          onValueChange={() => handleNotificationChange('orderDeliveries')}
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="close-circle-outline"
          title="Annulations"
          subtitle="Notifications d'annulation de commande"
          value={notifications.orderCancellations}
          onValueChange={() => handleNotificationChange('orderCancellations')}
          color="#FF6B6B"
        />
      </NotificationGroup>

      {/* Notifications de produits */}
      <NotificationGroup title="Produits">
        <NotificationItem
          icon="pricetag-outline"
          title="Baisses de prix"
          subtitle="Alertes quand vos produits favoris baissent de prix"
          value={notifications.priceDrops}
          onValueChange={() => handleNotificationChange('priceDrops')}
          color="#FF9800"
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="star-outline"
          title="Nouveaux produits"
          subtitle="Découvrir les nouveaux produits"
          value={notifications.newProducts}
          onValueChange={() => handleNotificationChange('newProducts')}
          color="#2196F3"
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="warning-outline"
          title="Alertes de stock"
          subtitle="Produits bientôt en rupture de stock"
          value={notifications.stockAlerts}
          onValueChange={() => handleNotificationChange('stockAlerts')}
          color="#FF5722"
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="refresh-outline"
          title="Mises à jour de produits"
          subtitle="Informations sur vos produits suivis"
          value={notifications.productUpdates}
          onValueChange={() => handleNotificationChange('productUpdates')}
        />
      </NotificationGroup>

      {/* Notifications marketing */}
      <NotificationGroup title="Marketing et promotions">
        <NotificationItem
          icon="megaphone-outline"
          title="Promotions"
          subtitle="Offres spéciales et réductions"
          value={notifications.promotions}
          onValueChange={() => handleNotificationChange('promotions')}
          color="#9C27B0"
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="newspaper-outline"
          title="Newsletters"
          subtitle="Actualités et conseils"
          value={notifications.newsletters}
          onValueChange={() => handleNotificationChange('newsletters')}
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="gift-outline"
          title="Offres spéciales"
          subtitle="Offres exclusives pour vous"
          value={notifications.specialOffers}
          onValueChange={() => handleNotificationChange('specialOffers')}
          color="#FF6B6B"
        />
      </NotificationGroup>

      {/* Notifications de compte */}
      <NotificationGroup title="Compte et sécurité">
        <NotificationItem
          icon="person-outline"
          title="Mises à jour de compte"
          subtitle="Changements de profil et paramètres"
          value={notifications.accountUpdates}
          onValueChange={() => handleNotificationChange('accountUpdates')}
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="shield-checkmark-outline"
          title="Alertes de sécurité"
          subtitle="Connexions suspectes et sécurité"
          value={notifications.securityAlerts}
          onValueChange={() => handleNotificationChange('securityAlerts')}
          color="#4CAF50"
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="card-outline"
          title="Rappels de paiement"
          subtitle="Rappels pour les paiements en attente"
          value={notifications.paymentReminders}
          onValueChange={() => handleNotificationChange('paymentReminders')}
          color="#FF9800"
        />
      </NotificationGroup>

      {/* Notifications sociales */}
      <NotificationGroup title="Social et recommandations">
        <NotificationItem
          icon="business-outline"
          title="Mises à jour des fermes"
          subtitle="Actualités de vos fermes suivies"
          value={notifications.farmUpdates}
          onValueChange={() => handleNotificationChange('farmUpdates')}
          color="#8BC34A"
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          title="Avis et commentaires"
          subtitle="Nouveaux avis sur vos produits"
          value={notifications.reviews}
          onValueChange={() => handleNotificationChange('reviews')}
          icon="star-outline"
          color="#FFC107"
        />
        
        <Divider style={styles.divider} />
        
        <NotificationItem
          icon="bulb-outline"
          title="Recommandations"
          subtitle="Produits qui pourraient vous intéresser"
          value={notifications.recommendations}
          onValueChange={() => handleNotificationChange('recommendations')}
          color="#00BCD4"
        />
      </NotificationGroup>

      <View style={{ height: 40 }} />
    </ScrollView>
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
  resetButton: {
    padding: 8,
  },
  resetButtonText: {
   
    fontSize: 14,
    fontWeight: '600',
  },
  group: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 15,
  },
  notificationItem: {
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
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 15,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  selectButtonText: {
    color: '#777E5C',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 5,
  },
});
