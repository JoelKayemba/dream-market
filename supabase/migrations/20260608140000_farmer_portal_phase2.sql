-- Phase 2 : stock & disponibilité par le fermier + alertes admin

CREATE TABLE IF NOT EXISTS public.product_stock_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  old_stock integer,
  new_stock integer,
  old_is_active boolean,
  new_is_active boolean,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_stock_logs_product_id ON public.product_stock_logs(product_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_stock_logs_farm_id ON public.product_stock_logs(farm_id, changed_at DESC);

ALTER TABLE public.product_stock_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_stock_logs_admin_all" ON public.product_stock_logs;
CREATE POLICY "product_stock_logs_admin_all"
  ON public.product_stock_logs
  FOR ALL
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "product_stock_logs_farmer_select_own" ON public.product_stock_logs;
CREATE POLICY "product_stock_logs_farmer_select_own"
  ON public.product_stock_logs
  FOR SELECT
  TO authenticated
  USING (farm_id = public.get_my_farm_id());

-- Fermier : mettre à jour stock + disponibilité (pas le prix)
CREATE OR REPLACE FUNCTION public.update_farmer_product_stock(
  p_product_id uuid,
  p_stock integer,
  p_is_active boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_product public.products%ROWTYPE;
  v_new_stock integer;
  v_new_active boolean;
BEGIN
  IF NOT public.is_farmer_user() THEN
    RAISE EXCEPTION 'Accès réservé aux fermiers';
  END IF;

  v_farm_id := public.get_my_farm_id();
  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'Aucune ferme associée à ce compte';
  END IF;

  SELECT * INTO v_product
  FROM public.products p
  WHERE p.id = p_product_id
    AND p.farm_id = v_farm_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produit introuvable ou non autorisé';
  END IF;

  v_new_stock := GREATEST(0, COALESCE(p_stock, v_product.stock, 0));
  v_new_active := COALESCE(p_is_active, v_product.is_active, true);

  IF v_new_stock = 0 THEN
    v_new_active := false;
  END IF;

  INSERT INTO public.product_stock_logs (
    product_id, farm_id, old_stock, new_stock, old_is_active, new_is_active, changed_by
  )
  VALUES (
    v_product.id,
    v_farm_id,
    v_product.stock,
    v_new_stock,
    v_product.is_active,
    v_new_active,
    auth.uid()
  );

  UPDATE public.products
  SET
    stock = v_new_stock,
    is_active = v_new_active,
    updated_at = now()
  WHERE id = v_product.id
  RETURNING * INTO v_product;

  RETURN jsonb_build_object(
    'success', true,
    'product', to_jsonb(v_product)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.update_farmer_product_stock(uuid, integer, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_farmer_product_stock(uuid, integer, boolean) TO authenticated, service_role;

-- Historique stock d'un produit (fermier propriétaire ou admin)
CREATE OR REPLACE FUNCTION public.get_product_stock_logs(
  p_product_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_product_farm_id uuid;
  v_logs jsonb;
BEGIN
  SELECT p.farm_id INTO v_product_farm_id
  FROM public.products p
  WHERE p.id = p_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produit introuvable';
  END IF;

  v_farm_id := public.get_my_farm_id();

  IF NOT public.is_admin_user()
     AND (NOT public.is_farmer_user() OR v_farm_id IS NULL OR v_farm_id <> v_product_farm_id) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_logs
  FROM (
    SELECT
      l.id,
      l.old_stock,
      l.new_stock,
      l.old_is_active,
      l.new_is_active,
      l.changed_at,
      p.first_name,
      p.last_name,
      pr.role AS changed_by_role
    FROM public.product_stock_logs l
    LEFT JOIN public.profiles p ON p.id = l.changed_by
    LEFT JOIN public.profiles pr ON pr.id = l.changed_by
    WHERE l.product_id = p_product_id
    ORDER BY l.changed_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 10), 30))
  ) t;

  RETURN jsonb_build_object('logs', v_logs);
END;
$$;

REVOKE ALL ON FUNCTION public.get_product_stock_logs(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_product_stock_logs(uuid, integer) TO authenticated, service_role;

-- Alertes admin : stock bas ou rupture
CREATE OR REPLACE FUNCTION public.get_admin_stock_alerts(p_limit integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alerts jsonb;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_alerts
  FROM (
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      p.stock,
      p.is_active,
      p.updated_at,
      f.id AS farm_id,
      f.name AS farm_name,
      CASE
        WHEN COALESCE(p.is_active, true) = false THEN 'rupture'
        WHEN COALESCE(p.stock, 0) <= 0 THEN 'empty'
        WHEN COALESCE(p.stock, 0) <= 5 THEN 'low'
        ELSE 'ok'
      END AS alert_type
    FROM public.products p
    INNER JOIN public.farms f ON f.id = p.farm_id
    WHERE COALESCE(p.is_active, true) = false
       OR COALESCE(p.stock, 0) <= 5
    ORDER BY p.updated_at DESC NULLS LAST
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 30), 100))
  ) t;

  RETURN jsonb_build_object('alerts', v_alerts);
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_stock_alerts(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_stock_alerts(integer) TO authenticated, service_role;
