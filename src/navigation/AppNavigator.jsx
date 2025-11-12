import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import AuthGuard from '../components/AuthGuard';

// Écrans principaux
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import FarmsScreen from '../screens/FarmsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator();

export default function AppNavigator({ navigation }) {
  const insets = useSafeAreaInsets();

  // Empêcher le retour en arrière depuis MainApp
  useEffect(() => {
    const backAction = () => {
      // Empêcher le retour en arrière depuis MainApp
      // L'utilisateur doit se déconnecter pour revenir aux écrans d'auth
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Empêcher le retour par swipe depuis MainApp
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Empêcher complètement le retour depuis MainApp
      e.preventDefault();
    });

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation]);

  return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Accueil') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Produits') {
              iconName = focused ? 'leaf' : 'leaf-outline';
            } else if (route.name === 'Fermes') {
              iconName = focused ? 'business' : 'business-outline';
            } else if (route.name === 'Services') {
              iconName = focused ? 'construct' : 'construct-outline';
            } else if (route.name === 'Profil') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#777E5C',
          tabBarStyle: {
            backgroundColor: '#f5f5f5',
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 8),
            height: 60 + Math.max(insets.bottom, 8),
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Accueil" 
          component={HomeScreen}
          options={{
            title: 'Accueil'
          }}
        />
        <Tab.Screen 
          name="Produits" 
          component={ProductsScreen}
          options={{
            title: 'Produits'
          }}
        />
        <Tab.Screen 
          name="Fermes" 
          component={FarmsScreen}
          options={{
            title: 'Fermes'
          }}
        />
        <Tab.Screen 
          name="Services" 
          component={ServicesScreen}
          options={{
            title: 'Services'
          }}
        />
        <Tab.Screen 
          name="Profil" 
          component={ProfileStackNavigator}
          options={{
            title: 'Profil'
          }}
        />
      </Tab.Navigator>
  );
}
