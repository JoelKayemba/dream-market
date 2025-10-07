import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// Import des écrans admin
import AdminDashboard from './AdminDashboard';
import ProductsManagement from './Products/ProductsManagement';
import ProductDetail from './Products/ProductDetail';
import ProductForm from './Products/ProductForm';
import ProductCategories from './Products/ProductCategories';
import FarmsManagement from './Farms/FarmsManagement';
import FarmDetail from './Farms/FarmDetail';
import FarmForm from './Farms/FarmForm';
import FarmProducts from './Farms/FarmProducts';
import FarmVerification from './Farms/FarmVerification';
import AdminServicesManagement from './Services/ServicesManagement';
import AdminServiceForm from './Services/ServiceForm';
import AdminServiceDetail from './Services/ServiceDetail';
import OrdersManagement from './Orders/OrdersManagement';
import OrderDetail from './Orders/OrderDetail';
import OrderStatus from './Orders/OrderStatus';
import AnalyticsDashboard from './Analytics/AnalyticsDashboard';
import SalesAnalytics from './Analytics/SalesAnalytics';
import UserAnalytics from './Analytics/UserAnalytics';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Composant pour le menu latéral
function AdminDrawerContent({ navigation }) {
  const menuItems = [
    {
      id: 'dashboard',
      title: 'Tableau de Bord',
      icon: 'home-outline',
      screen: 'AdminDashboard'
    },
    {
      id: 'products',
      title: 'Gestion des Produits',
      icon: 'leaf-outline',
      screen: 'ProductsManagement'
    },
    {
      id: 'farms',
      title: 'Gestion des Fermes',
      icon: 'business-outline',
      screen: 'FarmsManagement'
    },
    {
      id: 'services',
      title: 'Gestion des Services',
      icon: 'construct-outline',
      screen: 'AdminServicesManagement'
    },
    {
      id: 'orders',
      title: 'Gestion des Commandes',
      icon: 'receipt-outline',
      screen: 'OrdersManagement'
    },
   
  ];

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 280,
        },
        drawerActiveTintColor: '#4CAF50',
        drawerInactiveTintColor: '#777E5C',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}
    >
      {menuItems.map((item) => (
        <Drawer.Screen
          key={item.id}
          name={item.screen}
          component={getScreenComponent(item.screen)}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name={item.icon} size={size} color={color} />
            ),
            drawerLabel: item.title,
          }}
        />
      ))}
    </Drawer.Navigator>
  );
}

// Fonction pour obtenir le composant d'écran
function getScreenComponent(screenName) {
  const screens = {
    AdminDashboard,
    ProductsManagement,
    ProductForm,
    ProductCategories,
    FarmsManagement,
    FarmForm,
    FarmVerification,
    AdminServicesManagement,
    AdminServiceForm,
    AdminServiceDetail,
    OrdersManagement,
    OrderDetail,
    OrderStatus,
    AnalyticsDashboard,
    SalesAnalytics,
    UserAnalytics,
  };
  
  return screens[screenName] || AdminDashboard;
}

// Navigateur principal de l'administration
export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AdminDrawer"
        component={AdminDrawerContent}
        options={{
          title: 'Administration'
        }}
      />
      
      {/* Écrans de gestion des produits */}
      <Stack.Screen
        name="ProductsManagement"
        component={ProductsManagement}
        options={{
          title: 'Gestion des Produits'
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetail}
        options={{
          title: 'Détails du Produit'
        }}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductForm}
        options={{
          title: 'Formulaire Produit'
        }}
      />
      <Stack.Screen
        name="ProductCategories"
        component={ProductCategories}
        options={{
          title: 'Catégories Produits'
        }}
      />
      
      {/* Écrans de gestion des fermes */}
      <Stack.Screen
        name="FarmsManagement"
        component={FarmsManagement}
        options={{
          title: 'Gestion des Fermes'
        }}
      />
      <Stack.Screen
        name="FarmDetail"
        component={FarmDetail}
        options={{
          title: 'Détails de la Ferme'
        }}
      />
      <Stack.Screen
        name="FarmForm"
        component={FarmForm}
        options={{
          title: 'Formulaire Ferme'
        }}
      />
      <Stack.Screen
        name="FarmProducts"
        component={FarmProducts}
        options={{
          title: 'Produits de la Ferme'
        }}
      />
      <Stack.Screen
        name="FarmVerification"
        component={FarmVerification}
        options={{
          title: 'Vérification Fermes'
        }}
      />
      
      {/* Écrans de gestion des services */}
      <Stack.Screen
        name="AdminServicesManagement"
        component={AdminServicesManagement}
        options={{
          title: 'Gestion des Services'
        }}
      />
      <Stack.Screen
        name="AdminServiceForm"
        component={AdminServiceForm}
        options={{
          title: 'Formulaire Service'
        }}
      />
      <Stack.Screen
        name="AdminServiceDetail"
        component={AdminServiceDetail}
        options={{
          title: 'Détails du Service'
        }}
      />
      
      {/* Écrans de gestion des commandes */}
      <Stack.Screen
        name="OrdersManagement"
        component={OrdersManagement}
        options={{
          title: 'Gestion des Commandes'
        }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetail}
        options={{
          title: 'Détails Commande'
        }}
      />
      <Stack.Screen
        name="OrderStatus"
        component={OrderStatus}
        options={{
          title: 'Statuts Commandes'
        }}
      />
      
      {/* Écrans d'analytics */}
     
      <Stack.Screen
        name="SalesAnalytics"
        component={SalesAnalytics}
        options={{
          title: 'Analytics Ventes'
        }}
      />
      <Stack.Screen
        name="UserAnalytics"
        component={UserAnalytics}
        options={{
          title: 'Analytics Utilisateurs'
        }}
      />
      <Stack.Screen
        name="AnalyticsDashboard"
        component={AnalyticsDashboard}
        options={{
          title: 'Analytics Dashboard'
        }}
      />
      
    </Stack.Navigator>
  );
}
