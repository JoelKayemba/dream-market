-- Source de vérité pour les admins qui reçoivent les emails de nouvelles commandes.
-- À exécuter dans Supabase SQL Editor ou via les migrations Supabase.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS receive_order_emails boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.receive_order_emails IS
  'Si true, un profil admin reçoit les emails de notification pour les nouvelles commandes.';

CREATE INDEX IF NOT EXISTS idx_profiles_admin_order_email_recipients
  ON public.profiles (role, email)
  WHERE role = 'admin'
    AND receive_order_emails = true
    AND email IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_admin_order_email_recipients()
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    p.id AS user_id,
    p.email,
    NULLIF(
      trim(concat_ws(' ', p.first_name, p.last_name)),
      ''
    ) AS full_name
  FROM public.profiles p
  WHERE p.role = 'admin'
    AND p.receive_order_emails = true
    AND p.email IS NOT NULL
    AND btrim(p.email) <> '';
$$;

REVOKE ALL ON FUNCTION public.get_admin_order_email_recipients() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_order_email_recipients() TO service_role;

-- Fonction utilisée par l'app après création d'une commande pour créer les notifications in-app.
-- L'email, lui, doit être envoyé par l'Edge Function `send-order-admin-email`.
-- DROP nécessaire si une ancienne fonction avait le même type d'argument mais un nom de paramètre différent.
DROP FUNCTION IF EXISTS public.notify_admin_new_order(uuid);

CREATE FUNCTION public.notify_admin_new_order(order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    order_id,
    type,
    title,
    message,
    data,
    priority,
    is_read,
    is_sent
  )
  SELECT
    p.id,
    o.id,
    'admin_new_order',
    'Nouvelle commande reçue',
    concat(
      'Commande #',
      coalesce(o.order_number, left(o.id::text, 8)),
      CASE
        WHEN coalesce(o.customer_first_name, o.customer_last_name, o.customer_email) IS NOT NULL
          THEN concat(
            ' de ',
            nullif(
              trim(concat_ws(' ', o.customer_first_name, o.customer_last_name)),
              ''
            )
          )
        ELSE ''
      END
    ),
    jsonb_build_object(
      'order_id', o.id,
      'order_number', o.order_number,
      'customer_name', nullif(trim(concat_ws(' ', o.customer_first_name, o.customer_last_name)), ''),
      'customer_email', o.customer_email,
      'totals', o.totals,
      'priority', 2,
      'adminAction', true
    ),
    2,
    false,
    false
  FROM public.orders o
  JOIN public.profiles p ON p.role = 'admin'
  WHERE o.id = order_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.notifications n
      WHERE n.user_id = p.id
        AND n.order_id = o.id
        AND n.type = 'admin_new_order'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.notify_admin_new_order(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_admin_new_order(uuid) TO authenticated, service_role;
