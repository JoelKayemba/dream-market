# ✅ Vérification Brevo - Checklist

## 🔍 Problème : Message "envoyé" mais email non reçu

Si vous voyez le message "Code envoyé" mais ne recevez pas l'email, suivez cette checklist :

## 1. ✅ Vérifier l'email expéditeur dans Brevo

**C'EST LE PROBLÈME LE PLUS FRÉQUENT !**

1. Connectez-vous à Brevo : https://app.brevo.com
2. Allez dans **Settings** → **Senders & IP**
3. Cherchez `dreamfield2000@gmail.com`
4. **Vérifiez le statut** :
   - ✅ **"Verified"** = OK, vous pouvez envoyer
   - ❌ **"Pending"** = Vous devez vérifier l'email
   - ❌ **"Not verified"** = Ajoutez et vérifiez l'email

### Comment vérifier un email expéditeur :

1. Cliquez sur **"Add a sender"** (si l'email n'existe pas)
2. Entrez `dreamfield2000@gmail.com`
3. Cliquez sur **"Send verification email"**
4. Ouvrez votre boîte mail `dreamfield2000@gmail.com`
5. Cliquez sur le lien de vérification dans l'email Brevo
6. Le statut passera à **"Verified"**

**⚠️ IMPORTANT** : Sans email vérifié, Brevo n'enverra PAS les emails, même si l'API retourne un succès !

## 2. ✅ Vérifier les logs dans la console

Quand vous testez, regardez les logs. Vous devriez voir :

```
✅ [PasswordReset] Clé API Brevo chargée depuis (.env ou eas.json - dev)
📧 [PasswordReset] Envoi email via Brevo...
📧 [PasswordReset] Destinataire: votre@email.com
📧 [PasswordReset] Statut réponse: 201 Created
✅ [PasswordReset] Email accepté par Brevo
```

### Si vous voyez une erreur :

- **400 Bad Request** → Email expéditeur non vérifié (voir point 1)
- **401 Unauthorized** → Clé API invalide (voir point 3)
- **201 Created** mais pas d'email → Vérifiez les spams (voir point 4)

## 3. ✅ Vérifier la clé API Brevo

1. Dans Brevo : **Settings** → **SMTP & API** → **API Keys**
2. Vérifiez que votre clé `Dream Market key` est **Active**
3. Si elle est inactive ou expirée, créez-en une nouvelle
4. Mettez à jour la clé dans :
   - `.env` : `EXPO_PUBLIC_BREVO_API_KEY=xkeysib-...`
   - `eas.json` : Remplacez `"À_REMPLACER"` dans les profils `preview` et `production`

## 4. ✅ Vérifier les spams

- Ouvrez votre dossier **Spam/Indésirables**
- Cherchez un email de `dreamfield2000@gmail.com` ou `Dream Market`
- Si trouvé, marquez-le comme "Non spam" pour les prochains emails

## 5. ✅ Vérifier le quota Brevo

Plan gratuit : **300 emails/jour**

1. Dans Brevo : **Settings** → **Account** → **Usage**
2. Vérifiez que vous n'avez pas dépassé la limite
3. Si limite atteinte, attendez le lendemain ou passez à un plan payant

## 6. ✅ Tester avec curl (optionnel)

Pour tester directement l'API Brevo :

```bash
curl -X POST 'https://api.brevo.com/v3/smtp/email' \
  -H 'api-key: xkeysib-VOTRE_CLE' \
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

Remplacez :
- `VOTRE_CLE` par votre clé API Brevo
- `VOTRE_EMAIL_TEST@example.com` par votre email de test

### Réponse attendue :

**Succès (201)** :
```json
{
  "messageId": "xxxxx-xxxxx-xxxxx"
}
```

**Erreur (400)** - Email non vérifié :
```json
{
  "code": "invalid_parameter",
  "message": "Invalid sender email"
}
```

## 7. ✅ Vérifier dans Brevo → Statistics

1. Dans Brevo : **Statistics** → **Email Activity**
2. Vérifiez si vos emails apparaissent dans l'historique
3. Si oui, regardez le statut :
   - **Delivered** = Email livré (vérifiez les spams)
   - **Bounced** = Email rejeté (adresse invalide)
   - **Opened** = Email ouvert (fonctionne !)

## 📋 Checklist rapide

- [ ] Email expéditeur `dreamfield2000@gmail.com` vérifié dans Brevo (statut "Verified")
- [ ] Clé API Brevo active et correcte dans `.env` et `eas.json`
- [ ] Quota Brevo non dépassé (300 emails/jour en gratuit)
- [ ] Dossier spam vérifié
- [ ] Logs console vérifiés (pas d'erreur 400/401)
- [ ] Test avec curl réussi (optionnel)

## 🆘 Si le problème persiste

Partagez avec moi :
1. Les logs complets de la console (tous les messages `📧 [PasswordReset]`)
2. La réponse complète de Brevo (visible dans les logs)
3. Le statut de l'email expéditeur dans Brevo (Verified/Pending/Not verified)
4. Le résultat du test curl (si vous l'avez fait)

## 💡 Solution la plus probable

**Dans 90% des cas, le problème est que l'email expéditeur n'est pas vérifié dans Brevo.**

Vérifiez d'abord le point 1, c'est généralement ça !

