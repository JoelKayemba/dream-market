import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, View, Image, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/store';
import NotificationManager from './src/components/NotificationManager';
import BackgroundNotificationService from './src/services/backgroundNotificationServiceNew';
import ErrorBoundary from './src/components/ErrorBoundary';
import GlobalErrorHandler from './src/components/GlobalErrorHandler';
import { supabase } from './src/backend/config/supabase';
import { authListenerService } from './src/backend/services/authListenerService';

// Écrans d'authentification
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// Écrans principaux
import AppNavigator from './src/navigation/AppNavigator';
import SearchScreen from './src/screens/SearchScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CategoryProductsScreen from './src/screens/CategoryProductsScreen';
import AllProductsScreen from './src/screens/AllProductsScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import FarmDetailScreen from './src/screens/FarmDetailScreen';
import ServiceDetailScreen from './src/screens/ServiceDetailScreen';
import AllFarmsScreen from './src/screens/AllFarmsScreen';
import AllServicesScreen from './src/screens/AllServicesScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderScreen from './src/screens/OrderScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';

// Écrans d'administration
import AdminNavigator from './src/screens/Admin/AdminNavigator';

const Stack = createStackNavigator();

export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  const [initialRoute, setInitialRoute] = React.useState('Welcome');

  // Initialiser l'application
  React.useEffect(() => {
    initializeApp();
    
    // Démarrer le listener pour les changements d'auth state
    const unsubscribe = authListenerService.addListener(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        // Mettre à jour le token dans Redux quand il est rafraîchi
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        store.dispatch({
          type: 'auth/loadStoredAuth/fulfilled',
          payload: {
            user: {
              id: session.user.id,
              email: session.user.email,
              role: profile?.role || 'customer',
              firstName: profile?.first_name || '',
              lastName: profile?.last_name || '',
              phone: profile?.phone || '',
              address: profile?.address || '',
              avatarUrl: profile?.avatar_url || '',
            },
            token: session.access_token,
            refreshToken: session.refresh_token
          }
        });
      } else if (event === 'SIGNED_OUT') {
        // Déconnecter l'utilisateur dans Redux
        store.dispatch({
          type: 'auth/logout/fulfilled'
        });
      }
    });

    // Cleanup lors du démontage
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Vérifier s'il y a une session valide
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Récupérer le profil utilisateur
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Charger la session dans Redux
        store.dispatch({
          type: 'auth/loadStoredAuth/fulfilled',
          payload: {
            user: {
              id: session.user.id,
              email: session.user.email,
              role: profile?.role || 'customer',
              firstName: profile?.first_name || '',
              lastName: profile?.last_name || '',
              phone: profile?.phone || '',
              address: profile?.address || '',
              avatarUrl: profile?.avatar_url || '',
            },
            token: session.access_token,
            refreshToken: session.refresh_token
          }
        });

        // Utilisateur déjà connecté, aller directement à MainApp
        setInitialRoute('MainApp');
      } else {
        // Pas de session, commencer par Welcome
        setInitialRoute('Welcome');
      }

      // Initialiser le service de notifications en arrière-plan
      BackgroundNotificationService.initialize();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setInitialRoute('Welcome');
    } finally {
      setIsReady(true);
    }
  };

  // Écran de chargement avec logo
  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('./assets/Dream_logo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
        <ActivityIndicator 
          size="large" 
          color="#4CAF50" 
          style={styles.splashLoader}
        />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GlobalErrorHandler>
        <SafeAreaProvider>
          <Provider store={store}>
            <NotificationManager />
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName={initialRoute}
                screenOptions={{
                  headerShown: false,
                }}
              >
                {/* Écrans d'authentification */}
                <Stack.Screen
                  name="Welcome"
                  component={WelcomeScreen}
                  options={{
                    title: 'Bienvenue'
                  }}
                />
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{
                    title: 'Connexion'
                  }}
                />
                <Stack.Screen
                  name="Register"
                  component={RegisterScreen}
                  options={{
                    title: 'Inscription'
                  }}
                />
                <Stack.Screen
                  name="ForgotPassword"
                  component={ForgotPasswordScreen}
                  options={{
                    title: 'Mot de passe oublié'
                  }}
                />
                
                {/* Application principale */}
                <Stack.Screen
                  name="MainApp"
                  component={AppNavigator}
                  options={{
                    title: 'Dream Market'
                  }}
                />

                {/* Écrans de recherche et détails */}
                <Stack.Screen
                  name="Search"
                  component={SearchScreen}
                  options={{
                    title: 'Recherche'
                  }}
                />

                {/* Écrans de navigation depuis l'accueil */}
                <Stack.Screen
                  name="Notifications"
                  component={NotificationsScreen}
                  options={{
                    title: 'Notifications'
                  }}
                />
                <Stack.Screen
                  name="CategoryProducts"
                  component={CategoryProductsScreen}
                  options={{
                    title: 'Produits par catégorie'
                  }}
                />
                <Stack.Screen
                  name="AllProducts"
                  component={AllProductsScreen}
                  options={{
                    title: 'Tous nos produits'
                  }}
                />
                <Stack.Screen
                  name="ProductDetail"
                  component={ProductDetailScreen}
                  options={{
                    title: 'Détails du produit'
                  }}
                />
                <Stack.Screen
                  name="Cart"
                  component={CartScreen}
                  options={{
                    title: 'Panier'
                  }}
                />
                <Stack.Screen
                  name="FarmDetail"
                  component={FarmDetailScreen}
                  options={{
                    title: 'Détails de la ferme'
                  }}
                />
                <Stack.Screen
                  name="ServiceDetail"
                  component={ServiceDetailScreen}
                  options={{
                    title: 'Détails du service'
                  }}
                />
                <Stack.Screen
                  name="AllFarms"
                  component={AllFarmsScreen}
                  options={{
                    title: 'Toutes les fermes'
                  }}
                />
                <Stack.Screen
                  name="AllServices"
                  component={AllServicesScreen}
                  options={{
                    title: 'Tous les services'
                  }}
                />
                <Stack.Screen
                  name="Checkout"
                  component={CheckoutScreen}
                  options={{
                    title: 'Finaliser la commande'
                  }}
                />
                <Stack.Screen
                  name="Orders"
                  component={OrderScreen}
                  options={{
                    title: 'Mes Commandes'
                  }}
                />
                <Stack.Screen
                  name="OrderDetail"
                  component={OrderDetailScreen}
                  options={{
                    title: 'Détails de la commande'
                  }}
                />

                {/* Écrans d'administration */}
                <Stack.Screen
                  name="AdminDashboard"
                  component={AdminNavigator}
                  options={{
                    title: 'Administration',
                    headerShown: false
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </Provider>
        </SafeAreaProvider>
      </GlobalErrorHandler>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  splashLoader: {
    marginTop: 20,
  },
});
