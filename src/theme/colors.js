// 🎨 Palette de couleurs principale - Dream Market App
// Couleurs inspirées de la nature et de l'agriculture

export const colors = {
  // 🟢 Couleurs principales (palette spécifiée)
  primary: {
    main: '#283106',       // Vert foncé - Couleur principale
    light: '#D1D8BD',      // Vert clair - Couleur de fond
    dark: '#1B2504',       // Vert foncé - Couleur sombre
  },
  secondary: '#777E5C',    // Vert-gris - Couleur secondaire
  accent: '#C7C2AB',       // Beige - Couleur d'accent
  light: '#D1D8BD',        // Vert clair - Couleur de fond
  white: '#DFEODC',        // Blanc cassé - Couleur de base

  // 🌈 Couleurs sémantiques
  success: {
    main: '#4CAF50',       // Vert succès
    light: '#E8F5E8',      // Vert succès clair
    dark: '#388E3C',       // Vert succès foncé
  },
  warning: {
    main: '#FF9800',       // Orange avertissement
    light: '#FFF3E0',      // Orange avertissement clair
    dark: '#F57C00',       // Orange avertissement foncé
  },
  error: {
    main: '#F44336',       // Rouge erreur
    light: '#FFEBEE',      // Rouge erreur clair
    dark: '#D32F2F',       // Rouge erreur foncé
  },
  info: {
    main: '#2196F3',       // Bleu information
    light: '#E3F2FD',      // Bleu information clair
    dark: '#1976D2',       // Bleu information foncé
  },

  // 📝 Couleurs de texte
  text: {
    primary: '#283106',    // Texte principal (vert foncé)
    secondary: '#777E5C',  // Texte secondaire (vert-gris)
    light: '#DFEODC',      // Texte clair (blanc cassé)
    inverse: '#FFFFFF',    // Texte sur fond sombre
    disabled: '#9E9E9E',   // Texte désactivé
  },

  // 🎨 Couleurs de fond
  background: {
    primary: '#DFEODC',    // Fond principal (blanc cassé)
    secondary: '#D1D8BD',  // Fond secondaire (vert clair)
    card: '#FFFFFF',       // Fond des cartes (blanc pur)
    modal: '#FFFFFF',      // Fond des modales
    overlay: 'rgba(40, 49, 6, 0.8)', // Overlay sombre
  },

  // 🔗 Couleurs d'interaction
  interactive: {
    primary: '#283106',    // Boutons principaux
    secondary: '#777E5C',  // Boutons secondaires
    accent: '#C7C2AB',     // Boutons d'accent
    disabled: '#E0E0E0',   // Boutons désactivés
    hover: '#1B2504',      // Hover sur boutons primaires
  },

  // 📱 Couleurs spécifiques aux composants
  components: {
    border: '#D1D8BD',     // Bordures des composants
    divider: '#E0E0E0',    // Séparateurs
    shadow: 'rgba(40, 49, 6, 0.1)', // Ombres subtiles
    highlight: '#C7C2AB',  // Mise en évidence
  },

  // 🔲 Couleurs de bordures
  border: {
    light: '#E0E0E0',      // Bordures claires
    medium: '#BDBDBD',     // Bordures moyennes
    dark: '#757575',       // Bordures sombres
  },

  // 🌟 Couleurs d'ombres
  shadow: 'rgba(40, 49, 6, 0.1)', // Ombres par défaut

  // 🌾 Couleurs spécifiques à l'agriculture
  agriculture: {
    soil: '#8D6E63',       // Couleur terre
    leaf: '#4CAF50',       // Couleur feuille
    fruit: '#FF9800',      // Couleur fruit
    grain: '#FFC107',      // Couleur céréale
    organic: '#4CAF50',    // Couleur bio
  },

  // 📊 Couleurs pour les graphiques et statistiques
  charts: {
    chart1: '#283106',     // Premier graphique
    chart2: '#777E5C',     // Deuxième graphique
    chart3: '#C7C2AB',     // Troisième graphique
    chart4: '#D1D8BD',     // Quatrième graphique
    chart5: '#4CAF50',     // Cinquième graphique
  },

  // 🎭 Couleurs pour les états et statuts
  status: {
    available: '#4CAF50',  // Disponible
    unavailable: '#F44336', // Non disponible
    pending: '#FF9800',    // En attente
    processing: '#2196F3', // En cours
    completed: '#4CAF50',  // Terminé
    cancelled: '#9E9E9E',  // Annulé
  },

  // 🌟 Couleurs pour les produits sponsorisés
  sponsored: {
    gold: '#FFD700',       // Or pour les produits premium
    silver: '#C0C0C0',     // Argent pour les produits standard
    bronze: '#CD7F32',     // Bronze pour les produits de base
    featured: '#FF6B6B',   // Mise en avant
  },

  // 🔒 Couleurs pour la sécurité et l'authentification
  security: {
    secure: '#4CAF50',     // Sécurisé
    warning: '#FF9800',    // Attention
    danger: '#F44336',     // Danger
    info: '#2196F3',       // Information
  }
};

// 🎨 Couleurs avec transparence pour les overlays
export const colorsWithOpacity = {
  primary: (opacity = 0.8) => `rgba(40, 49, 6, ${opacity})`,
  secondary: (opacity = 0.8) => `rgba(119, 126, 92, ${opacity})`,
  accent: (opacity = 0.8) => `rgba(199, 194, 171, ${opacity})`,
  light: (opacity = 0.8) => `rgba(209, 216, 189, ${opacity})`,
  white: (opacity = 0.8) => `rgba(223, 224, 220, ${opacity})`,
};

// 🌈 Couleurs dégradées
export const gradients = {
  primary: ['#283106', '#777E5C'],
  secondary: ['#777E5C', '#C7C2AB'],
  accent: ['#C7C2AB', '#D1D8BD'],
  light: ['#D1D8BD', '#DFEODC'],
  nature: ['#4CAF50', '#8BC34A'],
  sunset: ['#FF9800', '#FF5722'],
};

// 📱 Couleurs pour les thèmes sombres (futur)
export const darkColors = {
  primary: '#1B2504',
  secondary: '#4A5D3A',
  accent: '#8B8578',
  light: '#6B7A5A',
  white: '#2A2D28',
  background: {
    primary: '#1A1D18',
    secondary: '#2A2D28',
    card: '#3A3D38',
  },
  text: {
    primary: '#DFEODC',
    secondary: '#C7C2AB',
    light: '#D1D8BD',
  }
};

// 🔧 Fonction utilitaire pour obtenir une couleur avec opacité
export const getColorWithOpacity = (color, opacity = 1) => {
  if (typeof color === 'string' && color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// 📋 Export par défaut
export default colors;
