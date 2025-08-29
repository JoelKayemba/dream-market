// 🎨 Index du thème - Dream Market App
// Export centralisé de tous les éléments du système de design

// 🌈 Couleurs
export { colors, colorsWithOpacity, gradients, darkColors, getColorWithOpacity } from './colors';

// 📝 Typographie
export { default as typography } from './typography';
export { 
  fontSizes, 
  lineHeights, 
  fontWeights, 
  fontFamilies, 
  textStyles, 
  componentTextStyles,
  createTextStyle,
  responsiveTextStyles 
} from './typography';

// 📏 Espacement
export { default as spacing } from './spacing';
export { 
  baseUnit,
  componentSpacing, 
  responsiveSpacing, 
  margins, 
  paddings, 
  borders, 
  layout, 
  ui,
  createSpacing 
} from './spacing';

// 🎯 Thème complet
import { colors as themeColors } from './colors';
import typographyModule from './typography';
import spacingModule from './spacing';

export const theme = {
  colors: themeColors,
  typography: typographyModule,
  spacing: spacingModule,
  // Ajout de propriétés calculées
  shadows: {
    small: {
      shadowColor: themeColors.primary.main,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: themeColors.primary.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: themeColors.primary.main,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  // Points de rupture pour le responsive design
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
  // Z-index pour la gestion des couches
  zIndex: {
    base: 0,
    card: 1,
    modal: 1000,
    overlay: 999,
    tooltip: 1001,
    toast: 1002,
  },
};

// 🔧 Fonctions utilitaires du thème
export const themeUtils = {
  // Obtenir une couleur avec opacité
  getColor: (colorName, opacity = 1) => {
    if (opacity === 1) return themeColors[colorName];
    return getColorWithOpacity(themeColors[colorName], opacity);
  },
  
  // Obtenir un espacement
  getSpacing: (size) => spacingModule.spacing[size] || spacingModule.spacing.md,
  
  // Obtenir un style de texte
  getTextStyle: (styleName) => typographyModule.textStyles[styleName] || {},
  
  // Obtenir un espacement de composant
  getComponentSpacing: (componentName) => spacingModule.componentSpacing[componentName] || {},
  
  // Vérifier si on est sur mobile/tablet/desktop
  isMobile: (width) => width < theme.breakpoints.tablet,
  isTablet: (width) => width >= theme.breakpoints.tablet && width < theme.breakpoints.desktop,
  isDesktop: (width) => width >= theme.breakpoints.desktop,
  
  // Obtenir des espacements responsifs
  getResponsiveSpacing: (deviceType, spacingType) => {
    return spacingModule.responsiveSpacing[deviceType]?.[spacingType] || spacingModule.spacing.md;
  },
};

// 📱 Hook personnalisé pour utiliser le thème (à utiliser dans les composants)
export const useTheme = () => {
  return {
    ...theme,
    utils: themeUtils,
  };
};

// 🎨 Export par défaut du thème complet
export default theme;
