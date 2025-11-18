# Guide : Mise en Production iOS - Dream Market v1.0.1

## 📋 Prérequis

1. ✅ **Compte Apple Developer** (99$ USD/an)
   - Créer un compte sur [developer.apple.com](https://developer.apple.com)
   - Payer les frais d'abonnement annuel (99$ USD)
   - Activer l'adhésion au programme développeur

2. ✅ **EAS CLI installé et configuré**
   ```bash
   npm install -g eas-cli
   eas login
   ```

3. ✅ **Compte Expo connecté** (`eas login`)

4. ✅ **Certificats iOS configurés** (générés automatiquement par EAS)

5. ✅ **Mac avec Xcode** (optionnel, pour tester localement)

## 🔄 Étape 1 : Vérifier la configuration iOS

Vérifiez que `app.json` contient les bonnes informations iOS :

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.dreammarket.app",
      "buildNumber": "1",  // ⚠️ À incrémenter à chaque mise à jour
      "infoPlist": {
        "UIBackgroundModes": [
          "remote-notification"
        ]
      }
    },
    "version": "1.0.1"  // ⚠️ Version visible par l'utilisateur
  }
}
```

**Important** :
- `bundleIdentifier` : Identifiant unique de l'application (déjà configuré : `com.dreammarket.app`)
- `buildNumber` : Numéro de build interne (à incrémenter à chaque mise à jour)
- `version` : Version visible par l'utilisateur dans l'App Store

## 🔧 Étape 2 : Configurer EAS pour iOS

### 2.1 Mettre à jour `eas.json`

Assurez-vous que `eas.json` contient la configuration iOS :

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "kayembajoel92@icloud.com",
        "ascAppId": "votre-app-id",
        "appleTeamId": "votre-team-id"
      }
    }
  }
}
```

### 2.2 Configurer les identifiants Apple

