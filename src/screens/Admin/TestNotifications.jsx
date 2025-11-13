import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Container , ScreenWrapper } from '../../components/ui';
import AdminNotificationCenter from '../../components/admin/AdminNotificationCenter';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import { useDispatch } from 'react-redux';
import { fetchOrders } from '../../store/admin/ordersSlice';

export default function TestNotifications({ navigation }) {
  const dispatch = useDispatch();
  const { 
    adminNotifications, 
    unreadAdminNotifications, 
    unreadAdminCount,
    markAsRead 
  } = useAdminNotifications();

  const [isTesting, setIsTesting] = useState(false);

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      await dispatch(fetchOrders({ page: 0, refresh: true }));
      Alert.alert('Test', 'Rechargement des commandes effectué. Vérifiez les notifications !');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors du test : ' + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Effacer les notifications',
      'Voulez-vous marquer toutes les notifications comme lues ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            adminNotifications.forEach(notification => {
              markAsRead(notification.id);
            });
            Alert.alert('Succès', 'Toutes les notifications ont été marquées comme lues');
          }
        }
      ]
    );
  };

  const TestCard = ({ title, description, icon, color, onPress, badge }) => (
    <TouchableOpacity style={styles.testCard} onPress={onPress}>
      <View style={styles.testCardHeader}>
        <View style={[styles.testIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        {badge && badge > 0 && (
          <View style={styles.testBadge}>
            <Text style={styles.testBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.testTitle}>{title}</Text>
      <Text style={styles.testDescription}>{description}</Text>
    </TouchableOpacity>
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Test Notifications Admin</Text>
          <Text style={styles.headerSubtitle}>
            {unreadAdminCount} non lue(s) • {adminNotifications.length} total
          </Text>
        </View>
        <AdminNotificationCenter navigation={navigation} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistiques */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques des Notifications</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{adminNotifications.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{unreadAdminCount}</Text>
              <Text style={styles.statLabel}>Non lues</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {adminNotifications.filter(n => n.type === 'admin_order').length}
              </Text>
              <Text style={styles.statLabel}>Nouvelles commandes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {adminNotifications.filter(n => n.type === 'admin_pending').length}
              </Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
          </View>
        </Container>

        {/* Actions de test */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Actions de Test</Text>
          <View style={styles.testsGrid}>
            <TestCard
              title="Recharger les commandes"
              description="Force le rechargement des commandes pour détecter les nouvelles"
              icon="refresh"
              color="#4CAF50"
              onPress={handleTestNotification}
            />
            <TestCard
              title="Marquer tout comme lu"
              description="Marque toutes les notifications comme lues"
              icon="checkmark-done"
              color="#2196F3"
              onPress={handleClearAllNotifications}
              badge={unreadAdminCount}
            />
            <TestCard
              title="Voir toutes les notifications"
              description="Ouvre le centre de notifications"
              icon="notifications"
              color="#FF9800"
              onPress={() => {/* Le composant AdminNotificationCenter gère l'ouverture */}}
              badge={unreadAdminCount}
            />
            <TestCard
              title="Aller aux commandes"
              description="Navigue vers la gestion des commandes"
              icon="list"
              color="#9C27B0"
              onPress={() => navigation.navigate('OrdersManagement')}
            />
          </View>
        </Container>

        {/* Liste des notifications récentes */}
        <Container style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications Récentes</Text>
          {adminNotifications.length > 0 ? (
            <View style={styles.notificationsList}>
              {adminNotifications.slice(0, 5).map((notification) => (
                <View 
                  key={notification.id} 
                  style={[
                    styles.notificationItem,
                    !notification.isRead && styles.unreadNotification
                  ]}
                >
                  <View style={styles.notificationHeader}>
                    <Ionicons 
                      name={notification.type === 'admin_order' ? 'add-circle' : 'time'} 
                      size={20} 
                      color={notification.data?.urgent ? '#FF5722' : '#4CAF50'} 
                    />
                    <Text style={[
                      styles.notificationTitle,
                      !notification.isRead && styles.unreadText
                    ]}>
                      {notification.title}
                    </Text>
                    {!notification.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
                  {notification.data?.urgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>URGENT</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={60} color="#777E5C" />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptySubtitle}>
                Les notifications apparaîtront ici quand de nouvelles commandes arriveront
              </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#777E5C',
    textAlign: 'center',
    marginTop: 4,
  },
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  testCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  testIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBadge: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  testBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 12,
    color: '#777E5C',
    lineHeight: 16,
  },
  notificationsList: {
    gap: 8,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    flex: 1,
    marginLeft: 8,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#777E5C',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  urgentBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
