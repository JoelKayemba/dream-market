import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

/**
 * 🎯 Composant Icon - Icône Ionicons avec intégration du thème
 * 
 * @param {Object} props - Propriétés de l'icône
 * @param {string} props.name - Nom de l'icône Ionicons
 * @param {number} props.size - Taille de l'icône
 * @param {string} props.color - Couleur de l'icône
 * @param {string} props.variant - Variante de couleur ('primary', 'secondary', 'success', 'warning', 'error', 'info')
 * @param {Object} props.style - Styles personnalisés
 * @param {Function} props.onPress - Fonction appelée lors du clic
 * @param {boolean} props.pressable - Si l'icône est cliquable
 */
const Icon = ({
  name,
  size = 24,
  color,
  variant,
  style,
  onPress,
  pressable = false,
  ...props
}) => {
  // 🎨 Couleur de l'icône
  const getIconColor = () => {
    if (color) return color;
    
    if (variant) {
      return colors[variant]?.main || colors.primary.main;
    }
    
    return colors.text.primary;
  };

  // 🎨 Taille de l'icône
  const getIconSize = () => {
    if (typeof size === 'string') {
      const sizeMap = {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 32,
        xl: 40,
        xxl: 48,
      };
      return sizeMap[size] || 24;
    }
    return size;
  };

  // 🎨 Rendu de l'icône
  const renderIcon = () => (
    <Ionicons
      name={name}
      size={getIconSize()}
      color={getIconColor()}
      style={[styles.icon, style]}
      {...props}
    />
  );

  // 🎨 Si l'icône est cliquable, l'envelopper dans un TouchableOpacity
  if (pressable || onPress) {
    const TouchableOpacity = require('react-native').TouchableOpacity;
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.pressable}
        activeOpacity={0.7}
        {...props}
      >
        {renderIcon()}
      </TouchableOpacity>
    );
  }

  return renderIcon();
};

// 🎨 Styles du composant
const styles = StyleSheet.create({
  icon: {
    // Styles de base pour l'icône
  },
  pressable: {
    // Styles pour l'icône cliquable
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Icon;