Lors du premier build iOS, EAS vous demandera :
- **Apple ID** : L'email de votre compte Apple Developer (ex: `kayembajoel92@icloud.com`)
- **Apple Team ID** : Trouvable dans [developer.apple.com/account](https://developer.apple.com/account)
- **App Store Connect API Key** : Optionnel mais recommandé pour l'automatisation

## 🏗️ Étape 3 : Créer le build de production

### Option A : Build iOS pour production (recommandé)

```bash
# Build de production (IPA pour App Store)
eas build --platform ios --profile production
```

### Option B : Build pour test interne (TestFlight)

```bash
# Build de prévisualisation pour TestFlight
eas build --platform ios --profile preview
```

**Note** : Pour la production sur l'App Store, utilisez l'**Option A**.

### Option C : Build pour simulateur (développement)

```bash
# Build pour tester dans le simulateur iOS
eas build --platform ios --profile development
```

## ⏳ Étape 4 : Attendre la fin du build

Le build iOS prend généralement **20-40 minutes** (plus long qu'Android). Vous pouvez :
- Suivre la progression dans le terminal
- Vérifier sur [expo.dev](https://expo.dev) dans la section "Builds"

**Note** : Les builds iOS nécessitent un Mac dans le cloud d'Expo, ce qui explique le temps plus long.

## 📥 Étape 5 : Télécharger le build

Une fois le build terminé :

1. **Via le terminal** : Un lien de téléchargement sera affiché
2. **Via Expo Dashboard** :
   - Allez sur [expo.dev](https://expo.dev)
   - Ouvrez votre projet
   - Section "Builds"
   - Cliquez sur le build terminé
   - Téléchargez le fichier `.ipa` (iOS App)

## 📤 Étape 6 : Soumettre à l'App Store Connect

### Option A : Soumission automatique avec EAS (recommandé)

```bash
# Soumettre automatiquement à l'App Store Connect
eas submit --platform ios --profile production
```

EAS gérera automatiquement :
- L'upload du build vers App Store Connect
- La création de la version dans App Store Connect (si nécessaire)

### Option B : Soumission manuelle

Si vous préférez soumettre manuellement :

1. **Télécharger le build** depuis Expo Dashboard
2. **Utiliser Transporter** (application macOS) :
   - Ouvrez Transporter
   - Glissez-déposez le fichier `.ipa`
   - Cliquez sur "Deliver"
3. **Ou utiliser Xcode** :
   - Ouvrez Xcode
   - Window > Organizer
   - Archives > Distribute App
   - Suivez l'assistant

## 🎨 Étape 7 : Préparer les ressources App Store

### 7.1 Icône de l'application

- **Taille** : 1024x1024 px (obligatoire)
- **Format** : PNG ou JPEG
- **Fond** : Pas de transparence (fond opaque requis)
- **Fichier** : `./assets/Dream_logo.png` (vérifiez qu'il fait 1024x1024)

### 7.2 Captures d'écran

**Requis pour iPhone** :
- **6.7" (iPhone 14 Pro Max, etc.)** : 1290x2796 px (minimum 1, recommandé 3-10)
- **6.5" (iPhone 11 Pro Max, etc.)** : 1242x2688 px (optionnel)
- **5.5" (iPhone 8 Plus, etc.)** : 1242x2208 px (optionnel)

**Requis pour iPad** :
- **12.9" iPad Pro** : 2048x2732 px (minimum 1, recommandé 3-10)
- **11" iPad Pro** : 1668x2388 px (optionnel)

**Formats** : PNG ou JPEG

**Écrans à capturer** :
1. Écran d'accueil (HomeScreen)
2. Liste des produits (ProductsScreen)
3. Détail d'un produit (ProductDetailScreen)
4. Panier (CartScreen)
5. Commande (CheckoutScreen)
6. Profil utilisateur (ProfileScreen)
7. Liste des fermes (FarmsScreen)
8. Liste des services (ServicesScreen)

### 7.3 Vidéo promotionnelle (optionnel)

- **Durée** : 15-30 secondes
- **Format** : MP4, MOV, ou M4V
- **Taille** : Même que les captures d'écran
- **Contenu** : Démonstration des fonctionnalités principales

## 📝 Étape 8 : Configurer l'application dans App Store Connect

### 8.1 Accéder à App Store Connect

1. Allez sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Connectez-vous avec votre compte Apple Developer
3. Cliquez sur **"Mes apps"** (My Apps)

### 8.2 Créer une nouvelle application

#### Étape 1 : Cliquer sur "Ajouter une app" (Add App)

1. Dans App Store Connect, en haut à gauche, cliquez sur le bouton **"+"** (plus)
2. Dans le menu déroulant, sélectionnez **"Nouvelle application"** (New App)

#### Étape 2 : Remplir le formulaire de création

Un formulaire s'ouvre avec les champs suivants :

**Plateforme** :
- Cochez **"iOS"** (c'est la seule option si vous créez pour iOS)

**Nom** :
- Entrez : **Dream Market**
- ⚠️ **Important** : Ce nom doit être unique dans l'App Store. Si "Dream Market" est déjà pris, essayez "Dream Market RDC" ou un nom similaire.

**Langue principale** :
- Sélectionnez **"Français"** dans le menu déroulant
- C'est la langue par défaut pour toutes les informations de l'application

**Bundle ID** :
- Cliquez sur le menu déroulant
- Sélectionnez **`com.dreammarket.app`**
- ⚠️ **Important** : Ce Bundle ID doit déjà exister dans votre compte Apple Developer
- Si vous ne le voyez pas, vous devez d'abord le créer dans [developer.apple.com/account](https://developer.apple.com/account) > Certificates, Identifiers & Profiles > Identifiers

**SKU (Stock Keeping Unit)** :
- Entrez : **`dream-market-ios`**
- ⚠️ **Important** : Le SKU est un identifiant unique interne que vous choisissez
- Il ne sera jamais visible par les utilisateurs
- Il ne peut pas être modifié après la création
- Utilisez un format simple : lettres minuscules, chiffres et tirets uniquement

**Accès utilisateur** :
- Sélectionnez **"Accès complet"** (Full Access)
- Cela vous donne tous les droits sur l'application
- L'option "Accès limité" est pour les comptes d'équipe avec restrictions

#### Étape 3 : Confirmer la création

1. Vérifiez que toutes les informations sont correctes
2. Cliquez sur **"Créer"** (Create) en haut à droite
3. ⚠️ **Note** : La création peut prendre quelques secondes

#### Étape 4 : Vérifier la création

Après la création, vous serez redirigé vers la page principale de votre nouvelle application. Vous devriez voir :

- Le nom de l'application : "Dream Market"
- Le Bundle ID : `com.dreammarket.app`
- Le statut : "Préparation à la soumission" (Prepare for Submission)
- Plusieurs onglets à gauche : Informations sur l'application, Prix et disponibilité, Préparation à la soumission, etc.

**⚠️ Important** : Si le Bundle ID `com.dreammarket.app` n'existe pas encore dans votre compte Apple Developer, vous devez d'abord le créer :

1. Allez sur [developer.apple.com/account](https://developer.apple.com/account)
2. Connectez-vous avec votre compte Apple Developer
3. Allez dans **"Certificates, Identifiers & Profiles"**
4. Cliquez sur **"Identifiers"** dans le menu de gauche
5. Cliquez sur le bouton **"+"** en haut à gauche
6. Sélectionnez **"App IDs"** et cliquez sur **"Continue"**
7. Sélectionnez **"App"** et cliquez sur **"Continue"**
8. Remplissez :
   - **Description** : Dream Market App
   - **Bundle ID** : Sélectionnez **"Explicit"** et entrez `com.dreammarket.app`
9. Cochez les **Capabilities** nécessaires (Push Notifications, etc.)
10. Cliquez sur **"Continue"** puis **"Register"**

### 8.3 Remplir les informations de l'application

Maintenant que votre application est créée, vous devez remplir toutes les informations requises. Commencez par l'onglet **"Informations sur l'application"** (App Information) dans le menu de gauche.

#### Étape 1 : Accéder à "Informations sur l'application"

1. Dans le menu de gauche de votre application, cliquez sur **"Informations sur l'application"** (App Information)
2. Vous verrez plusieurs sections à remplir

#### Étape 2 : Remplir les informations de base

**Nom** :
- Le nom est déjà rempli : **Dream Market**
- Vous pouvez le modifier si nécessaire (maximum 30 caractères)

**Sous-titre** (optionnel mais recommandé) :
- Cliquez sur **"Modifier"** (Edit) à côté de "Sous-titre"
- Entrez : **Produits agricoles bio RDC**
- ⚠️ Maximum 30 caractères
- Cliquez sur **"Enregistrer"** (Save)

**Catégorie principale** :
- Cliquez sur **"Modifier"** (Edit) à côté de "Catégorie"
- **Primaire** : Sélectionnez **"Style de vie"** (Lifestyle) ou **"Shopping"**
- **Secondaire** (optionnel) : Sélectionnez **"Alimentation et boissons"** (Food & Drink)
- Cliquez sur **"Enregistrer"** (Save)

**URL de la politique de confidentialité** :
- Cliquez sur **"Modifier"** (Edit) à côté de "Politique de confidentialité"
- ⚠️ **OBLIGATOIRE** : Vous devez avoir une URL accessible publiquement
- Entrez l'URL complète, par exemple : `https://dreammarket.com/privacy` ou `https://votre-site.com/privacy`
- ⚠️ Cette URL doit être accessible et contenir votre politique de confidentialité
- Cliquez sur **"Enregistrer"** (Save)

**Site web** (optionnel) :
- Si vous avez un site web, entrez l'URL
- Sinon, laissez vide

**Informations de contact** :
- **Email de support** : Entrez `dreamfield2000@gmail.com`
- ⚠️ Cet email sera visible par les utilisateurs dans l'App Store
- **Téléphone de support** (optionnel) : Entrez `+243 858 000 217`
- Cliquez sur **"Enregistrer"** (Save)

#### Étape 3 : Configurer "Prix et disponibilité"

1. Dans le menu de gauche, cliquez sur **"Prix et disponibilité"** (Pricing and Availability)

**Prix** :
- Cliquez sur **"Modifier"** (Edit) à côté de "Prix"
- Sélectionnez **"Gratuit"** (Free)
- ⚠️ Si vous choisissez un prix payant, vous devrez configurer un contrat fiscal et bancaire
- Cliquez sur **"Enregistrer"** (Save)

**Disponibilité** :
- Cliquez sur **"Modifier"** (Edit) à côté de "Disponibilité"
- Par défaut, l'application est disponible dans tous les pays
- Si vous voulez limiter à certains pays :
  - Cliquez sur **"Choisir des pays ou régions"** (Choose countries or regions)
  - Décochez les pays que vous ne voulez pas
  - Ou laissez **"Tous les pays"** (All countries) pour une distribution mondiale
- Cliquez sur **"Enregistrer"** (Save)

**Contrats et informations bancaires** :
- Si l'application est gratuite, vous n'avez pas besoin de configurer de contrat
- Si vous voulez vendre l'application ou des achats intégrés, vous devrez configurer un contrat fiscal et bancaire

#### Étape 4 : Remplir "Préparation à la soumission"

C'est l'onglet le plus important ! C'est ici que vous configurez tout ce qui apparaîtra dans l'App Store.

1. Dans le menu de gauche, cliquez sur **"Préparation à la soumission"** (App Store)
2. Vous verrez plusieurs sections à remplir

**⚠️ Important** : Vous devez créer une **version** avant de pouvoir remplir les informations. Cliquez sur **"+ Version ou plateforme"** (+ Version or Platform) si aucune version n'existe encore.

**Version** :
- La version doit correspondre à celle dans `app.json` : **1.0.1**
- Si vous créez une nouvelle version, entrez **1.0.1**

**Description** :
- Cliquez dans le champ **"Description"**
- ⚠️ Maximum 4000 caractères
- Copiez-collez le texte suivant :

```
Dream Market est votre plateforme de confiance pour acheter des produits agricoles bio et réserver des services spécialisés en République Démocratique du Congo.

🌱 PRODUITS FRAIS ET BIO
- Fruits et légumes de saison
- Produits locaux certifiés
- Livraison rapide et sécurisée

🏡 FERMES PARTENAIRES
- Découvrez les producteurs locaux
- Apprenez-en plus sur leurs pratiques durables
- Contactez directement les fermes

🛠️ SERVICES SPÉCIALISÉS
- Coaching agricole
- Formation et diagnostic
- Gestion de patrimoine
- Certification

✨ FONCTIONNALITÉS
- Catalogue complet de produits
- Recherche et filtres avancés
- Panier d'achat intuitif
- Suivi de commandes en temps réel
- Notifications push
- Profil utilisateur personnalisé

📞 CONTACT
- Téléphone : +243 858 000 217 - 899 292 369
- Email : dreamfield2000@gmail.com
- Adresse : Avenue Lufira, N°16, Q/école, C/Lemba, Kinshasa

🕑 HORAIRES
Ouvert de 8H30 à 16H30 du lundi au vendredi

Téléchargez Dream Market dès maintenant et découvrez les meilleurs produits agricoles de la RDC !
```

**Mots-clés** :
- Cliquez dans le champ **"Mots-clés"**
- ⚠️ Maximum 100 caractères, séparés par des virgules (pas d'espaces après les virgules)
- Entrez : `agriculture,bio,produits frais,RDC,Congo,fermes,services agricoles,livraison`
- ⚠️ Ces mots-clés aident les utilisateurs à trouver votre application dans l'App Store

**URL de support** :
- Cliquez dans le champ **"URL de support"**
- ⚠️ **OBLIGATOIRE** : Entrez une URL ou un email
- Option 1 : URL de votre page de support : `https://votre-site.com/support`
- Option 2 : Email : `mailto:dreamfield2000@gmail.com`
- ⚠️ Cette URL sera visible par les utilisateurs

**URL de marketing** (optionnel) :
- Si vous avez un site web, entrez l'URL
- Sinon, laissez vide

**Captures d'écran** :
- ⚠️ **OBLIGATOIRE** : Vous devez télécharger au moins 1 capture d'écran pour chaque taille d'appareil requise
- Cliquez sur **"Ajouter"** (Add) dans la section "Captures d'écran iPhone"
- **Pour iPhone 6.7"** (iPhone 14 Pro Max, etc.) :
  - Cliquez sur **"Ajouter"** dans la section "6.7" Display"
  - Téléchargez au moins 1 capture (recommandé : 3-10)
  - Taille : 1290x2796 px
- **Pour iPad 12.9"** (si vous supportez iPad) :
  - Cliquez sur **"Ajouter"** dans la section "12.9" iPad Pro"
  - Téléchargez au moins 1 capture (recommandé : 3-10)
  - Taille : 2048x2732 px
- ⚠️ **Ordre recommandé** : Écran d'accueil, liste produits, détail produit, panier, commande, profil
- ⚠️ Les captures doivent être en PNG ou JPEG
- ⚠️ Glissez-déposez les fichiers ou cliquez pour sélectionner

**Icône de l'application** :
- Cliquez sur **"Choisir un fichier"** (Choose File) dans la section "Icône de l'application"
- ⚠️ **OBLIGATOIRE** : Téléchargez l'icône 1024x1024 px
- Format : PNG ou JPEG
- ⚠️ L'icône ne doit pas avoir de transparence (fond opaque requis)
- ⚠️ L'icône ne doit pas contenir de coins arrondis (Apple les ajoutera automatiquement)

**Vidéo promotionnelle** (optionnel) :
- Si vous avez une vidéo, cliquez sur **"Ajouter"** (Add)
- Format : MP4, MOV, ou M4V
- Durée : 15-30 secondes
- Taille : Même que les captures d'écran

#### Étape 5 : Remplir les informations de version

Dans la même page "Préparation à la soumission", descendez jusqu'à la section **"Informations de version"** (Version Information).

**Notes de version** :
- Cliquez dans le champ **"Notes de version"** (What's New in This Version)
- ⚠️ Maximum 4000 caractères
- Pour la première version, vous pouvez utiliser :
```
Première version de Dream Market

✨ Fonctionnalités :
- Catalogue complet de produits agricoles bio
- Système de commande et livraison
- Gestion des fermes partenaires
- Services spécialisés (coaching, formation, etc.)
- Recherche et filtres avancés
- Panier d'achat intuitif
- Suivi de commandes en temps réel
- Notifications push
- Profil utilisateur personnalisé
```
- Pour les mises à jour futures, utilisez :
```
Nouvelles fonctionnalités :
- Amélioration de la navigation et des filtres produits
- Correction des problèmes d'affichage des produits filtrés
- Optimisation des performances avec pagination
- Amélioration de l'interface utilisateur

Corrections :
- Correction du problème de synchronisation des produits entre écrans
- Amélioration de la stabilité générale
```

**Informations de build** :
- ⚠️ **Important** : Cette section ne sera disponible qu'après avoir uploadé un build
- Une fois que vous avez soumis un build (via EAS ou manuellement), il apparaîtra dans le menu déroulant **"Build"**
- Cliquez sur le menu déroulant et sélectionnez le build que vous voulez publier
- ⚠️ Le build doit avoir le statut "Prêt à soumettre" (Ready to Submit) pour être sélectionnable

#### Étape 6 : Remplir les informations de classification

Dans la même page "Préparation à la soumission", descendez jusqu'à la section **"Informations sur l'application"** (App Information).

**Âge recommandé** :
- Cliquez sur **"Modifier"** (Edit) à côté de "Classification de contenu"
- Répondez au questionnaire sur le contenu de votre application
- Questions typiques :
  - **Contenu médical/traitement** : Non (sauf si votre app concerne la santé)
  - **Contenu fréquent/intense** : Non
  - **Violence** : Aucune ou rare/fantastique
  - **Contenu sexuel** : Aucun
  - **Gambling** : Non
  - **Contenu effrayant** : Aucun
- Après avoir répondu, Apple affichera automatiquement la classification (généralement **4+** ou **12+** pour une app e-commerce)
- Cliquez sur **"Enregistrer"** (Save)

**Informations sur le contenu** :
- Si demandé, répondez aux questions supplémentaires sur :
  - Violence
  - Contenu sexuel
  - Contenu effrayant
  - Jeux d'argent
  - Contenu médical
- Pour Dream Market (e-commerce de produits agricoles), la plupart des réponses seront **"Non"** ou **"Aucun"**

#### Étape 7 : Vérifier que tout est complété

Avant de soumettre, vérifiez que toutes les sections ont une coche verte ✅ :

- ✅ Informations sur l'application
- ✅ Prix et disponibilité
- ✅ Description et mots-clés
- ✅ Captures d'écran
- ✅ Icône de l'application
- ✅ Notes de version
- ✅ Build sélectionné (après upload)
- ✅ Classification de contenu
- ✅ Politique de confidentialité (dans "Informations sur l'application")

⚠️ **Important** : Toutes les sections avec un ⚠️ rouge doivent être complétées avant de pouvoir soumettre.

## ✅ Étape 9 : Soumettre pour révision

### 9.1 Vérifications finales

Avant de soumettre, vérifiez que vous avez complété :

- ✅ Informations de l'application
- ✅ Icône 1024x1024 px
- ✅ Captures d'écran (minimum requis)
- ✅ Description et notes de version
- ✅ Politique de confidentialité
- ✅ Build uploadé et sélectionné
- ✅ Informations de contact
- ✅ Catégorie sélectionnée
- ✅ Prix configuré

### 9.2 Soumettre pour révision

1. Dans App Store Connect, allez dans votre application
2. Vérifiez que toutes les sections sont complétées (coche verte)
3. Cliquez sur **"Soumettre pour révision"** (Submit for Review)
4. Répondez aux questions de conformité si nécessaire
5. Confirmez la soumission

## 🔍 Étape 10 : Suivre la révision

### 10.1 Statuts de révision

- **En attente de révision** : Votre application est en file d'attente
- **En révision** : Apple examine votre application (généralement 1-3 jours)
- **En attente de publication** : Approuvée, en attente de publication
- **Rejetée** : Des modifications sont nécessaires
- **Prête à la vente** : Disponible sur l'App Store

### 10.2 Notifications

Vous recevrez des emails à chaque changement de statut.

## 📱 Étape 11 : Tester avec TestFlight (optionnel mais recommandé)

Avant de publier en production, testez avec TestFlight :

### 11.1 Créer un build TestFlight

```bash
# Build pour TestFlight
eas build --platform ios --profile preview
```

### 11.2 Configurer TestFlight dans App Store Connect

1. Allez dans App Store Connect > Votre app > TestFlight
2. Ajoutez des testeurs internes (jusqu'à 100)
3. Ajoutez des testeurs externes (jusqu'à 10 000, nécessite une révision Apple)
4. Invitez les testeurs par email

### 11.3 Tester l'application

Les testeurs recevront une invitation par email et pourront installer l'application via l'app TestFlight.

## 🚨 En cas de problème

### Build échoué

```bash
# Voir les logs détaillés
eas build:list
eas build:view [BUILD_ID]

# Nettoyer et réessayer
eas build --platform ios --profile production --clear-cache
```

### Erreur de certificat

**Solution** :
- EAS gère automatiquement les certificats
- Si problème, supprimez les certificats dans EAS et laissez-les se régénérer

### Erreur de soumission

**Solutions courantes** :
- Vérifiez que le `bundleIdentifier` correspond dans `app.json` et App Store Connect
- Vérifiez que le `buildNumber` est supérieur à la version précédente
- Vérifiez que tous les champs obligatoires sont remplis

### Application rejetée

**Raisons courantes** :
- Politique de confidentialité manquante ou incomplète
- Permissions non justifiées
- Contenu non conforme aux guidelines Apple
- Problèmes de performance ou de stabilité

**Solution** :
- Lisez les commentaires d'Apple dans App Store Connect
- Corrigez les problèmes mentionnés
- Soumettez à nouveau

## 📝 Commandes utiles

```bash
# Voir l'historique des builds
eas build:list

# Voir les détails d'un build
eas build:view [BUILD_ID]

# Annuler un build en cours
eas build:cancel [BUILD_ID]

# Soumettre à l'App Store
eas submit --platform ios --profile production

# Voir les informations du projet
eas project:info

# Voir les certificats iOS
eas credentials
```

## ✅ Checklist avant publication

- [ ] Compte Apple Developer actif (99$ USD/an payé)
- [ ] Version et buildNumber mis à jour dans `app.json`
- [ ] Build de production créé avec succès
- [ ] Fichier `.ipa` téléchargé ou soumis automatiquement
- [ ] Application créée dans App Store Connect
- [ ] Icône 1024x1024 px préparée et uploadée
- [ ] Captures d'écran préparées (minimum requis)
- [ ] Description et notes de version rédigées
- [ ] Politique de confidentialité créée et accessible
- [ ] Informations de contact complétées
- [ ] Catégorie sélectionnée
- [ ] Prix configuré (gratuit)
- [ ] Build sélectionné dans App Store Connect
- [ ] Toutes les sections requises complétées
- [ ] Application soumise pour révision

## 🔄 Mises à jour futures

### Préparer une mise à jour

1. **Incrémenter la version** dans `app.json` :
   ```json
   {
     "version": "1.0.2",  // Version visible par l'utilisateur
     "ios": {
       "buildNumber": "2"  // Numéro interne (toujours incrémenter)
     }
   }
   ```

2. **Créer un nouveau build** :
   ```bash
   eas build --platform ios --profile production
   ```

3. **Soumettre dans App Store Connect** :
   - Allez dans App Store Connect > Votre app > Versions
   - Créez une nouvelle version ou modifiez la version existante
   - Sélectionnez le nouveau build
   - Mettez à jour les notes de version
   - Soumettez pour révision

### Gestion des versions

- **version** : Version visible par l'utilisateur (ex: 1.0.1, 1.1.0, 2.0.0)
- **buildNumber** : Numéro interne qui doit toujours augmenter (1, 2, 3, 4...)

**Important** : Le `buildNumber` doit être unique et croissant. Même si vous revenez à une version antérieure (ex: 2.0.0 → 1.5.0), le `buildNumber` doit continuer à augmenter.

## 🎯 Prochaines étapes

Après la publication :

1. Surveillez les retours utilisateurs dans App Store Connect
2. Surveillez les crash reports dans App Store Connect > Analytics
3. Répondez aux avis utilisateurs
4. Préparez la prochaine version avec les améliorations nécessaires

## 📚 Ressources utiles

- [Documentation EAS Build iOS](https://docs.expo.dev/build/introduction/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Guide de publication iOS](https://developer.apple.com/app-store/submissions/)
- [TestFlight Documentation](https://developer.apple.com/testflight/)

---

**Date de création** : $(date)
**Version** : 1.0.1
**Build Number** : 1

