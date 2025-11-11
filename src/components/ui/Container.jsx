import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme';

/**
 * 📦 Composant Container - Conteneur avec marges et paddings cohérents
 * 
 * @param {Object} props - Propriétés du container
 * @param {React.ReactNode} props.children - Contenu du container
 * @param {string} props.variant - Variante du container ('default', 'fluid', 'narrow', 'wide')
 * @param {string} props.padding - Padding du container ('none', 'sm', 'md', 'lg', 'xl')
 * @param {string} props.margin - Marge du container ('none', 'sm', 'md', 'lg', 'xl')
 * @param {boolean} props.centerContent - Centrer le contenu horizontalement
 * @param {string} props.backgroundColor - Couleur de fond personnalisée
 * @param {boolean} props.elevated - Ajouter une élévation/ombre
 * @param {string} props.borderRadius - Rayon de bordure personnalisé
 * @param {Object} props.style - Styles personnalisés
 */
const Container = ({
  children,
  variant = 'default',
  padding = 'md',
  margin = 'none',
  centerContent = false,
  backgroundColor,
  elevated = false,
  borderRadius,
  style,
  ...props
}) => {
  // 🎨 Padding selon la variante
  const getPadding = () => {
    if (padding === 'none') return 0;
    
    const paddingMap = {
      sm: spacing.spacing.sm,
      md: spacing.spacing.md,
      lg: spacing.spacing.lg,
      xl: spacing.spacing.xl,
    };
    
    return paddingMap[padding] || spacing.spacing.md;
  };

  // 🎨 Marge selon la variante
  const getMargin = () => {
    if (margin === 'none') return 0;
    
    const marginMap = {
      sm: spacing.spacing.sm,
      md: spacing.spacing.md,
      lg: spacing.spacing.lg,
      xl: spacing.spacing.xl,
    };
    
    return marginMap[margin] || 0;
  };

  // 🎨 Largeur selon la variante - CORRIGÉ POUR MOINS D'ESPACE
  const getWidth = () => {
    switch (variant) {
      case 'fluid':
        return '100%';
      case 'narrow':
        return '85%'; // Réduit de 80% à 85%
      case 'wide':
        return '98%'; // Augmenté de 95% à 98%
      default:
        return '100%'; // Augmenté de 90% à 94% pour moins d'espace sur les côtés
    }
  };

  // 🎨 Styles d'élévation
  const getElevationStyles = () => {
    if (!elevated) return {};

    return {
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    };
  };

  // 🎨 Styles de bordure
  const getBorderStyles = () => {
    if (!borderRadius) return {};

    return {
      borderRadius: borderRadius,
    };
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: getWidth(),
          padding: getPadding(),
          margin: getMargin(),
          backgroundColor: backgroundColor || colors.background.primary,
          alignItems: centerContent ? 'center' : 'stretch',
        },
        getElevationStyles(),
        getBorderStyles(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// 🎨 Styles du composant
const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
});

export default Container;