# 🏗️ Architecture des dossiers - Dream Market App

## 📁 Structure principale

```
src/
├── 📱 app/                    # Navigation et configuration de l'app
│   ├── AppNavigator.jsx      # Navigation principale
│   ├── BottomTabs.jsx        # Onglets de navigation
│   ├── routes.js             # Configuration des routes
│   └── index.js              # Export principal de l'app
│
├── 🎨 components/            # Composants réutilisables
│   ├── ui/                   # Composants UI de base
│   │   ├── Button.jsx        # Boutons personnalisés
│   │   ├── Card.jsx          # Cartes réutilisables
│   │   ├── Input.jsx         # Champs de saisie
│   │   ├── Modal.jsx         # Modales
│   │   ├── Badge.jsx         # Badges et étiquettes
│   │   ├── Rating.jsx        # Système de notation
│   │   ├── Loader.jsx        # Indicateurs de chargement
│   │   └── index.js          # Export des composants UI
│   │
│   ├── home/                 # Composants spécifiques à l'accueil
│   │   ├── HeroBanner.jsx    # Bannière principale
│   │   ├── CategoriesGrid.jsx # Grille des catégories
│   │   ├── SponsoredSlider.jsx # Carrousel des produits sponsorisés
│   │   ├── ServicesSection.jsx # Section des services
│   │   └── index.js          # Export des composants home
│   │
│   ├── products/             # Composants liés aux produits
│   │   ├── ProductCard.jsx   # Carte de produit
│   │   ├── ProductGrid.jsx   # Grille de produits
│   │   ├── ProductFilter.jsx # Filtres de produits
│   │   ├── SearchBar.jsx     # Barre de recherche
│   │   └── index.js          # Export des composants produits
│   │
│   ├── farms/                # Composants liés aux fermes
│   │   ├── FarmCard.jsx      # Carte de ferme
│   │   ├── FarmGallery.jsx   # Galerie d'images de ferme
│   │   └── index.js          # Export des composants fermes
│   │
│   ├── services/             # Composants liés aux services
│   │   ├── ServiceCard.jsx   # Carte de service
│   │   └── index.js          # Export des composants services
│   │
│   └── index.js              # Export principal des composants
│
├── 🖼️ screens/               # Écrans de l'application
│   ├── Home/                 # Écran d'accueil
│   │   ├── HomeScreen.jsx    # Écran principal
│   │   └── index.js          # Export
│   │
│   ├── Products/             # Écrans des produits
│   │   ├── ProductsScreen.jsx # Liste des produits
│   │   ├── ProductDetailsScreen.jsx # Détails d'un produit
│   │   ├── ProductSearchScreen.jsx # Recherche de produits
│   │   └── index.js          # Export
│   │
│   ├── Farms/                # Écrans des fermes
│   │   ├── FarmsScreen.jsx   # Liste des fermes
│   │   ├── FarmDetailsScreen.jsx # Détails d'une ferme
│   │   └── index.js          # Export
│   │
│   ├── Services/             # Écrans des services
│   │   ├── ServicesScreen.jsx # Liste des services
│   │   ├── ServiceDetailsScreen.jsx # Détails d'un service
│   │   └── index.js          # Export
│   │
│   ├── Admin/                # Écrans d'administration
│   │   ├── AdminScreen.jsx   # Tableau de bord admin
│   │   ├── SponsoredManager.jsx # Gestion des produits sponsorisés
│   │   ├── AnalyticsScreen.jsx # Statistiques et analytics
│   │   └── index.js          # Export
│   │
│   ├── Auth/                 # Écrans d'authentification
│   │   ├── LoginScreen.jsx   # Connexion
│   │   ├── RegisterScreen.jsx # Inscription
│   │   └── index.js          # Export
│   │
│   └── index.js              # Export principal des écrans
│
├── 🗃️ store/                 # Gestion d'état Redux Toolkit
│   ├── slices/               # Slices Redux
│   │   ├── authSlice.js      # État d'authentification
│   │   ├── productsSlice.js  # État des produits
│   │   ├── farmsSlice.js     # État des fermes
│   │   ├── servicesSlice.js  # État des services
│   │   ├── sponsoredSlice.js # État des produits sponsorisés
│   │   ├── cartSlice.js      # État du panier
│   │   ├── uiSlice.js        # État de l'interface
│   │   └── index.js          # Export des slices
│   │
│   ├── middleware/            # Middleware personnalisés
│   │   ├── logger.js         # Logging des actions
│   │   └── index.js          # Export
│   │
│   ├── store.js              # Configuration du store Redux
│   └── index.js              # Export du store
│
├── 🎨 theme/                 # Thème et design system
│   ├── colors.js             # Palette de couleurs
│   ├── typography.js         # Typographie
│   ├── spacing.js            # Espacements
│   ├── shadows.js            # Ombres et élévations
│   ├── breakpoints.js        # Points de rupture responsive
│   └── index.js              # Export du thème
│
├── 🛠️ utils/                 # Utilitaires et helpers
│   ├── constants.js          # Constantes de l'application
│   ├── helpers.js            # Fonctions utilitaires
│   ├── validators.js         # Validation des données
│   ├── formatters.js         # Formatage des données
│   └── index.js              # Export des utilitaires
│
├── 🔐 hooks/                 # Hooks personnalisés
│   ├── useAuth.js            # Hook d'authentification
│   ├── useProducts.js        # Hook des produits
│   ├── useFarms.js           # Hook des fermes
│   ├── useServices.js        # Hook des services
│   ├── useCart.js            # Hook du panier
│   ├── useLocalStorage.js    # Hook de stockage local
│   └── index.js              # Export des hooks
│
├── 📊 data/                  # Données mockées (déjà créées)
│   ├── categories.js         # Catégories de produits
│   ├── farms.js              # Données des fermes
│   ├── products.js           # Données des produits
│   ├── services.js           # Données des services
│   ├── sponsored.js          # Données des produits sponsorisés
│   └── index.js              # Export des données
│
├── 🔌 services/              # Services et API
│   ├── api/                  # Configuration API
│   │   ├── httpClient.js     # Client HTTP
│   │   ├── authApi.js        # API d'authentification
│   │   ├── productsApi.js    # API des produits
│   │   ├── farmsApi.js       # API des fermes
│   │   ├── servicesApi.js    # API des services
│   │   └── index.js          # Export des APIs
│   │
│   ├── storage/              # Gestion du stockage
│   │   ├── secureStorage.js  # Stockage sécurisé (expo-secure-store)
│   │   ├── localStorage.js   # Stockage local
│   │   └── index.js          # Export
│   │
│   └── index.js              # Export principal des services
│
└── 📱 assets/                # Ressources statiques
    ├── images/                # Images
    ├── icons/                 # Icônes personnalisées
    └── fonts/                 # Polices personnalisées
```

