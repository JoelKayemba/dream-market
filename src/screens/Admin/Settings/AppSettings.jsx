import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button, Input } from '../../../components/ui';

export default function AppSettings({ navigation }) {
  const [settings, setSettings] = useState({
    general: {
      appName: 'Dream Market',
      appVersion: '1.0.0',
      defaultLanguage: 'fr',
      timezone: 'Europe/Paris',
    },
    features: {
      enableReviews: true,
      enableRatings: true,
      enableWishlist: true,
      enableNotifications: true,
      enableLocationServices: true,
    },
    display: {
      theme: 'light',
      fontSize: 'medium',
      showImages: true,
      showPrices: true,
    },
    performance: {
      cacheSize: '100',
      imageQuality: 'high',
      enableOfflineMode: false,
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
    console.log('Sauvegarde des paramètres app:', settings);
    Alert.alert('Succès', 'Paramètres de l\'application sauvegardés avec succès');
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

  const SettingSelector = ({ title, subtitle, value, options, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.selectorContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectorOption,
              value === option.value && styles.selectorOptionActive
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <Text style={[
              styles.selectorOptionText,
              value === option.value && styles.selectorOptionTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
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
        <Text style={styles.headerTitle}>Paramètres App</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Container style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Paramètres Généraux</Text>
          
          <SettingInput
            title="Nom de l'Application"
            subtitle="Nom affiché dans l'application"
            value={settings.general.appName}
            onChangeText={(value) => setSettings({
              ...settings,
              general: { ...settings.general, appName: value }
            })}
          />

          <SettingInput
            title="Version"
            subtitle="Version actuelle de l'application"
            value={settings.general.appVersion}
            onChangeText={(value) => setSettings({
              ...settings,
              general: { ...settings.general, appVersion: value }
            })}
          />

          <SettingSelector
            title="Langue par Défaut"
            subtitle="Langue principale de l'application"
            value={settings.general.defaultLanguage}
            options={[
              { value: 'fr', label: 'Français' },
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
            ]}
            onValueChange={(value) => setSettings({
              ...settings,
              general: { ...settings.general, defaultLanguage: value }
            })}
          />

          <SettingInput
            title="Fuseau Horaire"
            subtitle="Fuseau horaire par défaut"
            value={settings.general.timezone}
            onChangeText={(value) => setSettings({
              ...settings,
              general: { ...settings.general, timezone: value }
            })}
          />

          <Text style={styles.sectionTitle}>Fonctionnalités</Text>

          <SettingSwitch
            title="Activer les Avis"
            subtitle="Permettre aux utilisateurs de laisser des avis"
            value={settings.features.enableReviews}
            onValueChange={(value) => setSettings({
              ...settings,
              features: { ...settings.features, enableReviews: value }
            })}
          />

          <SettingSwitch
            title="Activer les Notes"
            subtitle="Permettre aux utilisateurs de noter les produits"
            value={settings.features.enableRatings}
            onValueChange={(value) => setSettings({
              ...settings,
              features: { ...settings.features, enableRatings: value }
            })}
          />

          <SettingSwitch
            title="Activer la Liste de Souhaits"
            subtitle="Permettre aux utilisateurs de sauvegarder des favoris"
            value={settings.features.enableWishlist}
            onValueChange={(value) => setSettings({
              ...settings,
              features: { ...settings.features, enableWishlist: value }
            })}
          />

          <SettingSwitch
            title="Activer les Notifications"
            subtitle="Envoyer des notifications aux utilisateurs"
            value={settings.features.enableNotifications}
            onValueChange={(value) => setSettings({
              ...settings,
              features: { ...settings.features, enableNotifications: value }
            })}
          />

          <SettingSwitch
            title="Activer la Localisation"
            subtitle="Utiliser les services de localisation"
            value={settings.features.enableLocationServices}
            onValueChange={(value) => setSettings({
              ...settings,
              features: { ...settings.features, enableLocationServices: value }
            })}
          />

          <Text style={styles.sectionTitle}>Affichage</Text>

          <SettingSelector
            title="Thème"
            subtitle="Thème de l'application"
            value={settings.display.theme}
            options={[
              { value: 'light', label: 'Clair' },
              { value: 'dark', label: 'Sombre' },
              { value: 'auto', label: 'Automatique' },
            ]}
            onValueChange={(value) => setSettings({
              ...settings,
              display: { ...settings.display, theme: value }
            })}
          />

          <SettingSelector
            title="Taille de Police"
            subtitle="Taille des textes dans l'application"
            value={settings.display.fontSize}
            options={[
              { value: 'small', label: 'Petite' },
              { value: 'medium', label: 'Moyenne' },
              { value: 'large', label: 'Grande' },
            ]}
            onValueChange={(value) => setSettings({
              ...settings,
              display: { ...settings.display, fontSize: value }
            })}
          />

          <SettingSwitch
            title="Afficher les Images"
            subtitle="Charger et afficher les images des produits"
            value={settings.display.showImages}
            onValueChange={(value) => setSettings({
              ...settings,
              display: { ...settings.display, showImages: value }
            })}
          />

          <SettingSwitch
            title="Afficher les Prix"
            subtitle="Afficher les prix des produits"
            value={settings.display.showPrices}
            onValueChange={(value) => setSettings({
              ...settings,
              display: { ...settings.display, showPrices: value }
            })}
          />

          <Text style={styles.sectionTitle}>Performance</Text>

          <SettingInput
            title="Taille du Cache (MB)"
            subtitle="Taille maximale du cache local"
            value={settings.performance.cacheSize}
            onChangeText={(value) => setSettings({
              ...settings,
              performance: { ...settings.performance, cacheSize: value }
            })}
            keyboardType="numeric"
          />

          <SettingSelector
            title="Qualité des Images"
            subtitle="Qualité des images téléchargées"
            value={settings.performance.imageQuality}
            options={[
              { value: 'low', label: 'Faible' },
              { value: 'medium', label: 'Moyenne' },
              { value: 'high', label: 'Élevée' },
            ]}
            onValueChange={(value) => setSettings({
              ...settings,
              performance: { ...settings.performance, imageQuality: value }
            })}
          />

          <SettingSwitch
            title="Mode Hors Ligne"
            subtitle="Permettre l'utilisation hors ligne"
            value={settings.performance.enableOfflineMode}
            onValueChange={(value) => setSettings({
              ...settings,
              performance: { ...settings.performance, enableOfflineMode: value }
            })}
          />
        </Container>
      </ScrollView>

      {/* Footer avec bouton de sauvegarde */}
      <View style={styles.footer}>
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
    marginBottom: 12,
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
    backgroundColor: '#F5F5F5',
  },
  selectorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    width: '100%',
  },
});




