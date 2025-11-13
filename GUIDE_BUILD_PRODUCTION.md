# Guide : Mise en Production - Dream Market v1.0.1

## 📋 Prérequis

1. ✅ EAS CLI installé et configuré
2. ✅ Compte Expo connecté (`eas login`)
3. ✅ Compte Google Play Console avec accès développeur
4. ✅ Keystore Android configuré (généré automatiquement par EAS)

## 🔄 Étape 1 : Vérifier les modifications

Les versions ont été mises à jour :
- **Version** : `1.0.0` → `1.0.1`
- **versionCode** : `1` → `2` (obligatoire pour Google Play)

## 🏗️ Étape 2 : Créer le build de production

### Option A : Build Android (recommandé pour production)

```bash
# Build de production (AAB pour Google Play)
eas build --platform android --profile production
```

### Option B : Build pour test interne (APK)

```bash
# Build de prévisualisation (APK pour test)
eas build --platform android --profile preview
```

**Note** : Pour la production sur Google Play, utilisez l'**Option A** (AAB).

## ⏳ Étape 3 : Attendre la fin du build

Le build prend généralement **15-30 minutes**. Vous pouvez :
- Suivre la progression dans le terminal
- Vérifier sur [expo.dev](https://expo.dev) dans la section "Builds"

## 📥 Étape 4 : Télécharger le build

Une fois le build terminé :

1. **Via le terminal** : Un lien de téléchargement sera affiché
2. **Via Expo Dashboard** :
   - Allez sur [expo.dev](https://expo.dev)
   - Ouvrez votre projet
   - Section "Builds"
   - Cliquez sur le build terminé
   - Téléchargez le fichier `.aab` (Android App Bundle)

## 📤 Étape 5 : Publier sur Google Play Console

### 5.1 Accéder à Google Play Console

1. Allez sur [Google Play Console](https://play.google.com/console)
2. Connectez-vous avec votre compte développeur
3. Sélectionnez votre application "Dream Market"

### 5.2 Créer une nouvelle version

1. Dans le menu de gauche, cliquez sur **"Production"** (ou **"Testing"** pour un test interne)
2. Cliquez sur **"Créer une nouvelle version"** (ou **"Create new release"**)

### 5.3 Téléverser le build

1. Dans la section **"App bundles and APKs"**, cliquez sur **"Téléverser"** (ou **"Upload"**)
2. Sélectionnez le fichier `.aab` téléchargé
3. Attendez la fin du téléversement

### 5.4 Remplir les notes de version

Dans la section **"Release notes"**, ajoutez les notes de version :

**Exemple pour v1.0.1 :**
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

### 5.5 Vérifier et publier

1. Vérifiez que toutes les informations sont correctes
2. Cliquez sur **"Enregistrer"** (ou **"Save"**)
3. Cliquez sur **"Examiner la version"** (ou **"Review release"**)
4. Si tout est OK, cliquez sur **"Démarrer le déploiement en production"** (ou **"Start rollout to production"**)

## 🔍 Étape 6 : Vérifier la publication

1. Le déploiement peut prendre **quelques heures à quelques jours**
2. Vous recevrez un email de confirmation
3. Vérifiez dans Google Play Console l'état de la version

## 📱 Étape 7 : Tester la version publiée

Une fois la version disponible :

1. Allez sur Google Play Store
2. Recherchez "Dream Market"
3. Vérifiez que la version `1.0.1` est disponible
4. Testez les nouvelles fonctionnalités

## 🚨 En cas de problème

### Build échoué

```bash
# Voir les logs détaillés
eas build:list
eas build:view [BUILD_ID]
```

### Erreur de téléversement

- Vérifiez que le fichier `.aab` n'est pas corrompu
- Vérifiez que le `versionCode` est supérieur à la version précédente
- Vérifiez que le `package` dans `app.json` correspond à celui de Google Play Console

### Erreur de publication

- Vérifiez que tous les champs obligatoires sont remplis
- Vérifiez que les images et descriptions sont à jour
- Vérifiez que les permissions demandées sont justifiées

## 📝 Commandes utiles

```bash
# Voir l'historique des builds
eas build:list

# Voir les détails d'un build
eas build:view [BUILD_ID]

# Annuler un build en cours
eas build:cancel [BUILD_ID]

# Voir les informations du projet
eas project:info
```

## ✅ Checklist avant publication

- [ ] Version et versionCode mis à jour
- [ ] Build de production créé avec succès
- [ ] Fichier `.aab` téléchargé
- [ ] Notes de version préparées
- [ ] Toutes les fonctionnalités testées localement
- [ ] Aucune erreur critique dans les logs
- [ ] Images et descriptions à jour dans Google Play Console

## 🎯 Prochaines étapes

Après la publication :

1. Surveillez les retours utilisateurs
2. Surveillez les crash reports dans Google Play Console
3. Préparez la prochaine version avec les améliorations nécessaires

---

**Date de création** : $(date)
**Version** : 1.0.1
**Build Number** : 2

