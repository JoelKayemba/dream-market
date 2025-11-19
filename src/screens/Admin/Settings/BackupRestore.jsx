import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Container, Button , ScreenWrapper } from '../../../components/ui';

export default function BackupRestore({ navigation }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    // TODO: Remplacer par un appel API réel
    setBackups([
      { id: 1, name: 'Backup complet', date: '2024-01-15 10:30', size: '25.6 MB', type: 'full' },
      { id: 2, name: 'Backup base de données', date: '2024-01-14 15:45', size: '12.3 MB', type: 'database' },
      { id: 3, name: 'Backup fichiers', date: '2024-01-13 09:20', size: '18.7 MB', type: 'files' },
    ]);
    setLoading(false);
  };

  const handleCreateBackup = () => {
    Alert.alert(
      'Créer une sauvegarde',
      'Voulez-vous créer une nouvelle sauvegarde complète ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Créer', 
          onPress: () => {
            // TODO: Implémenter la création de sauvegarde
            Alert.alert('Succès', 'Sauvegarde créée avec succès');
          }
        }
      ]
    );
  };

  const handleRestoreBackup = (backup) => {
    Alert.alert(
      'Restaurer la sauvegarde',
      `Êtes-vous sûr de vouloir restaurer la sauvegarde "${backup.name}" ? Cette action écrasera les données actuelles.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Restaurer', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implémenter la restauration
            Alert.alert('Succès', 'Sauvegarde restaurée avec succès');
          }
        }
      ]
    );
  };

  const handleDeleteBackup = (backup) => {
    Alert.alert(
      'Supprimer la sauvegarde',
      `Êtes-vous sûr de vouloir supprimer la sauvegarde "${backup.name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implémenter la suppression
            Alert.alert('Succès', 'Sauvegarde supprimée avec succès');
          }
        }
      ]
    );
  };

  const getBackupTypeColor = (type) => {
    switch (type) {
      case 'full': return '#4CAF50';
      case 'database': return '#2196F3';
      case 'files': return '#FF9800';
      default: return '#777E5C';
    }
  };

  const getBackupTypeLabel = (type) => {
    switch (type) {
      case 'full': return 'Complet';
      case 'database': return 'Base de données';
      case 'files': return 'Fichiers';
      default: return type;
    }
  };

  const BackupCard = ({ backup }) => (
    <ScreenWrapper style={styles.backupCard}>
      <View style={styles.backupHeader}>
        <View style={styles.backupInfo}>
          <Text style={styles.backupName}>{backup.name}</Text>
          <Text style={styles.backupDate}>{backup.date}</Text>
        </View>
        <View style={[styles.backupType, { backgroundColor: getBackupTypeColor(backup.type) }]}>
          <Text style={styles.backupTypeText}>{getBackupTypeLabel(backup.type)}</Text>
        </View>
      </View>
      
      <View style={styles.backupDetails}>
        <Text style={styles.backupSize}>Taille: {backup.size}</Text>
      </View>

      <View style={styles.backupActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRestoreBackup(backup)}
        >
          <Ionicons name="refresh-outline" size={20} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteBackup(backup)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
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
        <Text style={styles.headerTitle}>Sauvegarde/Restauration</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateBackup}
        >
          <Ionicons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.backupSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sauvegardes Disponibles</Text>
            <Text style={styles.sectionSubtitle}>{backups.length} sauvegarde(s)</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Chargement des sauvegardes...</Text>
            </View>
          ) : backups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cloud-outline" size={64} color="#777E5C" />
              <Text style={styles.emptyTitle}>Aucune sauvegarde</Text>
              <Text style={styles.emptySubtitle}>Créez votre première sauvegarde</Text>
              <Button
                title="Créer une sauvegarde"
                onPress={handleCreateBackup}
                variant="primary"
                style={styles.createButton}
              />
            </View>
          ) : (
            <View style={styles.backupsList}>
              {backups.map((backup) => (
                <BackupCard key={backup.id} backup={backup} />
              ))}
            </View>
          )}
        </Container>

        {/* Informations importantes */}
        <Container style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ Informations Importantes</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Les sauvegardes comprennent toutes les données</Text>
            <Text style={styles.infoItem}>• La restauration remplace les données actuelles</Text>
            <Text style={styles.infoItem}>• Créez des sauvegardes avant les mises à jour</Text>
            <Text style={styles.infoItem}>• Conservez les sauvegardes dans un endroit sûr</Text>
          </View>
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  backupSection: {
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
    marginBottom: 20,
  },
  createButton: {
    minWidth: 200,
  },
  backupsList: {
    gap: 12,
  },
  backupCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  backupInfo: {
    flex: 1,
  },
  backupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  backupDate: {
    fontSize: 14,
    color: '#777E5C',
  },
  backupType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  backupTypeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  backupDetails: {
    marginBottom: 12,
  },
  backupSize: {
    fontSize: 14,
    color: '#777E5C',
  },
  backupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  infoSection: {
    paddingVertical: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#777E5C',
    lineHeight: 20,
  },
});




