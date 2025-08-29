# État Global & Persistance Sécurisée - Dream Market

## Vue d'ensemble

Cette étape met en place l'architecture de gestion d'état global de Dream Market avec Redux Toolkit et une persistance sécurisée basée sur `expo-secure-store`.

## Architecture Redux Toolkit

### Pourquoi Redux Toolkit ?

- **Prévisibilité** : Flux de données unidirectionnel et prévisible
- **Tooling** : Redux DevTools intégrés, time-travel debugging
- **Modularité** : Slices indépendants pour chaque domaine métier
- **Performance** : Optimisations automatiques, memoization des sélecteurs

### Structure des Slices

#### 1. `productsSlice.js` (Non persisté)
```javascript
state: {
  items: [],           // Catalogue des produits
  loading: false,      // État de chargement
  error: null,         // Erreurs éventuelles
  filters: {           // Filtres actifs
    category: null,
    priceSort: null
  },
  search: ""           // Terme de recherche
}
```

**Reducers** : `setProducts`, `setLoading`, `setError`, `setFilters`, `setSearch`, `resetFilters`
**Sélecteurs** : `selectProducts`, `selectFilteredProducts`, `selectProductById`

#### 2. `servicesSlice.js` (Non persisté)
```javascript
state: {
  items: [],           // Catalogue des services
  loading: false,
  error: null
}
```

**Reducers** : `setServices`, `setLoading`, `setError`
**Sélecteurs** : `selectServices`, `selectServiceById`, `selectAvailableServices`

#### 3. `promotionsSlice.js` (Non persisté)
```javascript
state: {
  items: [],           // Promotions actives
  loading: false,
  error: null
}
```

**Modèle item** :
```javascript
{
  id: string,
  type: 'product' | 'vendor_product',
  elementId: string,
  placement: 'home' | 'category:<slug>',
  priority: number,
  start: Date,
  end: Date,
  badge: 'Sponsorisé'
}
```

**Reducers** : `setPromotions`, `setLoading`, `setError`
**Sélecteurs** : `selectActivePromotionsByPlacement(placement)`

#### 4. `cartSlice.js` (Persisté - items uniquement)
```javascript
state: {
  items: []            // Format: { id, name, price, qty, imageUrl }
}
```

**Reducers** : `addItem`, `removeItem`, `updateQty`, `clearCart`, `hydrateCart`
**Sélecteurs** : `selectCartItems`, `selectCartCount`, `selectCartTotal`

#### 5. `ordersSlice.js` (Optionnellement persisté)
```javascript
state: {
  items: [],           // Historique des commandes
  loading: false,
  error: null
}
```

**Reducers** : `addOrder`, `setOrders`, `setLoading`, `setError`, `hydrateOrders`
**Sélecteurs** : `selectOrders`, `selectOrderById`, `selectOrdersByStatus`

#### 6. `userSlice.js` (Persisté - profile, preferences, isAuthenticated)
```javascript
state: {
  profile: {           // Profil utilisateur
    name: '',
    phone: '',
    addresses: []
  },
  isAuthenticated: false,
  role: 'user',
  preferences: {       // Préférences utilisateur
    marketingEmails: false
  },
  session: null        // Données de session (non persistées)
}
```

**Reducers** : `loginSuccess`, `logout`, `setProfile`, `setRole`, `setPreferences`, `addAddress`, `updateAddress`, `removeAddress`, `setDefaultAddress`, `hydrateUser`
**Sélecteurs** : `selectIsAuthenticated`, `selectUserProfile`, `selectUserRole`

#### 7. `uiSlice.js` (Non persisté)
```javascript
state: {
  toasts: [],          // Notifications toast
  modals: [],          // Modales actives
  theme: 'light',      // Thème actuel
  globalLoading: false, // Chargement global
  activeTabs: {}       // Onglets actifs par stack
}
```

**Reducers** : `showToast`, `hideToast`, `openModal`, `closeModal`, `setTheme`
**Sélecteurs** : `selectToasts`, `selectModals`, `selectTheme`

## Persistance Sécurisée

### Principe de Moindre Privilège

Seules les données essentielles sont persistées :
- **Panier** : `cart.items` (clé `DM_CART`)
- **Utilisateur** : `user.profile`, `user.preferences`, `user.isAuthenticated` (clé `DM_USER`)
- **Commandes** : `orders.items` si volume ≤ 50 (clé `DM_ORDERS`)

