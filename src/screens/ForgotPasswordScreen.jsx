import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword, isLoading, error, resetCode, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // 'email' ou 'code'
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Effacer les erreurs au changement de navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      clearError();
    });
    return unsubscribe;
  }, [navigation, clearError]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre email');
      return;
    }

    try {
      await forgotPassword(email.trim());
      setStep('code');
    } catch (error) {
      console.error('Erreur envoi code:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!code.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir le code reçu');
      return;
    }
    if (!newPassword) {
      Alert.alert('Erreur', 'Veuillez saisir un nouveau mot de passe');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      // Ici on appellerait resetPassword avec le code réel
      // Pour la démo, on simule la réussite
      Alert.alert(
        'Succès',
        'Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
    }
  };

  const handleDemoCode = () => {
    // Simuler la réception du code
    setCode('123456');
  };

  const renderEmailStep = () => (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>1</Text>
        </View>
        <Text style={styles.stepTitle}>Saisir votre email</Text>
      </View>
      
      <Text style={styles.stepDescription}>
        Nous vous enverrons un code de réinitialisation par email
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#777E5C" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Votre email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <Button
        title={isLoading ? "Envoi..." : "Envoyer le code"}
        onPress={handleSendCode}
        variant="primary"
        size="large"
        style={styles.actionButton}
        disabled={isLoading}
      />

      <TouchableOpacity
        style={styles.demoButton}
        onPress={handleDemoCode}
      >
        <Text style={styles.demoButtonText}>Code de démonstration: 123456</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCodeStep = () => (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>2</Text>
        </View>
        <Text style={styles.stepTitle}>Vérifier le code</Text>
      </View>
      
      <Text style={styles.stepDescription}>
        Saisissez le code reçu par email et votre nouveau mot de passe
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="key-outline" size={20} color="#777E5C" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Code de réinitialisation"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#777E5C" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={20} 
            color="#777E5C" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#777E5C" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmer le nouveau mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons 
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
            size={20} 
            color="#777E5C" 
          />
        </TouchableOpacity>
      </View>

      <Button
        title="Réinitialiser le mot de passe"
        onPress={handleResetPassword}
        variant="primary"
        size="large"
        style={styles.actionButton}
      />
    </View>
  );

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
          <Text style={styles.title}>Mot de passe oublié</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Erreur */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC3545" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Étapes */}
        {step === 'email' ? renderEmailStep() : renderCodeStep()}

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.navLinkText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: -20,
   
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
  step: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepTitle: {
    color: '#283106',
    fontWeight: '600',
    fontSize: 18,
  },
  stepDescription: {
    color: '#777E5C',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
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
  actionButton: {
    marginBottom: 20,
  },
  demoButton: {
    alignItems: 'center',
    marginBottom: 30,
  },
  demoButtonText: {
    color: '#777E5C',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  navigation: {
    alignItems: 'center',
    marginTop: 20,
  },
  navLink: {
    paddingVertical: 8,
  },
  navLinkText: {
    color: '#4CAF50',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
