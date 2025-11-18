# 🔍 Vérification des Variables d'Environnement

## 📋 Variables Actuelles dans votre `.env`

```bash
EXPO_PUBLIC_APP_VERSION=1.0.0
ENVIRONNEMENT=development
NAME=Dream Market
```

## ⚠️ Problèmes Identifiés

### 1. ❌ **Version Incohérente**

**Dans votre `.env`** :
```
EXPO_PUBLIC_APP_VERSION=1.0.0
```

**Dans `app.json`** :
```json
"version": "1.0.1"
```

**Problème** : La version dans `.env` (1.0.0) ne correspond pas à la version dans `app.json` (1.0.1).

**Solution** : Mettre à jour `.env` :
```bash
EXPO_PUBLIC_APP_VERSION=1.0.1
```

---

### 2. ⚠️ **Variable `ENVIRONNEMENT` Non Utilisée**

**Dans votre `.env`** :
```
ENVIRONNEMENT=development
```

**Problème** : Cette variable n'est pas utilisée dans le code. Le code utilise `__DEV__` pour détecter l'environnement de développement.

**Recommandation** : 
- Soit supprimer cette variable si elle n'est pas nécessaire
- Soit l'utiliser dans le code si vous voulez un contrôle explicite de l'environnement

**Note** : Pour Expo, utilisez plutôt `EXPO_PUBLIC_ENVIRONMENT` si vous voulez l'utiliser dans le code.

---

### 3. ⚠️ **Variable `NAME` Non Utilisée**

**Dans votre `.env`** :
```
NAME=Dream Market
```

**Dans `app.json`** :
```json
"name": "Dream Market"
```

**Problème** : Cette variable n'est pas utilisée dans le code. Le nom est défini directement dans `app.json`.

**Recommandation** : Supprimer cette variable du `.env` car elle n'est pas utilisée.

---

### 4. ❌ **Variables Manquantes Critiques**

Votre `.env` ne contient **PAS** les variables suivantes qui sont **NÉCESSAIRES** pour le fonctionnement de l'application :

#### **Variables Supabase (OBLIGATOIRES)** :
```bash
EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

**Impact** : Sans ces variables, l'application **ne fonctionnera pas** car Supabase est utilisé pour :
- L'authentification
- La base de données
- Le stockage de fichiers
- Les notifications

#### **Variable Resend (Optionnelle mais Recommandée)** :
```bash
EXPO_PUBLIC_RESEND_API_KEY=votre_clé_resend
```

**Impact** : Sans cette variable, la réinitialisation de mot de passe par email ne fonctionnera pas.

#### **Variables de Stockage (Optionnelles)** :
```bash
EXPO_PUBLIC_STORAGE_BUCKET_FARMS=farm-images
EXPO_PUBLIC_STORAGE_BUCKET_PRODUCTS=product-images
EXPO_PUBLIC_STORAGE_BUCKET_SERVICES=service-images
EXPO_PUBLIC_STORAGE_BUCKET_AVATARS=user-avatars
```

**Impact** : Ces variables ont des valeurs par défaut, mais il est recommandé de les définir explicitement.

---

## ✅ Configuration Recommandée

Voici un fichier `.env` complet et correct :

```bash
# Version de l'application (doit correspondre à app.json)
EXPO_PUBLIC_APP_VERSION=1.0.1

# Environnement (optionnel, utilisez __DEV__ dans le code)
EXPO_PUBLIC_ENVIRONMENT=development

# Configuration Supabase (OBLIGATOIRE)
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_ici

# Configuration Resend pour les emails (Recommandé)
EXPO_PUBLIC_RESEND_API_KEY=votre_clé_resend_ici

# Configuration des buckets de stockage (Optionnel)
EXPO_PUBLIC_STORAGE_BUCKET_FARMS=farm-images
EXPO_PUBLIC_STORAGE_BUCKET_PRODUCTS=product-images
EXPO_PUBLIC_STORAGE_BUCKET_SERVICES=service-images
EXPO_PUBLIC_STORAGE_BUCKET_AVATARS=user-avatars
```

---

## 📝 Checklist de Vérification

- [ ] `EXPO_PUBLIC_APP_VERSION` correspond à la version dans `app.json` (1.0.1)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` est défini et correct
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` est défini et correct
- [ ] `EXPO_PUBLIC_RESEND_API_KEY` est défini (si vous utilisez la réinitialisation par email)
- [ ] Les variables de stockage sont définies (optionnel)

---

## 🚨 Actions Immédiates Requises

1. **Mettre à jour la version** :
   ```bash
   EXPO_PUBLIC_APP_VERSION=1.0.1
   ```

2. **Ajouter les variables Supabase** (OBLIGATOIRE) :
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=votre_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé
   ```

3. **Supprimer les variables inutiles** (optionnel) :
   - `NAME=Dream Market` (non utilisée)
   - `ENVIRONNEMENT=development` (remplacer par `EXPO_PUBLIC_ENVIRONMENT` si nécessaire)

---

## 📚 Où Trouver les Valeurs

### Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Resend
1. Allez sur [resend.com](https://resend.com)
2. Créez un compte ou connectez-vous
3. Allez dans **API Keys**
4. Créez une nouvelle clé → `EXPO_PUBLIC_RESEND_API_KEY`

---

## ⚠️ Sécurité

**IMPORTANT** :
- ✅ Les variables `EXPO_PUBLIC_*` sont **publiques** et seront incluses dans le bundle
- ❌ **NE JAMAIS** mettre de secrets dans les variables `EXPO_PUBLIC_*`
- ✅ Utiliser `expo-secure-store` pour les données sensibles
- ✅ Ne jamais commiter le fichier `.env` dans Git

**Fichier `.gitignore` doit contenir** :
```
.env
.env.local
.env.*.local
```

---

**Date de vérification** : $(date)
**Version app.json** : 1.0.1


