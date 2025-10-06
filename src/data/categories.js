// 🥬 Catégories de produits agricoles - Dream Market App
// Données mock pour les catégories principales

// Catégories de produits
export const productCategories = [
  { id: 0, name: 'Toutes', emoji: '🛒', color: '#777E5C' },
  { id: 1, name: 'Légumes', emoji: '🥬', color: '#4CAF50' },
  { id: 2, name: 'Fruits', emoji: '🍎', color: '#FF9800' },
  { id: 3, name: 'Céréales', emoji: '🌾', color: '#795548' },
  { id: 4, name: 'Produits Laitiers', emoji: '🥛', color: '#2196F3' },
  { id: 5, name: 'Produits de la Ruche', emoji: '🍯', color: '#FFC107' },
  { id: 6, name: 'Oeufs', emoji: '🥚', color: '#FF9800' },
  { id: 7, name: 'Fromages', emoji: '🧀', color: '#795548' },
];

// Catégories de fermes (spécialités)
export const farmCategories = [
  { id: 0, name: 'Toutes', emoji: '🌾', color: '#777E5C' },
  { id: 1, name: 'Bio', emoji: '🌱', color: '#4CAF50' },
  { id: 2, name: 'Fruits', emoji: '🍎', color: '#FF9800' },
  { id: 3, name: 'Céréales', emoji: '🌾', color: '#8BC34A' },
  { id: 4, name: 'Laitiers', emoji: '🥛', color: '#2196F3' },
  { id: 5, name: 'Vins', emoji: '🍷', color: '#9C27B0' },
  { id: 6, name: 'Herbes', emoji: '🌿', color: '#795548' },
];

// Catégories de services
export const serviceCategories = [
  { id: 0, name: 'Toutes', emoji: '🔧', color: '#777E5C' },
  { id: 1, name: 'Logistique', emoji: '🚚', color: '#4CAF50' },
  { id: 2, name: 'Conseil', emoji: '💡', color: '#FF9800' },
  { id: 3, name: 'Formation', emoji: '📚', color: '#2196F3' },
  { id: 4, name: 'Maintenance', emoji: '🔧', color: '#9C27B0' },
  { id: 5, name: 'Marketing', emoji: '📢', color: '#795548' },
  { id: 6, name: 'Certification', emoji: '🔒', color: '#FF5722' },
];

// Alias pour la compatibilité avec l'ancien code
export const categories = productCategories;

// Fonction pour obtenir une catégorie de produit par ID
export const getCategoryById = (id) => {
  return productCategories.find(category => category.id === id);
};

// Fonction pour obtenir les catégories populaires
export const getPopularCategories = () => {
  return productCategories.filter(category => category.isPopular);
};

// Fonction pour obtenir les nouvelles catégories
export const getNewCategories = () => {
  return productCategories.filter(category => category.isNew);
};

// Fonction pour obtenir les catégories bio
export const getOrganicCategories = () => {
  return productCategories.filter(category => category.isOrganic);
};

// Fonction pour obtenir une catégorie de ferme par ID
export const getFarmCategoryById = (id) => {
  return farmCategories.find(category => category.id === id);
};

// Fonction pour obtenir une catégorie de service par ID
export const getServiceCategoryById = (id) => {
  return serviceCategories.find(category => category.id === id);
};
