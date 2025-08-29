// 🎨 Composants - Dream Market App
// Export centralisé de tous les composants de l'application

// 🎨 Composants UI de base
export * from './ui';

// 🏠 Composants de l'accueil
export * from './home';

// 🛍️ Composants des produits
export * from './products';

// 🏡 Composants des fermes
export * from './farms';

// 🔧 Composants des services
export * from './services';

// 📱 Composants de navigation
export { default as Navigation } from './Navigation';
export { default as TabBar } from './TabBar';
export { default as Header } from './Header';
export { default as Footer } from './Footer';

// 🔐 Composants d'authentification
export { default as LoginForm } from './LoginForm';
export { default as RegisterForm } from './RegisterForm';
export { default as PasswordReset } from './PasswordReset';
export { default as ProfileForm } from './ProfileForm';

// 🛒 Composants du panier
export { default as CartItem } from './CartItem';
export { default as CartSummary } from './CartSummary';
export { default as CartActions } from './CartActions';
export { default as CheckoutForm } from './CheckoutForm';

// 📊 Composants d'administration
export { default as AdminDashboard } from './AdminDashboard';
export { default as StatsCard } from './StatsCard';
export { default as DataTable } from './DataTable';
export { default as ChartComponent } from './ChartComponent';

// 🔍 Composants de recherche
export { default as GlobalSearch } from './GlobalSearch';
export { default as SearchResults } from './SearchResults';
export { default as SearchFilters } from './SearchFilters';
export { default as SearchHistory } from './SearchHistory';

// 📱 Composants de mise en page
export { default as Layout } from './Layout';
export { default as Container } from './Container';
export { default as Section } from './Section';
export { default as Grid } from './Grid';

// 🎭 Composants de feedback
export { default as Toast } from './Toast';
export { default as Alert } from './Alert';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as ErrorBoundary } from './ErrorBoundary';

// 📋 Export par défaut
export default {
  // Composants UI de base
  ...require('./ui'),
  
  // Composants de l'accueil
  ...require('./home'),
  
  // Composants des produits
  ...require('./products'),
  
  // Composants des fermes
  ...require('./farms'),
  
  // Composants des services
  ...require('./services'),
  
  // Composants de navigation
  Navigation: require('./Navigation').default,
  TabBar: require('./TabBar').default,
  Header: require('./Header').default,
  Footer: require('./Footer').default,
  
  // Composants d'authentification
  LoginForm: require('./LoginForm').default,
  RegisterForm: require('./RegisterForm').default,
  PasswordReset: require('./PasswordReset').default,
  ProfileForm: require('./ProfileForm').default,
  
  // Composants du panier
  CartItem: require('./CartItem').default,
  CartSummary: require('./CartSummary').default,
  CartActions: require('./CartActions').default,
  CheckoutForm: require('./CheckoutForm').default,
  
  // Composants d'administration
  AdminDashboard: require('./AdminDashboard').default,
  StatsCard: require('./StatsCard').default,
  DataTable: require('./DataTable').default,
  ChartComponent: require('./ChartComponent').default,
  
  // Composants de recherche
  GlobalSearch: require('./GlobalSearch').default,
  SearchResults: require('./SearchResults').default,
  SearchFilters: require('./SearchFilters').default,
  SearchHistory: require('./SearchHistory').default,
  
  // Composants de mise en page
  Layout: require('./Layout').default,
  Container: require('./Container').default,
  Section: require('./Section').default,
  Grid: require('./Grid').default,
  
  // Composants de feedback
  Toast: require('./Toast').default,
  Alert: require('./Alert').default,
  LoadingSpinner: require('./LoadingSpinner').default,
  ErrorBoundary: require('./ErrorBoundary').default,
};


