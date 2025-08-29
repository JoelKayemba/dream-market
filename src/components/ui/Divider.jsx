import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

/**
 * ➗ Composant Divider - Ligne de séparation entre les sections
 * 
 * @param {Object} props - Propriétés du divider
 * @param {string} props.variant - Variante du divider ('solid', 'dashed', 'dotted')
 * @param {string} props.color - Couleur de la ligne
 * @param {number} props.thickness - Épaisseur de la ligne
 * @param {string} props.orientation - Orientation ('horizontal', 'vertical')
 * @param {number} props.margin - Marge autour du divider
 * @param {Object} props.style - Styles personnalisés
 */
const Divider = ({
  variant = 'solid',
  color = colors.border.light,
  thickness = 1,
  orientation = 'horizontal',
  margin = spacing.spacing.sm,
  style,
  ...props
}) => {
  // 🎨 Styles du divider selon la variante
  const getDividerStyles = () => {
    const baseStyles = {
      backgroundColor: color,
      margin: margin,
    };

    if (orientation === 'vertical') {
      return {
        ...baseStyles,
        width: thickness,
        height: '100%',
        alignSelf: 'stretch',
      };
    }

    // 🎨 Styles horizontaux
    const horizontalStyles = {
      ...baseStyles,
      height: thickness,
      width: '100%',
    };

    // 🎨 Styles selon la variante
    switch (variant) {
      case 'dashed':
        return {
          ...horizontalStyles,
          borderStyle: 'dashed',
          borderWidth: thickness,
          borderColor: color,
          backgroundColor: 'transparent',
        };
      case 'dotted':
        return {
          ...horizontalStyles,
          borderStyle: 'dotted',
          borderWidth: thickness,
          borderColor: color,
          backgroundColor: 'transparent',
        };
      default:
        return horizontalStyles;
    }
  };

  return (
    <View
      style={[getDividerStyles(), style]}
      {...props}
    />
  );
};

// 🎨 Styles du composant
const styles = StyleSheet.create({
  // Pas de styles spécifiques nécessaires
});

export default Divider;


