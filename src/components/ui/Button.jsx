import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, borders, ui, typography } from '../../theme';

/**
 * 🎯 Composant Button - Bouton réutilisable avec différentes variantes
 * 
 * @param {Object} props - Propriétés du bouton
 * @param {string} props.variant - Variante du bouton ('primary', 'secondary', 'outline', 'ghost')
 * @param {string} props.size - Taille du bouton ('small', 'medium', 'large')
 * @param {boolean} props.disabled - État désactivé du bouton
 * @param {boolean} props.loading - État de chargement du bouton
 * @param {string} props.title - Texte du bouton
 * @param {Function} props.onPress - Fonction appelée lors du clic
 * @param {Object} props.style - Styles personnalisés
 * @param {Object} props.textStyle - Styles personnalisés du texte
 * @param {React.ReactNode} props.icon - Icône à afficher
 * @param {string} props.iconPosition - Position de l'icône ('left', 'right')
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  title,
  onPress,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  // 🎨 Styles du bouton selon la variante
  const getButtonStyles = () => {
    const baseStyles = [styles.base, styles[size]];
    
    if (disabled) {
      baseStyles.push(styles.disabled);
    } else {
      baseStyles.push(styles[variant]);
    }
    
    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <>{icon}</>}
          <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && <>{icon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borders.radius.lg,
    paddingVertical: ui.button.padding.vertical,
    paddingHorizontal: ui.button.padding.horizontal,
    minHeight: ui.button.height.normal,
  },
  small: {
    paddingVertical: ui.button.padding.vertical,
    paddingHorizontal: ui.button.padding.horizontal,
    minHeight: ui.button.height.small,
  },
  medium: {
    paddingVertical: ui.button.padding.vertical,
    paddingHorizontal: ui.button.padding.horizontal,
    minHeight: ui.button.height.normal,
  },
  large: {
    paddingVertical: ui.button.padding.vertical,
    paddingHorizontal: ui.button.padding.horizontal,
    minHeight: ui.button.height.large,
  },
  primary: {
    backgroundColor: colors.primary.main,
    
  },
  warning: {
    backgroundColor: 'transparent',
    borderColor: '#FF6B6B',
    borderWidth: borders.width.normal,
  },
  secondary: {
    backgroundColor: colors.interactive.secondary,
    borderColor: colors.interactive.secondary,
    borderWidth: borders.width.normal,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.interactive.primary,
    borderWidth: borders.width.normal,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  disabled: {
    opacity: 0.7,
    backgroundColor: colors.interactive.disabled,
  },
  // Styles de base du texte
  text: {
    fontSize: typography.fontSizes.md,
    fontWeight: 'bold',
  },
  // Styles de texte spécifiques à chaque variante
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.text.inverse,
  },
  outlineText: {
    color: colors.interactive.primary,
  },
  ghostText: {
    color: colors.text.primary, // Texte sombre pour la variante ghost
  },
  disabledText: {
    color: colors.text.disabled,
  },
  warningText: {
    color: '#FF6B6B',
  },
});

export default Button;