## 🎨 **Palette de couleurs utilisée**

```javascript
// Palette de couleurs principale
export const colors = {
  primary: '#283106',      // Vert foncé - Couleur principale
  secondary: '#777E5C',    // Vert-gris - Couleur secondaire
  accent: '#C7C2AB',       // Beige - Couleur d'accent
  light: '#D1D8BD',        // Vert clair - Couleur de fond
  white: '#DFEODC',        // Blanc cassé - Couleur de base
  // Couleurs supplémentaires
  success: '#4CAF50',      // Vert succès
  warning: '#FF9800',      // Orange avertissement
  error: '#F44336',        // Rouge erreur
  info: '#2196F3',         // Bleu information
  text: {
    primary: '#283106',    // Texte principal
    secondary: '#777E5C',  // Texte secondaire
    light: '#DFEODC',      // Texte clair
  },
  background: {
    primary: '#DFEODC',    // Fond principal
    secondary: '#D1D8BD',  // Fond secondaire
    card: '#FFFFFF',       // Fond des cartes
  }
};
```

## 📱 **Technologies utilisées**

- **React Native** avec Expo
- **Redux Toolkit** pour la gestion d'état
- **expo-secure-store** pour le stockage sécurisé
- **React Navigation v6** pour la navigation
- **@expo/vector-icons** pour les icônes
- **StyleSheet** pour le styling
- **AsyncStorage** pour le stockage local (fallback)

## 🔧 **Configuration des dépendances**

```json
{
  "dependencies": {
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "expo-secure-store": "^12.8.1",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/stack": "^6.3.20",
    "@expo/vector-icons": "^13.0.0",
    "react-native-safe-area-context": "^4.7.4",
    "react-native-screens": "^3.27.0"
  }
}
```
