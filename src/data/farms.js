export const farms = [
  {
    id: 1,
    name: 'Ferme du Soleil Levant',
    description: 'Ferme familiale de 4ème génération spécialisée dans la culture biologique de légumes et fruits de saison. Notre engagement : respecter la terre et nourrir les familles avec des produits sains et savoureux.',
    location: 'Normandie, France',
    region: 'Basse-Normandie',
    specialty: 'organic',
    rating: 4.9,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop',
    certifications: ['Bio', 'HVE', 'Nature & Progrès'],
    delivery: true,
    pickup: true,
    farmShop: true,
    products: ['Tomates', 'Salades', 'Carottes', 'Pommes', 'Poires', 'Framboises'],
    established: 1985,
    size: '12 hectares',
    familyMembers: 4,
    sustainablePractices: ['Rotation des cultures', 'Compostage', 'Énergie solaire'],
    story: 'Depuis 1985, notre famille cultive cette terre avec passion et respect. Nous croyons en une agriculture qui nourrit les corps et les âmes.',
    contact: {
      phone: '+33 2 31 45 67 89',
      email: 'contact@fermedusoleil.fr',
      website: 'www.fermedusoleil.fr'
    }
  },
  {
    id: 2,
    name: 'Verger des Collines d\'Or',
    description: 'Verger traditionnel de 8 hectares produisant des pommes, poires et cerises de qualité exceptionnelle. Nos fruits sont cultivés selon les méthodes ancestrales combinées aux innovations durables.',
    location: 'Alsace, France',
    region: 'Bas-Rhin',
    specialty: 'fruits',
    rating: 4.7,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop',
    certifications: ['Bio', 'Label Rouge'],
    delivery: true,
    pickup: true,
    farmShop: true,
    products: ['Pommes Golden', 'Poires Williams', 'Cerises', 'Prunes', 'Abricots'],
    established: 1972,
    size: '8 hectares',
    familyMembers: 3,
    sustainablePractices: ['Pâturage ovin', 'Hôtels à insectes', 'Gestion de l\'eau'],
    story: 'Notre verger est un havre de biodiversité où chaque arbre raconte une histoire. Nous préservons les variétés anciennes tout en innovant pour l\'avenir.',
    contact: {
      phone: '+33 3 88 12 34 56',
      email: 'info@vergerdescollines.fr',
      website: 'www.vergerdescollines.fr'
    }
  },
  {
    id: 3,
    name: 'Champs de l\'Ouest Céréaliers',
    description: 'Exploitation céréalière moderne de 150 hectares produisant blé, orge et maïs pour la consommation humaine et animale. Nous privilégions les techniques de conservation des sols.',
    location: 'Bretagne, France',
    region: 'Ille-et-Vilaine',
    specialty: 'cereals',
    rating: 4.5,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop',
    certifications: ['HVE', 'GAP', 'Filière Qualité'],
    delivery: false,
    pickup: true,
    farmShop: false,
    products: ['Blé Dur', 'Orge', 'Maïs', 'Avoine', 'Seigle'],
    established: 1990,
    size: '150 hectares',
    familyMembers: 2,
    sustainablePractices: ['Agriculture de conservation', 'Couverts végétaux', 'Réduction des intrants'],
    story: 'Notre ferme est un exemple d\'agriculture moderne et responsable. Nous produisons des céréales de qualité tout en préservant la fertilité de nos sols.',
    contact: {
      phone: '+33 2 99 12 34 56',
      email: 'contact@champsouest.fr',
      website: 'www.champsouest.fr'
    }
  },
  {
    id: 4,
    name: 'Ferme du Plateau Laitier',
    description: 'Ferme laitière traditionnelle de 80 hectares produisant lait, fromages et yaourts artisanaux. Nos vaches pâturent librement sur les pâturages d\'altitude.',
    location: 'Auvergne, France',
    region: 'Puy-de-Dôme',
    specialty: 'dairy',
    rating: 4.8,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop',
    certifications: ['Bio', 'AOP', 'Label Rouge'],
    delivery: true,
    pickup: true,
    farmShop: true,
    products: ['Lait Frais', 'Fromage de Chèvre', 'Yaourt Nature', 'Beurre Fermier', 'Crème'],
    established: 1968,
    size: '80 hectares',
    familyMembers: 5,
    sustainablePractices: ['Pâturage extensif', 'Traite à la main', 'Fromages affinés'],
    story: 'Sur les hauts plateaux d\'Auvergne, nous perpétuons la tradition fromagère. Chaque produit raconte l\'histoire de nos terres et de nos vaches.',
    contact: {
      phone: '+33 4 73 12 34 56',
      email: 'info@fermeduplateau.fr',
      website: 'www.fermeduplateau.fr'
    }
  },
  {
    id: 5,
    name: 'Domaine des Vignes Ancestrales',
    description: 'Domaine viticole de 25 hectares cultivant des vignes selon les méthodes traditionnelles. Nos vins expriment le terroir unique de notre région.',
    location: 'Bourgogne, France',
    region: 'Côte d\'Or',
    specialty: 'wine',
    rating: 4.9,
    reviewCount: 445,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop',
    certifications: ['Bio', 'AOC', 'HVE'],
    delivery: true,
    pickup: true,
    farmShop: true,
    products: ['Pinot Noir', 'Chardonnay', 'Gamay', 'Crémant'],
    established: 1850,
    size: '25 hectares',
    familyMembers: 6,
    sustainablePractices: ['Vendanges manuelles', 'Élevage en fûts', 'Biodynamie'],
    story: 'Depuis 1850, notre famille perpétue l\'art de la viticulture. Chaque millésime raconte l\'histoire de notre terroir et de notre passion.',
    contact: {
      phone: '+33 3 80 12 34 56',
      email: 'contact@domainedesvignes.fr',
      website: 'www.domainedesvignes.fr'
    }
  },
  {
    id: 6,
    name: 'Ferme des Herbes Aromatiques',
    description: 'Ferme spécialisée dans la culture d\'herbes aromatiques et de plantes médicinales. Nous produisons des tisanes, huiles essentielles et condiments naturels.',
    location: 'Provence, France',
    region: 'Var',
    specialty: 'herbs',
    rating: 4.6,
    reviewCount: 178,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop',
    certifications: ['Bio', 'Nature & Progrès'],
    delivery: true,
    pickup: true,
    farmShop: true,
    products: ['Thym', 'Romarin', 'Lavande', 'Sauge', 'Menthe'],
    established: 2005,
    size: '6 hectares',
    familyMembers: 2,
    sustainablePractices: ['Culture en terrasses', 'Récolte manuelle', 'Séchage naturel'],
    story: 'Au cœur de la Provence, nous cultivons les herbes qui parfument notre région. Chaque plante est récoltée avec soin et respect.',
    contact: {
      phone: '+33 4 94 12 34 56',
      email: 'info@fermedesherbes.fr',
      website: 'www.fermedesherbes.fr'
    }
  }
];

export const getFarmsBySpecialty = (specialty) => {
  if (specialty === 'all') return farms;
  return farms.filter(farm => farm.specialty === specialty);
};

export const getPopularFarms = () => {
  return farms.filter(farm => farm.rating >= 4.5);
};

export const getNewFarms = () => {
  return farms.filter(farm => farm.established >= 2000);
};

export const getFarmsByRegion = (region) => {
  return farms.filter(farm => farm.region === region);
};

export const searchFarms = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return farms.filter(farm => 
    farm.name.toLowerCase().includes(lowercaseQuery) ||
    farm.location.toLowerCase().includes(lowercaseQuery) ||
    farm.description.toLowerCase().includes(lowercaseQuery)
  );
};
