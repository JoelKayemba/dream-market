// 📏 Système d'espacement - Dream Market App
// Système basé sur une unité de base de 4px pour la cohérence

// 🔢 Unités de base
export const baseUnit = 4; // 4px = unité de base

// 📐 Espacements prédéfinis
export const spacing = {
  // 🚫 Espacements nuls
  none: 0,
  zero: 0,

  // 🔴 Espacements très petits
  xs: baseUnit,           // 4px
  '2xs': baseUnit * 0.5,  // 2px

  // 🟡 Espacements petits
  sm: baseUnit * 2,       // 8px
  '2sm': baseUnit * 3,    // 12px

  // 🟢 Espacements moyens
  md: baseUnit * 4,       // 16px
  '2md': baseUnit * 5,    // 20px
  '3md': baseUnit * 6,    // 24px

  // 🔵 Espacements grands
  lg: baseUnit * 8,       // 32px
  '2lg': baseUnit * 10,   // 40px
  '3lg': baseUnit * 12,   // 48px

  // 🟣 Espacements très grands
  xl: baseUnit * 16,      // 64px
  '2xl': baseUnit * 20,   // 80px
  '3xl': baseUnit * 24,   // 96px

  // 🟤 Espacements énormes
  xxl: baseUnit * 32,     // 128px
  '2xxl': baseUnit * 40,  // 160px
};

// 🎯 Espacements spécifiques aux composants
export const componentSpacing = {
  // 🏠 Accueil
  hero: {
    paddingVertical: baseUnit * 16,    // 64px
    paddingHorizontal: baseUnit * 8,   // 32px
    marginBottom: baseUnit * 8,        // 32px
  },
  section: {
    paddingVertical: baseUnit * 8,     // 32px
    paddingHorizontal: baseUnit * 4,   // 16px
    marginBottom: baseUnit * 4,        // 16px
  },
  card: {
    padding: baseUnit * 4,             // 16px
    marginBottom: baseUnit * 2,        // 8px
    borderRadius: baseUnit * 6,        // 24px
  },

  // 🛍️ Produits
  productCard: {
    padding: baseUnit * 4,             // 16px
    marginBottom: baseUnit * 2,        // 8px
    marginHorizontal: baseUnit * 2,    // 8px
  },
  productGrid: {
    paddingHorizontal: baseUnit * 4,   // 16px
    paddingVertical: baseUnit * 2,     // 8px
  },
  productDetails: {
    padding: baseUnit * 8,             // 32px
    paddingTop: baseUnit * 16,         // 64px
  },

  // 🏡 Fermes
  farmCard: {
    padding: baseUnit * 4,             // 16px
    marginBottom: baseUnit * 4,        // 16px
    marginHorizontal: baseUnit * 2,    // 8px
  },
  farmGallery: {
    paddingHorizontal: baseUnit * 4,   // 16px
    paddingVertical: baseUnit * 2,     // 8px
  },

  // 🔧 Services
  serviceCard: {
    padding: baseUnit * 4,             // 16px
    marginBottom: baseUnit * 4,        // 16px
    marginHorizontal: baseUnit * 2,    // 8px
  },

  // 📱 Navigation
  navigation: {
    paddingHorizontal: baseUnit * 4,   // 16px
    paddingVertical: baseUnit * 2,     // 8px
  },
  tabBar: {
    paddingTop: baseUnit * 2,          // 8px
    paddingBottom: baseUnit * 4,       // 16px
    paddingHorizontal: baseUnit * 4,   // 16px
  },

  // 🔐 Authentification
  auth: {
    padding: baseUnit * 16,            // 64px
    paddingTop: baseUnit * 32,         // 128px
  },
  form: {
    marginBottom: baseUnit * 4,        // 16px
  },
  input: {
    paddingVertical: baseUnit * 4,     // 16px
    paddingHorizontal: baseUnit * 4,   // 16px
    marginBottom: baseUnit * 2,        // 8px
  },
  button: {
    paddingVertical: baseUnit * 4,     // 16px
    paddingHorizontal: baseUnit * 8,   // 32px
    marginVertical: baseUnit * 2,      // 8px
  },

  // 📊 Administration
  admin: {
    padding: baseUnit * 8,             // 32px
    paddingTop: baseUnit * 16,         // 64px
  },
  stats: {
    padding: baseUnit * 4,             // 16px
    marginBottom: baseUnit * 4,        // 16px
  },
};

// 📱 Espacements responsifs
export const responsiveSpacing = {
  // 📱 Mobile (par défaut)
  mobile: {
    container: baseUnit * 4,           // 16px
    section: baseUnit * 8,             // 32px
    card: baseUnit * 4,                // 16px
  },
  // 📱 Tablette
  tablet: {
    container: baseUnit * 8,           // 32px
    section: baseUnit * 16,            // 64px
    card: baseUnit * 8,                // 32px
  },
  // 💻 Desktop
  desktop: {
    container: baseUnit * 16,          // 64px
    section: baseUnit * 32,            // 128px
    card: baseUnit * 16,               // 64px
  },
};

