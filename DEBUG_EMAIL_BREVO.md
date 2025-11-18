# 🔍 Diagnostic Email Brevo - Problème d'envoi

## ✅ Modifications apportées

J'ai ajouté des **logs détaillés** dans `passwordResetService.js` pour identifier le problème.

## 📋 Étapes de diagnostic

### 1. Vérifier les logs dans la console

Quand vous testez la réinitialisation de mot de passe, regardez les logs dans la console. Vous devriez voir :

```
📧 [PasswordReset] Envoi email via Brevo...
📧 [PasswordReset] Destinataire: votre@email.com
📧 [PasswordReset] Expéditeur: dreamfield2000@gmail.com
📧 [PasswordReset] Clé API présente: Oui/Non
📧 [PasswordReset] Corps email préparé
📧 [PasswordReset] Statut réponse: 200 OK (ou erreur)
📧 [PasswordReset] Réponse Brevo complète: {...}
```

### 2. Problèmes possibles et solutions

#### ❌ Problème 1 : Clé API manquante

**Symptôme** : Log `❌ [PasswordReset] Clé API Brevo manquante ou non configurée`

**Solution** :
- Si vous testez en **development** : La clé est déjà dans `eas.json` (ligne 20)
- Si vous testez en **preview** ou **production** : Remplacez `"À_REMPLACER"` par votre clé Brevo dans `eas.json` (lignes 39 et 60)

```json
"EXPO_PUBLIC_BREVO_API_KEY": "VOTRE_CLE_API_BREVO_ICI"
```

**Important** : Après modification de `eas.json`, vous devez **reconstruire l'application** :
```bash
eas build --profile production --platform android
# ou
eas build --profile preview --platform android
```

#### ❌ Problème 2 : Email expéditeur non vérifié

**Symptôme** : 
- Log `❌ [PasswordReset] Erreur Brevo: invalid_parameter` ou message contenant "sender"
- Erreur : "Email expéditeur non vérifié dans Brevo"

**Solution** :
1. Connectez-vous à votre compte Brevo : https://app.brevo.com
2. Allez dans **Settings** → **Senders & IP**
3. Vérifiez que `dreamfield2000@gmail.com` est **vérifié** (statut "Verified")
4. Si ce n'est pas le cas :
   - Cliquez sur **Add a sender**
   - Entrez `dreamfield2000@gmail.com`
   - Vérifiez l'email en cliquant sur le lien dans l'email de confirmation

#### ❌ Problème 3 : Clé API invalide

**Symptôme** :
- Log `❌ [PasswordReset] Erreur Brevo: unauthorized`
- Statut réponse : `401 Unauthorized`

**Solution** :
1. Vérifiez que votre clé API Brevo est correcte dans `eas.json`
2. Dans Brevo : **Settings** → **SMTP & API** → **API Keys**
3. Vérifiez que la clé `Dream Market key` est **active**
4. Si nécessaire, créez une nouvelle clé et mettez à jour `eas.json`

#### ❌ Problème 4 : Email dans les spams

**Symptôme** :
- Log `✅ [PasswordReset] Email envoyé avec succès. MessageId: ...`
- Mais vous ne recevez pas l'email

**Solution** :
1. Vérifiez votre dossier **Spam/Indésirables**
2. Vérifiez que l'email destinataire est correct
3. Attendez quelques minutes (parfois Brevo met du temps à envoyer)

#### ❌ Problème 5 : Limite d'emails atteinte

**Symptôme** :
- Log avec erreur `quota` ou `limit`

**Solution** :
- Plan gratuit Brevo : 300 emails/jour
- Vérifiez votre quota dans Brevo : **Settings** → **Account** → **Usage**

## 🔧 Actions immédiates

1. **Vérifiez les logs** dans la console de votre application
2. **Vérifiez que l'email expéditeur est vérifié** dans Brevo
3. **Mettez à jour les clés** dans `preview` et `production` si vous testez ces environnements
4. **Reconstruisez l'application** si vous avez modifié `eas.json`

## 📝 Configuration actuelle

- **Email expéditeur** : `dreamfield2000@gmail.com` (ligne 43 de `passwordResetService.js`)
- **Clé API development** : ✅ Configurée
- **Clé API preview** : ❌ À configurer (ligne 39 de `eas.json`)
- **Clé API production** : ❌ À configurer (ligne 60 de `eas.json`)

## 🧪 Test rapide

Pour tester rapidement si Brevo fonctionne, vous pouvez utiliser cette commande curl :

```bash
curl -X POST 'https://api.brevo.com/v3/smtp/email' \
  -H 'api-key: VOTRE_CLE_API_BREVO_ICI' \
  -H 'Content-Type: application/json' \
  -d '{
    "sender": {
      "name": "Dream Market",
      "email": "dreamfield2000@gmail.com"
    },
    "to": [{"email": "VOTRE_EMAIL_TEST@example.com"}],
    "subject": "Test Brevo",
    "htmlContent": "<p>Test email</p>"
  }'
```

Remplacez `VOTRE_EMAIL_TEST@example.com` par votre email de test.

## 📞 Support

Si le problème persiste après avoir vérifié tous ces points, partagez :
1. Les logs complets de la console
2. La réponse Brevo complète (visible dans les logs)
3. Le statut de vérification de l'email expéditeur dans Brevo

