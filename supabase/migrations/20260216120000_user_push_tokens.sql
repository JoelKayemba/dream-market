-- Tokens Expo Push par utilisateur (App → Supabase → Edge Function → Expo Push API)
-- Exécuter ce fichier dans Supabase : SQL Editor → New query → Run

CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  expo_push_token text NOT NULL,
  platform text NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_push_tokens_expo_token_unique UNIQUE (expo_push_token)
);

CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON public.user_push_tokens (user_id);

ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_push_tokens_select_own"
  ON public.user_push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_push_tokens_insert_own"
  ON public.user_push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_push_tokens_update_own"
  ON public.user_push_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_push_tokens_delete_own"
  ON public.user_push_tokens FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_push_tokens IS 'Jetons Expo Push enregistrés par l’app ; utilisés par send-push-notification Edge Function.';

-- Réassocier un même jeton physique à auth.uid() (changement de compte sur l’appareil)
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
  DELETE FROM public.user_push_tokens WHERE expo_push_token = p_token;
  INSERT INTO public.user_push_tokens (user_id, expo_push_token, platform, updated_at)
  VALUES (auth.uid(), p_token, p_platform, now());
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_expo_push_token(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_expo_push_token(text, text) TO authenticated;
