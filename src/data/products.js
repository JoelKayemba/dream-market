// 🛍️ Produits agricoles - Dream Market App
// Données mock pour le catalogue des produits

export const products = [
  {
    id: 1,
    name: 'Tomates Bio Premium',
    description: 'Tomates biologiques cultivées avec soin, parfaites pour vos salades et plats. Récoltées à maturité optimale pour un goût exceptionnel.',
    price: 2.50,
    currency: 'CDF',
    oldPrice: 3.20,
    unit: 'kg',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      'https://images.unsplash.com/photo-1546470427-e8e7b3d8b8b8',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b'
    ],
    farm: 'Ferme du Soleil',
    farmId: 'farm1',
    category: 'Légumes',
    categoryId: 1,
    rating: 4.8,
    reviewCount: 127,
    stock: 45,
    isNew: false,
    isOrganic: true,
    isPopular: true,
    discount: 22,
    isFavorite: false,
    tags: ['Bio', 'Premium', 'Saison', 'Local'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: 'Pommes Golden Deluxe',
    description: 'Pommes Golden de qualité exceptionnelle, récoltées à maturité optimale. Douceur et croquant garantis pour un plaisir gustatif unique.',
    price: 3.20,
    currency: 'CDF',
    oldPrice: null,
    unit: 'kg',
    images: [
      'https://images.unsplash.com/photo-1519996529931-28324d5a630e',
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
      'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2'
    ],
    farm: 'Verger des Collines',
    farmId: 'farm2',
    category: 'Fruits',
    categoryId: 2,
    rating: 4.6,
    reviewCount: 89,
    stock: 32,
    isNew: true,
    isOrganic: false,
    isPopular: true,
    discount: null,
    isFavorite: true,
    tags: ['Fruits', 'Qualité', 'Tradition', 'Sucré'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 3,
    name: 'Blé Dur Traditionnel',
    description: 'Blé dur cultivé selon les méthodes traditionnelles, parfait pour vos pâtes et pains. Goût authentique du terroir français.',
    price: 1.80,
    currency: 'CDF',
    oldPrice: null,
    unit: 'kg',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      'https://images.unsplash.com/photo-1546470427-e8e7b3d8b8b8'
    ],
    farm: 'Champs de l\'Ouest',
    farmId: 'farm3',
    category: 'Céréales',
    categoryId: 3,
    rating: 4.4,
    reviewCount: 56,
    stock: 120,
    isNew: true,
    isOrganic: true,
    isPopular: false,
    discount: null,
    isFavorite: false,
    tags: ['Céréales', 'Tradition', 'Professionnel', 'Bio'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 4,
    name: 'Lait Frais du Matin',
    description: 'Lait frais du jour, récolté le matin même, pour une fraîcheur incomparable. Crémeux et délicieux comme autrefois.',
    price: 1.20,
    currency: 'USD',
    oldPrice: 1.50,
    unit: 'L',
    images: [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150',
      'https://images.unsplash.com/photo-1569288063648-5bb1d0e3b3b8',
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a9d2'
    ],
    farm: 'Ferme du Plateau',
    farmId: 'farm4',
    category: 'Produits Laitiers',
    categoryId: 4,
    rating: 4.9,
    reviewCount: 203,
    stock: 28,
    isNew: false,
    isOrganic: true,
    isPopular: true,
    discount: 20,
    isFavorite: false,
    tags: ['Lait', 'Frais', 'Local', 'Bio'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 5,
    name: 'Carottes Nouvelles',
    description: 'Carottes nouvelles et tendres, récoltées jeunes pour une saveur douce et sucrée. Parfaites crues ou cuites.',
    price: 1.90,
    currency: 'CDF',
    oldPrice: null,
    unit: 'kg',
    images: [
      'https://images.unsplash.com/photo-1447175008436-170170e886ae',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655',
      'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9'
    ],
    farm: 'Ferme du Soleil',
    farmId: 'farm1',
    category: 'Légumes',
    categoryId: 1,
    rating: 4.7,
    reviewCount: 78,
    stock: 65,
    isNew: true,
    isOrganic: false,
    isPopular: false,
    discount: null,
    isFavorite: false,
    tags: ['Légumes', 'Nouveau', 'Tendre', 'Sucré'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 6,
    name: 'Miel de Fleurs Sauvages',
    description: 'Miel pur et naturel récolté dans nos prairies fleuries. Goût floral délicat et propriétés nutritives exceptionnelles.',
    price: 8.50,
    oldPrice: 10.00,
    unit: '500g',
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38',
      'https://images.unsplash.com/photo-1550583724-b2692b85b150',
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a9d2'
    ],
    farm: 'Rucher des Prairies',
    farmId: 'farm5',
    category: 'Produits de la Ruche',
    categoryId: 5,
    rating: 4.9,
    reviewCount: 156,
    stock: 15,
    isNew: false,
    isOrganic: true,
    isPopular: true,
    discount: 15,
    isFavorite: true,
    tags: ['Miel', 'Bio', 'Naturel', 'Local'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 7,
    name: 'Oeufs Fermiers Frais',
    description: 'Oeufs de nos poules élevées en plein air, nourries aux céréales naturelles. Coquilles solides et jaunes dorés.',
    price: 4.20,
    oldPrice: null,
    unit: '6 oeufs',
    images: [
      'https://images.unsplash.com/photo-1569288063648-5bb1d0e3b3b8',
      'https://images.unsplash.com/photo-1550583724-b2692b85b150',
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a9d2'
    ],
    farm: 'Ferme du Plateau',
    farmId: 'farm4',
    category: 'Oeufs',
    categoryId: 6,
    rating: 4.8,
    reviewCount: 92,
    stock: 48,
    isNew: false,
    isOrganic: false,
    isPopular: true,
    discount: null,
    isFavorite: false,
    tags: ['Oeufs', 'Fermier', 'Plein air', 'Frais'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 8,
    name: 'Poires Williams Bio',
    description: 'Poires Williams biologiques, juteuses et parfumées. Récoltées à maturité pour un goût sucré et une texture fondante.',
    price: 3.80,
    oldPrice: 4.50,
    unit: 'kg',
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e',
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6',
      'https://images.unsplash.com/photo-1519996529931-28324d5a630e'
    ],
    farm: 'Verger des Collines',
    farmId: 'farm2',
    category: 'Fruits',
    categoryId: 2,
    rating: 4.6,
    reviewCount: 67,
    stock: 28,
    isNew: false,
    isOrganic: true,
    isPopular: false,
    discount: 16,
    isFavorite: true,
    tags: ['Fruits', 'Bio', 'Juteux', 'Parfumé'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 9,
    name: 'Pommes de Terre Primeur',
    description: 'Pommes de terre nouvelles récoltées jeunes, à la peau fine et à la chair tendre. Parfaites pour vos plats d\'été.',
    price: 2.20,
    oldPrice: null,
    unit: 'kg',
    images: [
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655',
      'https://images.unsplash.com/photo-1447175008436-170170e886ae',
      'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9'
    ],
    farm: 'Champs de l\'Ouest',
    category: 'Légumes',
    categoryId: 1,
    rating: 4.5,
    reviewCount: 45,
    stock: 85,
    isNew: true,
    isOrganic: false,
    isPopular: false,
    discount: null,
    isFavorite: false,
    tags: ['Légumes', 'Nouveau', 'Primeur', 'Tendre'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 10,
    name: 'Fromage de Chèvre Affiné',
    description: 'Fromage de chèvre affiné 3 mois, à la texture crémeuse et au goût délicatement acidulé. Affinage traditionnel.',
    price: 12.50,
    oldPrice: 15.00,
    unit: '200g',
    images: [
      'https://images.unsplash.com/photo-1486297678162-eb2a19b0a9d2',
      'https://images.unsplash.com/photo-1569288063648-5bb1d0e3b3b8',
      'https://images.unsplash.com/photo-1550583724-b2692b85b150'
    ],
    farm: 'Ferme du Plateau',
    farmId: 'farm4',
    category: 'Fromages',
    categoryId: 7,
    rating: 4.7,
    reviewCount: 134,
    stock: 22,
    isNew: false,
    isOrganic: false,
    isPopular: true,
    discount: 17,
    isFavorite: false,
    tags: ['Fromage', 'Chèvre', 'Affiné', 'Crémeux'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 11,
    name: 'Fraise Gariguette',
    description: 'Fraises Gariguette précoces, sucrées et parfumées. Récoltées à la main pour préserver leur délicatesse.',
    price: 6.80,
    oldPrice: null,
    unit: '500g',
    images: [
      'https://images.unsplash.com/photo-1464965911861-746a04b4bca6',
      'https://images.unsplash.com/photo-1542838132-92c53300491e',
      'https://images.unsplash.com/photo-1519996529931-28324d5a630e'
    ],
    farm: 'Verger des Collines',
    farmId: 'farm2',
    category: 'Fruits',
    categoryId: 2,
    rating: 4.9,
    reviewCount: 89,
    stock: 18,
    isNew: true,
    isOrganic: true,
    isPopular: true,
    discount: null,
    isFavorite: true,
    tags: ['Fruits', 'Nouveau', 'Bio', 'Sucré'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 12,
    name: 'Courgettes Bio',
    description: 'Courgettes biologiques tendres et savoureuses. Cultivées sans pesticides pour préserver leur goût naturel.',
    price: 2.10,
    oldPrice: null,
    unit: 'kg',
    images: [
      'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9',
      'https://images.unsplash.com/photo-1447175008436-170170e886ae',
      'https://images.unsplash.com/photo-1518977676601-b53f82aba655'
    ],
    farm: 'Ferme du Soleil',
    farmId: 'farm1',
    category: 'Légumes',
    categoryId: 1,
    rating: 4.4,
    reviewCount: 56,
    stock: 42,
    isNew: false,
    isOrganic: true,
    isPopular: false,
    discount: null,
    isFavorite: false,
    tags: ['Légumes', 'Bio', 'Tendre', 'Naturel'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  }
];

// Fonction pour obtenir un produit par ID
export const getProductById = (id) => {
  return products.find(product => product.id === id);
};

// Fonction pour obtenir les produits par catégorie
export const getProductsByCategory = (categoryId) => {
  return products.filter(product => product.categoryId === categoryId);
};

// Fonction pour obtenir les produits populaires
export const getPopularProducts = () => {
  return products.filter(product => product.isPopular);
};

// Fonction pour obtenir les nouveaux produits
export const getNewProducts = () => {
  return products.filter(product => product.isNew);
};

// Fonction pour obtenir les produits bio
export const getOrganicProducts = () => {
  return products.filter(product => product.isOrganic);
};

// Fonction pour obtenir les produits en promotion
export const getDiscountedProducts = () => {
  return products.filter(product => product.discount);
};

// Fonction pour rechercher des produits
export const searchProducts = (query) => {
  const lowerQuery = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.farm.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};
