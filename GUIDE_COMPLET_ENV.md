# 📋 Guide Complet - Configuration des Variables d'Environnement

## ✅ Variables Ajoutées dans `eas.json`

J'ai ajouté toutes vos variables dans `eas.json`. Il vous suffit de remplacer les valeurs `À_REMPLACER` par vos vraies valeurs.

### Variables dans `eas.json` :

1. ✅ `EXPO_PUBLIC_SUPABASE_URL` - À remplacer
2. ✅ `EXPO_PUBLIC_SUPABASE_ANON_KEY` - À remplacer
3. ✅ `EXPO_PUBLIC_APP_NAME` - Déjà configuré ("Dream Market")
4. ✅ `EXPO_PUBLIC_APP_VERSION` - Déjà configuré ("1.0.1")
5. ✅ `EXPO_PUBLIC_ENVIRONMENT` - Déjà configuré (development/preview/production)
6. ✅ `EXPO_PUBLIC_STORAGE_BUCKET_FARMS` - Déjà configuré ("farm-images")
7. ✅ `EXPO_PUBLIC_STORAGE_BUCKET_PRODUCTS` - Déjà configuré ("product-images")
8. ✅ `EXPO_PUBLIC_STORAGE_BUCKET_SERVICES` - Déjà configuré ("service-images")
9. ✅ `EXPO_PUBLIC_STORAGE_BUCKET_AVATARS` - Déjà configuré ("user-avatars")
10. ✅ `EXPO_PUBLIC_RESEND_API_KEY` - À remplacer

### Variable SECRÈTE (NON dans `eas.json`) :

11. ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - **SECRET** - Utiliser EAS Secrets (voir ci-dessous)

---

## 🔧 Comment Remplir les Valeurs

### Étape 1 : Ouvrir `eas.json`

Ouvrez le fichier `dream-market/eas.json` et remplacez `À_REMPLACER` par vos vraies valeurs dans chaque profil (development, preview, production).

### Étape 2 : Trouver les Valeurs Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → Remplacez `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → Remplacez `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Pour `SUPABASE_SERVICE_ROLE_KEY` (voir section Secrets)

### Étape 3 : Trouver la Clé Resend

