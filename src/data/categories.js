// 🥬 Catégories de produits agricoles - Dream Market App
// Données mock pour les catégories principales

export const categories = [
  {
    id: 1,
    name: 'Légumes',
    description: 'Légumes frais et bio',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    productCount: 45,
    isPopular: true,
    isNew: false,
    isOrganic: true,
    color: '#4CAF50'
  },
  {
    id: 2,
    name: 'Fruits',
    description: 'Fruits de saison sucrés',
    image: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e',
    productCount: 38,
    isPopular: true,
    isNew: false,
    isOrganic: false,
    color: '#FF9800'
  },
  {
    id: 3,
    name: 'Céréales',
    description: 'Grains et farines traditionnelles',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
    productCount: 22,
    isPopular: false,
    isNew: true,
    isOrganic: true,
    color: '#795548'
  },
  {
    id: 4,
    name: 'Produits Laitiers',
    description: 'Lait, fromages et yaourts frais',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150',
    productCount: 28,
    isPopular: false,
    isNew: false,
    isOrganic: true,
    color: '#2196F3'
  },
  {
    id: 5,
    name: 'Viandes',
    description: 'Viandes de qualité supérieure',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f',
    productCount: 32,
    isPopular: true,
    isNew: false,
    isOrganic: false,
    color: '#F44336'
  },
  {
    id: 6,
    name: 'Épices & Herbes',
    description: 'Aromates et condiments naturels',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
    productCount: 18,
    isPopular: false,
    isNew: true,
    isOrganic: true,
    color: '#9C27B0'
  }
];

// Fonction pour obtenir une catégorie par ID
export const getCategoryById = (id) => {
  return categories.find(category => category.id === id);
};

// Fonction pour obtenir les catégories populaires
export const getPopularCategories = () => {
  return categories.filter(category => category.isPopular);
};

// Fonction pour obtenir les nouvelles catégories
export const getNewCategories = () => {
  return categories.filter(category => category.isNew);
};

// Fonction pour obtenir les catégories bio
export const getOrganicCategories = () => {
  return categories.filter(category => category.isOrganic);
};
