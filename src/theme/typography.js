// 📝 Système de typographie - Dream Market App
// Typographie optimisée pour mobile avec hiérarchie claire

import { colors } from './colors';

// 📱 Tailles de police (en pixels)
export const fontSizes = {
  // 🔤 Tailles de base
  xs: 10,      // Très petit (labels, badges)
  sm: 12,      // Petit (texte secondaire)
  base: 14,    // Base (texte principal)
  md: 16,      // Moyen (sous-titres)
  lg: 18,      // Grand (titres de sections)
  xl: 20,      // Très grand (titres principaux)
  '2xl': 24,   // Extra grand (titres de page)
  '3xl': 30,   // Très extra grand (hero)
  '4xl': 36,   // Énorme (titre principal)
};

// 📏 Hauteurs de ligne (multiplicateurs)
export const lineHeights = {
  tight: 1.2,      // Compact
  normal: 1.4,     // Normal
  relaxed: 1.6,    // Détendu
  loose: 1.8,      // Très détendu
};

// ⚖️ Poids de police
export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// 🔤 Familles de polices
export const fontFamilies = {
  // Polices système par défaut
  primary: 'System',           // Police principale
  secondary: 'System',         // Police secondaire
  monospace: 'Courier',        // Police monospace
  // Polices personnalisées (à ajouter plus tard)
  // primary: 'Poppins',
  // secondary: 'Inter',
};

// 📝 Styles de texte prédéfinis
export const textStyles = {
  // 🎯 Titres
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    color: colors.text.primary,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.tight,
    color: colors.text.primary,
  },
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    color: colors.text.primary,
  },
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.text.primary,
  },
  h6: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.text.primary,
  },

  // 📄 Corps de texte
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    color: colors.text.primary,
  },
  bodyLarge: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    color: colors.text.primary,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    color: colors.text.secondary,
  },

  // 🔗 Liens et interactions
  link: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.text.inverse,
    textAlign: 'center',
  },

  // 🏷️ Labels et badges
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.normal,
    color: colors.text.secondary,
  },

  // 💰 Prix et informations importantes
  price: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.normal,
    color: colors.primary,
  },
  priceLarge: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    color: colors.primary,
  },

  // ⭐ Notes et évaluations
  rating: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: lineHeights.normal,
    color: colors.warning,
  },

  // 🚨 Messages d'état
  success: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.success,
  },
  error: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.error,
  },
  warning: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.warning,
  },
  info: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    color: colors.info,
  },
};

// 🎨 Styles de texte pour les composants spécifiques
export const componentTextStyles = {
  // 🏠 Accueil
  heroTitle: {
    ...textStyles.h1,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.black,
    color: colors.text.inverse,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...textStyles.h3,
    fontSize: fontSizes.xl,
    color: colors.text.inverse,
    textAlign: 'center',
    opacity: 0.9,
  },

  // 🛍️ Produits
  productTitle: {
    ...textStyles.h4,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  productDescription: {
    ...textStyles.bodySmall,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.normal,
  },
  productPrice: {
    ...textStyles.price,
    fontSize: fontSizes.md,
  },

  // 🏡 Fermes
  farmName: {
    ...textStyles.h3,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  farmLocation: {
    ...textStyles.bodySmall,
    color: colors.text.secondary,
  },

  // 🔧 Services
  serviceTitle: {
    ...textStyles.h4,
    fontSize: fontSizes.lg,
  },
  serviceDescription: {
    ...textStyles.bodySmall,
    lineHeight: lineHeights.relaxed,
  },

  // 📊 Administration
  adminTitle: {
    ...textStyles.h2,
    fontSize: fontSizes['2xl'],
  },
  statsNumber: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
};

// 🔧 Fonction utilitaire pour créer des styles de texte personnalisés
export const createTextStyle = (baseStyle, overrides = {}) => ({
  ...baseStyle,
  ...overrides,
});

// 📱 Styles responsifs (pour les tablettes et desktop)
export const responsiveTextStyles = {
  tablet: {
    h1: { fontSize: fontSizes['4xl'] + 4 },
    h2: { fontSize: fontSizes['3xl'] + 4 },
    h3: { fontSize: fontSizes['2xl'] + 2 },
    body: { fontSize: fontSizes.base + 2 },
  },
  desktop: {
    h1: { fontSize: fontSizes['4xl'] + 8 },
    h2: { fontSize: fontSizes['3xl'] + 6 },
    h3: { fontSize: fontSizes['2xl'] + 4 },
    body: { fontSize: fontSizes.base + 4 },
  },
};

// 📋 Export par défaut
export default {
  fontSizes,
  lineHeights,
  fontWeights,
  fontFamilies,
  textStyles,
  componentTextStyles,
  createTextStyle,
  responsiveTextStyles,
};
