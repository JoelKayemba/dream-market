import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../store/authSlice';
import { resetAttempts } from '../utils/attemptLimiter';
import { useAuthModal } from '../contexts/AuthModalContext';

/**
 * Composants locaux simples pour éviter les dépendances externes
 */
const PrimaryButton = ({ title, onPress, icon, style }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.btnBase, styles.btnPrimary, style]}>
    {icon ? <Ionicons name={icon} size={18} color="#FFFFFF" style={{ marginRight: 8 }} /> : null}
    <Text style={styles.btnPrimaryText}>{title}</Text>
  </TouchableOpacity>
);

const OutlineButton = ({ title, onPress, style }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.btnBase, styles.btnOutline, style]}>
    <Text style={styles.btnOutlineText}>{title}</Text>
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localUser, setLocalUser] = useState(user ?? null);
  const insets = useSafeAreaInsets();
  const { openLogin } = useAuthModal();

  // Mémoriser les actions (évite des re-créations + bugs d'égalité)
  
  const quickActions = useMemo(
    () => [
      { id: 'orders', title: 'Mes Commandes', subtitle: 'Suivre et gérer', icon: 'receipt-outline', color: '#283106', route: 'Orders' },
      { id: 'favorites', title: 'Mes Favoris', subtitle: 'Produits sauvegardés', icon: 'heart-outline', color: '#FF6B6B', route: 'Favorites' },
      { id: 'feedback', title: 'Feedback', subtitle: 'Retours et suggestions', icon: 'chatbox-ellipses-outline', color: '#9C27B0', route: 'Feedback' },
      { id: 'faq', title: 'FAQ', subtitle: 'Questions fréquentes', icon: 'help-circle-outline', color: '#2196F3', route: 'FAQ' },
      { id: 'support', title: 'Support', subtitle: 'Aide et contact', icon: 'chatbubbles-outline', color: '#FF9800', route: 'Support' },
      { id: 'profile', title: 'Informations', subtitle: 'Modifier profil', icon: 'person-outline', color: '#607D8B', route: 'PersonalInfo' },
      { id: 'settings', title: 'Paramètres', subtitle: 'Notifications, sécurité', icon: 'settings-outline', color: '#9C27B0', route: 'Settings' },
      // { id: 'addresses', title: 'Adresses', subtitle: 'Gérer mes adresses', icon: 'location-outline', color: '#607D8B', route: 'Addresses' },
    ],
    []
  );

  // Suivre les changements d'user (tout en évitant les glitchs pendant le logout)
  useEffect(() => {
    if (!isLoggingOut) {
      setLocalUser(user ?? null);
    }
  }, [user, isLoggingOut]);

  const displayUser = localUser ?? user ?? {
    firstName: 'Utilisateur',
    lastName: '',
    email: '—',
    phone: '',
    role: 'user',
  };

  const handleQuickAction = (route) => {
    if (!route) return;
    try {
      navigation.navigate(route);
    } catch (e) {
      console.warn('Navigation error:', e);
      Alert.alert('Navigation', "Impossible d'ouvrir cette section.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              // Réinitialiser les tentatives de connexion
              await resetAttempts('login');
              await resetAttempts('register');
              await resetAttempts('forgotPassword');
              
              // Déconnecter l'utilisateur
              // Utiliser dispatch directement avec unwrap() pour obtenir une promesse
              await dispatch(logoutAction()).unwrap();
              
              // Fermer le modal immédiatement
              setIsLoggingOut(false);
              
              // Ne pas rediriger vers Welcome - l'utilisateur peut continuer à utiliser l'app
              // La déconnexion met juste isAuthenticated à false
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'La déconnexion a échoué. Réessayez.');
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  // URLs des documents légaux (à compléter)
  const legalLinks = {
    privacyPolicy: 'https://dream-market-rdc-ecbd2be6.base44.app/privacy', 
    legalMentions: 'https://dream-market-rdc-ecbd2be6.base44.app/legal', 
    termsOfService: 'https://dream-market-rdc-ecbd2be6.base44.app/terms',
  };

  const handleOpenLink = async (url, title) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', `Impossible d'ouvrir ${title}. Veuillez vérifier l'URL.`);
      }
    } catch (error) {
      console.error(`Erreur lors de l'ouverture de ${title}:`, error);
      Alert.alert('Erreur', `Impossible d'ouvrir ${title}.`);
    }
  };

  // Écran si pas connecté
  if (!isAuthenticated && !user && !isLoggingOut && !localUser) {
    return (
      <View style={[styles.flex1, { backgroundColor: COLORS.bg, paddingTop: insets.top }]}>
        <ScrollView 
          contentContainerStyle={styles.notConnectedContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notConnectedContent}>
            <View style={styles.notConnectedIconContainer}>
              <Ionicons name="person-circle-outline" size={100} color={COLORS.accentText} />
            </View>
            <Text style={styles.notConnectedTitle}>Connectez-vous</Text>
            <Text style={styles.notConnectedSubtitle}>
              Connectez-vous pour voir votre profil, gérer vos commandes et accéder à toutes les fonctionnalités de Dream Market.
            </Text>
            <PrimaryButton
              title="Se connecter"
              icon="log-in-outline"
              onPress={openLogin}
              style={{ width: '100%', maxWidth: 300, marginTop: 24 }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.flex1, { backgroundColor: COLORS.bg, paddingTop: insets.top }]}>
      {/* Modal de déconnexion */}
      <Modal visible={isLoggingOut} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.modalText}>Déconnexion en cours...</Text>
            <Text style={styles.modalSubtext}>Veuillez patienter</Text>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header / Carte profil */}
        <View style={styles.header}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color="#FFFFFF" />
              </View>
              {displayUser?.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>

            <View style={styles.userInfo}>
              <Text numberOfLines={1} style={styles.userName}>
                {`${displayUser?.firstName ?? ''} ${displayUser?.lastName ?? ''}`.trim() || 'Utilisateur'}
              </Text>
              {!!displayUser?.email && <Text numberOfLines={1} style={styles.userEmail}>{displayUser.email}</Text>}
              {!!displayUser?.phone && <Text numberOfLines={1} style={styles.userPhone}>{displayUser.phone}</Text>}

             
            </View>
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <Text style={styles.sectionSubtitle}>Gérez votre compte et vos préférences</Text>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.quickActionCard}
                activeOpacity={0.85}
                onPress={() => handleQuickAction(a.route)}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: withAlpha(a.color, 0.12) }]}>
                  <Ionicons name={a.icon} size={20} color={a.color} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>{a.title}</Text>
                  <Text style={styles.actionSubtitle}>{a.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CBD5E0" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Espace admin si rôle admin */}
        {displayUser?.role === 'admin' && (
          <View style={styles.section}>
            <View style={styles.adminSection}>
              <View style={styles.adminHeader}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.purple} />
                <Text style={styles.adminTitle}>Espace Administrateur</Text>
              </View>
              <Text style={styles.adminSubtitle}>Accédez au tableau de bord d'administration</Text>
              <PrimaryButton
                title="Accéder à l'administration"
                icon="shield-outline"
                onPress={() => handleQuickAction('AdminDashboard')}
                style={styles.adminButton}
              />
            </View>
          </View>
        )}

        {/* Documents légaux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations légales</Text>
          <Text style={styles.sectionSubtitle}>Consultez nos documents officiels</Text>

          <View style={styles.legalLinksContainer}>
            <TouchableOpacity
              style={styles.legalLinkCard}
              activeOpacity={0.7}
              onPress={() => handleOpenLink(legalLinks.privacyPolicy, 'Politique de confidentialité')}
            >
              <View style={[styles.legalLinkIconContainer, { backgroundColor: withAlpha('#2196F3', 0.12) }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#2196F3" />
              </View>
              <View style={styles.legalLinkTextContainer}>
                <Text style={styles.legalLinkTitle}>Politique de confidentialité</Text>
                <Text style={styles.legalLinkSubtitle}>Protection de vos données</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={COLORS.subtext} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.legalLinkCard}
              activeOpacity={0.7}
              onPress={() => handleOpenLink(legalLinks.legalMentions, 'Mentions légales')}
            >
              <View style={[styles.legalLinkIconContainer, { backgroundColor: withAlpha('#9C27B0', 0.12) }]}>
                <Ionicons name="document-text-outline" size={20} color="#9C27B0" />
              </View>
              <View style={styles.legalLinkTextContainer}>
                <Text style={styles.legalLinkTitle}>Mentions légales</Text>
                <Text style={styles.legalLinkSubtitle}>Informations sur l'éditeur</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={COLORS.subtext} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.legalLinkCard}
              activeOpacity={0.7}
              onPress={() => handleOpenLink(legalLinks.termsOfService, 'Conditions générales')}
            >
              <View style={[styles.legalLinkIconContainer, { backgroundColor: withAlpha('#FF9800', 0.12) }]}>
                <Ionicons name="document-outline" size={20} color="#FF9800" />
              </View>
              <View style={styles.legalLinkTextContainer}>
                <Text style={styles.legalLinkTitle}>Conditions générales</Text>
                <Text style={styles.legalLinkSubtitle}>CGU d'utilisation</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={COLORS.subtext} />
            </TouchableOpacity>
          </View>
        </View>

        {/* À propos / version + Déconnexion */}
        <View style={styles.section}>
          <View style={styles.aboutCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="leaf-outline" size={18} color={COLORS.primary} />
              <Text style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}>Dream Market</Text>
            </View>
            <Text style={styles.aboutText}>
              Plateforme simple et efficace pour commander des produits agricoles et services associés.
            </Text>
            <Text style={styles.versionText}>Version 1.0.0 • {Platform.select({ ios: 'iOS', android: 'Android', default: 'Mobile' })}</Text>
          </View>

          <PrimaryButton
            title="Se déconnecter"
            onPress={handleLogout}
            icon="log-out-outline"
            style={[styles.logoutButton, { marginTop: 16 }]}
          />
        </View>

        <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    );
  }

