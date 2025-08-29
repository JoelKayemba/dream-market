// 📊 Écrans d'administration - Dream Market App
// Export centralisé de tous les écrans d'administration

// 🎯 Écrans principaux d'administration
export { default as AdminScreen } from './AdminScreen';
export { default as AdminDashboard } from './AdminDashboard';
export { default as AdminLogin } from './AdminLogin';

// 🛍️ Gestion des produits sponsorisés
export { default as SponsoredManager } from './SponsoredManager';
export { default as SponsoredProductsList } from './SponsoredProductsList';
export { default as SponsoredProductForm } from './SponsoredProductForm';
export { default as SponsoredProductDetails } from './SponsoredProductDetails';

// 📊 Analytics et statistiques
export { default as AnalyticsScreen } from './AnalyticsScreen';
export { default as DashboardStats } from './DashboardStats';
export { default as SalesAnalytics } from './SalesAnalytics';
export { default as UserAnalytics } from './UserAnalytics';

// 👥 Gestion des utilisateurs
export { default as UserManagement } from './UserManagement';
export { default as UserList } from './UserList';
export { default as UserDetails } from './UserDetails';
export { default as UserForm } from './UserForm';

// 🏡 Gestion des fermes
export { default as FarmManagement } from './FarmManagement';
export { default as FarmList } from './FarmList';
export { default as FarmDetails } from './FarmDetails';
export { default as FarmForm } from './FarmForm';

// 🛍️ Gestion des produits
export { default as ProductManagement } from './ProductManagement';
export { default as ProductList } from './ProductList';
export { default as ProductDetails } from './ProductDetails';
export { default as ProductForm } from './ProductForm';

// 🔧 Gestion des services
export { default as ServiceManagement } from './ServiceManagement';
export { default as ServiceList } from './ServiceList';
export { default as ServiceDetails } from './ServiceDetails';
export { default as ServiceForm } from './ServiceForm';

// 📋 Gestion des commandes
export { default as OrderManagement } from './OrderManagement';
export { default as OrderList } from './OrderList';
export { default as OrderDetails } from './OrderDetails';
export { default as OrderStatus } from './OrderStatus';

// ⚙️ Configuration et paramètres
export { default as SettingsScreen } from './SettingsScreen';
export { default as AppSettings } from './AppSettings';
export { default as NotificationSettings } from './NotificationSettings';
export { default as SecuritySettings } from './SecuritySettings';

// 📋 Export par défaut
export default {
  // Écrans principaux
  AdminScreen,
  AdminDashboard,
  AdminLogin,
  
  // Gestion des produits sponsorisés
  SponsoredManager,
  SponsoredProductsList,
  SponsoredProductForm,
  SponsoredProductDetails,
  
  // Analytics et statistiques
  AnalyticsScreen,
  DashboardStats,
  SalesAnalytics,
  UserAnalytics,
  
  // Gestion des utilisateurs
  UserManagement,
  UserList,
  UserDetails,
  UserForm,
  
  // Gestion des fermes
  FarmManagement,
  FarmList,
  FarmDetails,
  FarmForm,
  
  // Gestion des produits
  ProductManagement,
  ProductList,
  ProductDetails,
  ProductForm,
  
  // Gestion des services
  ServiceManagement,
  ServiceList,
  ServiceDetails,
  ServiceForm,
  
  // Gestion des commandes
  OrderManagement,
  OrderList,
  OrderDetails,
  OrderStatus,
  
  // Configuration et paramètres
  SettingsScreen,
  AppSettings,
  NotificationSettings,
  SecuritySettings,
};


