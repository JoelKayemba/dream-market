import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function PasswordChangeScreen({ navigation }) {
  const { changePassword, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Effacer les erreurs quand l'utilisateur tape
    if (error) {
      clearError();
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit être différent de l\'ancien');
      return false;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      const result = await changePassword(formData.currentPassword, formData.newPassword);
      
      if (result.type.endsWith('/fulfilled')) {
        Alert.alert(
          'Mot de passe modifié',
          'Votre mot de passe a été modifié avec succès.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Réinitialiser le formulaire
                setFormData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
                navigation.goBack();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
    }
  };

  const handleDemoFill = () => {
    setFormData({
      currentPassword: 'password123',
      newPassword: 'newpassword123',
      confirmPassword: 'newpassword123'
    });
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '', color: '#E0E0E0' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthLevels = [
      { text: 'Très faible', color: '#FF5722' },
      { text: 'Faible', color: '#FF9800' },
      { text: 'Moyen', color: '#FFC107' },
      { text: 'Bon', color: '#8BC34A' },
      { text: 'Très bon', color: '#4CAF50' },
      { text: 'Excellent', color: '#2E7D32' }
    ];

    return {
      strength: strength,
      text: strengthLevels[Math.min(strength, 5)].text,
      color: strengthLevels[Math.min(strength, 5)].color
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Container style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#283106" />
          </TouchableOpacity>
          <Text style={styles.title}>Changer le mot de passe</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Mot de passe actuel */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#777E5C" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe actuel"
              value={formData.currentPassword}
              onChangeText={(text) => handleInputChange('currentPassword', text)}
              secureTextEntry={!showPasswords.current}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => togglePasswordVisibility('current')}
            >
              <Ionicons 
                name={showPasswords.current ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#777E5C" 
              />
            </TouchableOpacity>
          </View>

          {/* Nouveau mot de passe */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#777E5C" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              value={formData.newPassword}
              onChangeText={(text) => handleInputChange('newPassword', text)}
              secureTextEntry={!showPasswords.new}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => togglePasswordVisibility('new')}
            >
              <Ionicons 
                name={showPasswords.new ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#777E5C" 
              />
            </TouchableOpacity>
          </View>

          {/* Indicateur de force du mot de passe */}
          {formData.newPassword.length > 0 && (
            <View style={styles.passwordStrengthContainer}>
              <View style={styles.strengthBar}>
                <View 
                  style={[
                    styles.strengthFill, 
                    { 
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                      backgroundColor: passwordStrength.color 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                Force : {passwordStrength.text}
              </Text>
            </View>
          )}

          {/* Confirmer nouveau mot de passe */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#777E5C" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le nouveau mot de passe"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              secureTextEntry={!showPasswords.confirm}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => togglePasswordVisibility('confirm')}
            >
              <Ionicons 
                name={showPasswords.confirm ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#777E5C" 
              />
            </TouchableOpacity>
          </View>

          {/* Erreur */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC3545" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Bouton de changement */}
          <Button
            title={isLoading ? "Changement..." : "Changer le mot de passe"}
            onPress={handleChangePassword}
            variant="primary"
            size="large"
            style={styles.changeButton}
            disabled={isLoading}
          />

          {/* Bouton de démonstration */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={handleDemoFill}
          >
            <Text style={styles.demoButtonText}>Remplir avec des données de démo</Text>
          </TouchableOpacity>

          {/* Conseils de sécurité */}
          <View style={styles.securityTips}>
            <Text style={styles.securityTitle}>Conseils pour un mot de passe sécurisé :</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Au moins 8 caractères</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Mélange de majuscules et minuscules</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Inclure des chiffres et symboles</Text>
            </View>
          </View>
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 24,
  },
  placeholder: {
    width: 40,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#283106',
    paddingVertical: 16,
  },
  eyeButton: {
    padding: 8,
  },
  passwordStrengthContainer: {
    marginBottom: 20,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8D7DA',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#721C24',
    fontSize: 14,
  },
  changeButton: {
    marginBottom: 20,
  },
  demoButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  demoButtonText: {
    color: '#777E5C',
    fontSize: 14,
    fontWeight: '500',
  },
  securityTips: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 8,
    padding: 16,
  },
  securityTitle: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    color: '#2E7D32',
    fontSize: 13,
  },
});
