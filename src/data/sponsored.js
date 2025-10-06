import { products } from './products';

export const sponsoredProducts = [
  {
    id: '1',
    productId: 1, // Tomates Bio
    title: '🌟 Produit de la semaine',
    subtitle: 'Tomates Bio de la Ferme du Soleil',
    description: 'Découvrez nos délicieuses tomates bio cultivées avec passion. Parfaites pour vos salades d\'été !',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&h=300&fit=crop',
    backgroundColor: '#FF6B6B',
    textColor: '#FFFFFF',
    startDate: '2024-01-15',
    endDate: '2024-01-31',
    isActive: true,
    priority: 1, // Plus le chiffre est élevé, plus le produit est mis en avant
    clickCount: 0,
    conversionRate: 0,
    budget: 150,
    spent: 45,
    targetAudience: ['Consommateurs bio', 'Cuisiniers amateurs', 'Familles'],
    tags: ['Bio', 'Saison', 'Local', 'Premium'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    productId: 2, // Pommes Golden
    title: '🍎 Offre spéciale verger',
    subtitle: 'Pommes Golden du Verger des Trois Chênes',
    description: 'Profitez de nos pommes Golden juteuses et sucrées. Variété traditionnelle de qualité exceptionnelle.',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef464136?w=400&h=300&fit=crop',
    backgroundColor: '#4ECDC4',
    textColor: '#FFFFFF',
    startDate: '2024-01-10',
    endDate: '2024-02-15',
    isActive: true,
    priority: 2,
    clickCount: 0,
    conversionRate: 0,
    budget: 200,
    spent: 78,
    targetAudience: ['Familles', 'Enfants', 'Amateurs de fruits'],
    tags: ['Fruits', 'Traditionnel', 'Qualité', 'Saison'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20'
  },
  {
    id: '3',
    productId: 6, // Miel de Lavande
    title: '🍯 Découverte gourmet',
    subtitle: 'Miel de Lavande du Rucher du Plateau',
    description: 'Un miel d\'exception, récolté dans les champs de lavande de Provence. Une expérience gustative unique !',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=300&fit=crop',
    backgroundColor: '#45B7D1',
    textColor: '#FFFFFF',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    isActive: true,
    priority: 3,
    clickCount: 0,
    conversionRate: 0,
    budget: 300,
    spent: 120,
    targetAudience: ['Gourmets', 'Amateurs de miel', 'Cadeaux'],
    tags: ['Premium', 'Artisanal', 'Lavande', 'Provence'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20'
  },
  {
    id: '4',
    productId: 10, // Fromage de Chèvre Frais
    title: '🧀 Nouveauté fromagerie',
    subtitle: 'Fromage de Chèvre Frais de la Fromagerie du Bocage',
    description: 'Un fromage frais et onctueux, parfait pour vos apéritifs et vos recettes créatives.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
    backgroundColor: '#96CEB4',
    textColor: '#FFFFFF',
    startDate: '2024-01-20',
    endDate: '2024-02-20',
    isActive: true,
    priority: 4,
    clickCount: 0,
    conversionRate: 0,
    budget: 100,
    spent: 25,
    targetAudience: ['Amateurs de fromage', 'Cuisiniers', 'Apéritifs'],
    tags: ['Fromage', 'Chèvre', 'Frais', 'Artisanal'],
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: '5',
    productId: 8, // Poires Williams Bio
    title: '🥩 Viande de qualité',
    subtitle: 'Bœuf Limousin de l\'Élevage de la Vallée Verte',
    description: 'Viande de bœuf Limousin de qualité supérieure, élevée en plein air et nourrie aux céréales.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    backgroundColor: '#DDA0DD',
    textColor: '#FFFFFF',
    startDate: '2024-01-18',
    endDate: '2024-01-25',
    isActive: true,
    priority: 5,
    clickCount: 0,
    conversionRate: 0,
    budget: 80,
    spent: 35,
    targetAudience: ['Carnivores', 'Qualité', 'Gastronomes'],
    tags: ['Viande', 'Limousin', 'Qualité supérieure', 'Plein air'],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-20'
  }
];

// Fonctions utilitaires
export const getSponsoredById = (id) => {
  return sponsoredProducts.find(sponsored => sponsored.id === id);
};

export const getActiveSponsored = () => {
  const now = new Date();
  return sponsoredProducts.filter(sponsored => {
    if (!sponsored.isActive) return false;
    
    const startDate = new Date(sponsored.startDate);
    const endDate = new Date(sponsored.endDate);
    
    return now >= startDate && now <= endDate;
  });
};

export const getSponsoredByPriority = () => {
  return getActiveSponsored().sort((a, b) => b.priority - a.priority);
};

export const getSponsoredWithProductInfo = () => {
  return sponsoredProducts.map(sponsored => {
    const product = products.find(p => p.id === sponsored.productId);
    return {
      ...sponsored,
      product: product
    };
  });
};

export const updateClickCount = (sponsoredId) => {
  const sponsored = sponsoredProducts.find(s => s.id === sponsoredId);
  if (sponsored) {
    sponsored.clickCount += 1;
    sponsored.updatedAt = new Date().toISOString().split('T')[0];
  }
};

export const getSponsoredStats = () => {
  const active = getActiveSponsored();
  const totalBudget = active.reduce((sum, s) => sum + s.budget, 0);
  const totalSpent = active.reduce((sum, s) => sum + s.spent, 0);
  const totalClicks = active.reduce((sum, s) => sum + s.clickCount, 0);
  
  return {
    activeCount: active.length,
    totalBudget,
    totalSpent,
    totalClicks,
    budgetRemaining: totalBudget - totalSpent,
    averageClickCost: totalClicks > 0 ? totalSpent / totalClicks : 0
  };
};

export const searchSponsored = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return sponsoredProducts.filter(sponsored => {
    const product = products.find(p => p.id === sponsored.productId);
    if (!product) return false;
    
    return sponsored.title.toLowerCase().includes(lowercaseQuery) ||
           product.name.toLowerCase().includes(lowercaseQuery) ||
           product.farm.toLowerCase().includes(lowercaseQuery) ||
           sponsored.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));
  });
};
