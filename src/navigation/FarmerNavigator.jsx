import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FarmerDashboardScreen from '../screens/Farmer/FarmerDashboardScreen';
import FarmerProductsScreen from '../screens/Farmer/FarmerProductsScreen';
import FarmerProposalsScreen from '../screens/Farmer/FarmerProposalsScreen';
import FarmerProductProposalScreen from '../screens/Farmer/FarmerProductProposalScreen';
import FarmerSalesScreen from '../screens/Farmer/FarmerSalesScreen';
import FarmerProfileScreen from '../screens/Farmer/FarmerProfileScreen';

const Tab = createBottomTabNavigator();
const ProductsStack = createStackNavigator();

function FarmerProductsStack() {
  return (
    <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStack.Screen name="FarmerProductsList" component={FarmerProductsScreen} />
      <ProductsStack.Screen name="FarmerProposals" component={FarmerProposalsScreen} />
      <ProductsStack.Screen name="FarmerProductProposal" component={FarmerProductProposalScreen} />
    </ProductsStack.Navigator>
  );
}

export default function FarmerNavigator({ navigation }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const actionType = e.data?.action?.type;
      if (actionType === 'RESET' || actionType === 'REPLACE') {
        return;
      }
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
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            FarmerHome: focused ? 'stats-chart' : 'stats-chart-outline',
            FarmerProducts: focused ? 'cube' : 'cube-outline',
            FarmerSales: focused ? 'receipt' : 'receipt-outline',
            FarmerProfile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={focused ? 24 : 22} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#8D9A72',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 64 + Math.max(insets.bottom, 8),
          borderTopWidth: 1,
          borderTopColor: '#E8EDE0',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="FarmerHome" component={FarmerDashboardScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="FarmerProducts" component={FarmerProductsStack} options={{ title: 'Produits' }} />
      <Tab.Screen name="FarmerSales" component={FarmerSalesScreen} options={{ title: 'Ventes' }} />
      <Tab.Screen name="FarmerProfile" component={FarmerProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}
