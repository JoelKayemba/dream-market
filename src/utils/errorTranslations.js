/**
 * Traduction des messages d'erreur en français
 */

export const translateError = (errorMessage) => {
  if (!errorMessage) return 'Une erreur est survenue';

  const message = errorMessage.toLowerCase();

  // Erreurs d'authentification
  if (message.includes('invalid login credentials') || 
      message.includes('invalid email or password') ||
      message.includes('incorrect password')) {
    return 'Email ou mot de passe incorrect';
  }

  if (message.includes('email not confirmed')) {
    return 'Veuillez confirmer votre email avant de vous connecter';
  }

  if (message.includes('user not found')) {
    return 'Aucun compte trouvé avec cet email';
  }

  if (message.includes('user already registered') || 
      message.includes('email already exists') ||
      message.includes('user already exists')) {
    return 'Un compte existe déjà avec cet email';
  }

  if (message.includes('invalid email')) {
    return 'Adresse email invalide';
  }

  if (message.includes('password should be at least') ||
      message.includes('password is too short')) {
    return 'Le mot de passe doit contenir au moins 6 caractères';
  }

  if (message.includes('weak password')) {
    return 'Mot de passe trop faible. Utilisez au moins 6 caractères';
  }

  // Erreurs réseau
  if (message.includes('network') || 
      message.includes('fetch failed') ||
      message.includes('failed to fetch')) {
    return 'Erreur de connexion. Vérifiez votre connexion internet';
  }

  if (message.includes('timeout')) {
    return 'La requête a pris trop de temps. Veuillez réessayer';
  }

  // Erreurs de session
  if (message.includes('session expired') || 
      message.includes('token expired')) {
    return 'Votre session a expiré. Veuillez vous reconnecter';
  }

  if (message.includes('invalid token') || 
      message.includes('invalid session')) {
    return 'Session invalide. Veuillez vous reconnecter';
  }

  // Erreurs de validation
  if (message.includes('required') || message.includes('missing')) {
    return 'Veuillez remplir tous les champs obligatoires';
  }

  // Erreurs de mot de passe oublié
  if (message.includes('rate limit')) {
    return 'Trop de tentatives. Veuillez réessayer dans quelques minutes';
  }

  if (message.includes('email not sent')) {
    return 'Impossible d\'envoyer l\'email. Veuillez réessayer';
  }

  // Erreurs serveur
  if (message.includes('internal server error') || 
      message.includes('500')) {
    return 'Erreur serveur. Veuillez réessayer plus tard';
  }

  if (message.includes('service unavailable') || 
      message.includes('503')) {
    return 'Service temporairement indisponible. Veuillez réessayer';
  }

  // Erreurs de profil
  if (message.includes('profile not found')) {
    return 'Profil non trouvé';
  }

  if (message.includes('unable to update')) {
    return 'Impossible de mettre à jour les informations';
  }

  // Par défaut, retourner un message générique
  return 'Une erreur est survenue. Veuillez réessayer';
};

export default translateError;

