import { useAuth } from './useAuth';
import { useAuthModal } from '../contexts/AuthModalContext';

/**
 * Hook pour vérifier si l'utilisateur est authentifié avant d'exécuter une action
 * Si non authentifié, ouvre le modal de connexion
 */
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const { openLogin } = useAuthModal();

  const requireAuth = (callback) => {
    if (isAuthenticated) {
      return callback();
    } else {
      openLogin();
      return false;
    }
  };

  return { requireAuth, isAuthenticated };
};

