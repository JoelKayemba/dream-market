# 📧 Configuration Email avec Domaine Brevo

## ✅ Modifications effectuées

Le code a été mis à jour pour utiliser un email avec votre domaine au lieu de `dreamfield2000@gmail.com`.

## 🔧 Configuration requise

### 1. Ajouter l'email dans votre fichier `.env`

Ajoutez cette ligne dans votre fichier `.env` :

```env
EXPO_PUBLIC_BREVO_SENDER_EMAIL=noreply@votredomaine.com
```

**Remplacez `noreply@votredomaine.com` par votre email réel avec votre domaine.**

Exemples :
- `noreply@dreammarket.com`
- `contact@dreammarket.com`
- `support@dreammarket.com`
- `no-reply@dreammarket.com`

### 2. Mettre à jour `eas.json`

Dans le fichier `eas.json`, remplacez `"noreply@votredomaine.com"` par votre email réel dans les 3 profils :

- **development** (ligne ~21)
- **preview** (ligne ~40)
- **production** (ligne ~61)

Exemple :
```json
"EXPO_PUBLIC_BREVO_SENDER_EMAIL": "noreply@dreammarket.com"
```

### 3. Vérifier l'email dans Brevo

**IMPORTANT** : L'email doit être vérifié dans Brevo avant de pouvoir envoyer des emails.

1. Connectez-vous à Brevo : https://app.brevo.com
2. Allez dans **Settings** → **Senders & IP**
3. Vérifiez que votre email avec domaine est présent et a le statut **"Verified"**
4. Si ce n'est pas le cas :
   - Si vous avez ajouté un domaine, Brevo devrait automatiquement vérifier tous les emails de ce domaine
   - Sinon, ajoutez l'email manuellement et vérifiez-le

## 📝 Comment ça fonctionne

Le code utilise maintenant cette logique :

1. **Priorité 1** : Variable `EXPO_PUBLIC_BREVO_SENDER_EMAIL` depuis `.env` ou `eas.json`
2. **Priorité 2** : Valeur par défaut dans le code (`noreply@dreammarket.app`)

**Recommandation** : Utilisez toujours la variable d'environnement pour plus de flexibilité.

## ✅ Checklist

- [ ] Email ajouté dans `.env` : `EXPO_PUBLIC_BREVO_SENDER_EMAIL=votre@email.com`
- [ ] Email mis à jour dans `eas.json` pour les 3 profils (development, preview, production)
- [ ] Email vérifié dans Brevo (Settings → Senders & IP → statut "Verified")
- [ ] Test d'envoi d'email effectué

## 🧪 Test

Après configuration, testez la réinitialisation de mot de passe. Les logs devraient afficher :

```
📧 [PasswordReset] Expéditeur: noreply@votredomaine.com
```

Si vous voyez une erreur concernant l'email expéditeur, vérifiez qu'il est bien vérifié dans Brevo.

## 💡 Avantages d'utiliser un domaine

- ✅ Meilleure délivrabilité (moins de spams)
- ✅ Image plus professionnelle
- ✅ Pas besoin de vérifier chaque email individuellement (si le domaine est vérifié)
- ✅ Plus de crédibilité auprès des utilisateurs

