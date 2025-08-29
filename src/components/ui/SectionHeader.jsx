import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import Button from './Button';

export default function SectionHeader({ 
  title, 
  subtitle, 
  actionText = "Voir tout", 
  onActionPress, 
  onViewAll,
  showAction = true,
  style 
}) {
  // Utiliser onViewAll si onActionPress n'est pas fourni (pour la compatibilité)
  const handleAction = onActionPress || onViewAll;
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleContainer}>
        <Text variant="h2" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="body" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {showAction && handleAction && (
        <TouchableOpacity onPress={handleAction} style={styles.actionContainer}>
          <Button
            title={actionText}
            onPress={handleAction}
            variant="ghost"
            size="small"
            style={styles.actionButton}
          />
          <Ionicons name="chevron-forward" size={14} color="#283106" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  titleContainer: {
    flex: 1,
    marginRight: 5,
  },
  title: {
    color: '#283106',
    fontWeight: 'bold',
    marginBottom: 3,
    fontSize: 18,
    lineHeight: 20,
  },
  subtitle: {
    color: '#777E5C',
    fontSize: 13,
    lineHeight: 15,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 100,
    justifyContent: 'flex-end',
    flex: 0,
  },
  actionButton: {
    paddingHorizontal: 8,
    minHeight: 28,
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
