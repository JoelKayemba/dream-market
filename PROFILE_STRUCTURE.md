# 🎯 Structure du Profil - Dream Market App

## 📱 Vue d'ensemble

Le système de profil de l'application Dream Market est conçu pour offrir une expérience utilisateur complète et intuitive, permettant aux agriculteurs et clients de gérer leurs informations personnelles, commandes et préférences.

## 🏗️ Architecture

### **ProfileStackNavigator**
- **Fichier** : `src/navigation/ProfileStackNavigator.jsx`
- **Rôle** : Gère la navigation entre les différentes pages du profil
- **Structure** : Navigation en pile (Stack) pour une expérience fluide

### **Pages principales**

#### 1. **ProfileScreen** (`src/screens/ProfileScreen.jsx`)
**Page d'accueil du profil**

**Fonctionnalités :**
- ✅ **Header du profil** : Avatar, nom, rôle, ferme, localisation
- ✅ **Badges de statut** : Premium, Vérifié
- ✅ **Statistiques** : Commandes, avis, favoris, points
- ✅ **Actions rapides** : Accès direct aux fonctionnalités principales
- ✅ **Commandes récentes** : Vue d'ensemble des dernières commandes
- ✅ **Paramètres** : Navigation vers les options de configuration
- ✅ **Déconnexion** : Bouton de déconnexion sécurisé

**Navigation :**
- `Orders` → Page des commandes
- `PersonalInfo` → Informations personnelles
- `Favorites` → Produits favoris (à implémenter)
- `FollowedFarms` → Fermes suivies (à implémenter)
- `Loyalty` → Programme fidélité (à implémenter)

#### 2. **OrdersScreen** (`src/screens/OrdersScreen.jsx`)
**Gestion complète des commandes**

**Fonctionnalités :**
- ✅ **Filtres intelligents** : Toutes, En cours, Expédiées, Livrées, Annulées
- ✅ **Vue détaillée** : Numéro, date, statut, ferme
- ✅ **Articles** : Images, noms, quantités, prix
- ✅ **Informations de livraison** : Adresse, dates estimées/réelles
- ✅ **Actions contextuelles** : Suivre, évaluer, voir détails
- ✅ **Statuts visuels** : Couleurs et icônes selon l'état

#### 3. **PersonalInfoScreen** (`src/screens/PersonalInfoScreen.jsx`)
**Modification des informations personnelles**

**Fonctionnalités :**
- ✅ **Mode édition** : Basculement entre affichage et modification
- ✅ **Avatar** : Changement de photo de profil
- ✅ **Informations de base** : Prénom, nom, email, téléphone, rôle
- ✅ **Informations professionnelles** : Ferme, localisation, adresse, site web, bio
- ✅ **Réseaux sociaux** : Facebook, Instagram, Twitter
- ✅ **Actions avancées** : Changement mot de passe, suppression compte

## 🔄 Navigation

### **Flux de navigation**
```
ProfileScreen (Accueil)
├── Orders → OrdersScreen
├── PersonalInfo → PersonalInfoScreen
├── Favorites → (À implémenter)
├── FollowedFarms → (À implémenter)
└── Loyalty → (À implémenter)
```

### **Gestion des états**
- **Mode lecture** : Affichage des informations
- **Mode édition** : Modification des champs avec validation
- **Navigation** : Retour automatique avec sauvegarde des modifications

## 🎨 Design System

### **Palette de couleurs**
- **Primaire** : `#283106` (Vert foncé)
- **Secondaire** : `#777E5C` (Vert gris)
- **Accent** : `#4CAF50` (Vert succès)
- **Erreur** : `#FF6B6B` (Rouge)
- **Arrière-plan** : `#f5f5f5` (Gris clair)

### **Composants utilisés**
- `Container` : Mise en page cohérente
- `Button` : Actions principales et secondaires
- `Badge` : Statuts et indicateurs
- `SectionHeader` : Organisation des sections
- `Divider` : Séparation visuelle

## 🚀 Fonctionnalités futures

### **Phase 2** (À implémenter)
- [ ] **FavoritesScreen** : Gestion des produits favoris
- [ ] **FollowedFarmsScreen** : Fermes suivies
- [ ] **LoyaltyScreen** : Programme de fidélité
- [ ] **SecurityScreen** : Sécurité et authentification
- [ ] **NotificationsScreen** : Préférences de communication
- [ ] **PaymentScreen** : Méthodes de paiement
- [ ] **SupportScreen** : Aide et support

### **Phase 3** (Avancées)
- [ ] **AnalyticsScreen** : Statistiques détaillées
- [ ] **PreferencesScreen** : Préférences avancées
- [ ] **ExportScreen** : Export des données
- [ ] **BackupScreen** : Sauvegarde et restauration

## 🔧 Configuration

### **Dépendances requises**
```json
{
  "@react-navigation/stack": "^6.x.x",
  "@react-navigation/bottom-tabs": "^6.x.x",
  "@expo/vector-icons": "^13.x.x"
}
```

### **Structure des dossiers**
```
src/
├── navigation/
│   ├── ProfileStackNavigator.jsx
│   ├── AppNavigator.jsx
│   └── index.js
├── screens/
│   ├── ProfileScreen.jsx
│   ├── OrdersScreen.jsx
│   └── PersonalInfoScreen.jsx
└── components/ui/
    ├── Container.jsx
    ├── Button.jsx
    ├── Badge.jsx
    └── ...
```

## 📱 Responsive Design

- **Mobile-first** : Optimisé pour les smartphones
- **Tablettes** : Adaptation automatique des grilles
- **Orientation** : Support portrait et paysage
- **Accessibilité** : Tailles de police et contrastes adaptés

## 🧪 Tests

### **Scénarios de test**
1. **Navigation** : Vérification des transitions entre pages
2. **Édition** : Test du mode édition/sauvegarde
3. **Validation** : Contrôle des champs obligatoires
4. **Performance** : Temps de chargement des images
5. **Erreurs** : Gestion des cas d'erreur

## 🚀 Déploiement

### **Étapes de mise en production**
1. ✅ Création des composants de base
2. ✅ Navigation et routing
3. ✅ Gestion des états
4. ✅ Validation des données
5. 🔄 Tests et débogage
6. 📱 Optimisation mobile
7. 🚀 Déploiement en production

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2024  
**Statut** : En développement  
**Responsable** : Équipe Dream Market
