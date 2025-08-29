// 📱 Application principale - Dream Market App
// Export centralisé de la navigation et de la configuration

// 🧭 Navigation principale
export { default as AppNavigator } from './AppNavigator';
export { default as BottomTabs } from './BottomTabs';
export { default as StackNavigator } from './StackNavigator';
export { default as DrawerNavigator } from './DrawerNavigator';

// 🛣️ Configuration des routes
export { default as routes } from './routes';
export { default as navigationConfig } from './navigationConfig';

// 🔧 Configuration de l'application
export { default as appConfig } from './appConfig';
export { default as constants } from './constants';

// 📱 Composants de navigation
export { default as NavigationHeader } from './NavigationHeader';
export { default as NavigationFooter } from './NavigationFooter';
export { default as NavigationDrawer } from './NavigationDrawer';

// 🎯 Composants de mise en page
export { default as AppContainer } from './AppContainer';
export { default as AppWrapper } from './AppWrapper';
export { default as AppProvider } from './AppProvider';

// 📋 Export par défaut
export default {
  // Navigation principale
  AppNavigator: require('./AppNavigator').default,
  BottomTabs: require('./BottomTabs').default,
  StackNavigator: require('./StackNavigator').default,
  DrawerNavigator: require('./DrawerNavigator').default,
  
  // Configuration des routes
  routes: require('./routes').default,
  navigationConfig: require('./navigationConfig').default,
  
  // Configuration de l'application
  appConfig: require('./appConfig').default,
  constants: require('./constants').default,
  
  // Composants de navigation
  NavigationHeader: require('./NavigationHeader').default,
  NavigationFooter: require('./NavigationFooter').default,
  NavigationDrawer: require('./NavigationDrawer').default,
  
  // Composants de mise en page
  AppContainer: require('./AppContainer').default,
  AppWrapper: require('./AppWrapper').default,
  AppProvider: require('./AppProvider').default,
};


