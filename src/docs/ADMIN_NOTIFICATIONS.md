# Système de Notifications Admin

## Vue d'ensemble

Le système de notifications admin permet de détecter automatiquement les nouvelles commandes et d'avertir les administrateurs en temps réel.

## Composants

### 1. `useAdminNotifications` Hook

**Fichier :** `src/hooks/useAdminNotifications.js`

Hook personnalisé qui gère la détection et la génération des notifications admin.

**Fonctionnalités :**
- Détection automatique des nouvelles commandes
- Génération de notifications pour les commandes en attente (>10 min)
- Gestion des notifications push
- Persistance des notifications

**Utilisation :**
```javascript
import { useAdminNotifications } from '../hooks/useAdminNotifications';

const { 
  adminNotifications, 
  unreadAdminNotifications, 
  unreadAdminCount,
  markAsRead 
} = useAdminNotifications();
```

### 2. `AdminNotificationCenter` Composant

**Fichier :** `src/components/admin/AdminNotificationCenter.jsx`

Composant d'interface utilisateur pour afficher et gérer les notifications.

**Fonctionnalités :**
- Badge avec compteur de notifications non lues
- Modal avec liste des notifications
- Actions rapides (marquer comme lu, naviguer vers les commandes)
- Design responsive et accessible

**Utilisation :**
```jsx
import AdminNotificationCenter from '../components/admin/AdminNotificationCenter';

<AdminNotificationCenter navigation={navigation} />
```

### 3. `AdminNotificationManager` Composant

**Fichier :** `src/components/admin/AdminNotificationManager.jsx`

Composant de gestion en arrière-plan qui surveille les nouvelles commandes.

**Fonctionnalités :**
- Rechargement automatique des commandes (toutes les 30 secondes)
- Détection des nouvelles commandes
- Génération des notifications
- Fonctionne en arrière-plan

**Utilisation :**
```jsx
import AdminNotificationManager from '../components/admin/AdminNotificationManager';

// Dans le composant principal de l'admin
<AdminNotificationManager />
```

## Types de Notifications

### 1. Nouvelles Commandes (`admin_order`)
- **Déclencheur :** Nouvelle commande détectée
- **Titre :** "🆕 Nouvelle commande reçue"
- **Message :** "Commande #XXX de [Nom du client]"
- **Action :** Naviguer vers le détail de la commande

### 2. Commandes en Attente (`admin_pending`)
- **Déclencheur :** Commande en statut "pending" depuis plus de 10 minutes
- **Titre :** "⏰ Commande en attente"
- **Message :** "Commande #XXX attend confirmation depuis [temps]"
- **Urgent :** Oui (badge URGENT)
- **Action :** Naviguer vers la gestion des commandes

## Intégration

### 1. Dans l'AdminDashboard

```jsx
import AdminNotificationManager from '../../components/admin/AdminNotificationManager';

export default function AdminDashboard({ navigation }) {
  return (
    <SafeAreaView>
      <AdminNotificationManager />
      {/* Reste du contenu */}
    </SafeAreaView>
  );
}
```

### 2. Dans OrdersManagement

```jsx
import AdminNotificationCenter from '../../../components/admin/AdminNotificationCenter';
import { useAdminNotifications } from '../../../hooks/useAdminNotifications';

export default function OrdersManagement({ navigation }) {
  const { unreadAdminCount } = useAdminNotifications();

  return (
    <View>
      <View style={styles.header}>
        {/* Header content */}
        <AdminNotificationCenter navigation={navigation} />
      </View>
      {/* Reste du contenu */}
    </View>
  );
}
```

## Configuration

### 1. Intervalles de Vérification
- **Rechargement des commandes :** 30 secondes
- **Détection des commandes en attente :** > 10 minutes

### 2. Types de Notifications Push
- **Nouvelles commandes :** Son par défaut
- **Commandes urgentes :** Son par défaut + badge urgent

### 3. Persistance
- Les notifications sont sauvegardées dans AsyncStorage
- Gestion des notifications lues/non lues
- Évite les doublons

## Tests

### Écran de Test
Un écran de test est disponible : `src/screens/Admin/TestNotifications.jsx`

**Fonctionnalités de test :**
- Statistiques des notifications
- Force le rechargement des commandes
- Marquer toutes les notifications comme lues
- Visualisation des notifications récentes

### Navigation vers le test
```javascript
navigation.navigate('TestNotifications');
```

## Dépannage

### Problèmes Courants

1. **Les notifications n'apparaissent pas**
   - Vérifier que `AdminNotificationManager` est monté
   - Vérifier que les commandes se chargent correctement
   - Vérifier les logs de la console

2. **Notifications en double**
   - Le système gère automatiquement les doublons
   - Vérifier que les IDs sont uniques

3. **Notifications push ne fonctionnent pas**
   - Vérifier les permissions de notification
   - Vérifier la configuration Expo Notifications

### Logs de Debug

Les logs suivants sont disponibles dans la console :
- `🔄 [AdminNotifications]` : Génération des notifications
- `📊 [AdminNotifications]` : Statistiques
- `🆕 [AdminNotifications]` : Nouvelles notifications détectées
- `📤 [AdminNotifications]` : Envoi des notifications push

## Performance

### Optimisations
- Utilisation de `useMemo` pour éviter les re-renders
- Gestion des intervalles avec `useEffect` cleanup
- Filtrage efficace des notifications

### Limites
- Maximum 100 notifications envoyées en mémoire
- Nettoyage automatique des anciennes notifications
- Intervalle de vérification configurable

## Sécurité

### Validation
- Vérification des permissions admin
- Validation des données des commandes
- Gestion des erreurs gracieuse

### Confidentialité
- Pas de données sensibles dans les notifications
- IDs des commandes seulement
- Messages génériques
