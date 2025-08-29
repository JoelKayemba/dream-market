import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

/**
 * 📝 Composant Text - Composant de texte réutilisable avec le système de typographie
 * 
 * @param {Object} props - Propriétés du texte
 * @param {string} props.variant - Variante de texte ('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'bodyLarge', 'bodySmall', 'label', 'caption', 'link', 'button', 'price', 'rating', 'success', 'error', 'warning', 'info')
 * @param {string} props.color - Couleur personnalisée du texte
 * @param {string} props.align - Alignement du texte ('left', 'center', 'right', 'justify')
 * @param {boolean} props.bold - Si le texte doit être en gras
 * @param {boolean} props.italic - Si le texte doit être en italique
 * @param {boolean} props.underline - Si le texte doit être souligné
 * @param {number} props.opacity - Opacité du texte (0-1)
 * @param {number} props.numberOfLines - Nombre maximum de lignes
 * @param {boolean} props.ellipsizeMode - Mode d'ellipse ('head', 'middle', 'tail', 'clip')
 * @param {Object} props.style - Styles personnalisés
 * @param {React.ReactNode} props.children - Contenu du texte
 */
const Text = ({
  variant = 'body',
  color,
  align = 'left',
  bold = false,
  italic = false,
  underline = false,
  opacity = 1,
  numberOfLines,
  ellipsizeMode = 'tail',
  style,
  children,
  ...props
}) => {
  // 🎨 Styles du texte selon la variante
  const getTextStyles = () => {
    const baseStyles = [styles.base, styles[variant]];
    
    // 🎨 Couleur personnalisée ou couleur par défaut de la variante
    if (color) {
      baseStyles.push({ color });
    }
    
    // 📍 Alignement
    if (align !== 'left') {
      baseStyles.push({ textAlign: align });
    }
    
    // ⚖️ Poids de police
    if (bold) {
      baseStyles.push({ fontWeight: typography.fontWeights.bold });
    }
    
    // 🔤 Style de police
    if (italic) {
      baseStyles.push({ fontStyle: 'italic' });
    }
    
    // 🔗 Soulignement
    if (underline) {
      baseStyles.push({ textDecorationLine: 'underline' });
    }
    
    // 🌫️ Opacité
    if (opacity !== 1) {
      baseStyles.push({ opacity });
    }
    
    return baseStyles;
  };

  return (
    <RNText
      style={[getTextStyles(), style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </RNText>
  );
};

// 🎨 Styles du composant
const styles = StyleSheet.create({
  // 🎯 Styles de base
  base: {
    color: colors.text.primary,
  },

  // 🎯 Titres
  h1: {
    ...typography.textStyles.h1,
  },
  h2: {
    ...typography.textStyles.h2,
  },
  h3: {
    ...typography.textStyles.h3,
  },
  h4: {
    ...typography.textStyles.h4,
  },
  h5: {
    ...typography.textStyles.h5,
  },
  h6: {
    ...typography.textStyles.h6,
  },

  // 📄 Corps de texte
  body: {
    ...typography.textStyles.body,
  },
  bodyLarge: {
    ...typography.textStyles.bodyLarge,
  },
  bodySmall: {
    ...typography.textStyles.bodySmall,
  },

  // 🏷️ Labels et captions
  label: {
    ...typography.textStyles.label,
  },
  caption: {
    ...typography.textStyles.caption,
  },

  // 🔗 Liens et boutons
  link: {
    ...typography.textStyles.link,
  },
  button: {
    ...typography.textStyles.button,
  },

  // 💰 Prix et évaluations
  price: {
    ...typography.textStyles.price,
  },
  rating: {
    ...typography.textStyles.rating,
  },

  // 🚨 Messages d'état
  success: {
    ...typography.textStyles.success,
  },
  error: {
    ...typography.textStyles.error,
  },
  warning: {
    ...typography.textStyles.warning,
  },
  info: {
    ...typography.textStyles.info,
  },
});

export default Text;


