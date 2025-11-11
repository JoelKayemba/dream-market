import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Composant réutilisable pour l'état vide des notifications
 * Utilisé par NotificationsScreen et AdminNotificationCenter
 */
const EmptyNotifications = ({ 
  activeFilter = 'all',
  variant = 'client' // 'client' ou 'admin'
}) => {
  const getEmptyStateContent = () => {
    if (variant === 'admin') {
      return {
        icon: 'notifications-off-outline',
        title: 'Aucune notification',
        subtitle: 'Vous serez notifié des nouvelles commandes et actions importantes'
      };
    } else {
      if (activeFilter === 'unread') {
        return {
          icon: 'checkmark-circle-outline',
          title: 'Toutes vos notifications ont été lues !',
          subtitle: 'Vous êtes à jour avec toutes vos notifications'
        };
      } else {
        return {
          icon: 'notifications-off-outline',
          title: 'Aucune notification',
          subtitle: 'Aucune notification dans cette catégorie'
        };
      }
    }
  };

  const content = getEmptyStateContent();

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={content.icon} size={64} color="#777E5C" />
      <Text style={styles.emptyTitle}>{content.title}</Text>
      <Text style={styles.emptySubtitle}>{content.subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyNotifications;

