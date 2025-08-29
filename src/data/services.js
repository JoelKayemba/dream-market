export const services = [
  {
    id: '1',
    name: 'Livraison à domicile',
    description: 'Service de livraison à domicile pour tous vos produits agricoles. Livraison gratuite pour les commandes supérieures à 50€.',
    shortDescription: 'Livraison gratuite pour commandes > 50€',
    icon: '🚚',
    price: 'Gratuit > 50€',
    priceDetails: '5€ pour commandes < 50€',
    isActive: true,
    category: 'Logistique',
    features: [
      'Livraison sous 24-48h',
      'Suivi en temps réel',
      'Livraison en point relais possible',
      'Emballages écologiques',
      'Horaires de livraison flexibles'
    ],
    coverage: 'Pays de la Loire et Bretagne',
    minOrder: 20,
    deliveryTime: '24-48h',
    contact: {
      phone: '02 40 12 34 56',
      email: 'livraison@dreammarket.fr'
    },
    createdAt: '2024-01-01',
    rating: 4.7,
    reviewCount: 89
  },
  {
    id: '2',
    name: 'Conseils agricoles',
    description: 'Équipe d\'experts agronomes à votre service pour optimiser vos cultures, améliorer vos rendements et adopter des pratiques durables.',
    shortDescription: 'Experts à votre service',
    icon: '👨‍🌾',
    price: 'À partir de 80€',
    priceDetails: '80€/heure de consultation',
    isActive: true,
    category: 'Conseil',
    features: [
      'Audit de vos parcelles',
      'Plan de fertilisation personnalisé',
      'Conseils en irrigation',
      'Gestion des maladies et ravageurs',
      'Formation de vos équipes',
      'Suivi régulier'
    ],
    coverage: 'Toute la France',
    minOrder: 1,
    deliveryTime: 'Sous 7 jours',
    contact: {
      phone: '02 40 12 34 57',
      email: 'conseils@dreammarket.fr'
    },
    createdAt: '2024-01-01',
    rating: 4.9,
    reviewCount: 156
  },
  {
    id: '3',
    name: 'Formation qualité',
    description: 'Formations certifiantes pour vos équipes sur les normes de qualité, l\'hygiène alimentaire et les bonnes pratiques agricoles.',
    shortDescription: 'Certification de vos produits',
    icon: '📋',
    price: 'À partir de 150€',
    priceDetails: '150€/personne/jour',
    isActive: true,
    category: 'Formation',
    features: [
      'Formation HACCP',
      'Certification bio',
      'Normes ISO 22000',
      'Traçabilité des produits',
      'Gestion des allergènes',
      'Audit qualité'
    ],
    coverage: 'Toute la France',
    minOrder: 5,
    deliveryTime: 'Sur mesure',
    contact: {
      phone: '02 40 12 34 58',
      email: 'formation@dreammarket.fr'
    },
    createdAt: '2024-01-01',
    rating: 4.8,
    reviewCount: 203
  },
  {
    id: '4',
    name: 'Marketing et promotion',
    description: 'Services de marketing digital et promotion pour valoriser vos produits agricoles et développer votre clientèle.',
    shortDescription: 'Valorisez vos produits',
    icon: '📱',
    price: 'À partir de 200€',
    priceDetails: '200€/mois pour le pack de base',
    isActive: true,
    category: 'Marketing',
    features: [
      'Création de contenu digital',
      'Gestion des réseaux sociaux',
      'Photographie professionnelle',
      'Stratégie de communication',
      'Campagnes publicitaires',
      'Analyse des performances'
    ],
    coverage: 'Toute la France',
    minOrder: 3,
    deliveryTime: 'Sous 15 jours',
    contact: {
      phone: '02 40 12 34 59',
      email: 'marketing@dreammarket.fr'
    },
    createdAt: '2024-01-01',
    rating: 4.6,
    reviewCount: 78
  },
  {
    id: '5',
    name: 'Certification bio',
    description: 'Accompagnement complet pour obtenir et maintenir vos certifications bio, avec un suivi personnalisé de vos dossiers.',
    shortDescription: 'Accompagnement bio complet',
    icon: '🌱',
    price: 'À partir de 300€',
    priceDetails: '300€/an pour l\'accompagnement',
    isActive: true,
    category: 'Certification',
    features: [
      'Audit pré-certification',
      'Préparation des dossiers',
      'Accompagnement des contrôles',
      'Formation des équipes',
      'Suivi des évolutions réglementaires',
      'Support technique permanent'
    ],
    coverage: 'Toute la France',
    minOrder: 1,
    deliveryTime: '6-12 mois',
    contact: {
      phone: '02 40 12 34 60',
      email: 'certification@dreammarket.fr'
    },
    createdAt: '2024-01-01',
    rating: 4.9,
    reviewCount: 134
  },
  {
    id: '6',
    name: 'Gestion logistique',
    description: 'Solutions logistiques complètes pour optimiser votre chaîne d\'approvisionnement et la distribution de vos produits.',
    shortDescription: 'Optimisez votre logistique',
    icon: '📦',
    price: 'Sur devis',
    priceDetails: 'Tarification personnalisée',
    isActive: true,
    category: 'Logistique',
    features: [
      'Audit logistique',
      'Optimisation des flux',
      'Gestion des stocks',
      'Transport multimodal',
      'Traçabilité complète',
      'Réduction des coûts'
    ],
    coverage: 'Europe',
    minOrder: 1,
    deliveryTime: 'Sur mesure',
    contact: {
      phone: '02 40 12 34 61',
      email: 'logistique@dreammarket.fr'
    },
    createdAt: '2024-01-01',
    rating: 4.7,
    reviewCount: 67
  }
];

// Fonctions utilitaires
export const getServiceById = (id) => {
  return services.find(service => service.id === id);
};

export const getServicesByCategory = (category) => {
  return services.filter(service => service.category === category);
};

export const getActiveServices = () => {
  return services.filter(service => service.isActive);
};

export const searchServices = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return services.filter(service => 
    service.name.toLowerCase().includes(lowercaseQuery) ||
    service.description.toLowerCase().includes(lowercaseQuery) ||
    service.category.toLowerCase().includes(lowercaseQuery) ||
    service.features.some(feature => 
      feature.toLowerCase().includes(lowercaseQuery)
    )
  );
};

export const getServiceCategories = () => {
  const categories = [...new Set(services.map(service => service.category))];
  return categories;
};


