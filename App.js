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


