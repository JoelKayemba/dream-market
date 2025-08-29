// 🔐 Écrans d'authentification - Dream Market App
// Export centralisé de tous les écrans d'authentification

// 🎯 Écrans principaux d'authentification
export { default as LoginScreen } from './LoginScreen';
export { default as RegisterScreen } from './RegisterScreen';
export { default as ForgotPasswordScreen } from './ForgotPasswordScreen';

// 📱 Écrans de profil utilisateur
export { default as ProfileScreen } from './ProfileScreen';
export { default as EditProfileScreen } from './EditProfileScreen';
export { default as ChangePasswordScreen } from './ChangePasswordScreen';

// 🔒 Écrans de sécurité
export { default as SecuritySettingsScreen } from './SecuritySettingsScreen';
export { default as TwoFactorAuthScreen } from './TwoFactorAuthScreen';
export { default as PrivacySettingsScreen } from './PrivacySettingsScreen';

// 📋 Écrans de vérification
export { default as EmailVerificationScreen } from './EmailVerificationScreen';
export { default as PhoneVerificationScreen } from './PhoneVerificationScreen';
export { default as VerificationSuccessScreen } from './VerificationSuccessScreen';

// 🚪 Écrans de session
export { default as SessionExpiredScreen } from './SessionExpiredScreen';
export { default as LogoutScreen } from './LogoutScreen';
export { default as AccountDeactivatedScreen } from './AccountDeactivatedScreen';

// 📱 Écrans de récupération
export { default as PasswordResetScreen } from './PasswordResetScreen';
export { default as PasswordResetConfirmScreen } from './PasswordResetConfirmScreen';
export { default as PasswordResetSuccessScreen } from './PasswordResetSuccessScreen';

// 📋 Export par défaut
export default {
  // Écrans principaux
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  
  // Profil utilisateur
  ProfileScreen,
  EditProfileScreen,
  ChangePasswordScreen,
  
  // Sécurité
  SecuritySettingsScreen,
  TwoFactorAuthScreen,
  PrivacySettingsScreen,
  
  // Vérification
  EmailVerificationScreen,
  PhoneVerificationScreen,
  VerificationSuccessScreen,
  
  // Session
  SessionExpiredScreen,
  LogoutScreen,
  AccountDeactivatedScreen,
  
  // Récupération
  PasswordResetScreen,
  PasswordResetConfirmScreen,
  PasswordResetSuccessScreen,
};


