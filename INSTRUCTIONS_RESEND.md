# 📧 Configuration Resend pour Envoi d'Emails

## 🚀 Étape par Étape

### 1. Créer un Compte Resend (Gratuit)

1. Aller sur **https://resend.com/signup**
2. S'inscrire avec votre email
3. Vérifier l'email de confirmation
4. Se connecter

### 2. Obtenir la Clé API

1. Dans le dashboard Resend → **API Keys**
2. Cliquer sur **"Create API Key"**
3. Nom : `Dream Market`
4. Permission : **Sending access**
5. Cliquer sur **"Create"**
6. **Copier la clé** (ex: `re_abc123def456xyz`)

### 3. Ajouter la Clé dans .env

**Créer ou modifier le fichier `.env` à la racine du projet :**

```env
EXPO_PUBLIC_RESEND_API_KEY=re_VOTRE_CLE_ICI
```

**Remplacer `re_VOTRE_CLE_ICI` par votre vraie clé Resend**

### 4. Remplacer passwordResetService.js

**Remplacer TOUT le contenu de `src/backend/services/passwordResetService.js` par le code dans le fichier `passwordResetService_AVEC_EMAIL.js`**

### 5. Redémarrer l'Application

```bash
# Arrêter Metro (Ctrl+C)
# Relancer avec reset cache
npm start -- --reset-cache

# Dans un autre terminal
npm run android
```

---

## 🧪 Tester

### 1. Dans l'App

1. Aller sur **"Mot de passe oublié"**
2. Entrer votre **vrai email** (celui que vous consultez)
3. Cliquer sur **"Recevoir le code"**
4. ✅ Message "Code envoyé"
5. **Vérifier votre boîte mail** (inbox + spams)

### 2. Email Reçu

Vous devriez recevoir un email avec :
- ✅ Header vert "Dream Market"
- ✅ Code à 6 chiffres dans un cadre vert
- ✅ Message clair
- ✅ Footer

### 3. Utiliser le Code

1. Copier le code depuis l'email
2. Retourner dans l'app
3. Entrer le code + nouveau mot de passe
4. Cliquer "Réinitialiser"
5. ✅ Succès !

---

## 📊 Limites Gratuites Resend

- ✅ **3000 emails/mois** gratuits
- ✅ **100 emails/jour** max
- ✅ Domaine de test : `onboarding@resend.dev`
- ✅ Support de votre propre domaine (gratuit)

---

## 🔧 Configurer Votre Propre Domaine (Optionnel)

### Si vous avez un domaine (ex: dreammarket.com)

1. Dans Resend → **Domains** → **Add Domain**
2. Entrer votre domaine : `dreammarket.com`
3. Ajouter les **DNS records** fournis par Resend
4. Attendre la vérification (~24h max)
5. Changer `from:` dans le code :
   ```javascript
   from: 'Dream Market <noreply@dreammarket.com>'
   ```

---

## ⚠️ Dépannage

### Email pas reçu ?

1. **Vérifier les spams/promotions**
2. **Vérifier les logs console :**
   ```
   ✅ [passwordResetService] Email envoyé avec succès via Resend
   ```
3. **Vérifier la clé API** dans `.env`
4. **Vérifier dans Resend Dashboard → Logs**

### Erreur "Unauthorized" ?

**Cause :** Clé API incorrecte ou manquante

**Solution :**
- Vérifier que la clé est bien dans `.env`
- Redémarrer Metro pour recharger les variables d'environnement

### Erreur "Rate limit" ?

**Cause :** Trop d'emails envoyés (100/jour en gratuit)

**Solution :**
- Attendre 24h
- Ou passer au plan payant Resend

---

## 🎯 Récapitulatif

### Checklist

- [ ] Compte Resend créé
- [ ] Clé API obtenue
- [ ] Clé ajoutée dans `.env`
- [ ] `passwordResetService.js` remplacé
- [ ] App redémarrée
- [ ] Test : demander un code
- [ ] Email reçu dans boîte mail
- [ ] Code fonctionnel

---

## 💡 Alternative : Gmail (Si pas de Resend)

Si vous préférez utiliser Gmail :

1. Créer un mot de passe d'application Gmail
2. Remplacer l'URL Resend par un service SMTP
3. Ou utiliser Supabase Edge Functions (plus complexe)

---

**Suivez les instructions dans `INSTRUCTIONS_RESEND.md` pour configurer l'envoi d'email ! 📧**

**Le code complet est dans `passwordResetService_AVEC_EMAIL.js` ! 🚀**

