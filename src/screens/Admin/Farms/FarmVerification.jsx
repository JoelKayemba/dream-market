import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Container, Button , ScreenWrapper } from '../../../components/ui';

export default function FarmVerification({ navigation }) {
  const [pendingFarms, setPendingFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingFarms();
  }, []);

  const loadPendingFarms = () => {
    // TODO: Remplacer par un appel API réel
    setPendingFarms([
      { 
        id: 1, 
        name: 'Ferme Nouvelle', 
        location: 'Toulouse', 
        submittedAt: '2024-01-15',
        documents: ['certificat_bio.pdf', 'plan_ferme.pdf']
      },
      { 
        id: 2, 
        name: 'Verger Moderne', 
        location: 'Bordeaux', 
        submittedAt: '2024-01-14',
        documents: ['certificat_qualite.pdf']
      },
    ]);
    setLoading(false);
  };

  const handleVerifyFarm = (farm, approved) => {
    Alert.alert(
      approved ? 'Approuver la ferme' : 'Rejeter la ferme',
      `Êtes-vous sûr de vouloir ${approved ? 'approuver' : 'rejeter'} la ferme "${farm.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: approved ? 'Approuver' : 'Rejeter', 
          style: approved ? 'default' : 'destructive',
          onPress: () => {
            // TODO: Implémenter la vérification
            console.log(`${approved ? 'Approbation' : 'Rejet'} de la ferme:`, farm.id);
            setPendingFarms(pendingFarms.filter(f => f.id !== farm.id));
            Alert.alert('Succès', `Ferme ${approved ? 'approuvée' : 'rejetée'} avec succès`);
          }
        }
      ]
    );
  };

  const FarmVerificationCard = ({ farm }) => (
    <View style={styles.farmCard}>
      <View style={styles.farmHeader}>
        <Text style={styles.farmName}>{farm.name}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>En attente</Text>
        </View>
      </View>
      
      <View style={styles.farmInfo}>
        <Text style={styles.farmLocation}>📍 {farm.location}</Text>
        <Text style={styles.submittedDate}>Soumis le: {farm.submittedAt}</Text>
      </View>

      <View style={styles.documentsSection}>
        <Text style={styles.documentsTitle}>Documents fournis:</Text>
        {farm.documents.map((doc, index) => (
          <View key={index} style={styles.documentItem}>
            <Ionicons name="document-outline" size={16} color="#777E5C" />
            <Text style={styles.documentName}>{doc}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title="Rejeter"
          onPress={() => handleVerifyFarm(farm, false)}
          variant="secondary"
          style={styles.rejectButton}
        />
        <Button
          title="Approuver"
          onPress={() => handleVerifyFarm(farm, true)}
          variant="primary"
          style={styles.approveButton}
        />
      </View>
    </View>
  );

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vérification des Fermes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.verificationSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fermes en Attente</Text>
            <Text style={styles.sectionSubtitle}>{pendingFarms.length} ferme(s) à vérifier</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des fermes...</Text>
            </View>
          ) : pendingFarms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
              <Text style={styles.emptyTitle}>Aucune ferme en attente</Text>
              <Text style={styles.emptySubtitle}>Toutes les fermes ont été vérifiées</Text>
            </View>
          ) : (
            <View style={styles.farmsList}>
              {pendingFarms.map((farm) => (
                <FarmVerificationCard key={farm.id} farm={farm} />
              ))}
            </View>
          )}
        </Container>
      </ScrollView>
    </ScreenWrapper>
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
  verificationSection: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#777E5C',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
  },
  farmsList: {
    gap: 16,
  },
  farmCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  farmName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  farmInfo: {
    marginBottom: 12,
  },
  farmLocation: {
    fontSize: 14,
    color: '#777E5C',
    marginBottom: 4,
  },
  submittedDate: {
    fontSize: 14,
    color: '#777E5C',
  },
  documentsSection: {
    marginBottom: 16,
  },
  documentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  documentName: {
    fontSize: 14,
    color: '#777E5C',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
  },
  approveButton: {
    flex: 1,
  },
});




