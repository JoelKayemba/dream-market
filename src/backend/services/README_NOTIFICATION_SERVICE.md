# 🔔 NotificationService - Guide d'utilisation

## Vue d'ensemble

Le `NotificationService` est maintenant la **source unique de vérité** pour toutes les notifications dans l'application Dream Market. Il gère de manière unifiée les notifications pour les admins et les clients.

## 🏗️ Architecture

```
NotificationService (Unifié)
├── Méthodes Client (getClientNotifications, getClientUnreadCount)
├── Méthodes Admin (getAdminNotifications, getAdminUnreadCount)
├── Méthodes Générales (getUserNotifications, getUnreadCount)
├── Gestion Temps Réel (subscribeToNotifications avec filtrage par rôle)
└── Utilitaires (cleanupOldNotifications, markMultipleNotificationsAsSent)
```

## 📋 Types de notifications supportés

### Types Admin
- `admin_new_order` - Nouvelle commande reçue
- `admin_pending_order` - Commande en attente
- `admin_order` - Commande générale (legacy)
- `admin_pending` - En attente (legacy)

### Types Client
- `order_confirmed` - Commande confirmée
- `order_preparing` - Commande en préparation
- `order_shipped` - Commande expédiée
- `order_delivered` - Commande livrée
- `order_cancelled` - Commande annulée
- `order_status_update` - Mise à jour de statut générale

### Types Généraux
- `promo` - Promotions
- `product` - Nouveaux produits
- `farm` - Nouvelles fermes
- `service` - Nouveaux services
- `system` - Notifications système
- `test` - Tests

## 🚀 Utilisation dans les hooks

### Pour les Clients (`useNotifications`)

```javascript
import { notificationService } from '../backend/services/notificationService';

// Charger les notifications client
const notifications = await notificationService.getClientNotifications(userId);

// Compter les notifications non lues
const unreadCount = await notificationService.getClientUnreadCount(userId);

// S'abonner au temps réel (filtré pour les clients)
const subscription = notificationService.subscribeToNotifications(
  userId, 
  callback, 
  'client'
);
```

### Pour les Admins (`useAdminNotifications`)

```javascript
import { notificationService } from '../backend/services/notificationService';

// Charger les notifications admin
const notifications = await notificationService.getAdminNotifications(userId);

// Compter les notifications non lues
const unreadCount = await notificationService.getAdminUnreadCount(userId);

// S'abonner au temps réel (filtré pour les admins)
const subscription = notificationService.subscribeToNotifications(
  userId, 
  callback, 
  'admin'
);
```

## 🔧 Méthodes principales

### Récupération des notifications

```javascript
// Toutes les notifications d'un utilisateur
await notificationService.getUserNotifications(userId, limit);

// Notifications client uniquement
await notificationService.getClientNotifications(userId, limit);

// Notifications admin uniquement
await notificationService.getAdminNotifications(userId, limit);

// Notifications non envoyées (avec filtrage par rôle)
await notificationService.getUnsentNotifications(userId, type, userRole, limit);
```

### Gestion des statuts

```javascript
// Marquer comme lu
await notificationService.markNotificationAsRead(notificationId);

// Marquer comme envoyée
await notificationService.markNotificationAsSent(notificationId);

// Marquer toutes comme lues
await notificationService.markAllNotificationsAsRead(userId);

// Marquer plusieurs comme envoyées
await notificationService.markMultipleNotificationsAsSent(notificationIds);
```

### Temps réel

```javascript
// S'abonner avec filtrage par rôle
const subscription = notificationService.subscribeToNotifications(
  userId,
  (payload) => {
    console.log('Nouvelle notification:', payload);
  },
  'admin' // ou 'client'
);

// Se désabonner
notificationService.unsubscribeFromNotifications(subscription);
```

### Création de notifications

```javascript
// Créer une notification manuellement
await notificationService.createNotification({
  userId: 'user-id',
  orderId: 'order-id', // optionnel
  type: 'order_confirmed',
  title: 'Commande confirmée',
  message: 'Votre commande a été confirmée',
  data: { orderNumber: 'CMD123' },
  priority: 1 // 1=normal, 2=haute, 3=urgente
});
```

### Utilitaires

```javascript
// Obtenir les statistiques
const stats = await notificationService.getNotificationStats(userId);
// { total: 10, unread: 3, clientUnread: 2, adminUnread: 1 }

// Nettoyer les anciennes notifications
await notificationService.cleanupOldNotifications(30); // 30 jours

// Obtenir les types disponibles
const types = notificationService.getNotificationTypes();
```

## 🎯 Avantages de cette architecture

1. **Source unique de vérité** : Toutes les notifications passent par ce service
2. **Filtrage intelligent** : Séparation automatique admin/client
3. **Performance optimisée** : Requêtes spécialisées selon le rôle
4. **Temps réel intelligent** : Filtrage côté client selon le rôle
5. **Maintenance facilitée** : Méthodes utilitaires intégrées
6. **Évolutivité** : Facile d'ajouter de nouveaux types

## 🔄 Flux de données

```
Base de données Supabase
    ↓ (Triggers SQL)
Notifications créées automatiquement
    ↓ (NotificationService)
Hooks spécialisés (useNotifications, useAdminNotifications)
    ↓ (Temps réel)
Composants d'affichage (NotificationsScreen, AdminNotificationCenter)
    ↓ (Actions utilisateur)
Mise à jour des statuts via NotificationService
```

## 🛠️ Maintenance

Le service inclut des méthodes de maintenance automatique :

- **Nettoyage automatique** des anciennes notifications
- **Gestion des doublons** avec `is_sent` et `is_read`
- **Logs détaillés** pour le debugging
- **Validation des paramètres** dans `createNotification`

## 📝 Notes importantes

- Les notifications sont créées automatiquement par les triggers SQL
- Le service filtre automatiquement selon le rôle utilisateur
- Les abonnements temps réel sont optimisés pour éviter les notifications inutiles
- Toutes les méthodes incluent une gestion d'erreur robuste

