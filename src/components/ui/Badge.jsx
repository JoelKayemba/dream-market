import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * 🏷️ Composant Badge - Badge simple et fonctionnel
 * 
 * @param {Object} props - Propriétés du badge
 * @param {string} props.text - Texte du badge
 * @param {string} props.variant - Variante du badge ('default', 'primary', 'success', 'warning', 'error', 'info')
 * @param {string} props.size - Taille du badge ('small', 'medium', 'large')
 * @param {Object} props.style - Styles personnalisés
 */
const Badge = ({
  text,
  variant = 'default',
  size = 'medium',
  style,
  ...props
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[size], style]} {...props}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}>
        {text}
      </Text>
    </View>
  );
};

// 🎨 Styles du composant
const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
  },
  
  // 📏 Tailles
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 16,
  },
  medium: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    minWidth: 20,
  },
  large: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 24,
  },
  
  // 🌈 Variantes de couleurs
  default: {
    backgroundColor: '#E0E0E0',
  },
  primary: {
    backgroundColor: '#283106',
  },
  success: {
    backgroundColor: '#4CAF50',
  },
  warning: {
    backgroundColor: '#FF9800',
  },
  error: {
    backgroundColor: '#F44336',
  },
  info: {
    backgroundColor: '#2196F3',
  },
  
  // 📝 Styles du texte
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // 🌈 Couleurs du texte selon la variante
  defaultText: {
    color: '#FFF',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  successText: {
    color: '#FFFFFF',
  },
  warningText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#FFFFFF',
  },
  infoText: {
    color: '#FFFFFF',
  },
  
  // 📏 Tailles du texte
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});

export default Badge;
