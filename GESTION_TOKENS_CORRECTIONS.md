# 🔐 Corrections de la Gestion des Tokens et Session

## 📌 Problèmes Identifiés et Résolus

### 1. ❌ Double Stockage des Tokens
**Problème :** Les tokens étaient stockés manuellement dans AsyncStorage en plus du stockage automatique de Supabase, créant des incohérences.

**Solution :** Suppression complète du stockage manuel. Supabase gère tout automatiquement avec `persistSession: true`.

**Fichiers modifiés :**
- `src/store/authSlice.js` : Suppression des appels `AsyncStorage.setItem/removeItem`
- `src/backend/services/authListenerService.js` : Simplification des handlers

---

### 2. ❌ Listener d'Auth State Non Actif
**Problème :** Le listener `onAuthStateChange` n'était jamais démarré, empêchant le rafraîchissement automatique du token.

**Solution :** Démarrage du listener dans `App.js` au montage de l'application.

**Fichiers modifiés :**
- `App.js` : Ajout du listener dans `useEffect`

---

### 3. ❌ Vérification Incorrecte dans loadStoredAuth
**Problème :** Comparaison redondante entre token stocké manuellement et token Supabase.

**Solution :** Simplification pour utiliser uniquement `supabase.auth.getSession()`.

**Fichiers modifiés :**
- `src/store/authSlice.js` : Simplification de `loadStoredAuth`

---

## ✅ Ce Qui Fonctionne Maintenant

### 1. **Persistance de Session**
```javascript
// Configuration dans supabase.js
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,          // ✓ Stockage persistant
    autoRefreshToken: true,          // ✓ Refresh automatique
    persistSession: true,            // ✓ Session sauvegardée
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
```

### 2. **Rafraîchissement Automatique du Token**
- Supabase rafraîchit automatiquement le token avant expiration
- Le listener `TOKEN_REFRESHED` met à jour Redux
- Pas d'intervention manuelle nécessaire

### 3. **Chargement de Session au Démarrage**
- `App.js` vérifie la session au démarrage
- Si valide, charge l'utilisateur dans Redux
- Si expirée, Supabase tente de la rafraîchir automatiquement

---

## 🔍 Vérifications à Faire dans Supabase

### 1. **Configuration de l'Auth**
Vérifiez dans votre dashboard Supabase : **Authentication > Settings**

#### ✅ JWT Expiration
```
Access Token Lifetime (JWT expiry): 3600 secondes (1 heure)
Refresh Token Lifetime: 2592000 secondes (30 jours)
```

**Recommandation :**
- Si vous voulez que l'utilisateur reste connecté plus longtemps entre les utilisations :
  - Augmentez le `Refresh Token Lifetime` (ex: 90 jours)
  - L'Access Token peut rester court (1h) car il se rafraîchit auto

#### ✅ JWT Settings
Dans **Settings > API Settings** :
```
JWT Secret: [Auto-généré par Supabase]
JWT Expiry Limit: 3600 (1 heure par défaut)
```

---

### 2. **Vérifier les Politiques RLS (Row Level Security)**

Dans **Database > Tables > profiles** :

```sql
-- Politique pour permettre à l'utilisateur de lire son profil
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Politique pour permettre à l'utilisateur de modifier son profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

**⚠️ Important :** Si les politiques RLS ne sont pas correctes, même avec un token valide, l'utilisateur ne pourra pas accéder à ses données !

---

### 3. **Vérifier la Configuration Email (si nécessaire)**

Si vous utilisez la confirmation par email :

#### Dans **Authentication > Settings > Email Templates** :
- Vérifiez que les templates sont configurés
- Testez l'envoi d'emails

#### Dans **Authentication > Settings > Auth Providers** :
```
Enable Email provider: ✓ Activé
Confirm email: ☐ (Désactivé si vous voulez connexion immédiate)
               ☑ (Activé si vous voulez confirmation obligatoire)
