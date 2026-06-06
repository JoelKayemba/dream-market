-- Corrige l'upsert des tokens push et configure RLS pour les réglages applicatifs.
-- Peut être exécuté plusieurs fois dans Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (key, value, updated_at)
VALUES ('delivery_fee', '{"amount":0,"currency":"CDF"}'::jsonb, now())
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon, authenticated;

DROP POLICY IF EXISTS "app_settings_select_delivery_fee" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_admin_insert" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_admin_update" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_admin_delete" ON public.app_settings;

CREATE POLICY "app_settings_select_delivery_fee"
  ON public.app_settings
  FOR SELECT
  TO anon, authenticated
  USING (key = 'delivery_fee' OR public.is_admin_user());

CREATE POLICY "app_settings_admin_insert"
  ON public.app_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user());

CREATE POLICY "app_settings_admin_update"
  ON public.app_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "app_settings_admin_delete"
  ON public.app_settings
  FOR DELETE
  TO authenticated
  USING (public.is_admin_user());

CREATE OR REPLACE FUNCTION public.upsert_expo_push_token(p_token text, p_platform text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.user_push_tokens (user_id, expo_push_token, platform, updated_at)
  VALUES (auth.uid(), p_token, p_platform, now())
  ON CONFLICT (expo_push_token)
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    platform = EXCLUDED.platform,
    updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_expo_push_token(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_expo_push_token(text, text) TO authenticated;
