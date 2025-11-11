import React from 'react';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';

const AdminNotificationManager = () => {
  // Le hook useAdminNotifications se charge maintenant de tout :
  // - Chargement depuis Supabase
  // - Abonnement temps réel
  // - Envoi des notifications push
  // - Gestion des notifications déjà envoyées
  useAdminNotifications();

  // Ce composant ne rend rien, il délègue tout au hook
  return null;
};

export default AdminNotificationManager;
