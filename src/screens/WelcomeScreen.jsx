import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { Container, Button  , ScreenWrapper } from '../components/ui';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  return (
    <ScreenWrapper style={styles.container}>
      {/* Header avec logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={60} color="#4CAF50" />
          <Text style={styles.logoText}>Dream Market</Text>
          <Text style={styles.tagline}>Votre marché agricole en ligne</Text>
        </View>
      </View>

      {/* Contenu principal */}
      <Container style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Bienvenue sur Dream Market</Text>
          <Text style={styles.welcomeSubtitle}>
            Découvrez des produits frais et locaux directement depuis votre fermier de confiance
          </Text>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <Button
            title="Se connecter"
            onPress={() => navigation.navigate('Login')}
            variant="primary"
            size="large"
            style={styles.loginButton}
          />
          
          <Button
            title="Créer un compte"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            size="large"
            style={styles.registerButton}
          />
        </View>

        {/* Lien mot de passe oublié */}
        <TouchableOpacity
          style={styles.forgotPasswordLink}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* Informations supplémentaires */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Pourquoi Dream Market ?</Text>
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="leaf-outline" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Produits frais et locaux</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Qualité garantie</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="car-outline" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Livraison rapide</Text>
            </View>
          </View>
        </View>
      </Container>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#283106',
    marginTop: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#777E5C',
    marginTop: 4,
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#283106',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  actionButtons: {
    gap: 16,
    marginBottom: 24,
  },
  
  registerButton: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  forgotPasswordLink: {
    alignItems: 'center',
    marginBottom: 40,
  },
  forgotPasswordText: {
    color: '#777E5C',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  infoSection: {
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginBottom: 20,
  },
  features: {
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#777E5C',
  },
});
