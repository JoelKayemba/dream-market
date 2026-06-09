-- Phase 1 : Espace fermier — owner_id, invitations, stats RPC

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Lien ferme ↔ compte fermier
ALTER TABLE public.farms
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON public.farms(owner_id);

COMMENT ON COLUMN public.farms.owner_id IS 'Profil fermier lié à cette ferme (role=farmer).';

-- Invitations contrôlées par admin
CREATE TABLE IF NOT EXISTS public.farmer_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  login_identifier text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  used_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT farmer_invites_login_identifier_trim CHECK (char_length(trim(login_identifier)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_farmer_invites_farm_id ON public.farmer_invites(farm_id);
CREATE INDEX IF NOT EXISTS idx_farmer_invites_login_identifier ON public.farmer_invites(lower(trim(login_identifier)));
CREATE INDEX IF NOT EXISTS idx_farmer_invites_active ON public.farmer_invites(farm_id, used_at, expires_at);

ALTER TABLE public.farmer_invites ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION public.get_my_farm_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id
  FROM public.farms f
  WHERE f.owner_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_farmer_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'farmer'
  );
$$;

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

CREATE OR REPLACE FUNCTION public.generate_farmer_invite_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_code text;
BEGIN
  v_code := 'DM-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4))
    || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
  RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_farm_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_farm_id() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_farmer_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_farmer_user() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.hash_farmer_invite_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hash_farmer_invite_code(text) TO authenticated, service_role;

-- Admin : créer une invitation (code affiché une seule fois)
CREATE OR REPLACE FUNCTION public.create_farmer_invite(
  p_farm_id uuid,
  p_login_identifier text,
  p_expires_days integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_invite public.farmer_invites%ROWTYPE;
  v_days integer;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;

  IF p_farm_id IS NULL OR trim(p_login_identifier) = '' THEN
    RAISE EXCEPTION 'Ferme et identifiant requis';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.farms WHERE id = p_farm_id) THEN
    RAISE EXCEPTION 'Ferme introuvable';
  END IF;

  v_days := GREATEST(1, LEAST(COALESCE(p_expires_days, 30), 90));
  v_code := public.generate_farmer_invite_code();

  INSERT INTO public.farmer_invites (
    farm_id,
    login_identifier,
    code_hash,
    expires_at,
    created_by
  )
  VALUES (
    p_farm_id,
    trim(p_login_identifier),
    public.hash_farmer_invite_code(v_code),
    now() + make_interval(days => v_days),
    auth.uid()
  )
  RETURNING * INTO v_invite;

  RETURN jsonb_build_object(
    'invite_id', v_invite.id,
    'farm_id', v_invite.farm_id,
    'login_identifier', v_invite.login_identifier,
    'code', v_code,
    'expires_at', v_invite.expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_farmer_invite(uuid, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_farmer_invite(uuid, text, integer) TO authenticated, service_role;

-- Public : valider identifiant + code (avant inscription)
CREATE OR REPLACE FUNCTION public.validate_farmer_invite(
  p_login_identifier text,
  p_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.farmer_invites%ROWTYPE;
  v_farm_name text;
BEGIN
  IF trim(COALESCE(p_login_identifier, '')) = '' OR trim(COALESCE(p_code, '')) = '' THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Identifiant et code requis');
  END IF;

  SELECT fi.* INTO v_invite
  FROM public.farmer_invites fi
  WHERE lower(trim(fi.login_identifier)) = lower(trim(p_login_identifier))
    AND fi.code_hash = public.hash_farmer_invite_code(p_code)
    AND fi.used_at IS NULL
    AND fi.expires_at > now()
  ORDER BY fi.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Code invalide ou expiré');
  END IF;

  SELECT f.name INTO v_farm_name FROM public.farms f WHERE f.id = v_invite.farm_id;

  RETURN jsonb_build_object(
    'valid', true,
    'invite_id', v_invite.id,
    'farm_id', v_invite.farm_id,
    'farm_name', COALESCE(v_farm_name, 'Ferme partenaire'),
    'login_identifier', v_invite.login_identifier,
    'expires_at', v_invite.expires_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_farmer_invite(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_farmer_invite(text, text) TO anon, authenticated, service_role;

-- Fermier connecté : finaliser activation après signUp
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

-- Admin : lister invitations d'une ferme
CREATE OR REPLACE FUNCTION public.get_farm_farmer_invites(p_farm_id uuid)
RETURNS TABLE (
  id uuid,
  login_identifier text,
  expires_at timestamptz,
  used_at timestamptz,
  used_by uuid,
  created_at timestamptz,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;

  RETURN QUERY
  SELECT
    fi.id,
    fi.login_identifier,
    fi.expires_at,
    fi.used_at,
    fi.used_by,
    fi.created_at,
    CASE
      WHEN fi.used_at IS NOT NULL THEN 'used'
      WHEN fi.expires_at <= now() THEN 'expired'
      ELSE 'active'
    END AS status
  FROM public.farmer_invites fi
  WHERE fi.farm_id = p_farm_id
  ORDER BY fi.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_farm_farmer_invites(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_farm_farmer_invites(uuid) TO authenticated, service_role;

-- Stats dashboard fermier (lecture commandes via items JSONB)
CREATE OR REPLACE FUNCTION public.get_farmer_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_farm_name text;
  v_product_count integer;
  v_orders_today integer := 0;
  v_orders_month integer := 0;
  v_units_month numeric := 0;
  v_revenue_cdf numeric := 0;
  v_revenue_usd numeric := 0;
  v_top_products jsonb := '[]'::jsonb;
  v_month_start timestamptz;
  v_day_start timestamptz;
BEGIN
  IF NOT public.is_farmer_user() AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux fermiers';
  END IF;

  v_farm_id := public.get_my_farm_id();

  IF v_farm_id IS NULL AND public.is_admin_user() THEN
    RETURN jsonb_build_object(
      'farm_id', null,
      'farm_name', null,
      'product_count', 0,
      'orders_today', 0,
      'orders_month', 0,
      'units_sold_month', 0,
      'revenue_month_cdf', 0,
      'revenue_month_usd', 0,
      'top_products', '[]'::jsonb
    );
  END IF;

  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'Aucune ferme associée à ce compte';
  END IF;

  SELECT f.name INTO v_farm_name FROM public.farms f WHERE f.id = v_farm_id;

  SELECT COUNT(*)::integer INTO v_product_count
  FROM public.products p
  WHERE p.farm_id = v_farm_id
    AND COALESCE(p.review_status, 'published') = 'published';

  v_month_start := date_trunc('month', now());
  v_day_start := date_trunc('day', now());

  WITH farm_items AS (
    SELECT
      o.id AS order_id,
      o.created_at,
      o.status,
      item.value AS item
    FROM public.orders o
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(o.items, '[]'::jsonb)) AS item(value)
    WHERE o.status IS DISTINCT FROM 'cancelled'
      AND COALESCE(item.value->>'farm_id', '') = v_farm_id::text
  ),
  month_items AS (
    SELECT * FROM farm_items WHERE created_at >= v_month_start
  ),
  today_orders AS (
    SELECT DISTINCT order_id FROM farm_items WHERE created_at >= v_day_start
  ),
  month_orders AS (
    SELECT DISTINCT order_id FROM month_items
  ),
  revenue AS (
    SELECT
      COALESCE(SUM(
        CASE WHEN upper(COALESCE(item->>'product_currency', 'CDF')) = 'USD'
          THEN COALESCE((item->>'subtotal')::numeric, (item->>'product_price')::numeric * (item->>'quantity')::numeric, 0)
          ELSE 0 END
      ), 0) AS usd,
      COALESCE(SUM(
        CASE WHEN upper(COALESCE(item->>'product_currency', 'CDF')) <> 'USD'
          THEN COALESCE((item->>'subtotal')::numeric, (item->>'product_price')::numeric * (item->>'quantity')::numeric, 0)
          ELSE 0 END
      ), 0) AS cdf,
      COALESCE(SUM(COALESCE((item->>'quantity')::numeric, 0)), 0) AS units
    FROM month_items
  ),
  top AS (
    SELECT
      COALESCE(item->>'product_id', item->>'product_name') AS key,
      COALESCE(item->>'product_name', 'Produit') AS product_name,
      SUM(COALESCE((item->>'quantity')::numeric, 0)) AS quantity,
      SUM(COALESCE((item->>'subtotal')::numeric, (item->>'product_price')::numeric * (item->>'quantity')::numeric, 0)) AS revenue
    FROM month_items
    GROUP BY 1, 2
    ORDER BY quantity DESC
    LIMIT 5
  )
  SELECT
    (SELECT COUNT(*) FROM today_orders),
    (SELECT COUNT(*) FROM month_orders),
    (SELECT units FROM revenue),
    (SELECT cdf FROM revenue),
    (SELECT usd FROM revenue),
    COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'product_name', t.product_name,
      'quantity', t.quantity,
      'revenue', t.revenue
    )) FROM top t), '[]'::jsonb)
  INTO
    v_orders_today,
    v_orders_month,
    v_units_month,
    v_revenue_cdf,
    v_revenue_usd,
    v_top_products;

  RETURN jsonb_build_object(
    'farm_id', v_farm_id,
    'farm_name', COALESCE(v_farm_name, 'Ma ferme'),
    'product_count', COALESCE(v_product_count, 0),
    'orders_today', COALESCE(v_orders_today, 0),
    'orders_month', COALESCE(v_orders_month, 0),
    'units_sold_month', COALESCE(v_units_month, 0),
    'revenue_month_cdf', COALESCE(v_revenue_cdf, 0),
    'revenue_month_usd', COALESCE(v_revenue_usd, 0),
    'top_products', COALESCE(v_top_products, '[]'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_farmer_dashboard_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_farmer_dashboard_stats() TO authenticated, service_role;

-- Produits de ma ferme (lecture seule)
CREATE OR REPLACE FUNCTION public.get_farmer_products()
RETURNS SETOF public.products
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
BEGIN
  v_farm_id := public.get_my_farm_id();

  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'Aucune ferme associée à ce compte';
  END IF;

  IF NOT public.is_farmer_user() AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux fermiers';
  END IF;

  RETURN QUERY
  SELECT p.*
  FROM public.products p
  WHERE p.farm_id = v_farm_id
  ORDER BY p.name ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_farmer_products() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_farmer_products() TO authenticated, service_role;

-- Ventes contenant mes produits
CREATE OR REPLACE FUNCTION public.get_farmer_sales(
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_result jsonb;
BEGIN
  v_farm_id := public.get_my_farm_id();

  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'Aucune ferme associée à ce compte';
  END IF;

  IF NOT public.is_farmer_user() AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux fermiers';
  END IF;

  WITH farm_orders AS (
    SELECT
      o.id,
      o.order_number,
      o.created_at,
      o.status,
      jsonb_agg(item.value) AS farm_items,
      SUM(COALESCE((item.value->>'subtotal')::numeric, (item.value->>'product_price')::numeric * (item.value->>'quantity')::numeric, 0)) AS farm_subtotal
    FROM public.orders o
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(o.items, '[]'::jsonb)) AS item(value)
    WHERE COALESCE(item.value->>'farm_id', '') = v_farm_id::text
    GROUP BY o.id, o.order_number, o.created_at, o.status
    ORDER BY o.created_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 50))
    OFFSET GREATEST(0, COALESCE(p_offset, 0))
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'order_id', fo.id,
    'order_number', fo.order_number,
    'created_at', fo.created_at,
    'status', fo.status,
    'farm_items', fo.farm_items,
    'farm_subtotal', fo.farm_subtotal
  )), '[]'::jsonb)
  INTO v_result
  FROM farm_orders fo;

  RETURN jsonb_build_object('sales', COALESCE(v_result, '[]'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.get_farmer_sales(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_farmer_sales(integer, integer) TO authenticated, service_role;

-- Profil ferme du fermier connecté
CREATE OR REPLACE FUNCTION public.get_my_farm_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm public.farms%ROWTYPE;
BEGIN
  SELECT f.* INTO v_farm
  FROM public.farms f
  WHERE f.owner_id = auth.uid()
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'farm', to_jsonb(v_farm)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_farm_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_farm_profile() TO authenticated, service_role;

-- RLS farmer_invites
DROP POLICY IF EXISTS "farmer_invites_admin_all" ON public.farmer_invites;
CREATE POLICY "farmer_invites_admin_all"
  ON public.farmer_invites
  FOR ALL
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Fermier : lire produits de sa ferme (en complément des policies existantes)
DROP POLICY IF EXISTS "products_farmer_select_own" ON public.products;
CREATE POLICY "products_farmer_select_own"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (
    farm_id = public.get_my_farm_id()
    OR public.is_admin_user()
  );

-- Fermier : lire sa ferme
DROP POLICY IF EXISTS "farms_farmer_select_own" ON public.farms;
CREATE POLICY "farms_farmer_select_own"
  ON public.farms
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR public.is_admin_user()
  );
