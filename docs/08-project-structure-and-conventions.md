# Structure du Projet & Conventions - Dream Market

## Vue d'ensemble

Ce document décrit l'organisation complète du projet Dream Market, ses conventions de code et son architecture modulaire. L'objectif est d'avoir une base solide et évolutive pour le développement de l'application.

## 📁 Structure du Repository

```
dream-market-app/
├── App.jsx                    # Point d'entrée principal Expo
├── .eslintrc.json            # Configuration ESLint
├── .prettierrc               # Configuration Prettier
├── babel.config.js           # Configuration Babel avec alias
├── package.json              # Dépendances et scripts
├── config/
│   └── security.md           # Règles de sécurité
├── docs/                     # Documentation du projet
│   ├── 01-vision-perimetre-mvp.md
│   ├── 02-principes-ux-navigation.md
│   ├── 03-regles-securite-conformite.md
│   ├── 04-strategie-performance-offline.md
│   ├── 05-roadmap-etapes.md
│   ├── 06-criteres-succes-risques.md
│   ├── 07-regles-travail.md
│   ├── 01-product-brief.md
│   ├── 02-ux-principles-and-navigation.md
│   ├── 03-user-stories-and-flows.md
│   ├── 04-non-functional-requirements.md
│   ├── 05-success-metrics-and-rollout.md
│   ├── 06-risks-and-mitigations.md
│   ├── 07-accessibility-and-tablets.md
│   └── 08-project-structure-and-conventions.md
└── src/                      # Code source de l'application
    ├── app/                  # Navigation et structure de l'app
    │   ├── AppNavigator.jsx  # Navigateur principal
    │   └── BottomTabs.jsx    # Navigation par onglets
    ├── screens/              # Écrans de l'application
    │   ├── Home/             # Page d'accueil
    │   │   └── HomeScreen.jsx
    │   ├── Products/         # Gestion des produits
    │   │   ├── ProductsScreen.jsx
    │   │   └── ProductDetailsScreen.jsx
    │   ├── Cart/             # Gestion du panier
    │   │   ├── CartScreen.jsx
    │   │   ├── CheckoutScreen.jsx
    │   │   └── OrderSuccessScreen.jsx
    │   ├── Orders/           # Gestion des commandes
    │   │   ├── OrdersScreen.jsx
    │   │   └── OrderDetailsScreen.jsx
    │   ├── Services/         # Gestion des services
    │   │   ├── ServicesScreen.jsx
    │   │   └── ServiceBookingScreen.jsx
    │   └── Account/          # Gestion du compte
    │       ├── AccountScreen.jsx
    │       ├── LoginScreen.jsx
    │       └── RegisterScreen.jsx
    ├── components/            # Composants réutilisables
    │   └── ui/               # Composants UI de base
    │       ├── Button.jsx
    │       ├── Badge.jsx
    │       ├── Card.jsx
    │       ├── SectionHeader.jsx
    │       ├── EmptyState.jsx
    │       ├── Loader.jsx
    │       └── index.js
    ├── store/                 # Gestion d'état Redux
    │   ├── store.js          # Configuration du store
    │   ├── secureStorage.js  # Stockage sécurisé
    │   ├── securePersistMiddleware.js # Persistance sécurisée
    │   └── slices/           # Slices Redux modulaires
    │       ├── productsSlice.js
    │       ├── cartSlice.js
    │       ├── userSlice.js
    │       ├── servicesSlice.js
    │       ├── ordersSlice.js
    │       └── promotionsSlice.js
    ├── theme/                 # Design system et thème
    │   ├── colors.js         # Palette de couleurs
    │   ├── spacing.js        # Système d'espacement
    │   ├── typography.js     # Système de typographie
    │   ├── breakpoints.js    # Breakpoints responsifs
    │   └── index.js
    ├── hooks/                 # Hooks React personnalisés
    │   ├── useResponsive.js  # Hook de responsivité
    │   └── index.js
    ├── utils/                 # Utilitaires et helpers
    │   ├── featureFlags.js   # Gestion des feature flags
    │   ├── validators.js     # Validation des données
    │   ├── dates.js          # Utilitaires de dates
    │   └── currency.js       # Utilitaires de devises
    └── api/                   # Couche API (futur Supabase)
        ├── productsApi.js
        ├── servicesApi.js
        ├── promotionsApi.js
        ├── ordersApi.js
        └── authApi.js
```

## 🎯 Organisation par Domaines Fonctionnels

### 1. **App** (`/src/app/`)
- **Responsabilité** : Navigation et structure globale de l'application
- **Contenu** : Navigateurs, configuration des routes
- **Évolution** : Préparation pour la navigation avancée et les deep links

### 2. **Screens** (`/src/screens/`)
- **Responsabilité** : Écrans principaux de l'application
- **Organisation** : Un dossier par domaine métier
- **Évolution** : Chaque écran sera développé dans les étapes suivantes

### 3. **Components** (`/src/components/`)
- **Responsabilité** : Composants réutilisables
- **UI** : Composants de base du design system
- **Évolution** : Composants métier spécifiques à ajouter

### 4. **Store** (`/src/store/`)
- **Responsabilité** : Gestion d'état global avec Redux Toolkit
- **Slices** : Organisation modulaire par domaine métier
- **Évolution** : Préparation pour l'intégration Supabase

### 5. **Theme** (`/src/theme/`)
- **Responsabilité** : Design system et variables de style
- **Contenu** : Couleurs, espacements, typographie, breakpoints
- **Évolution** : Support des thèmes sombres et personnalisation

