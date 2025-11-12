import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
const MAX_ATTEMPTS = 5; // Bloque après 5 tentatives (donc après 4 échecs)
const WARNING_THRESHOLD = 4; // Afficher un avertissement à partir de 4 tentatives
const START_TRACKING_AFTER = 3; // Commencer à enregistrer les tentatives après 3 échecs
const WAIT_TIMES = [1, 2, 5, 10, 30]; // en minutes

/**
 * Récupère les données de tentatives pour un type d'action
 */
export const getAttemptData = async (actionType) => {
  try {
    const key = `@attempt_limiter_${actionType}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des tentatives:', error);
    return null;
  }
};

/**
 * Obtient le nombre actuel de tentatives (sans enregistrer)
 */
export const getCurrentAttempts = async (actionType) => {
  try {
    const data = await getAttemptData(actionType);
    if (!data) {
      return 0;
    }
    
    const now = Date.now();
    
    // Si plus de 24h se sont écoulées, réinitialiser
    if (now - data.lastAttemptTime > 24 * 60 * 60 * 1000) {
      await resetAttempts(actionType);
      return 0;
    }
    
    return data.attempts || 0;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de tentatives:', error);
    return 0;
  }
};

/**
 * Enregistre une tentative échouée (seulement si on a déjà 3 tentatives)
 */
export const recordFailedAttempt = async (actionType) => {
  try {
    const key = `@attempt_limiter_${actionType}`;
    const existingData = await getAttemptData(actionType);
    
    const now = Date.now();
    let attempts = existingData?.attempts || 0;
    let lastAttemptTime = existingData?.lastAttemptTime || now;
    
    // Si plus de 24h se sont écoulées, réinitialiser
    if (existingData && now - lastAttemptTime > 24 * 60 * 60 * 1000) {
      attempts = 0;
    }
    
    // Si on n'a pas encore atteint le seuil de tracking, on commence à 3
    if (attempts < START_TRACKING_AFTER) {
      attempts = START_TRACKING_AFTER;
    }
    
    attempts += 1;
    
    // Ne bloquer qu'à partir de la 5ème tentative (après 4 échecs)
    let blockedUntil = null;
    let waitTimeMinutes = 0;
    
    if (attempts >= MAX_ATTEMPTS) {
      // Calculer le temps d'attente en fonction du nombre de tentatives au-delà du seuil
      const waitTimeIndex = Math.min(attempts - MAX_ATTEMPTS, WAIT_TIMES.length - 1);
      waitTimeMinutes = WAIT_TIMES[waitTimeIndex];
      blockedUntil = now + (waitTimeMinutes * 60 * 1000);
    }
    
    const attemptData = {
      attempts,
      lastAttemptTime: now,
      blockedUntil,
      waitTimeMinutes,
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(attemptData));
    
    return attemptData;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la tentative:', error);
    return null;
  }
};

/**
 * Réinitialise les tentatives (après succès)
 */
export const resetAttempts = async (actionType) => {
  try {
    const key = `@attempt_limiter_${actionType}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des tentatives:', error);
  }
};

/**
 * Vérifie si l'utilisateur est bloqué
 */
export const isBlocked = async (actionType) => {
  try {
    const data = await getAttemptData(actionType);
    if (!data) {
      return { blocked: false };
    }
    
    const now = Date.now();
    
    // Si plus de 24h se sont écoulées, réinitialiser
    if (now - data.lastAttemptTime > 24 * 60 * 60 * 1000) {
      await resetAttempts(actionType);
      return { blocked: false };
    }
    
    // Vérifier si toujours bloqué (seulement si attempts >= MAX_ATTEMPTS)
    if (data.attempts >= MAX_ATTEMPTS && data.blockedUntil && now < data.blockedUntil) {
      const remainingSeconds = Math.ceil((data.blockedUntil - now) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      
      return {
        blocked: true,
        remainingSeconds,
        remainingMinutes,
        attempts: data.attempts,
        waitTimeMinutes: data.waitTimeMinutes,
      };
    }
    
    // Si le temps de blocage est passé mais qu'on a encore des tentatives, réinitialiser
    if (data.attempts >= MAX_ATTEMPTS && data.blockedUntil && now >= data.blockedUntil) {
      // Réinitialiser les tentatives après le temps d'attente
      await resetAttempts(actionType);
      return { blocked: false };
    }
    
    return { blocked: false, attempts: data.attempts };
  } catch (error) {
    console.error('Erreur lors de la vérification du blocage:', error);
    return { blocked: false };
  }
};

/**
 * Formate le temps restant en texte lisible
 */
export const formatRemainingTime = (remainingSeconds) => {
  if (remainingSeconds < 60) {
    return `${remainingSeconds} seconde${remainingSeconds > 1 ? 's' : ''}`;
  }
  
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  if (minutes < 60) {
    if (seconds > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} et ${seconds} seconde${seconds > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes > 0) {
    return `${hours} heure${hours > 1 ? 's' : ''} et ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  }
  
  return `${hours} heure${hours > 1 ? 's' : ''}`;
};

/**
 * Vérifie si le nombre maximum de tentatives est atteint
 */
export const hasReachedMaxAttempts = async (actionType) => {
  const data = await getAttemptData(actionType);
  if (!data) {
    return false;
  }
  
  const now = Date.now();
  
  // Si plus de 24h se sont écoulées, réinitialiser
  if (now - data.lastAttemptTime > 24 * 60 * 60 * 1000) {
    await resetAttempts(actionType);
    return false;
  }
  
  return data.attempts >= MAX_ATTEMPTS;
};

