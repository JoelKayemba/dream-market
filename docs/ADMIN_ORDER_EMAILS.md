# Emails admin pour les nouvelles commandes

Les emails de nouvelles commandes ne doivent plus être envoyés depuis l'application mobile ni utiliser `EXPO_PUBLIC_ADMIN_ORDER_EMAIL`.

## Principe

1. Une commande est insérée dans `public.orders`.
2. La RPC `notify_admin_new_order(order_id)` crée les notifications internes pour tous les profils `role = 'admin'`.
3. Un Database Webhook Supabase appelle l'Edge Function `send-order-admin-email`.
4. L'Edge Function lit les admins dans `public.profiles` via `get_admin_order_email_recipients()`.
5. Brevo envoie un email à tous les admins dont `receive_order_emails = true`.

## Migration à exécuter

Exécuter :

`supabase/migrations/20260606153000_admin_order_email_recipients.sql`

Cette migration ajoute :

- `profiles.receive_order_emails`
- `get_admin_order_email_recipients()`
- `notify_admin_new_order(order_id)`

## Secrets Supabase à configurer

Dans Supabase :

```bash
supabase secrets set ORDER_EMAIL_WEBHOOK_SECRET="une-valeur-longue-et-secrete"
supabase secrets set BREVO_COMMANDE_API_KEY="xkeysib-..."
supabase secrets set BREVO_SENDER_EMAIL="noreply@votre-domaine.com"
```

Supabase fournit déjà généralement :

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Déployer l'Edge Function

```bash
supabase functions deploy send-order-admin-email
```

## Créer le Database Webhook

Dans Supabase Dashboard :

1. Aller dans **Database > Webhooks**.
2. Créer un webhook sur la table `public.orders`.
3. Événement : `INSERT`.
4. Type : HTTP Request.
5. URL :

```text
https://<PROJECT_REF>.supabase.co/functions/v1/send-order-admin-email
```

6. Ajouter le header :

```text
x-webhook-secret: la_meme_valeur_que_ORDER_EMAIL_WEBHOOK_SECRET
```

## Gérer les destinataires

Un admin reçoit les emails si :

- `profiles.role = 'admin'`
- `profiles.email` est renseigné
- `profiles.receive_order_emails = true`

Pour désactiver les emails d'un admin :

```sql
UPDATE public.profiles
SET receive_order_emails = false
WHERE email = 'admin@example.com';
```

## Variables à retirer de l'app mobile

À terme, retirer du `.env` de l'app :

- `EXPO_PUBLIC_ADMIN_ORDER_EMAIL`
- `EXPO_PUBLIC_BREVO_COMMANDE_API_KEY`
- `EXPO_PUBLIC_BREVO_API_KEY` si elle ne sert qu'aux emails serveur

Une clé Brevo ne doit pas être exposée en `EXPO_PUBLIC_*` dans une application mobile.
