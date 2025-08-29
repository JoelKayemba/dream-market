import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';

/**
 * 📝 Composant Input - Champ de saisie réutilisable avec validation
 * 
 * @param {Object} props - Propriétés de l'input
 * @param {string} props.value - Valeur de l'input
 * @param {Function} props.onChangeText - Fonction appelée lors du changement de texte
 * @param {string} props.placeholder - Texte d'aide
 * @param {string} props.label - Label au-dessus de l'input
 * @param {string} props.error - Message d'erreur
 * @param {string} props.variant - Variante de l'input ('default', 'outlined', 'filled')
 * @param {string} props.size - Taille de l'input ('small', 'medium', 'large')
 * @param {boolean} props.disabled - Si l'input est désactivé
 * @param {boolean} props.secureTextEntry - Si le texte doit être masqué (mot de passe)
 * @param {string} props.keyboardType - Type de clavier
 * @param {number} props.maxLength - Longueur maximale du texte
 * @param {boolean} props.multiline - Si l'input peut avoir plusieurs lignes
 * @param {number} props.numberOfLines - Nombre de lignes pour multiline
 * @param {string} props.leftIcon - Icône à gauche
 * @param {string} props.rightIcon - Icône à droite
 * @param {Function} props.onRightIconPress - Action lors du clic sur l'icône droite
 * @param {Object} props.style - Styles personnalisés
 * @param {Object} props.inputStyle - Styles personnalisés de l'input
 */
const Input = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  variant = 'default',
  size = 'medium',
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🎨 Styles de l'input selon la variante et l'état
  const getInputStyles = () => {
    const baseStyles = [styles.input, styles[variant], styles[size]];
    
    if (disabled) {
      baseStyles.push(styles.disabled);
    } else if (error) {
      baseStyles.push(styles.error);
    } else if (isFocused) {
      baseStyles.push(styles.focused);
    }
    
    if (leftIcon) {
      baseStyles.push(styles.withLeftIcon);
    }
    
    if (rightIcon || secureTextEntry) {
      baseStyles.push(styles.withRightIcon);
    }
    
    return baseStyles;
  };

  // 🔄 Gestion de l'affichage du mot de passe
  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  // 🔄 Rendu de l'icône gauche
  const renderLeftIcon = () => {
    if (!leftIcon) return null;
    
    return (
      <View style={styles.leftIconContainer}>
        <Ionicons name={leftIcon} size={20} color={colors.text.secondary} />
      </View>
    );
  };

  // 🔄 Rendu de l'icône droite
  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={handlePasswordToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={colors.text.secondary}
          />
        </TouchableOpacity>
      );
    }
    
    if (rightIcon) {
      return (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={onRightIconPress}
          activeOpacity={0.7}
        >
          <Ionicons name={rightIcon} size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  return (
    <View style={[styles.container, style]}>
      {/* 🏷️ Label */}
      {label && (
        <Text style={[styles.label, disabled && styles.disabledText]}>
          {label}
        </Text>
      )}
      
      {/* 📝 Input */}
      <View style={styles.inputContainer}>
        {renderLeftIcon()}
        
        <TextInput
          style={[getInputStyles(), inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.disabled}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {renderRightIcon()}
      </View>
      
      {/* 🚨 Message d'erreur */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

// 🎨 Styles du composant
const styles = StyleSheet.create({
  // 🎯 Container principal
  container: {
    marginBottom: spacing.componentSpacing.form.marginBottom,
  },

  // 🏷️ Label
  label: {
    ...typography.textStyles.label,
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },

  // 📝 Container de l'input
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },

  // 🎯 Input de base
  input: {
    flex: 1,
    ...typography.textStyles.body,
    color: colors.text.primary,
    backgroundColor: colors.background.card,
    borderWidth: spacing.borders.width.thin,
    borderColor: colors.components.border,
    borderRadius: spacing.borders.radius.md,
    paddingHorizontal: spacing.componentSpacing.input.paddingHorizontal,
    paddingVertical: spacing.componentSpacing.input.paddingVertical,
  },

  // 🌈 Variantes de l'input
  default: {
    backgroundColor: colors.background.card,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: spacing.borders.width.normal,
  },
  filled: {
    backgroundColor: colors.background.secondary,
    borderWidth: 0,
  },

  // 📏 Tailles de l'input
  small: {
    height: spacing.ui.input.height * 0.75,
    fontSize: typography.fontSizes.sm,
  },
  medium: {
    height: spacing.ui.input.height,
    fontSize: typography.fontSizes.base,
  },
  large: {
    height: spacing.ui.input.height * 1.25,
    fontSize: typography.fontSizes.md,
  },

  // 🚫 États de l'input
  disabled: {
    backgroundColor: colors.background.secondary,
    opacity: 0.6,
  },
  error: {
    borderColor: colors.error,
    backgroundColor: colors.background.card,
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.background.card,
  },

  // 🎨 Styles avec icônes
  withLeftIcon: {
    paddingLeft: spacing.xl + spacing.sm,
  },
  withRightIcon: {
    paddingRight: spacing.xl + spacing.sm,
  },

  // 🔗 Containers des icônes
  leftIconContainer: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  rightIconContainer: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 1,
  },

  // 🚨 Message d'erreur
  errorText: {
    ...typography.textStyles.error,
    marginTop: spacing.xs,
    fontSize: typography.fontSizes.sm,
  },

  // 🚫 Texte désactivé
  disabledText: {
    color: colors.text.disabled,
  },
});

export default Input;


