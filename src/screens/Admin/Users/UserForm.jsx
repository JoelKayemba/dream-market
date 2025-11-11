import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Container, Button, Input , ScreenWrapper } from '../../../components/ui';

export default function UserForm({ route, navigation }) {
  const { mode = 'add', user } = route.params || {};
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'client',
    status: user?.status || 'active',
  });

  const roles = [
    { value: 'client', label: 'Client' },
    { value: 'fermier', label: 'Fermier' },
    { value: 'admin', label: 'Administrateur' },
  ];

  const statuses = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
  ];

  const handleSave = () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    // TODO: Implémenter la sauvegarde
    Alert.alert('Succès', 'Utilisateur sauvegardé avec succès');
    navigation.goBack();
  };

  const RoleSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Rôle *</Text>
      <View style={styles.selectorOptions}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.value}
            style={[
              styles.selectorOption,
              formData.role === role.value && styles.selectorOptionActive
            ]}
            onPress={() => setFormData({ ...formData, role: role.value })}
          >
            <Text style={[
              styles.selectorOptionText,
              formData.role === role.value && styles.selectorOptionTextActive
            ]}>
              {role.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );

  const StatusSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Statut *</Text>
      <View style={styles.selectorOptions}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.selectorOption,
              formData.status === status.value && styles.selectorOptionActive
            ]}
            onPress={() => setFormData({ ...formData, status: status.value })}
          >
            <Text style={[
              styles.selectorOptionText,
              formData.status === status.value && styles.selectorOptionTextActive
            ]}>
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
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
        <Text style={styles.headerTitle}>
          {mode === 'add' ? 'Ajouter un Utilisateur' : 'Modifier l\'Utilisateur'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.formSection}>
          <Text style={styles.sectionTitle}>Informations de l'Utilisateur</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <Input
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              placeholder="Entrez le prénom"
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom *</Text>
            <Input
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              placeholder="Entrez le nom"
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <Input
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Entrez l'email"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <Input
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Numéro de téléphone"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <RoleSelector />
          <StatusSelector />
        </Container>
      </ScrollView>

      {/* Footer avec boutons */}
      <View style={styles.footer}>
        <Button
          title="Annuler"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={styles.cancelButton}
        />
        <Button
          title={mode === 'add' ? 'Ajouter' : 'Modifier'}
          onPress={handleSave}
          variant="primary"
          style={styles.saveButton}
        />
      </View>
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
  formSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#283106',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  selectorOptionActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  selectorOptionText: {
    fontSize: 14,
    color: '#283106',
    fontWeight: '500',
  },
  selectorOptionTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});




