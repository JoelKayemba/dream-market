# 🚀 Plan MVP - Dream Market

## 📋 Vue d'ensemble du projet

**Dream Market** est une application mobile de marketplace agricole qui permet à une entreprise de servir de pont entre les fermes et les consommateurs. L'entreprise peut vendre ses propres produits tout en mettant en avant les produits des fermes partenaires.

### 🎯 Objectifs principaux
- **Marketplace agricole** : Présentation des produits des fermes partenaires
- **Services de l'entreprise** : Mise en avant des services proposés
- **Gestion des produits sponsorisés** : Interface admin pour gérer la visibilité
- **Détails des fermes** : Informations complètes sur chaque partenaire
- **Paiements externes** : Les transactions se font en dehors de l'application

---

## 🏗️ Architecture technique

### 📱 Frontend
- **React Native** avec Expo
- **Navigation** : React Navigation v6
- **État global** : Redux Toolkit (pour la gestion des données)
- **Stockage local** : AsyncStorage pour les préférences utilisateur
- **UI Components** : Composants personnalisés avec StyleSheet

### 🗄️ Backend (Phase 2 - Supabase)
- **Base de données** : PostgreSQL via Supabase
- **Authentification** : Supabase Auth
- **API REST** : Supabase Edge Functions
- **Stockage fichiers** : Supabase Storage
- **Temps réel** : Supabase Realtime

### 🔧 Phase 1 : Développement sans backend
- **Données mockées** : Fichiers JSON locaux
- **Navigation simulée** : Routes et paramètres
- **État local** : Redux avec données statiques

---

## 📱 Structure des écrans

### 1. **HomeScreen** (Écran d'accueil)
- **Header** : Logo et titre de l'application
- **Produits sponsorisés** : Carrousel horizontal des produits mis en avant
- **Catégories** : Grille des catégories de produits (Légumes, Fruits, Céréales, etc.)
- **Services de l'entreprise** : Présentation des services proposés
- **Bouton Admin** : Accès à l'interface d'administration

### 2. **ProductsScreen** (Catalogue des produits)
- **Barre de recherche** : Recherche par nom de produit ou ferme
- **Filtres par catégorie** : Navigation horizontale des catégories
- **Liste des produits** : Cartes avec image, nom, ferme, prix, disponibilité
- **Navigation** : Vers détails produit ou détails ferme

### 3. **ProductDetailsScreen** (Détails d'un produit)
- **Image et informations** : Photo, nom, description, prix
- **Informations de la ferme** : Nom, localisation, contact
- **Détails techniques** : Catégorie, unité de mesure, disponibilité
- **Actions** : Contact, voir la ferme, retour au catalogue

### 4. **FarmDetailsScreen** (Détails d'une ferme)
- **Informations générales** : Nom, description, localisation, contact
- **Produits de la ferme** : Liste des produits disponibles
- **Galerie photos** : Images de la ferme et des activités
- **Informations pratiques** : Horaires, méthodes de culture, certifications

### 5. **ServicesScreen** (Services de l'entreprise)
- **Liste des services** : Description détaillée de chaque service
- **Tarifs** : Informations sur les prix et conditions
- **Contact** : Formulaire de demande de devis
- **Témoignages** : Avis des clients

### 6. **AdminScreen** (Interface d'administration)
- **Gestion des produits sponsorisés** : Ajout/suppression/modification
- **Gestion des fermes** : Ajout de nouvelles fermes partenaires
- **Statistiques** : Vue d'ensemble des produits et fermes
- **Paramètres** : Configuration de l'application

---

## 🗂️ Structure des données

### 📊 Modèles de données

#### **Product**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "string",
  "category": "string",
  "image": "string",
  "farmId": "string",
  "isSponsored": "boolean",
  "isAvailable": "boolean",
  "unit": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

#### **Farm**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "location": "string",
  "contact": {
    "phone": "string",
    "email": "string",
    "address": "string"
  },
  "images": ["string"],
  "products": ["Product"],
  "certifications": ["string"],
  "createdAt": "date"
}
```

#### **Service**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "icon": "string",
  "price": "string",
  "isActive": "boolean"
}
```

#### **Category**
```json
{
  "id": "string",
  "name": "string",
  "icon": "string",
  "color": "string",
  "description": "string"
}
```

---

## 🎨 Design et UX

