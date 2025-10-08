import React, { useEffect } from 'react';
import { errorHandler } from '../utils/errorHandler';

/**
 * Composant pour gérer les erreurs globales de l'application
 * Doit être placé au niveau racine de l'app
 */
const GlobalErrorHandler = ({ children }) => {
  useEffect(() => {
    // Gérer les erreurs non capturées
    const handleError = (error, isFatal) => {
      if (__DEV__) {
        console.error('Global error:', error, 'isFatal:', isFatal);
      }
      errorHandler.handleError(error, 'Global Error', !__DEV__);
    };

    // Gestionnaire d'erreurs global pour React Native
    const errorHandlerRef = ErrorUtils.setGlobalHandler(handleError);

    // Cleanup
    return () => {
      if (errorHandlerRef) {
        ErrorUtils.setGlobalHandler(errorHandlerRef);
      }
    };
  }, []);

  return <>{children}</>;
};

export default GlobalErrorHandler;

