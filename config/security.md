# Règles de Sécurité - Dream Market

## ⚠️ Règles NON NÉGOCIABLES

### 1. Secrets et Variables d'environnement
- **AUCUN secret** ne doit être commité dans le repo
- **SEULEMENT** les variables préfixées `EXPO_PUBLIC_` sont autorisées
- Exemple : `EXPO_PUBLIC_SUPABASE_URL` ✅
- Exemple : `SUPABASE_SECRET_KEY` ❌

### 2. Stockage local
- **OBLIGATOIRE** : Utiliser `expo-secure-store` pour les données sensibles
- **INTERDIT** : `AsyncStorage` pour les données sensibles
- **INTERDIT** : `redux-persist` pour les données sensibles

### 3. Données utilisateur (PII)
- **MINIMUM** : Stocker uniquement le strict nécessaire
- **INTERDIT** : Stocker des mots de passe en clair
- **INTERDIT** : Stocker des informations bancaires
- **INTERDIT** : Stocker des documents d'identité

### 4. Logs et Debug
- **PRODUCTION** : Aucun log de données sensibles
- **DÉVELOPPEMENT** : Logs limités et contrôlés
- **INTERDIT** : Console.log avec des données utilisateur

## 🔐 Implémentation Sécurisée

### Variables d'environnement
```javascript
// ✅ CORRECT
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

// ❌ INCORRECT
const secretKey = "sk_1234567890abcdef";
```

### Stockage sécurisé
```javascript
// ✅ CORRECT - expo-secure-store
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('user_token', token);
const token = await SecureStore.getItemAsync('user_token');

// ❌ INCORRECT - AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('user_token', token);
```

### Validation des entrées
```javascript
// ✅ CORRECT - Validation et sanitization
const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};

// ❌ INCORRECT - Pas de validation
const processInput = (input) => {
  return input; // DANGEREUX !
};
```

## 🚨 Checklist de Sécurité

### Avant chaque commit
- [ ] Aucun secret dans le code
- [ ] Aucune clé API en dur
- [ ] Aucun mot de passe en clair
- [ ] Aucune URL de base de données en dur

### Avant chaque déploiement
- [ ] Variables d'environnement configurées
- [ ] Secrets gérés via les variables système
- [ ] Logs de production nettoyés
- [ ] Tests de sécurité passés

## 📱 Sécurité Mobile

### Permissions
- Demander uniquement les permissions nécessaires
- Expliquer pourquoi chaque permission est requise
- Gérer gracieusement le refus de permission

### Communication réseau
- Utiliser HTTPS uniquement
- Valider les certificats SSL
- Implémenter la validation des réponses API

### Stockage local
- Chiffrer les données sensibles si possible
- Nettoyer les données à la déconnexion
- Respecter la vie privée de l'utilisateur

## 🔒 Supabase (Futur)

### RLS (Row Level Security)
- Activer RLS sur toutes les tables
- Définir des politiques de sécurité strictes
- Tester les politiques avec différents rôles

### Authentification
- Utiliser l'auth Supabase intégré
- Implémenter la déconnexion automatique
- Gérer les tokens de manière sécurisée

### API Keys
- Utiliser des clés publiques côté client
- Limiter les permissions des clés
- Remplacer régulièrement les clés

## 📞 Contact Sécurité

En cas de problème de sécurité détecté :
1. **NE PAS** créer d'issue publique
2. **NE PAS** commiter de correction sans validation
3. **CONTACTER** l'équipe de sécurité en privé
4. **DOCUMENTER** le problème et la solution

---

**Rappel** : La sécurité est l'affaire de tous. Chaque développeur doit vérifier ses commits et respecter ces règles.