```

---

### 4. **Tester la Durée de Session**

Pour tester si la session persiste correctement :

1. **Connexion et Fermeture Immédiate**
   ```bash
   - Connectez-vous à l'app
   - Fermez complètement l'app (pas juste minimiser)
   - Rouvrez immédiatement
   - ✓ Devrait être connecté
   ```

2. **Connexion et Attente de 2 heures**
   ```bash
   - Connectez-vous à l'app
   - Fermez l'app
   - Attendez 2 heures (après expiration du token)
   - Rouvrez l'app
   - ✓ Devrait se rafraîchir automatiquement et rester connecté
   ```

3. **Connexion et Attente de 31+ jours**
   ```bash
   - Connectez-vous à l'app
   - Fermez l'app
   - Attendez 31+ jours (après expiration du refresh token)
   - Rouvrez l'app
   - ✓ Devrait demander une nouvelle connexion
   ```

---

## 🛠️ Commandes de Debug

### Vérifier la Session Active
```javascript
// Dans votre app, ajoutez temporairement ce code pour debug :
const { data: { session }, error } = await supabase.auth.getSession();
console.log('Session active:', session);
console.log('Access token expiry:', new Date(session?.expires_at * 1000));
```

### Forcer le Rafraîchissement du Token
```javascript
const { data, error } = await supabase.auth.refreshSession();
console.log('Nouvelle session:', data.session);
```

---

## 📊 Supabase Dashboard - Requêtes SQL Utiles

### 1. Vérifier tous les profils
```sql
SELECT id, email, role, first_name, last_name, created_at 
FROM profiles 
ORDER BY created_at DESC;
```

### 2. Vérifier les sessions actives (si stockées)
```sql
SELECT * FROM auth.sessions 
WHERE user_id = 'votre-user-id' 
ORDER BY created_at DESC;
```

### 3. Vérifier les tokens de refresh
```sql
SELECT id, user_id, token, created_at, updated_at
FROM auth.refresh_tokens
WHERE user_id = 'votre-user-id';
```

---

## 🔧 Configuration Recommandée pour Votre Cas d'Usage

### Pour une application mobile de marketplace :

```javascript
// Dans votre dashboard Supabase > Authentication > Settings

JWT Expiry: 3600 (1 heure)
✓ Assez court pour la sécurité

Refresh Token Lifetime: 7776000 (90 jours)
✓ Permet de rester connecté pendant 3 mois

Enable Refresh Token Rotation: ✓ Activé
✓ Plus sécurisé

Auto Confirm Users: ✓ (Si vous ne voulez pas d'email de confirmation)
☐ (Si vous voulez vérifier les emails)
```

---

## 🚀 Prochaines Étapes

1. **Tester l'application** :
   - Connectez-vous
   - Fermez et rouvrez l'app plusieurs fois
   - Attendez quelques heures et rouvrez

2. **Vérifier les logs** :
   - Dans Expo : `npx expo start`
   - Surveillez les messages d'auth
   - Vérifiez qu'il n'y a pas d'erreurs de token

3. **Ajuster les durées de token** :
   - Si les utilisateurs se déconnectent trop souvent → Augmenter Refresh Token Lifetime
   - Si préoccupations de sécurité → Diminuer JWT Expiry

---

## ⚠️ Points d'Attention

### 1. **Ne jamais stocker manuellement les tokens**
- Supabase le fait automatiquement
- Le stockage manuel crée des incohérences

### 2. **Toujours vérifier les politiques RLS**
- Token valide ≠ accès aux données
- Les politiques RLS doivent être correctes

### 3. **Tester sur un vrai appareil**
- L'émulateur peut avoir un comportement différent
- Testez sur Android et iOS si possible

---

## 📝 Résumé des Modifications

| Fichier | Changement | Raison |
|---------|-----------|--------|
| `authSlice.js` | Suppression AsyncStorage dans login/register/logout | Doublon avec Supabase |
| `authSlice.js` | Simplification de `loadStoredAuth` | Enlever comparaison redondante |
| `authListenerService.js` | Suppression stockage manuel | Doublon avec Supabase |
| `App.js` | Ajout du listener d'auth state | Détecter TOKEN_REFRESHED |

---

## 🎯 Résultat Attendu

Après ces modifications :
- ✅ L'utilisateur reste connecté après fermeture de l'app
- ✅ Le token se rafraîchit automatiquement avant expiration
- ✅ L'utilisateur est déconnecté uniquement après expiration du refresh token (30-90 jours)
- ✅ Pas de stockage manuel conflictuel
- ✅ Gestion propre et conforme aux best practices Supabase

---

**Date de création :** $(date)
**Problème résolu :** Déconnexion après fermeture et réouverture de l'app après un long moment


