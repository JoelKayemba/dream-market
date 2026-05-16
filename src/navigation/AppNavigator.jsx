import React, { useEffect } from 'react';
import { BackHandler, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import AuthGuard from '../components/AuthGuard';

// Écrans principaux
import HomeScreen from '../screens/HomeScreen';
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
          tabBarIcon: ({ focused, color }) => {
            let iconName;

            if (route.name === 'Accueil') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Fermes') {
              iconName = focused ? 'business' : 'business-outline';
            } else if (route.name === 'Services') {
              iconName = focused ? 'construct' : 'construct-outline';
            } else if (route.name === 'Profil') {
              iconName = focused ? 'person' : 'person-outline';
            }

            const iconSize = focused ? 24 : 22;

            return (
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 23,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: focused ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                }}
              >
                <Ionicons name={iconName} size={iconSize} color={color} />
              </View>
            );
          },
          tabBarActiveTintColor: '#2E7D32',
          tabBarInactiveTintColor: '#8D9A72',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            marginHorizontal: 0,
            marginBottom: 0,
            marginTop: 0,
            paddingTop: 8,
            paddingBottom: Math.max(insets.bottom, 8),
            height: 64 + Math.max(insets.bottom, 8),
            borderTopWidth: 1,
            borderTopColor: '#E8EDE0',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 0,
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
