-- Demandes produits fermier (admin) + compteur dashboard fermier corrigé

-- Compteur : uniquement produits publiés (aligné avec l'onglet Produits fermier)
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

-- Liste admin des demandes produits fermier (filtres statut + période)
CREATE OR REPLACE FUNCTION public.get_admin_product_requests(
  p_status text DEFAULT 'pending_review',
  p_days integer DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_items jsonb;
  v_total integer;
  v_status text;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;

  v_status := lower(trim(COALESCE(p_status, 'pending_review')));

  SELECT COUNT(*)::integer
  INTO v_total
  FROM public.products p
  INNER JOIN public.farms f ON f.id = p.farm_id
  WHERE (
      p.submitted_at IS NOT NULL
      OR p.review_status IN ('draft', 'pending_review', 'rejected')
      OR p.proposed_price IS NOT NULL
    )
    AND (
      v_status = 'all'
      OR (v_status = 'pending_review' AND p.review_status = 'pending_review')
      OR (v_status = 'approved' AND p.review_status = 'published' AND p.submitted_at IS NOT NULL)
      OR (v_status = 'rejected' AND p.review_status = 'rejected')
      OR (v_status = 'draft' AND p.review_status = 'draft')
    )
    AND (
      p_days IS NULL
      OR COALESCE(p.submitted_at, p.created_at) >= now() - make_interval(days => GREATEST(1, p_days))
    );

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_items
  FROM (
    SELECT
      p.id,
      p.name,
      p.description,
      p.short_description,
      p.proposed_price,
      p.price,
      p.currency,
      p.unit,
      p.stock,
      p.images,
      p.review_status,
      p.review_note,
      p.submitted_at,
      p.reviewed_at,
      p.created_at,
      p.updated_at,
      f.id AS farm_id,
      f.name AS farm_name,
      c.name AS category_name
    FROM public.products p
    INNER JOIN public.farms f ON f.id = p.farm_id
    LEFT JOIN public.categories c ON c.id = p.category_id
    WHERE (
        p.submitted_at IS NOT NULL
        OR p.review_status IN ('draft', 'pending_review', 'rejected')
        OR p.proposed_price IS NOT NULL
      )
      AND (
        v_status = 'all'
        OR (v_status = 'pending_review' AND p.review_status = 'pending_review')
        OR (v_status = 'approved' AND p.review_status = 'published' AND p.submitted_at IS NOT NULL)
        OR (v_status = 'rejected' AND p.review_status = 'rejected')
        OR (v_status = 'draft' AND p.review_status = 'draft')
      )
      AND (
        p_days IS NULL
        OR COALESCE(p.submitted_at, p.created_at) >= now() - make_interval(days => GREATEST(1, p_days))
      )
    ORDER BY COALESCE(p.submitted_at, p.created_at) DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 100))
    OFFSET GREATEST(0, COALESCE(p_offset, 0))
  ) t;

  RETURN jsonb_build_object(
    'products', v_items,
    'total', COALESCE(v_total, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_product_requests(text, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_product_requests(text, integer, integer, integer) TO authenticated, service_role;

-- Compat : l'ancienne RPC délègue à la nouvelle
CREATE OR REPLACE FUNCTION public.get_admin_pending_products(p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  v_result := public.get_admin_product_requests('pending_review', NULL, p_limit, 0);
  RETURN jsonb_build_object('products', v_result->'products');
END;
$$;
