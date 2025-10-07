import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { 
  loginUser, 
  registerUser, 
  forgotPassword, 
  resetPassword, 
  logout, 
  clearError, 
  clearPasswordReset,
  clearEmailConfirmation,
  updateUserInfo,
  changeUserPassword,
  loadStoredAuth
} from '../store/authSlice';
import { authListenerService } from '../backend/services/authListenerService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const hasLoaded = useRef(false);

  // Charger l'authentification stockée au montage (une seule fois)
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      dispatch(loadStoredAuth());
    }
  }, [dispatch]);

  // Écouter les changements d'auth Supabase
  useEffect(() => {
    const unsubscribe = authListenerService.addListener((event, session) => {
      console.log('Auth event in useAuth:', event);
      
      if (event === 'SIGNED_OUT') {
        // Déconnexion automatique
        dispatch(logout());
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token rafraîchi, mettre à jour l'état
        console.log('Token refreshed, updating auth state');
        // Pas besoin de faire quoi que ce soit, Supabase gère automatiquement
      }
    });

    return unsubscribe;
  }, [dispatch]);

  const signIn = async (email, password) => {
    return dispatch(loginUser({ email, password }));
  };

  const signUp = async (userData) => {
    return dispatch(registerUser({
      email: userData.email || '',
      password: userData.password || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      phone: userData.phone || '',
      address: userData.address || '',
    }));
  };

  const signOut = async () => {
    return dispatch(logout());
  };

  const resetPassword = async (email) => {
    return dispatch(forgotPassword({ email }));
  };

  const updatePassword = async (email, code, newPassword) => {
    return dispatch(resetPassword({ email, code, newPassword }));
  };

  const updateProfile = async (userData) => {
    return dispatch(updateUserInfo(userData));
  };


  const changePassword = async (currentPassword, newPassword) => {
    return dispatch(changeUserPassword({ currentPassword, newPassword }));
  };

  const refreshToken = async () => {
    return authListenerService.refreshToken();
  };

  const clearErrorAction = () => {
    dispatch(clearError());
  };

  return {
    // État
    user: auth.user,
    profile: auth.user, // Compatibilité avec l'ancien système
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    resetCode: auth.resetCode,
    isPasswordReset: auth.isPasswordReset,
    needsEmailConfirmation: auth.needsEmailConfirmation,
    
    // Actions
    login: signIn,
    register: signUp,
    signUp,
    signIn,
    logout: signOut,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    updateUserInfo: updateProfile, // Alias pour compatibilité
    changePassword,
    refreshToken,
    clearError: clearErrorAction,
    clearPasswordReset: () => dispatch(clearPasswordReset()),
    clearEmailConfirmation: () => dispatch(clearEmailConfirmation()),
    
    // Getters
    isAdmin: () => auth.user?.role === 'admin',
    isFarmer: () => auth.user?.role === 'farmer',
    isCustomer: () => auth.user?.role === 'customer',
    isUser: () => auth.user?.role === 'user', // Compatibilité
    hasRole: (role) => auth.user?.role === role,
    
    // Compatibilité avec l'ancien système
    forgotPassword: resetPassword,
  };
};
