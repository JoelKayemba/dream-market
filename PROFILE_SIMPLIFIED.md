# 🎯 Profil Simplifié - Dream Market App

## 📱 Vue d'ensemble

Le profil utilisateur a été simplifié pour être **minimal et destiné uniquement aux clients**. L'administration est gérée séparément via une page de connexion dédiée.

## 🏗️ Architecture simplifiée

### **ProfileStackNavigator** - Navigation du profil client
- **Fichier** : `src/navigation/ProfileStackNavigator.jsx`
- **Rôle** : Gère la navigation entre les pages du profil client
- **Structure** : Navigation en pile (Stack) pour une expérience fluide

### **Pages du profil client**

#### 1. **ProfileScreen** (`src/screens/ProfileScreen.jsx`)
**Page d'accueil du profil - MINIMAL**

**Fonctionnalités :**
- ✅ **Header simple** : Nom, email, téléphone, adresse, date d'inscription
- ✅ **Avatar placeholder** : Icône person au lieu d'une photo
- ✅ **Actions rapides** : 4 actions principales (Commandes, Favoris, Support, Informations)
- ✅ **Bouton déconnexion** : Déconnexion simple
- ✅ **Accès admin discret** : Bouton discret en bas
- ✅ **Synchronisation** : Mise à jour automatique des informations

**Actions rapides :**
- `Orders` → Page des commandes
- `Favorites` → Produits favoris
- `Support` → Aide et contact
- `PersonalInfo` → Informations personnelles

#### 2. **OrdersScreen** (`src/screens/OrdersScreen.jsx`)
**Gestion des commandes client**

**Fonctionnalités :**
- ✅ **Filtres** : Toutes, En cours, Expédiées, Livrées, Annulées
- ✅ **Vue détaillée** : Articles, prix, statuts
- ✅ **Actions** : Suivre, évaluer, voir détails

#### 3. **FavoritesScreen** (`src/screens/FavoritesScreen.jsx`)
**Gestion des favoris**

**Fonctionnalités :**
- ✅ **Liste des favoris** : Produits sauvegardés
- ✅ **Actions** : Retirer des favoris, voir produit
- ✅ **État vide** : Message et bouton de découverte

#### 4. **SupportScreen** (`src/screens/SupportScreen.jsx`)
**Support client**

**Fonctionnalités :**
- ✅ **Méthodes de contact** : Email, téléphone, chat
- ✅ **Formulaire** : Catégorie, sujet, message
- ✅ **FAQ rapide** : Questions fréquentes

#### 5. **PersonalInfoScreen** (`src/screens/PersonalInfoScreen.jsx`)
**Informations personnelles simplifiées avec synchronisation**

**Fonctionnalités :**
- ✅ **Mode édition** : Basculement lecture/édition avec bouton toggle
- ✅ **Champs essentiels** : Prénom, nom, email, téléphone, adresse uniquement
- ✅ **Gestion des modifications** : Sauvegarde, annulation, validation
- ✅ **Synchronisation** : Mise à jour automatique du profil principal
- ✅ **Suppression de compte** : Double confirmation avec zone de danger
- ✅ **Navigation intelligente** : Retour au profil après suppression

**Champs disponibles :**
- **Prénom** : Modifiable avec validation
- **Nom** : Modifiable avec validation  
- **Email** : Modifiable avec clavier email
- **Téléphone** : Modifiable avec clavier numérique
- **Adresse** : Modifiable en mode multiligne

**Sections :**
- **Informations personnelles** : Champs essentiels uniquement
- **Zone de danger** : Suppression de compte avec avertissements

**Synchronisation :**
- **Hook personnalisé** : `useUserInfo` pour partager l'état
- **Mise à jour automatique** : Le profil principal se met à jour en temps réel
- **État global** : Données partagées entre tous les écrans

## 🔐 Administration séparée

### **LoginScreen** (`src/screens/LoginScreen.jsx`)
**Page de connexion admin**

**Fonctionnalités :**
- ✅ **Interface admin** : Design distinct de l'app client
- ✅ **Authentification** : Email/mot de passe
- ✅ **Identifiants de test** : admin@dreammarket.com / admin123
- ✅ **Navigation** : Retour à l'app client

**Accès :**
- Via le bouton discret "Accès Administration" dans le profil
- Navigation directe : `navigation.navigate('Login')`

## 🔄 Navigation

### **Flux de navigation client**
```
ProfileScreen (Accueil)
├── Orders → OrdersScreen
├── Favorites → FavoritesScreen
├── Support → SupportScreen
└── PersonalInfo → PersonalInfoScreen
```

### **Accès admin**
```
ProfileScreen → LoginScreen (Administration)
```

## 🎨 Design System

### **Principe de séparation**
- **Interface client** : Minimal, fonctionnel, accessible
- **Interface admin** : Professionnelle, distincte, sécurisée

### **Composants utilisés**
- `Container` : Mise en page cohérente
- `Button` : Actions principales et secondaires
- `Divider` : Séparation visuelle
- Composants natifs : `TextInput`, `TouchableOpacity`

## 🚀 Fonctionnalités futures

### **Phase 2 - Administration**
- [ ] **AdminDashboard** : Tableau de bord administrateur
- [ ] **ProductManagement** : Gestion des produits
- [ ] **FarmManagement** : Gestion des fermes
- [ ] **OrderManagement** : Gestion des commandes
- [ ] **UserManagement** : Gestion des utilisateurs

### **Phase 3 - Client**
- [ ] **Notifications** : Alertes et notifications
- [ ] **Preferences** : Préférences utilisateur
- [ ] **History** : Historique des achats

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
│   ├── ProfileScreen.jsx          → Profil minimal avec synchronisation
│   ├── OrdersScreen.jsx           → Commandes
│   ├── FavoritesScreen.jsx        → Favoris
│   ├── SupportScreen.jsx          → Support
│   ├── PersonalInfoScreen.jsx     → Infos perso simplifiées
│   └── LoginScreen.jsx            → Connexion admin
├── hooks/
│   └── useUserInfo.js             → Hook de synchronisation des données
└── components/ui/
    ├── Container.jsx
    ├── Button.jsx
    ├── Divider.jsx
    └── ...
```

## 📱 Responsive Design

- **Mobile-first** : Optimisé pour les smartphones
- **Interface client** : Simple et intuitive
- **Interface admin** : Professionnelle et fonctionnelle

## 🧪 Tests

### **Scénarios de test client**
1. **Navigation** : Vérification des transitions entre pages
2. **Actions rapides** : Test des 4 actions principales
3. **Favoris** : Ajout/retrait de produits
4. **Support** : Envoi de messages
5. **Informations personnelles** : Édition et synchronisation
6. **Déconnexion** : Gestion de la session

### **Scénarios de test admin**
1. **Connexion** : Authentification avec identifiants
2. **Navigation** : Accès depuis le profil client
3. **Retour** : Retour à l'application client

## 🚀 Déploiement

### **Étapes de mise en production**
1. ✅ Profil client simplifié
2. ✅ Navigation entre pages client
3. ✅ Page de connexion admin
4. ✅ Support et favoris
5. ✅ Informations personnelles simplifiées
6. ✅ Synchronisation automatique des données
7. ✅ Suppression de compte sécurisée
8. 🔄 Tests et validation
9. 📱 Optimisation mobile
10. 🚀 Déploiement en production

---

**Version** : 2.2.0  
**Dernière mise à jour** : Janvier 2024  
**Statut** : Profil client simplifié + Admin séparé + Infos perso simplifiées + Synchronisation  
**Responsable** : Équipe Dream Market