// 🎨 Espacements pour les marges et paddings
export const margins = {
  // Marges verticales
  v: {
    none: 0,
    xs: baseUnit,                      // 4px
    sm: baseUnit * 2,                  // 8px
    md: baseUnit * 4,                  // 16px
    lg: baseUnit * 8,                  // 32px
    xl: baseUnit * 16,                 // 64px
    xxl: baseUnit * 32,                // 128px
  },
  // Marges horizontales
  h: {
    none: 0,
    xs: baseUnit,                      // 4px
    sm: baseUnit * 2,                  // 8px
    md: baseUnit * 4,                  // 16px
    lg: baseUnit * 8,                  // 32px
    xl: baseUnit * 16,                 // 64px
    xxl: baseUnit * 32,                // 128px
  },
  // Marges globales
  global: {
    none: 0,
    xs: baseUnit,                      // 4px
    sm: baseUnit * 2,                  // 8px
    md: baseUnit * 4,                  // 16px
    lg: baseUnit * 8,                  // 32px
    xl: baseUnit * 16,                 // 64px
    xxl: baseUnit * 32,                // 128px
  },
};

export const paddings = {
  // Paddings verticaux
  v: {
    none: 0,
    xs: baseUnit,                      // 4px
    sm: baseUnit * 2,                  // 8px
    md: baseUnit * 4,                  // 16px
    lg: baseUnit * 8,                  // 32px
    xl: baseUnit * 16,                 // 64px
    xxl: baseUnit * 32,                // 128px
  },
  // Paddings horizontaux
  h: {
    none: 0,
    xs: baseUnit,                      // 4px
    sm: baseUnit * 2,                  // 8px
    md: baseUnit * 4,                  // 16px
    lg: baseUnit * 8,                  // 32px
    xl: baseUnit * 16,                 // 64px
    xxl: baseUnit * 32,                // 128px
  },
  // Paddings globaux
  global: {
    none: 0,
    xs: baseUnit,                      // 4px
    sm: baseUnit * 2,                  // 8px
    md: baseUnit * 4,                  // 16px
    lg: baseUnit * 8,                  // 32px
    xl: baseUnit * 16,                 // 64px
    xxl: baseUnit * 32,                // 128px
  },
};

// 🔧 Espacements pour les bordures et rayons
export const borders = {
  // Rayons de bordure
  radius: {
    none: 0,
    xs: baseUnit * 1.5,                // 6px
    sm: baseUnit * 3,                  // 12px
    md: baseUnit * 5,                  // 20px
    lg: baseUnit * 7,                  // 28px
    xl: baseUnit * 9,                  // 36px
    round: 999,                        // Complètement rond (pilule)
  },
  // Largeurs de bordure
  width: {
    none: 0,
    thin: 1,                           // 1px
    normal: 2,                          // 2px
    thick: 3,                           // 3px
    extra: 4,                           // 4px
  },
};

// 📐 Espacements pour les grilles et layouts
export const layout = {
  // Grilles
  grid: {
    gap: baseUnit * 4,                 // 16px entre les éléments
    padding: baseUnit * 4,             // 16px autour de la grille
  },
  // Colonnes
  columns: {
    gap: baseUnit * 2,                 // 8px entre les colonnes
    padding: baseUnit * 2,             // 8px autour des colonnes
  },
  // Rangs
  rows: {
    gap: baseUnit * 2,                 // 8px entre les rangs
    padding: baseUnit * 2,             // 8px autour des rangs
  },
};

// 🎯 Espacements pour les icônes et éléments d'interface
export const ui = {
  // Icônes
  icon: {
    size: {
      xs: baseUnit * 2,                // 8px
      sm: baseUnit * 4,                // 16px
      md: baseUnit * 8,                // 32px
      lg: baseUnit * 16,               // 64px
      xl: baseUnit * 32,               // 128px
    },
    margin: baseUnit,                  // 4px autour des icônes
  },
  // Boutons
  button: {
    height: {
      small: baseUnit * 8,             // 32px
      normal: baseUnit * 10,           // 40px
      large: baseUnit * 12,            // 48px
    },
    padding: {
      horizontal: baseUnit * 4,        // 16px horizontal
      vertical: baseUnit * 2,          // 8px vertical
    },
  },
  // Inputs
  input: {
    height: baseUnit * 16,             // 64px
    padding: baseUnit * 4,             // 16px
  },
};

// 🔧 Fonction utilitaire pour créer des espacements personnalisés
export const createSpacing = (multiplier = 1) => baseUnit * multiplier;

// 📋 Export par défaut
export default {
  baseUnit,
  spacing,
  componentSpacing,
  responsiveSpacing,
  margins,
  paddings,
  borders,
  layout,
  ui,
  createSpacing,
};