### Middleware de Persistance

#### `securePersistMiddleware.js`

- **Déclenchement** : Après chaque action Redux
- **Debounce** : 250ms pour éviter les écritures excessives
- **Sélectif** : Seules les branches whitelistées sont persistées
- **Gestion d'erreurs** : Logs en mode DEV uniquement

#### `secureStorage.js`

Wrapper robuste pour `expo-secure-store` :
- **Sérialisation JSON** automatique
- **Gestion des valeurs null/undefined**
- **Logs de debug** en mode DEV
- **Clés de stockage** : `DM_CART`, `DM_USER`, `DM_ORDERS`

### Hydratation au Démarrage

#### `hydration.js`

Fonctions d'hydratation du store :
- **`hydrateStore(store)`** : Orchestration complète
- **`clearPersistedData()`** : Nettoyage sécurisé
- **`hasPersistedData()`** : Vérification de l'existence
- **`getPersistedDataSummary()`** : Résumé des données persistées

## Sécurité & Conformité

### Règles Strictes

1. **Aucun secret** stocké côté client
2. **PII minimale** : nom, téléphone, adresses uniquement
3. **Pas de tokens sensibles** en SecureStore
4. **Logs prudents** : pas de données sensibles en production

### Gestion des Erreurs

- **Try/catch** sur toutes les opérations SecureStore
- **Logs silencieux** en production
- **Fallbacks** gracieux en cas d'échec
- **Nettoyage automatique** sur logout

### Préparation Supabase

L'architecture est conçue pour faciliter la migration vers Supabase :
- **API layer** centralisé (étapes suivantes)
- **Sélecteurs** compatibles avec les données distantes
- **Actions** standardisées pour la synchronisation

## Utilisation

### Configuration du Store

```javascript
// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import securePersistMiddleware from './securePersistMiddleware';
import { 
  productsReducer, 
  cartReducer, 
  userReducer,
  // ... autres reducers
} from './slices';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    user: userReducer,
    // ... autres reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(securePersistMiddleware)
});
```

### Hydratation au Boot

```javascript
// App.jsx
import { useEffect } from 'react';
import { hydrateStore } from '@/store/hydration';

const App = () => {
  useEffect(() => {
    // Hydrater le store au démarrage
    hydrateStore(store);
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
};
```

### Utilisation des Slices

```javascript
// Dans un composant
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCartItems, 
  selectCartTotal,
  addItem,
  removeItem 
} from '@/store/slices/cartSlice';

const CartComponent = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  const handleAddItem = (product) => {
    dispatch(addItem(product));
  };

  // ... reste du composant
};
```

## Bonnes Pratiques

### Taille des Données

- **Pas de blobs** ou images en SecureStore
- **Données structurées** uniquement
- **Limite de volume** pour les commandes (≤50)

### Fréquence d'Écriture

- **Debounce** de 250ms pour éviter les écritures excessives
- **Persistance sélective** selon les actions
- **Nettoyage automatique** sur logout

### Gestion des Erreurs

- **Logs en DEV uniquement**
- **Fallbacks gracieux**
- **Nettoyage des données corrompues**

## Évolution Future

### Prochaines Étapes

1. **API Layer** : Abstraction pour les appels réseau
2. **Mocks** : Données de test pour le développement
3. **Supabase Integration** : Remplacement des mocks par l'API
4. **Synchronisation** : Gestion des conflits offline/online

### Scalabilité

- **Slices modulaires** pour faciliter l'extension
- **Sélecteurs optimisés** avec memoization
- **Middleware extensible** pour de nouvelles fonctionnalités
- **Architecture** prête pour la gestion d'état complexe

## Tests & Validation

### Vérifications

- [ ] Store Redux initialise sans erreur
- [ ] Tous les slices sont combinés correctement
- [ ] Middleware de persistance est branché
- [ ] Hydratation fonctionne au démarrage
- [ ] Actions et sélecteurs sont accessibles
- [ ] Persistance sécurisée fonctionne
- [ ] Gestion d'erreurs est robuste

### Démarrage de l'App

L'application doit :
1. **Démarrer** sans erreur Redux
2. **Hydrater** le store depuis SecureStore
3. **Afficher** la navigation principale
4. **Persister** automatiquement les changements d'état






