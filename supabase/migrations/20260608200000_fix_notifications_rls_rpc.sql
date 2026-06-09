-- Notifications cross-utilisateur (admin → fermier, fermier → admin)
-- Contourne RLS via SECURITY DEFINER, comme notify_admin_new_order

CREATE OR REPLACE FUNCTION public.create_app_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'::jsonb,
  p_order_id uuid DEFAULT NULL,
  p_priority integer DEFAULT 1
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification public.notifications%ROWTYPE;
  v_recipient_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Connexion requise';
  END IF;

  IF p_user_id IS NULL OR NULLIF(trim(p_type), '') IS NULL
     OR NULLIF(trim(p_title), '') IS NULL OR NULLIF(trim(p_message), '') IS NULL THEN
    RAISE EXCEPTION 'Paramètres notification invalides';
  END IF;

  SELECT p.role INTO v_recipient_role
  FROM public.profiles p
  WHERE p.id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Destinataire introuvable';
  END IF;

  -- Autorisé : notification pour soi-même, admin → n'importe qui, fermier → admin
  IF auth.uid() <> p_user_id
     AND NOT public.is_admin_user()
     AND NOT (
       public.is_farmer_user()
       AND v_recipient_role = 'admin'
     ) THEN
    RAISE EXCEPTION 'Non autorisé à créer cette notification';
  END IF;

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
  VALUES (
    p_user_id,
    p_order_id,
    trim(p_type),
    trim(p_title),
    trim(p_message),
    COALESCE(p_data, '{}'::jsonb),
    GREATEST(1, LEAST(COALESCE(p_priority, 1), 3)),
    false,
    false
  )
  RETURNING * INTO v_notification;

  RETURN to_jsonb(v_notification);
END;
$$;

REVOKE ALL ON FUNCTION public.create_app_notification(uuid, text, text, text, jsonb, uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_app_notification(uuid, text, text, text, jsonb, uuid, integer) TO authenticated, service_role;
