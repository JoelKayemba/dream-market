import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button, Input } from '../../../components/ui';

export default function AdminSettings({ navigation }) {
  const [settings, setSettings] = useState({
    app: {
      maintenanceMode: false,
      registrationEnabled: true,
      farmVerificationRequired: true,
      maxFileSize: '10',
      allowedFileTypes: 'jpg,png,pdf',
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    security: {
      sessionTimeout: '30',
      maxLoginAttempts: '5',
      requireTwoFactor: false,
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // TODO: Remplacer par un appel API réel
    setLoading(false);
  };

  const handleSaveSettings = () => {
    // TODO: Implémenter la sauvegarde
    console.log('Sauvegarde des paramètres:', settings);
    Alert.alert('Succès', 'Paramètres sauvegardés avec succès');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Réinitialiser les paramètres',
      'Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Réinitialiser', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implémenter la réinitialisation
            console.log('Réinitialisation des paramètres');
            Alert.alert('Succès', 'Paramètres réinitialisés');
          }
        }
      ]
    );
  };

  const SettingSwitch = ({ title, subtitle, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  const SettingInput = ({ title, subtitle, value, onChangeText, keyboardType }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Input
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.settingInput}
      />
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
        <Text style={styles.headerTitle}>Paramètres Admin</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Paramètres de l'Application</Text>
          
          <SettingSwitch
            title="Mode Maintenance"
            subtitle="Désactive l'accès public à l'application"
            value={settings.app.maintenanceMode}
            onValueChange={(value) => setSettings({
              ...settings,
              app: { ...settings.app, maintenanceMode: value }
            })}
          />

          <SettingSwitch
            title="Inscription Ouverte"
            subtitle="Permet aux nouveaux utilisateurs de s'inscrire"
            value={settings.app.registrationEnabled}
            onValueChange={(value) => setSettings({
              ...settings,
              app: { ...settings.app, registrationEnabled: value }
            })}
          />

          <SettingSwitch
            title="Vérification Fermes Obligatoire"
            subtitle="Exige la vérification des fermes avant publication"
            value={settings.app.farmVerificationRequired}
            onValueChange={(value) => setSettings({
              ...settings,
              app: { ...settings.app, farmVerificationRequired: value }
            })}
          />

          <SettingInput
            title="Taille Max des Fichiers (MB)"
            subtitle="Taille maximale des fichiers uploadés"
            value={settings.app.maxFileSize}
            onChangeText={(value) => setSettings({
              ...settings,
              app: { ...settings.app, maxFileSize: value }
            })}
            keyboardType="numeric"
          />

          <SettingInput
            title="Types de Fichiers Autorisés"
            subtitle="Extensions séparées par des virgules"
            value={settings.app.allowedFileTypes}
            onChangeText={(value) => setSettings({
              ...settings,
              app: { ...settings.app, allowedFileTypes: value }
            })}
          />

          <Text style={styles.sectionTitle}>Notifications</Text>

          <SettingSwitch
            title="Notifications Email"
            subtitle="Envoyer des notifications par email"
            value={settings.notifications.email}
            onValueChange={(value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, email: value }
            })}
          />

          <SettingSwitch
            title="Notifications Push"
            subtitle="Envoyer des notifications push"
            value={settings.notifications.push}
            onValueChange={(value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, push: value }
            })}
          />

          <SettingSwitch
            title="Notifications SMS"
            subtitle="Envoyer des notifications par SMS"
            value={settings.notifications.sms}
            onValueChange={(value) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, sms: value }
            })}
          />

          <Text style={styles.sectionTitle}>Sécurité</Text>

          <SettingInput
            title="Timeout de Session (minutes)"
            subtitle="Durée avant expiration de la session"
            value={settings.security.sessionTimeout}
            onChangeText={(value) => setSettings({
              ...settings,
              security: { ...settings.security, sessionTimeout: value }
            })}
            keyboardType="numeric"
          />

          <SettingInput
            title="Tentatives de Connexion Max"
            subtitle="Nombre maximum de tentatives de connexion"
            value={settings.security.maxLoginAttempts}
            onChangeText={(value) => setSettings({
              ...settings,
              security: { ...settings.security, maxLoginAttempts: value }
            })}
            keyboardType="numeric"
          />

          <SettingSwitch
            title="Authentification à Deux Facteurs"
            subtitle="Exiger 2FA pour les administrateurs"
            value={settings.security.requireTwoFactor}
            onValueChange={(value) => setSettings({
              ...settings,
              security: { ...settings.security, requireTwoFactor: value }
            })}
          />
        </Container>
      </ScrollView>

      {/* Footer avec boutons */}
      <View style={styles.footer}>
        <Button
          title="Réinitialiser"
          onPress={handleResetSettings}
          variant="secondary"
          style={styles.resetButton}
        />
        <Button
          title="Sauvegarder"
          onPress={handleSaveSettings}
          variant="primary"
          style={styles.saveButton}
        />
      </View>
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
  settingsSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 16,
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#777E5C',
  },
  settingInput: {
    width: 100,
    backgroundColor: '#F5F5F5',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  resetButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});




