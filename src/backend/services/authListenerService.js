import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthListenerService {
  constructor() {
    this.listeners = new Set();
    this.isListening = false;
  }

  // Ajouter un listener pour les changements d'auth
  addListener(callback) {
    this.listeners.add(callback);
    
    if (!this.isListening) {
      this.startListening();
    }
    
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopListening();
      }
    };
  }

  // Démarrer l'écoute des changements d'auth
  startListening() {
    if (this.isListening) return;
    
    this.isListening = true;
    
    this.authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      switch (event) {
        case 'SIGNED_IN':
          if (session) {
            await this.handleSignIn(session);
          }
          break;
          
        case 'SIGNED_OUT':
          await this.handleSignOut();
          break;
          
        case 'TOKEN_REFRESHED':
          if (session) {
            await this.handleTokenRefresh(session);
          }
          break;
          
        case 'PASSWORD_RECOVERY':
          console.log('Password recovery initiated');
          break;
          
        default:
          console.log('Auth event:', event);
      }
      
      // Notifier tous les listeners
      this.listeners.forEach(callback => {
        try {
          callback(event, session);
        } catch (error) {
          console.error('Error in auth listener callback:', error);
        }
      });
    });
  }

  // Arrêter l'écoute
  stopListening() {
    if (this.authSubscription) {
      this.authSubscription.data.subscription.unsubscribe();
      this.authSubscription = null;
    }
    this.isListening = false;
  }

  // Gérer la connexion
  async handleSignIn(session) {
    try {
      // Sauvegarder les tokens
      await AsyncStorage.setItem('auth_token', session.access_token);
      await AsyncStorage.setItem('user_id', session.user.id);
      await AsyncStorage.setItem('refresh_token', session.refresh_token);
      
      console.log('Tokens saved for user:', session.user.email);
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  // Gérer la déconnexion
  async handleSignOut() {
    try {
      // Supprimer les tokens
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.removeItem('refresh_token');
      
      console.log('Tokens cleared');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Gérer le refresh du token
  async handleTokenRefresh(session) {
    try {
      // Mettre à jour les tokens
      await AsyncStorage.setItem('auth_token', session.access_token);
      await AsyncStorage.setItem('refresh_token', session.refresh_token);
      
      console.log('Tokens refreshed for user:', session.user.email);
    } catch (error) {
      console.error('Error refreshing tokens:', error);
    }
  }

  // Vérifier la session actuelle
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  // Vérifier si l'utilisateur est connecté
  async isAuthenticated() {
    const session = await this.getCurrentSession();
    return !!session;
  }

  // Forcer le refresh du token
  async refreshToken() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing token:', error);
        return false;
      }
      
      if (data.session) {
        await this.handleTokenRefresh(data.session);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
}

// Instance singleton
export const authListenerService = new AuthListenerService();
export default authListenerService;
