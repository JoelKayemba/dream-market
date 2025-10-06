import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminMenu({ navigation, currentScreen }) {
  const menuItems = [
    {
      id: 'AdminDashboard',
      title: 'Tableau de Bord',
      icon: 'home-outline',
      color: '#4CAF50'
    },
    {
      id: 'ProductsManagement',
      title: 'Gestion des Produits',
      icon: 'leaf-outline',
      color: '#2196F3'
    },
    {
      id: 'FarmsManagement',
      title: 'Gestion des Fermes',
      icon: 'business-outline',
      color: '#FF9800'
    },
    {
      id: 'ServicesManagement',
      title: 'Gestion des Services',
      icon: 'construct-outline',
      color: '#9C27B0'
    },
    {
      id: 'UsersManagement',
      title: 'Gestion des Utilisateurs',
      icon: 'people-outline',
      color: '#F44336'
    },
    {
      id: 'OrdersManagement',
      title: 'Gestion des Commandes',
      icon: 'receipt-outline',
      color: '#607D8B'
    },
    {
      id: 'DashboardAnalytics',
      title: 'Analytics',
      icon: 'analytics-outline',
      color: '#795548'
    },
    {
      id: 'AdminSettings',
      title: 'Paramètres',
      icon: 'settings-outline',
      color: '#9E9E9E'
    }
  ];

  const handleMenuPress = (screenName) => {
    navigation.navigate(screenName);
  };

  const MenuItem = ({ item }) => {
    const isActive = currentScreen === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.menuItem, isActive && styles.activeMenuItem]}
        onPress={() => handleMenuPress(item.id)}
      >
        <View style={[styles.menuIcon, { backgroundColor: isActive ? item.color : '#F5F5F5' }]}>
          <Ionicons 
            name={item.icon} 
            size={20} 
            color={isActive ? '#FFFFFF' : item.color} 
          />
        </View>
        <Text style={[styles.menuText, isActive && styles.activeMenuText]}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administration</Text>
      </View>
      
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  activeMenuItem: {
    backgroundColor: '#F0F8F0',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 14,
    color: '#283106',
    fontWeight: '500',
  },
  activeMenuText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});




