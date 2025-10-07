import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/store';

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
  return (
    <Provider store={store}>
      <SafeAreaView style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator
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
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});


