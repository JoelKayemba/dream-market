import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  isBlocked,
  recordFailedAttempt,
  resetAttempts,
  formatRemainingTime,
  getCurrentAttempts,
} from '../utils/attemptLimiter';

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [blockedInfo, setBlockedInfo] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);

  // Effacer les erreurs au changement de navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      clearError();
      checkBlockStatus();
    });
    return unsubscribe;
  }, [navigation]);

  // Vérifier le statut de blocage au montage et toutes les secondes
  useEffect(() => {
    checkBlockStatus();
    
    const interval = setInterval(() => {
      checkBlockStatus();
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Mettre à jour le temps restant
  useEffect(() => {
    if (blockedInfo && blockedInfo.blocked) {
      const interval = setInterval(() => {
        const newRemaining = Math.max(0, blockedInfo.remainingSeconds - 1);
        setRemainingTime(newRemaining);
        
        if (newRemaining === 0) {
          checkBlockStatus();
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [blockedInfo]);

  const checkBlockStatus = async () => {
    const status = await isBlocked('register');
    setBlockedInfo(status);
    if (status.blocked) {
      setRemainingTime(status.remainingSeconds);
    }
  };

  // Empêcher le retour en arrière après inscription réussie
  useEffect(() => {
    const backAction = () => {
      // Permettre le retour seulement si on n'est pas en train de charger
      if (isLoading) {
        return true; // Bloquer pendant le chargement
      }
      return false; // Permettre le retour normal
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    // Empêcher le retour par swipe
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Si on est en train de charger, empêcher le retour
      if (isLoading) {
        e.preventDefault();
      }
    });

    return () => {
      backHandler.remove();
      unsubscribe();
    };
  }, [navigation, isLoading]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre prénom');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre nom');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre email');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Erreur', 'Veuillez saisir un mot de passe');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    // Vérifier si l'utilisateur est bloqué
    const blockStatus = await isBlocked('register');
    if (blockStatus.blocked) {
      const timeText = formatRemainingTime(blockStatus.remainingSeconds);
      Alert.alert(
        'Trop de tentatives',
        `Vous avez dépassé le nombre maximum de tentatives d'inscription. Veuillez patienter ${timeText} avant de réessayer.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      const result = await register(userData);

      // Si l'inscription réussit, réinitialiser les tentatives et naviguer
      if (result.type.endsWith('/fulfilled')) {
        await resetAttempts('register');
        navigation.replace('MainApp');
      } else {
        // Vérifier le nombre actuel de tentatives
        const currentAttempts = await getCurrentAttempts('register');
        
        // Si on a moins de 3 tentatives, afficher seulement l'erreur normale
        if (currentAttempts < 3) {
          // Ne pas enregistrer, juste afficher l'erreur normale
          // L'erreur est déjà gérée par le Redux store
        } else {
          // À partir de la 4ème tentative, enregistrer et gérer les avertissements
          const attemptData = await recordFailedAttempt('register');
          if (attemptData) {
            // Afficher un avertissement seulement à partir de 4 tentatives
            if (attemptData.attempts >= 4) {
              if (attemptData.attempts >= 5 && attemptData.blockedUntil) {
                const timeText = formatRemainingTime(
                  Math.ceil((attemptData.blockedUntil - Date.now()) / 1000)
                );
                Alert.alert(
                  'Trop de tentatives',
                  `Vous avez dépassé le nombre maximum de tentatives. Veuillez patienter ${timeText} avant de réessayer.`,
                  [{ text: 'OK' }]
                );
              } else if (attemptData.attempts === 4) {
                Alert.alert(
                  'Attention',
                  'Vous avez effectué 4 tentatives. Après une 5ème tentative échouée, vous serez temporairement bloqué.',
                  [{ text: 'OK' }]
                );
              }
            }
            checkBlockStatus();
          }
        }
      }
    } catch (error) {
      console.error('RegisterScreen - Erreur d\'inscription:', error);
      // Vérifier le nombre actuel de tentatives
      const currentAttempts = await getCurrentAttempts('register');
      
      // Si on a moins de 3 tentatives, afficher seulement l'erreur normale
      if (currentAttempts < 3) {
        // Ne pas enregistrer, juste afficher l'erreur normale
      } else {
        // À partir de la 4ème tentative, enregistrer et gérer les avertissements
        const attemptData = await recordFailedAttempt('register');
        if (attemptData) {
          // Afficher un avertissement seulement à partir de 4 tentatives
          if (attemptData.attempts >= 4) {
            if (attemptData.attempts >= 5 && attemptData.blockedUntil) {
              const timeText = formatRemainingTime(
                Math.ceil((attemptData.blockedUntil - Date.now()) / 1000)
              );
              Alert.alert(
                'Trop de tentatives',
                `Vous avez dépassé le nombre maximum de tentatives. Veuillez patienter ${timeText} avant de réessayer.`,
                [{ text: 'OK' }]
              );
            } else if (attemptData.attempts === 4) {
              Alert.alert(
                'Attention',
                'Vous avez effectué 4 tentatives. Après une 5ème tentative échouée, vous serez temporairement bloqué.',
                [{ text: 'OK' }]
              );
            }
          }
          checkBlockStatus();
        }
      }
    }
  };

  const getInputStyle = (fieldName) => [
    styles.inputContainer,
    focusedInput === fieldName && styles.inputContainerFocused,
  ];

  return (
    <ScreenWrapper style={styles.container}>
      <LinearGradient
        colors={['#F3F7F4', '#E8F5E9', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#1A3B1F" />
              </TouchableOpacity>
            </View>

            {/* Logo et titre */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/Dream_logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Inscription</Text>
              <Text style={styles.subtitle}>Rejoignez la communauté Dream Market</Text>
            </View>

            {/* Formulaire */}
            <View style={styles.form}>
              {/* Prénom et Nom */}
              <View style={styles.row}>
                <View style={[getInputStyle('firstName'), { flex: 1, marginRight: 8 }]}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={focusedInput === 'firstName' ? '#2F8F46' : '#6B8E6F'}
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Prénom"
                    placeholderTextColor="#9CA3AF"
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    autoCapitalize="words"
                    onFocus={() => setFocusedInput('firstName')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>

                <View style={[getInputStyle('lastName'), { flex: 1, marginLeft: 8 }]}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={focusedInput === 'lastName' ? '#2F8F46' : '#6B8E6F'}
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Nom"
                    placeholderTextColor="#9CA3AF"
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    autoCapitalize="words"
                    onFocus={() => setFocusedInput('lastName')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={getInputStyle('email')}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={focusedInput === 'email' ? '#2F8F46' : '#6B8E6F'}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Mot de passe */}
              <View style={getInputStyle('password')}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={focusedInput === 'password' ? '#2F8F46' : '#6B8E6F'}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B8E6F"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirmation mot de passe */}
              <View style={getInputStyle('confirmPassword')}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={focusedInput === 'confirmPassword' ? '#2F8F46' : '#6B8E6F'}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer le mot de passe"
                  placeholderTextColor="#9CA3AF"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#6B8E6F"
                  />
                </TouchableOpacity>
              </View>

              {/* Téléphone */}
              <View style={getInputStyle('phone')}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={focusedInput === 'phone' ? '#2F8F46' : '#6B8E6F'}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Téléphone"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Adresse */}
              <View style={getInputStyle('address')}>
                <View style={styles.inputIconContainer}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={focusedInput === 'address' ? '#2F8F46' : '#6B8E6F'}
                  />
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Adresse complète"
                  placeholderTextColor="#9CA3AF"
                  value={formData.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  onFocus={() => setFocusedInput('address')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Message de blocage */}
              {blockedInfo && blockedInfo.blocked && (
                <View style={styles.blockedContainer}>
                  <View style={styles.blockedIconContainer}>
                    <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.blockedTextContainer}>
                    <Text style={styles.blockedTitle}>Accès temporairement bloqué</Text>
                    <Text style={styles.blockedText}>
                      Vous avez dépassé le nombre maximum de tentatives. Veuillez patienter avant de réessayer.
                    </Text>
                    <View style={styles.blockedTimerContainer}>
                      <Ionicons name="time-outline" size={16} color="#DC2626" />
                      <Text style={styles.blockedTimer}>
                        Temps restant : {formatRemainingTime(remainingTime)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Avertissement avant blocage */}
              {blockedInfo && !blockedInfo.blocked && blockedInfo.attempts >= 4 && (
                <View style={styles.warningContainer}>
                  <View style={styles.warningIconContainer}>
                    <Ionicons name="warning-outline" size={20} color="#FF9800" />
                  </View>
                  <View style={styles.warningTextContainer}>
                    <Text style={styles.warningTitle}>Attention</Text>
                    <Text style={styles.warningText}>
                      Vous avez effectué {blockedInfo.attempts} tentative{blockedInfo.attempts > 1 ? 's' : ''}. 
                      {blockedInfo.attempts === 4 && ' Après une 5ème tentative échouée, vous serez temporairement bloqué.'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Erreur */}
              {error && !blockedInfo?.blocked && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Bouton d'inscription */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  (isLoading || (blockedInfo && blockedInfo.blocked)) && styles.registerButtonDisabled
                ]}
                onPress={handleRegister}
                disabled={isLoading || (blockedInfo && blockedInfo.blocked)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={isLoading ? ['#9CA3AF', '#9CA3AF'] : ['#2F8F46', '#3FB15A', '#4CAF50']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <Text style={styles.registerButtonText}>Inscription...</Text>
                  ) : (
                    <>
                      <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.registerButtonText}>Créer mon compte</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Lien vers connexion */}
              <View style={styles.loginLink}>
                <Text style={styles.loginText}>Déjà un compte ? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
                  <Text style={styles.loginLinkText}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7F4',
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2F8F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#E8F5E9',
  },
  logo: {
    width: 85,
    height: 85,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A3B1F',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B8E6F',
    fontWeight: '500',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#2F8F46',
    shadowColor: '#2F8F46',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A3B1F',
    paddingVertical: 16,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 50,
    paddingTop: 16,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  blockedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FECACA',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 14,
  },
  blockedIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  blockedTextContainer: {
    flex: 1,
  },
  blockedTitle: {
    color: '#DC2626',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  blockedText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 12,
  },
  blockedTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  blockedTimer: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
    gap: 12,
  },
  warningIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE082',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    color: '#E65100',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  warningText: {
    color: '#E65100',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#2F8F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#6B8E6F',
    fontSize: 15,
    fontWeight: '500',
  },
  loginLinkText: {
    color: '#2F8F46',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