1. Allez sur [resend.com](https://resend.com)
2. Connectez-vous
3. Allez dans **API Keys**
4. Copiez votre clé → Remplacez `EXPO_PUBLIC_RESEND_API_KEY`

### Étape 4 : Vérifier les Buckets de Storage

Les valeurs par défaut sont déjà configurées. Si vos buckets ont des noms différents dans Supabase, modifiez-les.

---

## 🔐 Configuration de `SUPABASE_SERVICE_ROLE_KEY` (Secret)

**⚠️ IMPORTANT** : `SUPABASE_SERVICE_ROLE_KEY` est un **SECRET** et ne doit **JAMAIS** être dans `eas.json` ou commité dans Git.

### Utiliser EAS Secrets :

```bash
# Créer le secret
eas secret:create --scope project --name SUPABASE_SERVICE_ROLE_KEY --value "votre_clé_service_role" --type string

# Voir tous les secrets
eas secret:list

# Supprimer un secret (si nécessaire)
eas secret:delete --name SUPABASE_SERVICE_ROLE_KEY
```

**Note** : Si vous n'utilisez pas `SUPABASE_SERVICE_ROLE_KEY` dans votre application client (ce qui est recommandé), vous n'avez pas besoin de le configurer. Cette clé ne devrait être utilisée que côté serveur.

---

## 🔄 Fonctionnement avec `.env` et `eas.json`

### ✅ Le Backend Fonctionne avec les Deux Méthodes

**Bonne nouvelle** : Votre code backend utilise déjà `process.env.EXPO_PUBLIC_*` partout, donc il fonctionne automatiquement avec les deux méthodes :

1. **En développement local** : Le fichier `.env` est utilisé
2. **En build EAS** : Les variables dans `eas.json` sont utilisées

**Aucune modification du code backend n'est nécessaire !** ✅

### Comment ça fonctionne :

```javascript
// Dans votre code (ex: src/backend/config/supabase.js)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

// En développement local :
// → Lit depuis .env

// En build EAS :
// → Lit depuis eas.json (section env)
```

---

## 📝 Configuration Recommandée

### Fichier `.env` (Développement Local)

Gardez votre fichier `.env` pour le développement local :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
EXPO_PUBLIC_APP_NAME=Dream Market
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_STORAGE_BUCKET_FARMS=farm-images
EXPO_PUBLIC_STORAGE_BUCKET_PRODUCTS=product-images
EXPO_PUBLIC_STORAGE_BUCKET_SERVICES=service-images
EXPO_PUBLIC_STORAGE_BUCKET_AVATARS=user-avatars
EXPO_PUBLIC_RESEND_API_KEY=votre_clé_resend
```

### Fichier `eas.json` (Builds EAS)

Les variables sont déjà configurées. Il suffit de remplacer `À_REMPLACER` par vos valeurs.

---

## ✅ Checklist de Configuration

### Pour le Développement Local :
- [x] Fichier `.env` existe avec toutes les variables
- [x] Variables `EXPO_PUBLIC_*` définies
- [x] Variable `SUPABASE_SERVICE_ROLE_KEY` définie (si utilisée)

### Pour les Builds EAS :
- [ ] Ouvrir `eas.json`
- [ ] Remplacer `EXPO_PUBLIC_SUPABASE_URL` dans les 3 profils
- [ ] Remplacer `EXPO_PUBLIC_SUPABASE_ANON_KEY` dans les 3 profils
- [ ] Remplacer `EXPO_PUBLIC_RESEND_API_KEY` dans les 3 profils
- [ ] Vérifier les noms des buckets de storage
- [ ] (Optionnel) Créer `SUPABASE_SERVICE_ROLE_KEY` avec EAS Secrets si nécessaire

### Après Configuration :
- [ ] Sauvegarder `eas.json`
- [ ] Créer un nouveau build : `eas build --platform android --profile production`
- [ ] Tester l'application

---

## 🚨 Points Importants

### 1. Variables `EXPO_PUBLIC_*` sont Publiques

Les variables `EXPO_PUBLIC_*` sont **publiques** et seront incluses dans le bundle de l'application. C'est normal et sécurisé pour :
- ✅ `EXPO_PUBLIC_SUPABASE_URL` - URL publique
- ✅ `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Clé anon (conçue pour être publique)
- ✅ `EXPO_PUBLIC_RESEND_API_KEY` - Clé API Resend (publique)

### 2. Secrets Ne Doivent Pas Être dans `eas.json`

❌ **NE JAMAIS** mettre dans `eas.json` :
- `SUPABASE_SERVICE_ROLE_KEY` (utiliser EAS Secrets)
- Mots de passe
- Clés privées
- Tokens secrets

### 3. Le Fichier `.env` N'est Pas Utilisé par EAS Build

Le fichier `.env` local n'est **PAS** automatiquement inclus dans les builds EAS. C'est pourquoi vous devez configurer les variables dans `eas.json`.

### 4. Pas de Modification du Code Backend Nécessaire

Votre code backend utilise déjà `process.env.EXPO_PUBLIC_*`, donc il fonctionne automatiquement avec les deux méthodes (`.env` et `eas.json`).

---

## 📚 Structure Finale

```
dream-market/
├── .env                    # ✅ Développement local (ne pas commiter)
├── eas.json                # ✅ Builds EAS (à commiter)
└── src/
    └── backend/
        └── config/
            └── supabase.js # ✅ Utilise process.env.EXPO_PUBLIC_*
```

---

## 🎯 Résumé

1. ✅ **Toutes les variables sont ajoutées dans `eas.json`**
2. ✅ **Il suffit de remplacer `À_REMPLACER` par vos valeurs**
3. ✅ **Le backend fonctionne avec les deux méthodes (pas de modification nécessaire)**
4. ⚠️ **`SUPABASE_SERVICE_ROLE_KEY` doit être dans EAS Secrets (pas dans `eas.json`)**

---

**Date de création** : $(date)
**Version** : 1.0.1


