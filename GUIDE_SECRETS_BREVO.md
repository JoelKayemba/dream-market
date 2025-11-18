# 🔐 Guide - Configuration Sécurisée de la Clé API Brevo

## ⚠️ Problème Résolu

GitHub a détecté que votre clé API Brevo était exposée dans le dépôt. Les secrets ont été retirés et remplacés par des placeholders.

## 🚨 Action Immédiate Requise

**IMPORTANT** : La clé API qui a été exposée doit être **révoquée** et une nouvelle clé doit être créée.

### Étape 1 : Révoquer l'Ancienne Clé API

1. Connectez-vous à votre compte Brevo : https://app.brevo.com
2. Allez dans **Settings** → **SMTP & API** → **API Keys**
3. Trouvez la clé `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`
4. Cliquez sur **Delete** ou **Revoke** pour la désactiver

### Étape 2 : Créer une Nouvelle Clé API

1. Toujours dans **Settings** → **SMTP & API** → **API Keys**
2. Cliquez sur **Generate a new API key**
3. Donnez-lui un nom (ex: "Dream Market - Production")
4. Copiez la nouvelle clé (vous ne pourrez la voir qu'une seule fois !)

---

## 🔧 Configuration avec EAS Secrets

### Option 1 : Utiliser EAS Secrets (Recommandé)

Cette méthode est la plus sécurisée car la clé n'est jamais dans le code.

#### 1. Créer le Secret EAS

```bash
# Dans le répertoire du projet
cd dream-market

# Créer le secret pour tous les environnements
eas secret:create --scope project --name BREVO_API_KEY --value "votre_nouvelle_cle_api_brevo" --type string
```

#### 2. Vérifier que le Secret est Créé

```bash
eas secret:list
```

Vous devriez voir `BREVO_API_KEY` dans la liste.

#### 3. Utiliser le Secret dans `eas.json`

Le fichier `eas.json` utilise déjà la syntaxe `${BREVO_API_KEY}` qui sera automatiquement remplacée par EAS lors du build.

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_BREVO_API_KEY": "${BREVO_API_KEY}"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_BREVO_API_KEY": "${BREVO_API_KEY}"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_BREVO_API_KEY": "${BREVO_API_KEY}"
      }
    }
  }
}
```

#### 4. Pour le Développement Local

Créez un fichier `.env` (qui est déjà dans `.gitignore`) :

```bash
EXPO_PUBLIC_BREVO_API_KEY=votre_nouvelle_cle_api_brevo
```

---

### Option 2 : Utiliser des Secrets Différents par Environnement

Si vous voulez utiliser des clés différentes pour development, preview et production :

```bash
# Clé pour development
eas secret:create --scope project --name BREVO_API_KEY_DEV --value "cle_dev" --type string

# Clé pour preview
eas secret:create --scope project --name BREVO_API_KEY_PREVIEW --value "cle_preview" --type string

# Clé pour production
eas secret:create --scope project --name BREVO_API_KEY_PROD --value "cle_prod" --type string
```

Puis dans `eas.json` :

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_BREVO_API_KEY": "${BREVO_API_KEY_DEV}"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_BREVO_API_KEY": "${BREVO_API_KEY_PREVIEW}"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_BREVO_API_KEY": "${BREVO_API_KEY_PROD}"
      }
    }
  }
}
```

---

## 📝 Commandes EAS Secrets Utiles

### Lister tous les secrets

```bash
eas secret:list
```

### Supprimer un secret

```bash
eas secret:delete --name BREVO_API_KEY
```

### Mettre à jour un secret

```bash
# Supprimer l'ancien
eas secret:delete --name BREVO_API_KEY

# Créer le nouveau
eas secret:create --scope project --name BREVO_API_KEY --value "nouvelle_valeur" --type string
```

---

## ✅ Vérification

### 1. Vérifier que les Secrets sont Configurés

```bash
eas secret:list
```

### 2. Tester un Build

```bash
# Build de test
eas build --profile development --platform android

# Vérifier dans les logs que la variable est bien injectée
```

### 3. Vérifier dans l'Application

Une fois le build terminé, testez l'envoi d'email pour vérifier que la clé fonctionne.

---

## 🚨 Points Importants

### 1. Ne Jamais Commiter de Secrets

- ❌ Ne pas mettre de clés API dans `eas.json` (utiliser `${SECRET_NAME}`)
- ❌ Ne pas mettre de clés API dans les fichiers de documentation
- ❌ Ne pas mettre de clés API dans le code source
- ✅ Utiliser EAS Secrets pour les builds
- ✅ Utiliser `.env` pour le développement local (déjà dans `.gitignore`)

### 2. Révoquer les Clés Exposées

Si une clé a été exposée publiquement (dans Git, GitHub, etc.), **révoquez-la immédiatement** et créez-en une nouvelle.

### 3. Rotation Régulière des Clés

Il est recommandé de changer les clés API régulièrement (tous les 3-6 mois) pour la sécurité.

---

## 📚 Documentation EAS

Pour plus d'informations sur EAS Secrets :
- Documentation officielle : https://docs.expo.dev/build-reference/variables/#using-eas-secrets
- Guide complet : https://docs.expo.dev/guides/environment-variables/

---

## 🎯 Résumé des Actions

1. ✅ **Révoquer l'ancienne clé API Brevo** (dans le dashboard Brevo)
2. ✅ **Créer une nouvelle clé API Brevo**
3. ✅ **Créer le secret EAS** : `eas secret:create --scope project --name BREVO_API_KEY --value "nouvelle_cle" --type string`
4. ✅ **Ajouter la clé dans `.env`** pour le développement local
5. ✅ **Vérifier que `eas.json` utilise `${BREVO_API_KEY}`** (déjà fait)
6. ✅ **Tester un build** pour vérifier que tout fonctionne

---

**Date de création** : $(date)
**Version** : 1.0.0

