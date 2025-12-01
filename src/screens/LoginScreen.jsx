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
  Linking,
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

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      // Initialiser le temps restant
      setRemainingTime(blockedInfo.remainingSeconds || 0);
      
      const interval = setInterval(() => {
        setRemainingTime((prevTime) => {
          const newTime = Math.max(0, prevTime - 1);
          
          if (newTime === 0) {
            // Vérifier le statut quand le temps est écoulé
            checkBlockStatus();
          }
          
          return newTime;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      // Réinitialiser le temps si on n'est plus bloqué
      setRemainingTime(0);
    }
  }, [blockedInfo]);

  const checkBlockStatus = async () => {
    const status = await isBlocked('login');
    setBlockedInfo(status);
    if (status.blocked) {
      setRemainingTime(status.remainingSeconds);
    }
  };

  // URLs des documents légaux
  const legalLinks = {
    privacyPolicy: 'https://dream-market-rdc-ecbd2be6.base44.app/privacy',
    termsOfService: 'https://dream-market-rdc-ecbd2be6.base44.app/terms',
  };

  const handleOpenLegalLink = async (type) => {
    try {
      const url = type === 'privacy' ? legalLinks.privacyPolicy : legalLinks.termsOfService;
      const title = type === 'privacy' ? 'Politique de confidentialité' : 'Conditions générales';
      
      // Vérifier si l'URL est valide
      if (!url || !url.startsWith('http')) {
        Alert.alert('Information', `${title} sera bientôt disponible.`);
        return;
      }

      // Vérifier si on peut ouvrir l'URL
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Essayer quand même d'ouvrir (certains systèmes ne supportent pas canOpenURL correctement)
        try {
          await Linking.openURL(url);
        } catch (openError) {
          console.warn(`Impossible d'ouvrir ${title}:`, openError);
          Alert.alert('Information', `${title} sera bientôt disponible.`);
        }
      }
    } catch (error) {
      console.warn(`Erreur lors de l'ouverture du lien légal:`, error);
      // Ne pas afficher d'erreur à l'utilisateur, juste logger
      // L'utilisateur peut toujours voir les liens même si l'URL n'est pas encore configurée
    }
  };

  // Empêcher le retour en arrière après connexion réussie
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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Vérifier si l'utilisateur est bloqué
    const blockStatus = await isBlocked('login');
    if (blockStatus.blocked) {
      const timeText = formatRemainingTime(blockStatus.remainingSeconds);
      Alert.alert(
        'Trop de tentatives',
        `Vous avez dépassé le nombre maximum de tentatives de connexion. Veuillez patienter ${timeText} avant de réessayer.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await login(email.trim(), password);

      // Si la connexion réussit, réinitialiser les tentatives et fermer le modal
      if (result.type.endsWith('/fulfilled')) {
        await resetAttempts('login');
        // Si on est dans un modal, fermer le modal au lieu de naviguer
        if (navigation.goBack && typeof navigation.goBack === 'function') {
          navigation.goBack();
        } else {
          // Sinon, navigation normale
          navigation.replace('MainApp');
        }
      } else {
        // Enregistrer TOUTES les tentatives échouées
        const attemptData = await recordFailedAttempt('login');
        if (attemptData) {
          // Mettre à jour le statut de blocage pour afficher le message dans l'UI
          await checkBlockStatus();
          
          // Afficher une alerte seulement si bloqué (5 tentatives)
          if (attemptData.attempts >= 5 && attemptData.blockedUntil) {
            const timeText = formatRemainingTime(
              Math.ceil((attemptData.blockedUntil - Date.now()) / 1000)
            );
            Alert.alert(
              'Trop de tentatives',
              `Vous avez dépassé le nombre maximum de tentatives. Veuillez patienter ${timeText} avant de réessayer.`,
              [{ text: 'OK' }]
            );
          }
        }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      // Enregistrer TOUTES les tentatives échouées
      const attemptData = await recordFailedAttempt('login');
      if (attemptData) {
        // Mettre à jour le statut de blocage pour afficher le message dans l'UI
        await checkBlockStatus();
        
        // Afficher une alerte seulement si bloqué (5 tentatives)
        if (attemptData.attempts >= 5 && attemptData.blockedUntil) {
          const timeText = formatRemainingTime(
            Math.ceil((attemptData.blockedUntil - Date.now()) / 1000)
          );
          Alert.alert(
            'Trop de tentatives',
            `Vous avez dépassé le nombre maximum de tentatives. Veuillez patienter ${timeText} avant de réessayer.`,
            [{ text: 'OK' }]
          );
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F3F7F4', '#E8F5E9', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingTop: 20 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            scrollEnabled={true}
          >
            {/* Header avec logo */}
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
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>Bienvenue de retour !</Text>
            </View>

            {/* Formulaire */}
            <View style={styles.form}>
              {/* Email */}
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'email' && styles.inputContainerFocused,
                ]}
              >
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? '#2F8F46' : '#6B8E6F'} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Mot de passe */}
              <View
                style={[
                  styles.inputContainer,
                  focusedInput === 'password' && styles.inputContainerFocused,
                ]}
              >
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#2F8F46' : '#6B8E6F'} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
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

              {/* Message de blocage */}
              {blockedInfo && blockedInfo.blocked && (
                <View style={styles.blockedContainer}>
                  <View style={styles.blockedIconContainer}>
                    <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.blockedTextContainer}>
                    <Text style={styles.blockedTitle}>Accès temporairement bloqué</Text>
                    <Text style={styles.blockedText}>
                      Vous avez dépassé le nombre maximum de tentatives de connexion. Veuillez patienter avant de réessayer.
                    </Text>
                    {remainingTime > 0 && (
                      <View style={styles.blockedTimerContainer}>
                        <Ionicons name="time" size={18} color="#DC2626" />
                        <Text style={styles.blockedTimer}>
                          Temps restant : {formatRemainingTime(remainingTime)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Avertissement avant blocage */}
              {blockedInfo && !blockedInfo.blocked && blockedInfo.attempts && blockedInfo.attempts >= 4 && (
                <View style={styles.warningContainer}>
                  <View style={styles.warningIconContainer}>
                    <Ionicons name="warning" size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.warningTextContainer}>
                    <Text style={styles.warningTitle}>Attention</Text>
                    <Text style={styles.warningText}>
                      Vous avez effectué {blockedInfo.attempts} tentative{blockedInfo.attempts > 1 ? 's' : ''} échouée{blockedInfo.attempts > 1 ? 's' : ''}. 
                      {blockedInfo.attempts === 4 && '\nAprès une 5ème tentative échouée, vous serez temporairement bloqué.'}
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

              {/* Lien mot de passe oublié */}
              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

              {/* Bouton de connexion */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (isLoading || (blockedInfo && blockedInfo.blocked)) && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
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
                    <Text style={styles.loginButtonText}>Connexion...</Text>
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.loginButtonText}>Se connecter</Text>
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

              {/* Lien vers inscription */}
              <View style={styles.registerLink}>
                <Text style={styles.registerText}>Pas encore de compte ? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                  <Text style={styles.registerLinkText}>S'inscrire</Text>
                </TouchableOpacity>
              </View>

              {/* Liens légaux */}
              <View style={styles.legalLinksContainer}>
                <TouchableOpacity
                  onPress={() => handleOpenLegalLink('privacy')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.legalLinkText}>Politique de confidentialité</Text>
                </TouchableOpacity>
                <Text style={styles.legalSeparator}> • </Text>
                <TouchableOpacity
                  onPress={() => handleOpenLegalLink('terms')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.legalLinkText}>Conditions générales</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F7F4',
    minHeight: '100%',
  },
  gradient: {
    flex: 1,
    minHeight: '100%',
  },
  keyboardView: {
    flex: 1,
    minHeight: '100%',
  },
  scrollContent: {
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
    marginBottom: 40,
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
  },
  form: {
    flex: 1,
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
  eyeButton: {
    padding: 8,
    marginLeft: 8,
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  warningIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    color: '#C2410C',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  warningText: {
    color: '#9A3412',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  blockedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  blockedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  blockedTextContainer: {
    flex: 1,
  },
  blockedTitle: {
    color: '#991B1B',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  blockedText: {
    color: '#7F1D1D',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 10,
  },
  blockedTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  blockedTimer: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#2F8F46',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#2F8F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
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
  loginButtonText: {
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
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#6B8E6F',
    fontSize: 15,
    fontWeight: '500',
  },
  registerLinkText: {
    color: '#2F8F46',
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  legalLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
    flexWrap: 'wrap',
    gap: 4,
  },
  legalLinkText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: '#9CA3AF',
    fontSize: 12,
    marginHorizontal: 4,
  },
});
