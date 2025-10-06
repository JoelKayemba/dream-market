import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button } from '../../../components/ui';

export default function OrderStatus({ navigation }) {
  const [statusStats, setStatusStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatusStats();
  }, []);

  const loadStatusStats = () => {
    // TODO: Remplacer par un appel API réel
    setStatusStats({
      pending: { count: 15, percentage: 25 },
      confirmed: { count: 20, percentage: 33 },
      shipped: { count: 12, percentage: 20 },
      delivered: { count: 10, percentage: 17 },
      cancelled: { count: 3, percentage: 5 }
    });
    setLoading(false);
  };

  const handleUpdateStatus = (status) => {
    Alert.alert(
      'Mettre à jour le statut',
      `Voulez-vous mettre à jour le statut "${status}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: () => {
            // TODO: Implémenter la mise à jour du statut
            console.log('Mise à jour du statut:', status);
            Alert.alert('Succès', 'Statut mis à jour avec succès');
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'shipped': return '#9C27B0';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#777E5C';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmées';
      case 'shipped': return 'Expédiées';
      case 'delivered': return 'Livrées';
      case 'cancelled': return 'Annulées';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'shipped': return 'car-outline';
      case 'delivered': return 'home-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const StatusCard = ({ status, stats }) => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={[styles.statusIcon, { backgroundColor: getStatusColor(status) }]}>
          <Ionicons name={getStatusIcon(status)} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>{getStatusLabel(status)}</Text>
          <Text style={styles.statusCount}>{stats.count} commande(s)</Text>
        </View>
        <Text style={[styles.statusPercentage, { color: getStatusColor(status) }]}>
          {stats.percentage}%
        </Text>
      </View>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${stats.percentage}%`,
              backgroundColor: getStatusColor(status)
            }
          ]} 
        />
      </View>

      <View style={styles.statusActions}>
        <Button
          title="Voir les commandes"
          onPress={() => handleUpdateStatus(status)}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>
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
        <Text style={styles.headerTitle}>Statuts des Commandes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Répartition par Statut</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des statistiques...</Text>
            </View>
          ) : (
            <View style={styles.statusList}>
              {Object.entries(statusStats).map(([status, stats]) => (
                <StatusCard key={status} status={status} stats={stats} />
              ))}
            </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statusSection: {
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
  statusList: {
    gap: 16,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  statusCount: {
    fontSize: 14,
    color: '#777E5C',
  },
  statusPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusActions: {
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 150,
  },
});