/** Utils */
const withAlpha = (hex, alpha = 0.2) => {
  // hex #RRGGBB -> rgba(r,g,b,alpha)
  const clean = (hex || '').replace('#', '');
  if (clean.length !== 6) return 'rgba(0,0,0,0.05)';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#F1F5F9',
  text: '#1A202C',
  subtext: '#718096',
  muted: '#A0AEC0',
  primary: '#4CAF50', // vert
  danger: '#FF6B6B',
  blue: '#2196F3',
  orange: '#FF9800',
  purple: '#9C27B0',
  accentText: '#777E5C',
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },

  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // HEADER + PROFIL
  header: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  adminBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.purple,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 14,
  },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.subtext,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },

  // SECTIONS
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 16,
  },

  // QUICK ACTIONS
  quickActionsGrid: {
    gap: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.subtext,
  },

  // ADMIN
  adminSection: {
    backgroundColor: COLORS.card,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.purple,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  adminSubtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 14,
    lineHeight: 20,
  },
  adminButton: {
    alignSelf: 'flex-start',
  },

  // ABOUT + LOGOUT
  aboutCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.subtext,
    marginBottom: 6,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  logoutButton: {
    width: '100%',
  },

  bottomSpacing: { height: 24 },

  // MODAL LOGOUT
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 260,
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283106',
    marginTop: 16,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#777E5C',
    marginTop: 6,
    textAlign: 'center',
  },

  // BOUTONS
  btnBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnOutlineText: {
    color: '#2D3748',
    fontSize: 15,
    fontWeight: '600',
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },

  // Not connected state
  notConnectedContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  notConnectedContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  notConnectedIconContainer: {
    marginBottom: 24,
  },
  notConnectedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  notConnectedSubtitle: {
    fontSize: 15,
    color: COLORS.subtext,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },

  // LEGAL LINKS
  legalLinksContainer: {
    gap: 12,
  },
  legalLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  legalLinkIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  legalLinkTextContainer: {
    flex: 1,
  },
  legalLinkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  legalLinkSubtitle: {
    fontSize: 12,
    color: COLORS.subtext,
  },
});
