# 🔑 Configuration des Variables d'Environnement pour EAS Build

## 🚨 PROBLÈME IDENTIFIÉ

**Le fichier `.env` local N'EST PAS automatiquement inclus dans les builds EAS !**

C'est probablement **LA CAUSE DU CRASH** en production. Les variables d'environnement ne sont pas disponibles lors du build, donc :
- `EXPO_PUBLIC_SUPABASE_URL` = `undefined`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` = `undefined`
- L'application crash au démarrage car Supabase ne peut pas s'initialiser

---

## ✅ SOLUTION : 3 Méthodes pour Configurer les Variables d'Environnement

### Méthode 1 : Dans `eas.json` (Recommandé pour les variables publiques)

**Fichier** : `eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://votre-projet.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "votre_clé_anon",
        "EXPO_PUBLIC_APP_VERSION": "1.0.1",
        "EXPO_PUBLIC_ENVIRONMENT": "development"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://votre-projet.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "votre_clé_anon",
        "EXPO_PUBLIC_APP_VERSION": "1.0.1",
        "EXPO_PUBLIC_ENVIRONMENT": "preview"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://votre-projet.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "votre_clé_anon",
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
  },
  "submit": {
    "production": {
      "android": {
        "track": "internal"
      },
      "ios": {
        "appleId": "kayembajoel92@icloud.com"
      }
    }
  }
}
```

**⚠️ IMPORTANT** : 
- ✅ Les variables `EXPO_PUBLIC_*` sont **publiques** et seront incluses dans le bundle
- ❌ **NE JAMAIS** mettre de secrets dans `eas.json` (clés privées, mots de passe, etc.)
- ✅ Utiliser `eas secret:create` pour les secrets (voir Méthode 2)

---

### Méthode 2 : EAS Secrets (Recommandé pour les secrets)

Pour les variables sensibles (clés API privées, etc.), utilisez EAS Secrets :

```bash
# Créer un secret
eas secret:create --scope project --name EXPO_PUBLIC_RESEND_API_KEY --value "votre_clé_resend" --type string

# Voir tous les secrets
eas secret:list

# Supprimer un secret
eas secret:delete --name EXPO_PUBLIC_RESEND_API_KEY
```

**Les secrets sont automatiquement injectés lors du build.**

---

### Méthode 3 : Fichier `.env` avec `eas.json` (Hybride)

Vous pouvez utiliser un fichier `.env` local pour le développement, mais **vous DEVEZ aussi les définir dans `eas.json`** pour les builds :

**Fichier `.env` (développement local)** :
```bash
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
EXPO_PUBLIC_APP_VERSION=1.0.1
EXPO_PUBLIC_ENVIRONMENT=development
```

**Fichier `eas.json` (builds EAS)** :
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://votre-projet.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "votre_clé_anon",
        "EXPO_PUBLIC_APP_VERSION": "1.0.1",
        "EXPO_PUBLIC_ENVIRONMENT": "production"
      }
    }
  }
}
```

---

## 🔧 Configuration Recommandée pour Dream Market

### Étape 1 : Mettre à jour `eas.json`

Ajoutez la section `env` dans chaque profil de build :

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "VOTRE_URL_SUPABASE",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "VOTRE_CLÉ_ANON",
        "EXPO_PUBLIC_APP_VERSION": "1.0.1",
        "EXPO_PUBLIC_ENVIRONMENT": "development"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "VOTRE_URL_SUPABASE",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "VOTRE_CLÉ_ANON",
        "EXPO_PUBLIC_APP_VERSION": "1.0.1",
        "EXPO_PUBLIC_ENVIRONMENT": "preview"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "VOTRE_URL_SUPABASE",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "VOTRE_CLÉ_ANON",
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
  },
  "submit": {
    "production": {
      "android": {
        "track": "internal"
      },
      "ios": {
        "appleId": "kayembajoel92@icloud.com"
      }
    }
  }
}
```

### Étape 2 : Remplacer les Valeurs

Remplacez :
- `VOTRE_URL_SUPABASE` → Votre URL Supabase (ex: `https://xxxxx.supabase.co`)
- `VOTRE_CLÉ_ANON` → Votre clé anon Supabase

### Étape 3 : (Optionnel) Ajouter Resend API Key

Si vous utilisez Resend pour les emails :

```bash
eas secret:create --scope project --name EXPO_PUBLIC_RESEND_API_KEY --value "votre_clé_resend" --type string
```

---

## 🚨 Pourquoi le Fichier `.env` Ne Fonctionne Pas avec EAS Build

1. **EAS Build s'exécute dans le cloud** : Le fichier `.env` local n'est pas envoyé
2. **Sécurité** : Les fichiers `.env` peuvent contenir des secrets et ne doivent pas être commités
3. **Configuration explicite** : `eas.json` permet de configurer différemment chaque environnement

---

## ✅ Vérification

Après avoir configuré les variables dans `eas.json` :

1. **Vérifier la configuration** :
```bash
eas build:configure
```

2. **Créer un nouveau build** :
```bash
eas build --platform android --profile production
```

3. **Vérifier dans les logs** :
Les variables d'environnement seront disponibles lors du build.

---

## 📋 Checklist

- [ ] Variables `EXPO_PUBLIC_SUPABASE_URL` ajoutées dans `eas.json`
- [ ] Variables `EXPO_PUBLIC_SUPABASE_ANON_KEY` ajoutées dans `eas.json`
- [ ] Variables configurées pour tous les profils (development, preview, production)
- [ ] Valeurs remplacées par les vraies valeurs
- [ ] (Optionnel) Secrets créés avec `eas secret:create` si nécessaire
- [ ] Nouveau build créé pour tester

---

## 🔍 Où Trouver les Valeurs Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## ⚠️ Sécurité

**IMPORTANT** :
- ✅ Les variables `EXPO_PUBLIC_*` sont **publiques** et seront incluses dans le bundle
- ❌ **NE JAMAIS** mettre de secrets dans `eas.json` (clés privées, mots de passe)
- ✅ Utiliser `eas secret:create` pour les secrets sensibles
- ✅ Ne jamais commiter le fichier `.env` dans Git

**Fichier `.gitignore` doit contenir** :
```
.env
.env.local
.env.*.local
```

---

## 🎯 Résumé

**Le problème** : Le fichier `.env` local n'est pas utilisé lors des builds EAS.

**La solution** : Ajouter les variables d'environnement dans `eas.json` dans la section `env` de chaque profil de build.

**C'est probablement la cause du crash** : Les variables Supabase n'étaient pas disponibles lors du build de production, causant un crash au démarrage.

---

**Date de création** : $(date)
**Version** : 1.0.1