### 🎨 Thème et couleurs
- **Couleur principale** : Vert agricole (#2E7D32)
- **Couleurs secondaires** : Orange (#FF9800), Bleu (#2196F3)
- **Arrière-plans** : Gris clair (#f8f9fa)
- **Textes** : Noir (#333), Gris (#666)

### 📱 Composants UI
- **Cards** : Produits, fermes, services
- **Buttons** : Actions principales et secondaires
- **Inputs** : Recherche, formulaires
- **Navigation** : Tabs, navigation par pile
- **Loading states** : Indicateurs de chargement
- **Empty states** : États vides avec illustrations

### 📐 Responsive Design
- **Mobile-first** : Optimisé pour smartphones
- **Tablet support** : Adaptation pour tablettes
- **SafeArea** : Respect des zones sûres de l'écran
- **Accessibility** : Support des lecteurs d'écran

---

## 🔄 Flux utilisateur

### 👤 Parcours client
1. **Accueil** → Découverte des produits sponsorisés
2. **Navigation** → Par catégorie ou recherche
3. **Sélection** → Choix d'un produit
4. **Détails** → Informations complètes et contact ferme
5. **Contact** → Prise de contact directe avec la ferme

### 👨‍💼 Parcours admin
1. **Accès** → Bouton admin sur l'écran d'accueil
2. **Gestion** → Ajout/modification des produits sponsorisés
3. **Fermes** → Gestion des partenaires
4. **Statistiques** → Vue d'ensemble de l'activité

---

## 🚀 Plan de développement

### **Phase 1 : MVP sans backend (Semaines 1-2)**
- [ ] Structure de base de l'application
- [ ] Navigation entre écrans
- [ ] Données mockées (JSON)
- [ ] Interface utilisateur complète
- [ ] Tests de navigation et UX

### **Phase 2 : Intégration Supabase (Semaines 3-4)**
- [ ] Configuration Supabase
- [ ] Migration des données mockées
- [ ] Authentification admin
- [ ] API et base de données
- [ ] Tests d'intégration

### **Phase 3 : Finalisation (Semaine 5)**
- [ ] Tests complets
- [ ] Optimisations de performance
- [ ] Documentation
- [ ] Déploiement

---

## 🧪 Tests et qualité

### ✅ Tests à implémenter
- **Tests unitaires** : Composants React Native
- **Tests d'intégration** : Navigation et flux utilisateur
- **Tests de performance** : Temps de chargement
- **Tests d'accessibilité** : Support des lecteurs d'écran

### 🔍 Outils de qualité
- **ESLint** : Linting du code
- **Prettier** : Formatage automatique
- **TypeScript** : Typage statique (optionnel)
- **Jest** : Framework de tests

---

## 📱 Déploiement

### 🚀 Plateformes cibles
- **Android** : Google Play Store
- **iOS** : Apple App Store
- **Web** : Version PWA (optionnel)

### 🔧 Configuration de build
- **Expo EAS Build** : Builds automatisés
- **Environnements** : Dev, Staging, Production
- **CI/CD** : GitHub Actions ou GitLab CI

---

## 📚 Documentation

### 📖 À produire
- **README** : Installation et configuration
- **API Documentation** : Endpoints et modèles
- **User Guide** : Guide utilisateur
- **Admin Guide** : Guide d'administration
- **Deployment Guide** : Guide de déploiement

---

## 🎯 Critères de succès

### ✅ Objectifs MVP
- [ ] Application fonctionnelle sur iOS et Android
- [ ] Navigation fluide entre tous les écrans
- [ ] Affichage correct des produits et fermes
- [ ] Interface admin fonctionnelle
- [ ] Design cohérent et professionnel

### 🚀 Objectifs post-MVP
- [ ] Intégration Supabase complète
- [ ] Authentification et gestion des utilisateurs
- [ ] Notifications push
- [ ] Mode hors ligne
- [ ] Analytics et reporting

---

## 💡 Notes importantes

### ⚠️ Contraintes techniques
- **Paiements** : Gérés en dehors de l'application
- **Images** : Utilisation d'emojis pour le MVP, photos réelles pour la production
- **Données** : Mockées au début, migrées vers Supabase ensuite

### 🔄 Évolutions futures
- **Paiements intégrés** : Stripe ou autre solution
- **Notifications** : Alertes de nouveaux produits
- **Géolocalisation** : Fermes à proximité
- **Chat** : Communication directe client-ferme
- **Livraison** : Suivi des commandes

---

*Ce plan sera mis à jour au fur et à mesure du développement et des retours utilisateurs.*
