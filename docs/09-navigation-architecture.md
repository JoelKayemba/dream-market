# Architecture de Navigation - Dream Market

## Vue d'ensemble

Ce document décrit l'architecture de navigation complète de l'application Dream Market, incluant les tabs, stacks, auth gates et la préparation aux deeplinks.

## 🗺️ Structure des Routes

### Navigation Principale (Tabs)

```
BottomTabs Navigator
├── Home (Accueil)
├── Products (Catalogue)
├── Cart (Panier)
├── Orders (Historique)
├── Services (Services & Réservations)
└── Account (Profil / Auth)
```

### Stacks de Navigation

```
AppNavigator (Stack)
├── MainTabs (BottomTabs)
├── ProductDetails
├── Checkout
├── OrderSuccess
├── OrderDetails
├── ServiceBooking
├── Login
└── Register
```

## 📱 Tabs et Icônes

### Configuration des Tabs

| Tab | Icône | Label | Écran |
|-----|-------|-------|-------|
| Home | `home` | Accueil | HomeScreen |
| Products | `list` | Produits | ProductsScreen |
| Cart | `cart` | Panier | CartScreen |
| Orders | `receipt` | Commandes | OrdersScreen |
| Services | `briefcase` | Services | ServicesScreen |
| Account | `person` | Compte | AccountScreen |

### Style des Tabs

- **Hauteur** : 80px (adaptatif tablette)
- **Couleur active** : #2E7D32 (vert primaire)
- **Couleur inactive** : #757575 (gris secondaire)
- **Padding** : 16px bas, 8px haut
- **Accessibilité** : Zones tactiles ≥44px

## 🔐 Auth Gates

### Points d'Authentification

L'application prévoit des auth gates aux endroits suivants :

1. **Checkout** (`CheckoutScreen`)
   - Redirige vers `LoginScreen` si non authentifié
   - Sauvegarde la route de retour

2. **Réservation de Service** (`ServiceBookingScreen`)
   - Redirige vers `LoginScreen` si non authentifié
   - Sauvegarde la route de retour

3. **Compte Utilisateur** (`AccountScreen`)
   - Affiche l'écran de connexion si non authentifié
   - Affiche le profil si authentifié

4. **Historique des Commandes** (`OrdersScreen`)
   - Accessible uniquement aux utilisateurs connectés

### Hook useAuthGate

```javascript
const {
  isAuthenticated,
  requireAuth,
  requireAuthForCheckout,
  requireAuthForServiceBooking,
  requireAuthForOrders,
  requireAuthForAccount
} = useAuthGate();
```

**TODO Étape 17** : Remplacer le placeholder par la vraie logique d'authentification.

## 🔗 Deep Links (Préparation)

### Routes de Deep Links

| Route | Description | Usage Futur |
|-------|-------------|-------------|
| `/` | Accueil | WhatsApp, e-mail |
| `/products` | Liste des produits | Partage de catalogue |
| `/product/:id` | Détail produit | Partage de produit |
| `/services` | Liste des services | Partage de services |
| `/service/:id` | Détail service | Partage de service |
| `/orders` | Commandes | Suivi client |
| `/order/:id` | Détail commande | Suivi commande |
| `/login` | Connexion | Authentification |
| `/register` | Inscription | Création de compte |

### Constantes de Routes

```javascript
// Fichier: src/app/routes.js
export const TAB_ROUTES = { ... };
export const STACK_ROUTES = { ... };
export const DEEPLINK_ROUTES = { ... };
```

## 📱 Responsivité et Tablettes

### Adaptation Mobile vs Tablette

- **Mobile** : Tabs en bas, navigation standard
- **Tablette Portrait** : Tabs en bas, marges plus généreuses
- **Tablette Paysage** : Tabs en bas, grilles adaptatives

### Hook useResponsive

```javascript
const { isMobile, isTablet, getSpacing } = useResponsive();

// Espacements adaptatifs
const containerPadding = getSpacing('pageMargin');
const itemGap = getSpacing('itemGap');
```

## 🎨 Cohérence UI

### Headers et Navigation

- **Arrière-plan** : Blanc (#FFFFFF)
- **Titre** : Gris foncé (#212121)
- **Bouton retour** : Visible et accessible
- **Localisation** : Français (FR)

### Composants UI

- **SectionHeader** : Titres de section cohérents
- **EmptyState** : Placeholders informatifs
- **Button** : Actions claires et accessibles
- **Badge** : Indicateurs visuels (ex: "Sponsorisé")

## 🚀 Évolution Future

### Étape 12 : Accueil
- Implémentation du contenu réel
- Navigation vers les produits
- Promotions et services en vedette

### Étape 13-14 : Catalogue
- Liste des produits
- Détails des produits
- Navigation vers le panier

### Étape 15 : Panier et Checkout
- Gestion du panier
- Processus de commande
- Intégration de l'auth gate

### Étape 16 : Services et Commandes
- Liste des services
- Réservation de services
- Historique des commandes

### Étape 17 : Authentification
- Remplacement des placeholders
- Vraie gestion des utilisateurs
- Intégration Supabase

## 📋 Validation (Definition of Done)

### ✅ Navigation Fonctionnelle
- [ ] App démarre sans erreur
- [ ] Navigation entre tous les onglets
- [ ] Ouverture des stacks depuis les tabs
- [ ] Headers cohérents et accessibles

### ✅ Auth Gates
- [ ] Placeholders présents aux entrées Checkout
- [ ] Placeholders présents aux entrées Réservation
- [ ] Redirection vers Login prévue
- [ ] Sauvegarde des routes de retour

### ✅ Responsivité
- [ ] Tabs visibles sur mobile et tablettes
- [ ] Adaptation des marges et espacements
- [ ] Support portrait et paysage
- [ ] Hook useResponsive fonctionnel

### ✅ Documentation
- [ ] Architecture de navigation documentée
- [ ] Constantes de routes définies
- [ ] Règles d'auth gate expliquées
- [ ] Notes tablettes/orientation incluses

## 🔧 Dépannage

### Erreurs Courantes

1. **"Store does not have a valid reducer"**
   - Solution : Ajouter `preloadedState: {}` dans store.js

2. **Composants inline dans navigation**
   - Solution : Créer des composants séparés

3. **Icônes manquantes**
   - Solution : Installer `@expo/vector-icons`

4. **Routes non trouvées**
   - Solution : Vérifier les imports dans AppNavigator

### Bonnes Pratiques

- Utiliser les constantes de routes (`STACK_ROUTES.PRODUCT_DETAILS`)
- Implémenter les auth gates progressivement
- Tester la navigation sur différents appareils
- Maintenir la cohérence des headers

---

**Note** : Cette architecture prépare l'intégration future avec Supabase et l'implémentation des fonctionnalités réelles dans les étapes suivantes.






