import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from './index';

/**
 * Composant réutilisable pour l'en-tête des notifications
 * Utilisé par NotificationsScreen et AdminNotificationCenter
 */
const NotificationHeader = ({ 
  title, 
  subtitle, 
  unreadCount, 
  onBack, 
  onMarkAllAsRead,
  showMarkAllButton = true,
  variant = 'default' // 'default' ou 'modal'
}) => {
  if (variant === 'modal') {
    return (
      <View style={styles.modalHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSubtitle}>
            {unreadCount} non lue(s) • {subtitle}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {unreadCount > 0 && showMarkAllButton && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={onMarkAllAsRead}
            >
              <Text style={styles.markAllText}>Tout marquer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onBack}
          >
            <Ionicons name="close" size={24} color="#777E5C" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={24} color="#283106" />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        {unreadCount > 0 && (
          <Badge 
            text={unreadCount.toString()} 
            variant="primary" 
            size="small"
            style={styles.unreadBadge}
          />
        )}
      </View>

      {showMarkAllButton && (
        <TouchableOpacity
          style={styles.markAllReadButton}
          onPress={onMarkAllAsRead}
        >
          <Text style={styles.markAllReadText}>Tout marquer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles pour l'en-tête standard
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    marginRight: 8,
  },
  unreadBadge: {
    marginLeft: 8,
  },
  markAllReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllReadText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },

  // Styles pour l'en-tête modal
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  markAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});

export default NotificationHeader;

