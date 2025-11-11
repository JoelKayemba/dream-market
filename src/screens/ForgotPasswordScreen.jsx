import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button  , ScreenWrapper } from '../components/ui';
import { passwordResetService } from '../backend/services/passwordResetService';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' ou 'code'
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre email');
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Erreur', 'Veuillez saisir un email valide');
      return;
    }

    setIsLoading(true);

    try {
      const result = await passwordResetService.requestResetCode(email.trim());
      
      setStep('code');
      
      Alert.alert(
        'Code envoyé',
        `Un code de réinitialisation a été envoyé à ${email.trim()}. Vérifiez votre boîte mail (et vos spams).\n\nLe code est valide pendant 15 minutes.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      let errorMessage = error.message || 'Impossible de générer le code.';
      if (errorMessage.includes('Aucun compte')) {
        errorMessage = 'Aucun compte associé à cet email.';
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
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

    setIsLoading(true);

    try {
      await passwordResetService.resetPasswordWithCode(
        email.trim(),
        code.trim(),
        newPassword
      );
      
      Alert.alert(
        'Succès',
        'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      let errorMessage = error.message || 'Impossible de réinitialiser le mot de passe.';
      if (errorMessage.includes('Code invalide')) {
        errorMessage = 'Code invalide ou expiré. Veuillez demander un nouveau code.';
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <View style={styles.formContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="lock-closed-outline" size={64} color="#4CAF50" />
      </View>
      
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotActive]} />
        <View style={styles.stepLine} />
        <View style={styles.stepDot} />
      </View>
      
      <Text style={styles.formTitle}>Étape 1 : Votre email</Text>
      <Text style={styles.formDescription}>
        Entrez votre email pour recevoir un code de réinitialisation
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
          editable={!isLoading}
        />
      </View>

      <Button
        title={isLoading ? "Envoi en cours..." : "Recevoir le code"}
        onPress={handleSendCode}
        variant="primary"
        size="large"
        style={styles.actionButton}
        loading={isLoading}
        disabled={isLoading}
      />
    </View>
  );

  const renderCodeStep = () => (
    <View style={styles.formContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="key-outline" size={64} color="#4CAF50" />
      </View>
      
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotComplete]}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        </View>
        <View style={[styles.stepLine, styles.stepLineActive]} />
        <View style={[styles.stepDot, styles.stepDotActive]} />
      </View>
      
      <Text style={styles.formTitle}>Étape 2 : Réinitialisation</Text>
      <Text style={styles.formDescription}>
        Entrez le code reçu par email et votre nouveau mot de passe
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="key-outline" size={20} color="#777E5C" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Code à 6 chiffres"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={6}
          editable={!isLoading}
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
          editable={!isLoading}
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
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          editable={!isLoading}
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
        title={isLoading ? "Vérification..." : "Réinitialiser le mot de passe"}
        onPress={handleResetPassword}
        variant="primary"
        size="large"
        style={styles.actionButton}
        loading={isLoading}
        disabled={isLoading}
      />

      <TouchableOpacity
        style={styles.backLink}
        onPress={() => {
          setStep('email');
          setCode('');
          setNewPassword('');
          setConfirmPassword('');
        }}
      >
        <Ionicons name="arrow-back" size={16} color="#4CAF50" />
        <Text style={styles.backLinkText}>Retour à l'email</Text>
      </TouchableOpacity>
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

        {/* Contenu */}
        {step === 'email' ? renderEmailStep() : renderCodeStep()}

       
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
    paddingTop: 50,
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
  formContainer: {
    flex: 1,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
    textAlign: 'center',
    marginBottom: 12,
  },
  formDescription: {
    fontSize: 15,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 15,
    color: '#777E5C',
    textAlign: 'center',
    marginBottom: 8,
  },
  successEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  successInstructions: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  resendButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  resendButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  stepDotActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  stepDotComplete: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
  },
  stepLineActive: {
    backgroundColor: '#4CAF50',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  backLinkText: {
    color: '#4CAF50',
    fontSize: 14,
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
    marginTop: 10,
    marginBottom: 20,
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
