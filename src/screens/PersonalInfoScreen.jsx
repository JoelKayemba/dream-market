import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button, Divider } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function PersonalInfoScreen({ navigation }) {
  const { user, updateUserInfo } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [tempUserInfo, setTempUserInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Sauvegarder les modifications dans Redux
      updateUserInfo(tempUserInfo);
      setIsEditing(false);
      Alert.alert('Succès', 'Vos informations ont été mises à jour');
    } else {
      // Activer le mode édition
      setTempUserInfo({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || ''
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setTempUserInfo({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteAccount = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    Alert.alert(
      'Suppression définitive',
      'Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer définitivement', 
          style: 'destructive',
          onPress: () => {
            console.log('Compte supprimé');
            // Ici on supprimerait le compte
            navigation.navigate('ProfileMain');
          }
        }
      ]
    );
  };

  const renderField = (label, field, placeholder, keyboardType = 'default', multiline = false) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          value={tempUserInfo[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      ) : (
        <Text style={styles.fieldValue}>
          {user?.[field] || 'Non renseigné'}
        </Text>
      )}
    </View>
  );

  // Afficher un loader si pas d'utilisateur
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Container style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.title}>Informations Personnelles</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditToggle}
        >
          <Ionicons 
            name={isEditing ? 'checkmark' : 'create-outline'} 
            size={24} 
            color={isEditing ? '#4CAF50' : '#777E5C'} 
          />
        </TouchableOpacity>
      </Container>

      {/* Informations personnelles */}
      <Container style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        
        {renderField('Prénom', 'firstName', 'Votre prénom')}
        {renderField('Nom', 'lastName', 'Votre nom')}
        {renderField('Email', 'email', 'votre@email.com', 'email-address')}
        {renderField('Téléphone', 'phone', '+33 6 12 34 56 78', 'phone-pad')}
        {renderField('Adresse', 'address', 'Votre adresse complète', 'default', true)}
      </Container>

      {/* Boutons d'action */}
      {isEditing && (
        <Container style={styles.actionSection}>
          <View style={styles.actionButtons}>
            <Button
              title="Annuler"
              onPress={handleCancelEdit}
              variant="outline"
              size="large"
              style={styles.cancelButton}
            />
            <Button
              title="Sauvegarder"
              onPress={handleEditToggle}
              variant="primary"
              size="large"
              style={styles.saveButton}
            />
          </View>
        </Container>
      )}

      <Divider />

      {/* Zone de danger */}
      <Container style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>Zone de danger</Text>
        <Text style={styles.dangerSubtitle}>
          Ces actions sont irréversibles et peuvent entraîner la perte définitive de vos données.
        </Text>
        
        <Button
          title="Supprimer mon compte"
          onPress={handleDeleteAccount}
          variant="outline"
          size="large"
          style={styles.deleteButton}
        />
        
        {showDeleteConfirm && (
          <View style={styles.confirmDelete}>
            <Text style={styles.confirmText}>
              Appuyez à nouveau pour confirmer la suppression
            </Text>
            <TouchableOpacity
              style={styles.cancelDeleteButton}
              onPress={() => setShowDeleteConfirm(false)}
            >
              <Text style={styles.cancelDeleteText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 20,
  },
  editButton: {
    padding: 8,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#283106',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#283106',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  fieldValue: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#777E5C',
  },
  actionSection: {
    paddingVertical: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#777E5C',
  },
  saveButton: {
    flex: 1,
  },
  dangerSection: {
    paddingVertical: 20,
  },
  dangerTitle: {
    color: '#DC3545',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  dangerSubtitle: {
    color: '#777E5C',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  deleteButton: {
    borderColor: '#DC3545',
    borderWidth: 2,
  },
  confirmDelete: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEAA7',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  confirmText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  cancelDeleteButton: {
    backgroundColor: '#6C757D',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelDeleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
