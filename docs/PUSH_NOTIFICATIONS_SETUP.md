# Notifications push (Supabase + Expo)

## Ce qui a été ajouté dans le repo

- **SQL** : `supabase/migrations/20260216120000_user_push_tokens.sql` — table `user_push_tokens`, RLS, fonction RPC `upsert_expo_push_token` (changement de compte sur le même appareil).
- **Edge Function** : `supabase/functions/send-push-notification` — appelée par un **Database Webhook** sur `INSERT` dans `notifications`, envoi vers l’API Expo Push, puis `is_sent = true`.
- **App** : `src/backend/services/pushTokenService.js` + enregistrement dans `NotificationManager` ; les hooks ne font plus de `scheduleNotificationAsync` pour les lignes « non envoyées ».

---

## À faire de ton côté (checklist)

### 1. Supabase — SQL

1. Ouvre **SQL Editor** dans le dashboard Supabase.
2. Copie-colle le contenu de `supabase/migrations/20260216120000_user_push_tokens.sql` et exécute-le une fois.

### 2. Expo — jeton d’accès (recommandé)

1. Sur [expo.dev](https://expo.dev), ouvre le projet **Dream Market** (même `projectId` que dans `app.json` → `extra.eas.projectId`).
2. Crée un **access token** si besoin (paramètres du compte / tokens).
3. Tu le mettras en secret Supabase à l’étape 4 sous le nom `EXPO_ACCESS_TOKEN`.

### 3. Supabase CLI — déployer la fonction

Dans le dossier du projet (avec [Supabase CLI](https://supabase.com/docs/guides/cli) installée) :

```bash
supabase login
supabase link --project-ref TON_PROJECT_REF
```

Puis secrets (choisis une valeur longue et aléatoire pour le webhook) :

```bash
supabase secrets set PUSH_WEBHOOK_SECRET="une-chaine-secrete-longue" EXPO_ACCESS_TOKEN="ton-token-expo-optionnel"
supabase functions deploy send-push-notification
```

Le fichier `supabase/config.toml` définit `verify_jwt = false` pour cette fonction (le webhook DB n’envoie pas de JWT utilisateur).

### 4. Supabase — Database Webhook

1. **Database** → **Webhooks** → **Create a new hook**.
2. **Table** : `public.notifications`.
3. **Events** : **Insert** (au minimum).
4. **URL** :  
   `https://TON_PROJECT_REF.supabase.co/functions/v1/send-push-notification`
5. **HTTP Headers** : ajoute  
   `x-webhook-secret` = **la même valeur** que `PUSH_WEBHOOK_SECRET`.
6. Méthode **POST**, corps JSON selon le format webhook Supabase (souvent envoyé automatiquement avec `record`).

### 5. Build mobile

Les push **ne sont pas fiables dans Expo Go** (surtout Android récent). Utilise un **development build** ou **EAS Build** :

```bash
eas build --profile development --platform ios
# ou android
```

### 6. Test rapide

1. Installe le build, connecte-toi (pour enregistrer le jeton via RPC).
2. Vérifie dans Supabase **Table Editor** → `user_push_tokens` qu’une ligne apparaît.
3. Insère une ligne de test dans `notifications` pour ton `user_id` (comme le fait déjà `notificationService.createNotification`).
4. Tu dois recevoir une notification système même avec l’app en arrière-plan.

---

## Dépannage

| Problème | Piste |
|----------|--------|
| 401 sur la fonction | Header `x-webhook-secret` absent ou différent du secret. |
| 503 « Server misconfigured » | Secret `PUSH_WEBHOOK_SECRET` non défini sur le projet Supabase. |
| Pas de notification mais `is_sent` passe à true | Aucune ligne dans `user_push_tokens` pour cet utilisateur (permissions refusées ou pas de build natif). |
| Erreurs Expo dans les logs de la fonction | Vérifier `EXPO_ACCESS_TOKEN` et le format des messages sur la doc Expo Push. |