### 6. **Hooks** (`/src/hooks/`)
- **Responsabilité** : Logique réutilisable et gestion d'état local
- **Contenu** : Hooks personnalisés pour la responsivité, l'API, etc.
- **Évolution** : Hooks métier spécifiques

### 7. **Utils** (`/src/utils/`)
- **Responsabilité** : Fonctions utilitaires et helpers
- **Contenu** : Validation, feature flags, formatage
- **Évolution** : Utilitaires métier et intégration

### 8. **API** (`/src/api/`)
- **Responsabilité** : Couche de communication avec le backend
- **Contenu** : Services API pour chaque domaine métier
- **Évolution** : Intégration Supabase et gestion des erreurs

## 📝 Conventions de Code

### Extensions de fichiers
- **Composants React** : `.jsx`
- **Logique métier** : `.js`
- **Configuration** : `.json`, `.js`

### Nommage des fichiers
- **Composants** : PascalCase (ex: `HomeScreen.jsx`)
- **Slices Redux** : camelCase + "Slice" (ex: `cartSlice.js`)
- **Hooks** : camelCase + "use" (ex: `useResponsive.js`)
- **Utilitaires** : camelCase (ex: `featureFlags.js`)

### Structure des composants
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

/**
 * Description du composant
 * @param {string} prop1 - Description de la prop
 * @param {function} onPress - Fonction de callback
 */
const ComponentName = ({ prop1, onPress, ...props }) => {
  // Logique du composant
  
  return (
    <View style={styles.container}>
      <Text>{prop1}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Styles du composant
  },
});

export default ComponentName;
```

### Structure des slices Redux
```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // État initial
};

const sliceName = createSlice({
  name: 'sliceName',
  initialState,
  reducers: {
    // Actions du slice
  },
});

export const { actions } = sliceName;
export default sliceName.reducer;
```

## 🔧 Configuration et Outils

### ESLint
- **Base** : `eslint:recommended`
- **React** : `plugin:react/recommended`
- **Hooks** : `plugin:react-hooks/recommended`
- **Règles** : Personnalisées pour React Native

### Prettier
- **Indentation** : 2 espaces
- **Point-virgule** : Obligatoire
- **Guillemets** : Doubles
- **Virgules finales** : Toujours

### Babel
- **Alias** : `@/` pour `/src`
- **Alias spécifiques** : `@components`, `@screens`, etc.
- **Présets** : `babel-preset-expo`

### Scripts NPM
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## 🚀 Évolution et Intégration

### Phase 1 : Structure de base (Étapes 1-4)
- ✅ Design system et composants UI
- ✅ Accessibilité et responsivité
- ✅ Structure du projet et conventions
- ✅ Navigation de base

### Phase 2 : Fonctionnalités métier (Étapes 5-11)
- Écrans et composants métier
- Gestion d'état Redux
- Validation et utilitaires
- Tests et documentation

### Phase 3 : Intégration Supabase (Étapes 12+)
- API et services backend
- Authentification et sécurité
- Base de données et RLS
- Déploiement et production

## 🔒 Sécurité et Conformité

### Variables d'environnement
- **Préfixe** : `EXPO_PUBLIC_` uniquement
- **Interdit** : Secrets, clés API, mots de passe
- **Gestion** : Via variables système ou fichiers `.env`

### Stockage local
- **Obligatoire** : `expo-secure-store`
- **Interdit** : `AsyncStorage` pour données sensibles
- **Interdit** : `redux-persist` pour données sensibles

### Validation des données
- **Entrées utilisateur** : Toujours valider et sanitiser
- **API** : Validation des réponses et gestion d'erreurs
- **Logs** : Aucune donnée sensible en production

## 📚 Bonnes Pratiques

### 1. **Modularité**
- Un fichier = Une responsabilité
- Imports/exports clairs et organisés
- Séparation des préoccupations

### 2. **Réutilisabilité**
- Composants génériques et configurables
- Hooks personnalisés pour la logique commune
- Utilitaires sans dépendances métier

### 3. **Maintenabilité**
- Code documenté et commenté
- Noms explicites et cohérents
- Structure prévisible et logique

### 4. **Performance**
- Lazy loading des composants
- Optimisation des re-renders
- Gestion efficace de l'état

### 5. **Accessibilité**
- Support des lecteurs d'écran
- Navigation au clavier
- Contrastes et tailles appropriés

## 🧪 Tests et Qualité

### Tests unitaires
- **Composants** : Rendu et interactions
- **Utilitaires** : Logique métier
- **Redux** : Actions et reducers

### Tests d'intégration
- **Navigation** : Flux utilisateur
- **API** : Communication backend
- **État** : Gestion Redux

### Qualité du code
- **Linting** : Règles ESLint respectées
- **Formatage** : Prettier appliqué
- **Documentation** : JSDoc et README

## 🔮 Évolutions Futures

### Architecture
- **Micro-frontends** : Séparation des domaines
- **Plugin system** : Extensibilité modulaire
- **API Gateway** : Gestion centralisée des services

### Performance
- **Code splitting** : Chargement à la demande
- **Service Workers** : Cache et offline
- **Bundle optimization** : Réduction de la taille

### Développement
- **Monorepo** : Gestion multi-packages
- **CI/CD** : Intégration et déploiement automatiques
- **Monitoring** : Observabilité et alertes

---

**Note** : Cette structure doit être respectée à chaque étape du développement. Toute modification doit être documentée et justifiée. L'objectif est d'avoir une base solide et évolutive pour le développement de Dream Market.








