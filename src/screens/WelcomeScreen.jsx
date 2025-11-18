import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, BackHandler, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container, Button, ScreenWrapper } from '../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthModal } from '../contexts/AuthModalContext';

const ONBOARDING_STORAGE_KEY = '@dream_market_onboarding_completed';

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { openLogin, openRegister, openForgotPassword } = useAuthModal();

  // Bloquer le retour en arrière sur WelcomeScreen
  useEffect(() => {
    const backAction = () => {
      // Retourner true empêche le retour en arrière
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  // Empêcher la navigation par swipe
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Empêcher le retour en arrière par swipe
      e.preventDefault();
    });

    return unsubscribe;
  }, [navigation]);

  // Fonction pour réinitialiser l'onboarding (pour les tests)
  const handleResetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de l\'onboarding:', error);
      Alert.alert('Erreur', 'Impossible de réinitialiser l\'onboarding');
    }
  };

  return (
    <ScreenWrapper style={styles.container}>
      <LinearGradient
        colors={['#F3F7F4', '#E8F5E9', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header avec logo */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/Dream_logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.logoText}>Dream Market</Text>
              <Text style={styles.tagline}>Votre marché agricole en ligne</Text>
            </View>
          </View>

          {/* Contenu principal */}
          <View style={styles.content}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Bienvenue !</Text>
              <Text style={styles.welcomeSubtitle}>
                Découvrez des produits frais et locaux directement depuis votre fermier de confiance
              </Text>
            </View>

            {/* Boutons d'action */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={openLogin}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#2F8F46', '#3FB15A', '#4CAF50']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Se connecter</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={openRegister}
                activeOpacity={0.85}
              >
                <Ionicons name="person-add-outline" size={20} color="#2F8F46" />
                <Text style={styles.secondaryButtonText}>Créer un compte</Text>
              </TouchableOpacity>
            </View>

            {/* Lien mot de passe oublié */}
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={openForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Informations supplémentaires */}
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Pourquoi Dream Market ?</Text>
              <View style={styles.features}>
                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons name="leaf-outline" size={28} color="#2F8F46" />
                  </View>
                  <Text style={styles.featureTitle}>Produits frais</Text>
                  <Text style={styles.featureDescription}>Directement de la ferme à votre table</Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons name="shield-checkmark-outline" size={28} color="#2F8F46" />
                  </View>
                  <Text style={styles.featureTitle}>Qualité garantie</Text>
                  <Text style={styles.featureDescription}>Sélection rigoureuse de nos producteurs</Text>
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons name="car-outline" size={28} color="#2F8F46" />
                  </View>
                  <Text style={styles.featureTitle}>Livraison rapide</Text>
                  <Text style={styles.featureDescription}>Service de livraison efficace et fiable</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bouton de test pour réinitialiser l'onboarding */}
        <TouchableOpacity
          style={[styles.resetOnboardingButton, { bottom: insets.bottom + 16 }]}
          onPress={handleResetOnboarding}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={16} color="#9CA3AF" />
        </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logoWrapper: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2F8F46',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#E8F5E9',
  },
  logo: {
    width: 120,
    height: 120,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A3B1F',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#6B8E6F',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A3B1F',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B8E6F',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  actionButtons: {
    gap: 16,
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2F8F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#2F8F46',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#2F8F46',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  forgotPasswordLink: {
    alignItems: 'center',
    marginBottom: 40,
  },
  forgotPasswordText: {
    color: '#6B8E6F',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  infoSection: {
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3B1F',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  features: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#214D31',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(47, 143, 70, 0.1)',
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(47, 143, 70, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3B1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B8E6F',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  resetOnboardingButton: {
    position: 'absolute',
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(156, 163, 175, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
