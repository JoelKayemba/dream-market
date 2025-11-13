# 📱 Guide de Publication - Google Play Store

## 📋 Prérequis

1. **Compte Google Play Console** (25$ USD - paiement unique)
   - Créer un compte sur [Google Play Console](https://play.google.com/console)
   - Payer les frais d'inscription (25$ USD, paiement unique)

2. **Compte Expo** (gratuit)
   - Créer un compte sur [expo.dev](https://expo.dev)
   - Installer EAS CLI : `npm install -g eas-cli`

3. **Informations nécessaires**
   - Nom de l'application : Dream Market
   - Package name : `com.dreammarket.app` (déjà configuré)
   - Description courte (80 caractères max)
   - Description complète (4000 caractères max)
   - Captures d'écran (minimum 2, recommandé 8)
   - Icône haute résolution (512x512 px)
   - Bannière graphique (1024x500 px)

---

## 🔧 Étape 1 : Préparer la configuration de l'application

### 1.1 Mettre à jour `app.json`

Vérifiez et mettez à jour les informations suivantes dans `app.json` :

```json
{
  "expo": {
    "name": "Dream Market",
    "slug": "dream-market-app",
    "version": "1.0.0",  // ⚠️ À incrémenter à chaque mise à jour
    "android": {
      "package": "com.dreammarket.app",
      "versionCode": 1,  // ⚠️ À incrémenter à chaque mise à jour
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "WAKE_LOCK",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### 1.2 Créer le fichier `eas.json`

Créez un fichier `eas.json` à la racine du projet :

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./service-account-key.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 🔑 Étape 2 : Configurer EAS Build

### 2.1 Installer EAS CLI

```bash
npm install -g eas-cli
```

### 2.2 Se connecter à Expo

```bash
eas login
```

### 2.3 Configurer le projet

```bash
eas build:configure
```

Cela créera le fichier `eas.json` si nécessaire.

---

## 🏗️ Étape 3 : Créer la clé de signature (Keystore)

### 3.1 Générer automatiquement avec EAS

EAS peut générer automatiquement la clé de signature. Lors de votre premier build de production, EAS vous demandera si vous voulez créer une nouvelle clé.

**Option recommandée** : Laisser EAS gérer la clé automatiquement.

### 3.2 (Optionnel) Générer manuellement

Si vous préférez générer votre propre keystore :

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore dream-market-keystore.jks -alias dream-market-key -keyalg RSA -keysize 2048 -validity 10000
```

⚠️ **IMPORTANT** : Sauvegardez le keystore et le mot de passe dans un endroit sûr. Vous en aurez besoin pour toutes les mises à jour futures.

---

## 📦 Étape 4 : Créer le build de production

### 4.1 Build Android App Bundle (AAB)

Le format AAB est requis par Google Play Store :

```bash
eas build --platform android --profile production
```

### 4.2 Suivre la progression

- Le build prendra 15-30 minutes
- Vous recevrez un lien pour suivre la progression
- Une fois terminé, vous recevrez un lien de téléchargement

### 4.3 Tester le build (optionnel mais recommandé)

Avant de publier, testez le build :

```bash
# Télécharger le build
eas build:list

# Installer sur un appareil Android pour tester
# Utilisez le fichier .aab téléchargé
```

---

## 🎨 Étape 5 : Préparer les ressources graphiques

### 5.1 Icône de l'application

- **Taille** : 512x512 px
- **Format** : PNG
- **Fond** : Transparent ou couleur unie
- **Fichier** : `./assets/Dream_logo.png` (vérifiez qu'il fait 512x512)

### 5.2 Captures d'écran

**Minimum requis** :
- 2 captures d'écran
- Format : PNG ou JPEG
- Taille minimale : 320px de hauteur
- Taille maximale : 3840px de largeur/hauteur

**Recommandé** :
- 8 captures d'écran montrant les fonctionnalités principales
- Taille : 1080x1920 px (portrait) ou 1920x1080 px (paysage)
- Formats : PNG ou JPEG

**Écrans à capturer** :
1. Écran d'accueil (HomeScreen)
2. Liste des produits (ProductsScreen)
3. Détail d'un produit (ProductDetailScreen)
4. Panier (CartScreen)
5. Commande (CheckoutScreen)
6. Profil utilisateur (ProfileScreen)
7. Liste des fermes (FarmsScreen)
8. Liste des services (ServicesScreen)

### 5.3 Bannière graphique (Feature Graphic)

- **Taille** : 1024x500 px
- **Format** : PNG ou JPEG
- **Contenu** : Logo + texte "Dream Market" + slogan

### 5.4 Icône adaptative (déjà configuré)

- **Foreground** : 1024x1024 px
- **Background** : Couleur unie (#FFFFFF)
- **Fichier** : `./assets/Dream_logo.png`

---

## 📝 Étape 6 : Créer l'application dans Google Play Console

### 6.1 Accéder à Google Play Console

1. Allez sur [Google Play Console](https://play.google.com/console)
2. Connectez-vous avec votre compte Google
3. Acceptez les conditions et payez les 25$ USD (une seule fois)

### 6.2 Créer une nouvelle application

1. Cliquez sur **"Créer une application"**
2. Remplissez les informations :
   - **Nom de l'application** : Dream Market
   - **Langue par défaut** : Français
   - **Type d'application** : Application
   - **Gratuit ou payant** : Gratuit
   - **Déclaration** : Cochez les cases appropriées

### 6.3 Remplir les informations de l'application

#### Onglet "Présentation de l'application"

**Description courte** (80 caractères max) :
```
Plateforme d'achat de produits agricoles bio et de réservation de services spécialisés en RDC
```

**Description complète** (4000 caractères max) :
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

**Icône de l'application** :
- Téléchargez votre icône 512x512 px

**Bannière graphique** :
- Téléchargez votre bannière 1024x500 px

**Captures d'écran** :
- Téléchargez au moins 2 captures d'écran (recommandé : 8)

**Vidéo promotionnelle** (optionnel) :
- Vous pouvez ajouter une vidéo YouTube

#### Onglet "Contenu de l'application"

**Politique de confidentialité** :
- Créez une page web avec votre politique de confidentialité
- Ajoutez l'URL dans le champ requis

**Catégorie** :
- Sélectionnez : **Style de vie** ou **Shopping**

**Cible** :
- **Tout public** ou **Adolescents et adultes**

---

## 📤 Étape 7 : Uploader le build

### 7.1 Créer une version de test (recommandé)

1. Dans Google Play Console, allez dans **"Production"** ou **"Tests internes"**
2. Cliquez sur **"Créer une nouvelle version"**
3. Uploader le fichier `.aab` téléchargé depuis EAS
4. Remplissez les notes de version :
   ```
   Première version de Dream Market
   - Catalogue de produits agricoles bio
   - Système de commande et livraison
   - Gestion des fermes partenaires
   - Services spécialisés
   ```

### 7.2 Vérifier les informations requises

Avant de publier, vérifiez que vous avez complété :

- ✅ Informations de l'application
- ✅ Icône et captures d'écran
- ✅ Politique de confidentialité
- ✅ Contenu évalué (classification)
- ✅ Informations sur la cible
- ✅ Build uploadé

---

## ✅ Étape 8 : Soumettre pour révision

### 8.1 Vérifications finales

1. **Contenu évalué** :
   - Remplissez le questionnaire sur le contenu de l'application
   - Répondez aux questions sur la violence, le contenu sexuel, etc.

2. **Prix et distribution** :
   - Confirmez que l'application est gratuite
   - Sélectionnez les pays de distribution (ou "Tous les pays")

3. **Accord de licence** :
   - Acceptez l'accord de licence du développeur Google Play

### 8.2 Soumettre pour révision

1. Cliquez sur **"Soumettre pour révision"**
2. Google examinera votre application (généralement 1-3 jours)
3. Vous recevrez un email une fois l'application approuvée ou si des modifications sont nécessaires

---

## 🔄 Étape 9 : Mises à jour futures

### 9.1 Préparer une mise à jour

1. **Incrémenter la version** dans `app.json` :
   ```json
   {
     "version": "1.0.1",  // Version visible par l'utilisateur
     "android": {
       "versionCode": 2  // Numéro interne (toujours incrémenter)
     }
   }
   ```

2. **Créer un nouveau build** :
   ```bash
   eas build --platform android --profile production
   ```

3. **Uploader dans Google Play Console** :
   - Allez dans "Production" > "Créer une nouvelle version"
   - Uploader le nouveau `.aab`
   - Ajouter les notes de version
   - Soumettre pour révision

### 9.2 Gestion des versions

- **version** : Version visible par l'utilisateur (ex: 1.0.1, 1.1.0, 2.0.0)
- **versionCode** : Numéro interne qui doit toujours augmenter (1, 2, 3, 4...)

---

## 🛠️ Dépannage

### Problème : Build échoue

**Solution** :
```bash
# Vérifier les logs
eas build:list

# Voir les détails d'un build
eas build:view [BUILD_ID]

# Nettoyer et réessayer
eas build --platform android --profile production --clear-cache
```

### Problème : Erreur de signature

**Solution** :
- Vérifiez que vous utilisez la même clé de signature pour toutes les mises à jour
- Si vous avez perdu la clé, contactez le support EAS

### Problème : Application rejetée

**Solutions courantes** :
- Vérifiez que vous avez une politique de confidentialité
- Assurez-vous que toutes les permissions sont justifiées
- Vérifiez que le contenu respecte les politiques de Google Play

---

## 📚 Ressources utiles

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Politique de contenu Google Play](https://play.google.com/about/developer-content-policy/)
- [Guide de publication Android](https://developer.android.com/distribute/googleplay/start)

---

## ✅ Checklist finale

Avant de soumettre, vérifiez :

- [ ] Compte Google Play Console créé et payé (25$ USD)
- [ ] Compte Expo créé et connecté
- [ ] `app.json` configuré correctement
- [ ] `eas.json` créé
- [ ] Build de production créé avec succès
- [ ] Icône 512x512 px préparée
- [ ] Captures d'écran préparées (minimum 2)
- [ ] Bannière graphique 1024x500 px préparée
- [ ] Description courte et complète rédigées
- [ ] Politique de confidentialité créée et accessible
- [ ] Contenu évalué complété
- [ ] Build uploadé dans Google Play Console
- [ ] Toutes les sections requises complétées
- [ ] Application soumise pour révision

---

## 🎉 Une fois approuvé

Une fois votre application approuvée :

1. Elle sera disponible sur le Google Play Store
2. Vous recevrez un email de confirmation
3. Vous pourrez suivre les statistiques dans Google Play Console
4. Les utilisateurs pourront télécharger et installer l'application

**Félicitations ! Votre application Dream Market est maintenant disponible sur le Google Play Store ! 🚀**

