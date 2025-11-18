# 🚨 INSTRUCTIONS URGENTES - Configuration des Variables d'Environnement

## ⚠️ PROBLÈME CRITIQUE IDENTIFIÉ

**Le fichier `.env` local N'EST PAS utilisé lors des builds EAS !**

C'est **PROBABLEMENT LA CAUSE DU CRASH** en production. Les variables d'environnement Supabase ne sont pas disponibles lors du build.

---

## ✅ ACTION IMMÉDIATE REQUISE

### Étape 1 : Ajouter les Variables Supabase dans `eas.json`

Ouvrez le fichier `eas.json` et ajoutez les variables Supabase dans chaque profil :

**Pour le profil `production`** :
```json
"production": {
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "VOTRE_URL_SUPABASE_ICI",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "VOTRE_CLÉ_ANON_ICI",
    "EXPO_PUBLIC_APP_VERSION": "1.0.1",
    "EXPO_PUBLIC_ENVIRONMENT": "production"
  },
  "android": {
    "buildType": "app-bundle"
  },
  "ios": {
    "simulator": false
  }
}
```

**Pour le profil `preview`** :
```json
"preview": {
  "distribution": "internal",
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "VOTRE_URL_SUPABASE_ICI",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "VOTRE_CLÉ_ANON_ICI",
    "EXPO_PUBLIC_APP_VERSION": "1.0.1",
    "EXPO_PUBLIC_ENVIRONMENT": "preview"
  },
  "android": {
    "buildType": "apk"
  },
  "ios": {
    "simulator": false
  }
}
```

**Pour le profil `development`** :
```json
"development": {
  "developmentClient": true,
  "distribution": "internal",
  "env": {
    "EXPO_PUBLIC_SUPABASE_URL": "VOTRE_URL_SUPABASE_ICI",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY": "VOTRE_CLÉ_ANON_ICI",
    "EXPO_PUBLIC_APP_VERSION": "1.0.1",
    "EXPO_PUBLIC_ENVIRONMENT": "development"
  },
  "ios": {
    "simulator": true
  }
}
```

### Étape 2 : Remplacer les Valeurs

1. **Trouvez vos valeurs Supabase** :
   - Allez sur [supabase.com](https://supabase.com)
   - Ouvrez votre projet
   - Allez dans **Settings** > **API**
   - Copiez :
     - **Project URL** → Remplacez `VOTRE_URL_SUPABASE_ICI`
     - **anon public** key → Remplacez `VOTRE_CLÉ_ANON_ICI`

2. **Remplacez dans `eas.json`** :
   - Remplacez `VOTRE_URL_SUPABASE_ICI` par votre URL Supabase
   - Remplacez `VOTRE_CLÉ_ANON_ICI` par votre clé anon Supabase

### Étape 3 : Créer un Nouveau Build

Après avoir mis à jour `eas.json` :

```bash
# Pour Android
eas build --platform android --profile production

# Pour iOS
eas build --platform ios --profile production
```

---

## 🔍 Pourquoi C'est Important

**Sans ces variables** :
- ❌ `EXPO_PUBLIC_SUPABASE_URL` = `undefined`
- ❌ `EXPO_PUBLIC_SUPABASE_ANON_KEY` = `undefined`
- ❌ L'application crash au démarrage
- ❌ Supabase ne peut pas s'initialiser
- ❌ Aucune connexion à la base de données

**Avec ces variables dans `eas.json`** :
- ✅ Les variables sont disponibles lors du build
- ✅ L'application peut se connecter à Supabase
- ✅ Pas de crash au démarrage

---

## 📋 Checklist

- [ ] Ouvrir `eas.json`
- [ ] Ajouter la section `env` dans le profil `production`
- [ ] Ajouter la section `env` dans le profil `preview`
- [ ] Ajouter la section `env` dans le profil `development`
- [ ] Remplacer `VOTRE_URL_SUPABASE_ICI` par la vraie URL
- [ ] Remplacer `VOTRE_CLÉ_ANON_ICI` par la vraie clé
- [ ] Sauvegarder `eas.json`
- [ ] Créer un nouveau build de production
- [ ] Tester l'application

---

## ⚠️ Sécurité

**IMPORTANT** :
- ✅ Les variables `EXPO_PUBLIC_*` sont **publiques** (c'est normal pour Supabase)
- ✅ La clé **anon** de Supabase est conçue pour être publique
- ❌ **NE JAMAIS** mettre la clé **service_role** (c'est un secret)
- ✅ Ne jamais commiter le fichier `.env` dans Git

---

## 📚 Documentation Complète

Voir `CONFIGURATION_ENV_EAS.md` pour plus de détails.

---

**C'est probablement la cause du crash !** 🚨


