import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../theme';


/**
 * 🃏 Composant Card - Conteneur de contenu avec différentes variantes
 * 
 * @param {ReactNode} props.children - Contenu de la carte
 * @param {string} props.variant - Variante de la carte ('default', 'elevated', 'outlined', 'flat')
 * @param {boolean} props.pressable - Si la carte est cliquable
 * @param {Function} props.onPress - Fonction appelée lors du clic
 * @param {Object} props.style - Styles personnalisés pour la carte
 * @param {Object} props.contentStyle - Styles personnalisés pour le contenu
 * @param {boolean} props.shadow - Si la carte doit avoir une ombre
 * @param {string} props.borderRadius - Rayon de bordure personnalisé
 * @param {string} props.backgroundColor - Couleur de fond personnalisée
 */
const Card = ({
  children,
  variant = 'default',
  pressable = false,
  onPress,
  style,
  contentStyle,
  shadow = true,
  borderRadius,
  backgroundColor,
  ...props
}) => {
  // 🔍 DEBUG - Logs Card render
  console.log('Card render - variant:', variant);
  console.log('Card render - shadow:', shadow);

  const cardStyles = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    shadow && styles.shadow,
    borderRadius && { borderRadius },
    backgroundColor && { backgroundColor },
    style,
  ];

  const contentContainerStyles = [
    styles.contentContainer,
    contentStyle,
  ];

  return (
    <TouchableOpacity
      style={cardStyles}
      onPress={onPress}
      activeOpacity={0.7}
      {...props}
    >
      <View style={contentContainerStyles}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.card,
    borderRadius: spacing.borders.radius.md,
    padding: spacing.componentSpacing.card.padding,
    borderWidth: spacing.borders.width.thin,
    borderColor: colors.components.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    borderWidth: spacing.borders.width.normal,
    borderColor: colors.components.border,
  },
  flat: {
    borderWidth: 0,
    borderColor: 'transparent',
  },
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    // Default styles for content, can be overridden by contentStyle
  },
});

export default Card;
