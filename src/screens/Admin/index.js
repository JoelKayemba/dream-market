// Export principal pour tous les écrans d'administration
export { default as AdminDashboard } from './AdminDashboard';
export { default as AdminNavigator } from './AdminNavigator';

// Gestion des produits
export { default as ProductsManagement } from './Products/ProductsManagement';
export { default as ProductForm } from './Products/ProductForm';
export { default as ProductCategories } from './Products/ProductCategories';

// Gestion des fermes
export { default as FarmsManagement } from './Farms/FarmsManagement';
export { default as FarmForm } from './Farms/FarmForm';
export { default as FarmVerification } from './Farms/FarmVerification';

// Gestion des services
export { default as ServicesManagement } from './Services/ServicesManagement';
export { default as ServiceForm } from './Services/ServiceForm';
export { default as ServiceCategories } from './Services/ServiceCategories';

// Gestion des utilisateurs
export { default as UsersManagement } from './Users/UsersManagement';
export { default as UserForm } from './Users/UserForm';
export { default as UserRoles } from './Users/UserRoles';

// Gestion des commandes
export { default as OrdersManagement } from './Orders/OrdersManagement';
export { default as OrderDetail } from './Orders/OrderDetail';
export { default as OrderStatus } from './Orders/OrderStatus';

// Analytics
export { default as DashboardAnalytics } from './Analytics/DashboardAnalytics';
export { default as SalesAnalytics } from './Analytics/SalesAnalytics';
export { default as UserAnalytics } from './Analytics/UserAnalytics';

// Paramètres
export { default as AdminSettings } from './Settings/AdminSettings';
export { default as AppSettings } from './Settings/AppSettings';
export { default as BackupRestore } from './Settings/BackupRestore';