import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AuthGuard from '../components/AuthGuard';

// Écrans principaux
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import FarmsScreen from '../screens/FarmsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator();

export default function AppNavigator({ navigation }) {
  return (
    <AuthGuard navigation={navigation}>
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
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
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
    </AuthGuard>
  );
}
