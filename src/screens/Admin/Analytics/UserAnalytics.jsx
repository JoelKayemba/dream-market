import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button } from '../../../components/ui';

export default function UserAnalytics({ navigation }) {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    // TODO: Remplacer par un appel API réel
    setUserData({
      totalUsers: 1250,
      newUsersThisMonth: 180,
      activeUsers: 890,
      inactiveUsers: 360,
      userGrowth: 15.2,
      retentionRate: 78.5,
      averageSessionTime: 12.5,
      userRoles: [
        { role: 'client', count: 1200, percentage: 96.0 },
        { role: 'fermier', count: 45, percentage: 3.6 },
        { role: 'admin', count: 5, percentage: 0.4 },
      ],
      userActivity: [
        { date: '2024-01-15', active: 45, new: 8 },
        { date: '2024-01-14', active: 52, new: 12 },
        { date: '2024-01-13', active: 38, new: 6 },
        { date: '2024-01-12', active: 41, new: 9 },
        { date: '2024-01-11', active: 48, new: 11 },
        { date: '2024-01-10', active: 35, new: 7 },
        { date: '2024-01-09', active: 43, new: 10 },
      ],
      topUsers: [
        { name: 'Jean Dupont', orders: 25, totalSpent: 1250 },
        { name: 'Marie Martin', orders: 22, totalSpent: 980 },
        { name: 'Pierre Durand', orders: 18, totalSpent: 750 },
      ]
    });
    setLoading(false);
  };

  const UserMetricCard = ({ title, value, subtitle, icon, color }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.metricInfo}>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.metricValue}>{value}</Text>
          {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  const RoleCard = ({ role }) => (
    <View style={styles.roleCard}>
      <View style={styles.roleHeader}>
        <Text style={styles.roleName}>{role.role}</Text>
        <Text style={styles.rolePercentage}>{role.percentage}%</Text>
      </View>
      <View style={styles.roleBar}>
        <View 
          style={[
            styles.roleBarFill, 
            { 
              width: `${role.percentage}%`,
              backgroundColor: role.role === 'client' ? '#4CAF50' : 
                              role.role === 'fermier' ? '#2196F3' : '#FF9800'
            }
          ]} 
        />
      </View>
      <Text style={styles.roleCount}>{role.count} utilisateurs</Text>
    </View>
  );

  const ActivityCard = ({ day }) => (
    <View style={styles.activityCard}>
      <Text style={styles.activityDate}>{day.date}</Text>
      <Text style={styles.activityActive}>{day.active} actifs</Text>
      <Text style={styles.activityNew}>{day.new} nouveaux</Text>
    </View>
  );

  const TopUserCard = ({ user, index }) => (
    <View style={styles.topUserCard}>
      <View style={styles.userRank}>
        <Text style={styles.rankText}>#{index + 1}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userOrders}>{user.orders} commandes</Text>
      </View>
      <Text style={styles.userSpent}>{user.totalSpent}€</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Utilisateurs</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadUserData}
        >
          <Ionicons name="refresh-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.analyticsSection}>
          <Text style={styles.sectionTitle}>Métriques Utilisateurs</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des analytics...</Text>
            </View>
          ) : (
            <>
              {/* Métriques principales */}
              <View style={styles.metricsGrid}>
                <UserMetricCard
                  title="Utilisateurs Totaux"
                  value={userData.totalUsers.toLocaleString()}
                  subtitle="Inscrits"
                  icon="people-outline"
                  color="#4CAF50"
                />
                <UserMetricCard
                  title="Nouveaux Utilisateurs"
                  value={userData.newUsersThisMonth}
                  subtitle="Ce mois"
                  icon="person-add-outline"
                  color="#2196F3"
                />
                <UserMetricCard
                  title="Utilisateurs Actifs"
                  value={userData.activeUsers}
                  subtitle="Actifs"
                  icon="checkmark-circle-outline"
                  color="#FF9800"
                />
                <UserMetricCard
                  title="Taux de Rétention"
                  value={`${userData.retentionRate}%`}
                  subtitle="30 jours"
                  icon="trending-up-outline"
                  color="#9C27B0"
                />
              </View>

              {/* Répartition par rôle */}
              <View style={styles.rolesSection}>
                <Text style={styles.sectionTitle}>Répartition par Rôle</Text>
                <View style={styles.rolesList}>
                  {userData.userRoles.map((role, index) => (
                    <RoleCard key={index} role={role} />
                  ))}
                </View>
              </View>

              {/* Activité quotidienne */}
              <View style={styles.activitySection}>
                <Text style={styles.sectionTitle}>Activité Quotidienne (7 derniers jours)</Text>
                <View style={styles.activityGrid}>
                  {userData.userActivity.map((day, index) => (
                    <ActivityCard key={index} day={day} />
                  ))}
                </View>
              </View>

              {/* Top utilisateurs */}
              <View style={styles.topUsersSection}>
                <Text style={styles.sectionTitle}>Top Utilisateurs</Text>
                <View style={styles.topUsersList}>
                  {userData.topUsers.map((user, index) => (
                    <TopUserCard key={index} user={user} index={index} />
                  ))}
                </View>
              </View>
            </>
          )}
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#283106',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  analyticsSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#283106',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#777E5C',
    marginTop: 2,
  },
  rolesSection: {
    marginBottom: 24,
  },
  rolesList: {
    gap: 12,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
  },
  rolePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  roleBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  roleBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  roleCount: {
    fontSize: 14,
    color: '#777E5C',
  },
  activitySection: {
    marginBottom: 24,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#777E5C',
    marginBottom: 4,
  },
  activityActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 2,
  },
  activityNew: {
    fontSize: 12,
    color: '#2196F3',
  },
  topUsersSection: {
    marginBottom: 24,
  },
  topUsersList: {
    gap: 8,
  },
  topUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 2,
  },
  userOrders: {
    fontSize: 12,
    color: '#777E5C',
  },
  userSpent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
});




