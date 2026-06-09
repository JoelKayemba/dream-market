-- Fix : digest() introuvable car pgcrypto est dans le schéma extensions (Supabase)

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.hash_farmer_invite_code(p_code text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public, extensions
AS $$
  SELECT encode(
    extensions.digest(convert_to(trim(p_code), 'UTF8'), 'sha256'::text),
    'hex'
  );
$$;

REVOKE ALL ON FUNCTION public.hash_farmer_invite_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hash_farmer_invite_code(text) TO authenticated, service_role, anon;

-- Créer le profil s'il n'existe pas encore (trigger parfois asynchrone après signUp)
CREATE OR REPLACE FUNCTION public.complete_farmer_activation(p_invite_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.farmer_invites%ROWTYPE;
  v_farm_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Connexion requise';
  END IF;

  SELECT fi.* INTO v_invite
  FROM public.farmer_invites fi
  WHERE fi.id = p_invite_id
    AND fi.used_at IS NULL
    AND fi.expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invitation invalide ou expirée';
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  SELECT
    auth.uid(),
    u.email,
    COALESCE(u.raw_user_meta_data->>'first_name', ''),
    COALESCE(u.raw_user_meta_data->>'last_name', ''),
    'farmer'
  FROM auth.users u
  WHERE u.id = auth.uid()
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'farmer',
    updated_at = now();

  UPDATE public.farms
  SET owner_id = auth.uid(),
      updated_at = now()
  WHERE id = v_invite.farm_id;

  UPDATE public.farmer_invites
  SET used_at = now(),
      used_by = auth.uid()
  WHERE id = v_invite.id;

  SELECT f.name INTO v_farm_name FROM public.farms f WHERE f.id = v_invite.farm_id;

  RETURN jsonb_build_object(
    'success', true,
    'farm_id', v_invite.farm_id,
    'farm_name', COALESCE(v_farm_name, 'Ferme partenaire'),
    'role', 'farmer'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.complete_farmer_activation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_farmer_activation(uuid) TO authenticated, service_role;
