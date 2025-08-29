// 🚀 Index Principal - Dream Market App
// Export centralisé de tous les modules de l'application

// 🧭 Navigation
export * from './navigation';

// 🎨 Composants UI
export * from './components/ui';

// 📱 Écrans
export { default as HomeScreen } from './screens/HomeScreen';
export { default as ProductsScreen } from './screens/ProductsScreen';
export { default as FarmsScreen } from './screens/FarmsScreen';
export { default as ServicesScreen } from './screens/ServicesScreen';
export { default as ProfileScreen } from './screens/AdminScreen';

// 🎨 Thème
export * from './theme';

// 📊 Données
export * from './data';

// 🔧 Fonction d'initialisation de l'app
export const initializeApp = () => {
  console.log('🌾 Dream Market App initialisée avec succès !');
  console.log('📱 Navigation configurée');
  console.log('🎨 Composants UI chargés');
  console.log('🎨 Thème appliqué');
  console.log('📊 Données mock chargées');
};

// 📋 Informations sur l'app
export const appInfo = {
  name: 'Dream Market',
  version: '1.0.0',
  description: 'Application de marché agricole',
  features: [
    'Navigation par onglets',
    '5 écrans principaux',
    'Composants UI réutilisables',
    'Thème personnalisé',
    'Données mock complètes'
  ]
};
