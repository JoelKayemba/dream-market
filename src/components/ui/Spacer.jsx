import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '../../theme';

/**
 * 📏 Composant Spacer - Composant simple pour ajouter de l'espacement
 * 
 * @param {Object} props - Propriétés du spacer
 * @param {string|number} props.size - Taille de l'espacement ('xs', 'sm', 'md', 'lg', 'xl', 'xxl' ou nombre en pixels)
 * @param {string} props.direction - Direction de l'espacement ('horizontal', 'vertical')
 * @param {Object} props.style - Styles personnalisés
 */
const Spacer = ({
  size = 'md',
  direction = 'vertical',
  style,
  ...props
}) => {
  // 🎨 Taille de l'espacement
  const getSpacingSize = () => {
    if (typeof size === 'number') {
      return size;
    }
    
    return spacing.spacing[size] || spacing.spacing.md;
  };

  // 🎨 Styles du spacer selon la direction
  const getSpacerStyles = () => {
    const spacingSize = getSpacingSize();
    
    if (direction === 'horizontal') {
      return { width: spacingSize };
    }
    
    return { height: spacingSize };
  };

  return (
    <View
      style={[getSpacerStyles(), style]}
      {...props}
    />
  );
};

// 🎨 Styles du composant
const styles = StyleSheet.create({
  // Pas de styles spécifiques nécessaires
});

export default Spacer;


