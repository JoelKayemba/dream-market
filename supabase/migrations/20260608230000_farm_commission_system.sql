-- Commission Dream Field par ferme + stats reversements

ALTER TABLE public.farms
  ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2) NOT NULL DEFAULT 0;

ALTER TABLE public.farms
  DROP CONSTRAINT IF EXISTS farms_commission_rate_check;

ALTER TABLE public.farms
  ADD CONSTRAINT farms_commission_rate_check
  CHECK (commission_rate >= 0 AND commission_rate <= 100);

COMMENT ON COLUMN public.farms.commission_rate IS
  'Taux de commission Dream Field en % (0-100) sur les ventes produits de la ferme';

-- Helper : montants commission / reversement sur une ligne commande
CREATE OR REPLACE FUNCTION public.compute_line_commission(
  p_subtotal numeric,
  p_rate_percent numeric,
  p_stored_commission numeric DEFAULT NULL,
  p_stored_payout numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_subtotal numeric;
  v_rate numeric;
  v_commission numeric;
  v_payout numeric;
BEGIN
  v_subtotal := GREATEST(0, COALESCE(p_subtotal, 0));
  v_rate := GREATEST(0, LEAST(COALESCE(p_rate_percent, 0), 100));

  IF p_stored_commission IS NOT NULL AND p_stored_payout IS NOT NULL THEN
    v_commission := GREATEST(0, p_stored_commission);
    v_payout := GREATEST(0, p_stored_payout);
  ELSE
    v_commission := ROUND(v_subtotal * v_rate / 100.0, 2);
    v_payout := GREATEST(0, ROUND(v_subtotal - v_commission, 2));
  END IF;

  RETURN jsonb_build_object(
    'subtotal', v_subtotal,
    'commission_rate', v_rate,
    'commission_amount', v_commission,
    'farmer_payout_amount', v_payout
  );
END;
$$;

-- Stats fermier (mois en cours) avec commission et net
CREATE OR REPLACE FUNCTION public.get_farmer_dashboard_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_farm_name text;
  v_commission_rate numeric;
  v_product_count integer;
  v_orders_today integer := 0;
  v_orders_month integer := 0;
  v_units_month numeric := 0;
  v_revenue_cdf numeric := 0;
  v_revenue_usd numeric := 0;
  v_commission_cdf numeric := 0;
  v_commission_usd numeric := 0;
  v_payout_cdf numeric := 0;
  v_payout_usd numeric := 0;
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
      'commission_rate', 0,
      'product_count', 0,
      'orders_today', 0,
      'orders_month', 0,
      'units_sold_month', 0,
      'revenue_month_cdf', 0,
      'revenue_month_usd', 0,
      'commission_month_cdf', 0,
      'commission_month_usd', 0,
      'payout_month_cdf', 0,
      'payout_month_usd', 0,
      'top_products', '[]'::jsonb
    );
  END IF;

  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'Aucune ferme associée à ce compte';
  END IF;

  SELECT f.name, COALESCE(f.commission_rate, 0)
  INTO v_farm_name, v_commission_rate
  FROM public.farms f
  WHERE f.id = v_farm_id;

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
  line_amounts AS (
    SELECT
      mi.item,
      COALESCE((mi.item->>'subtotal')::numeric,
        COALESCE((mi.item->>'product_price')::numeric, 0) * COALESCE((mi.item->>'quantity')::numeric, 0)
      ) AS subtotal,
      COALESCE((mi.item->>'commission_amount')::numeric,
        COALESCE((mi.item->>'subtotal')::numeric,
          COALESCE((mi.item->>'product_price')::numeric, 0) * COALESCE((mi.item->>'quantity')::numeric, 0)
        ) * COALESCE((mi.item->>'commission_rate')::numeric, v_commission_rate) / 100.0
      ) AS commission_amount,
      COALESCE((mi.item->>'farmer_payout_amount')::numeric,
        COALESCE((mi.item->>'subtotal')::numeric,
          COALESCE((mi.item->>'product_price')::numeric, 0) * COALESCE((mi.item->>'quantity')::numeric, 0)
        ) - COALESCE((mi.item->>'commission_amount')::numeric,
          COALESCE((mi.item->>'subtotal')::numeric,
            COALESCE((mi.item->>'product_price')::numeric, 0) * COALESCE((mi.item->>'quantity')::numeric, 0)
          ) * COALESCE((mi.item->>'commission_rate')::numeric, v_commission_rate) / 100.0
        )
      ) AS farmer_payout,
      upper(COALESCE(mi.item->>'product_currency', 'CDF')) AS currency
    FROM month_items mi
  ),
  revenue AS (
    SELECT
      COALESCE(SUM(CASE WHEN currency = 'USD' THEN subtotal ELSE 0 END), 0) AS usd,
      COALESCE(SUM(CASE WHEN currency <> 'USD' THEN subtotal ELSE 0 END), 0) AS cdf,
      COALESCE(SUM(CASE WHEN currency = 'USD' THEN commission_amount ELSE 0 END), 0) AS commission_usd,
      COALESCE(SUM(CASE WHEN currency <> 'USD' THEN commission_amount ELSE 0 END), 0) AS commission_cdf,
      COALESCE(SUM(CASE WHEN currency = 'USD' THEN farmer_payout ELSE 0 END), 0) AS payout_usd,
      COALESCE(SUM(CASE WHEN currency <> 'USD' THEN farmer_payout ELSE 0 END), 0) AS payout_cdf,
      COALESCE(SUM(COALESCE((item->>'quantity')::numeric, 0)), 0) AS units
    FROM line_amounts
  ),
  top AS (
    SELECT
      COALESCE(item->>'product_id', item->>'product_name') AS key,
      COALESCE(item->>'product_name', 'Produit') AS product_name,
      SUM(COALESCE((item->>'quantity')::numeric, 0)) AS quantity,
      SUM(COALESCE((item->>'subtotal')::numeric,
        COALESCE((item->>'product_price')::numeric, 0) * COALESCE((item->>'quantity')::numeric, 0)
      )) AS revenue
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
    (SELECT commission_cdf FROM revenue),
    (SELECT commission_usd FROM revenue),
    (SELECT payout_cdf FROM revenue),
    (SELECT payout_usd FROM revenue),
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
    v_commission_cdf,
    v_commission_usd,
    v_payout_cdf,
    v_payout_usd,
    v_top_products;

  RETURN jsonb_build_object(
    'farm_id', v_farm_id,
    'farm_name', COALESCE(v_farm_name, 'Ma ferme'),
    'commission_rate', COALESCE(v_commission_rate, 0),
    'product_count', COALESCE(v_product_count, 0),
    'orders_today', COALESCE(v_orders_today, 0),
    'orders_month', COALESCE(v_orders_month, 0),
    'units_sold_month', COALESCE(v_units_month, 0),
    'revenue_month_cdf', COALESCE(v_revenue_cdf, 0),
    'revenue_month_usd', COALESCE(v_revenue_usd, 0),
    'commission_month_cdf', COALESCE(v_commission_cdf, 0),
    'commission_month_usd', COALESCE(v_commission_usd, 0),
    'payout_month_cdf', COALESCE(v_payout_cdf, 0),
    'payout_month_usd', COALESCE(v_payout_usd, 0),
    'top_products', COALESCE(v_top_products, '[]'::jsonb)
  );
END;
$$;

-- Ventes fermier avec détail commission
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
  v_commission_rate numeric;
  v_result jsonb;
BEGIN
  v_farm_id := public.get_my_farm_id();

  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'Aucune ferme associée à ce compte';
  END IF;

  IF NOT public.is_farmer_user() AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux fermiers';
  END IF;

  SELECT COALESCE(f.commission_rate, 0) INTO v_commission_rate
  FROM public.farms f WHERE f.id = v_farm_id;

  WITH farm_orders AS (
    SELECT
      o.id,
      o.order_number,
      o.created_at,
      o.status,
      jsonb_agg(item.value) AS farm_items,
      SUM(COALESCE((item.value->>'subtotal')::numeric,
        COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0), 0)) AS farm_subtotal,
      SUM(COALESCE((item.value->>'commission_amount')::numeric,
        COALESCE((item.value->>'subtotal')::numeric,
          COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
        ) * COALESCE((item.value->>'commission_rate')::numeric, v_commission_rate) / 100.0, 0)) AS farm_commission,
      SUM(COALESCE((item.value->>'farmer_payout_amount')::numeric,
        COALESCE((item.value->>'subtotal')::numeric,
          COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
        ) - COALESCE((item.value->>'commission_amount')::numeric,
          COALESCE((item.value->>'subtotal')::numeric,
            COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
          ) * COALESCE((item.value->>'commission_rate')::numeric, v_commission_rate) / 100.0
        ), 0)) AS farm_payout
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
    'farm_subtotal', fo.farm_subtotal,
    'farm_commission', fo.farm_commission,
    'farm_payout', fo.farm_payout
  )), '[]'::jsonb)
  INTO v_result
  FROM farm_orders fo;

  RETURN jsonb_build_object('sales', COALESCE(v_result, '[]'::jsonb));
END;
$$;

-- Dashboard admin : commissions et reversements par ferme
CREATE OR REPLACE FUNCTION public.get_admin_commission_dashboard(
  p_days integer DEFAULT NULL,
  p_status text DEFAULT 'delivered'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_totals jsonb;
  v_farms jsonb;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;

  v_status := lower(trim(COALESCE(p_status, 'delivered')));

  WITH line_items AS (
    SELECT
      o.id AS order_id,
      o.status,
      o.created_at,
      NULLIF(item.value->>'farm_id', '')::uuid AS farm_id,
      COALESCE(item.value->>'farm_name', f.name, 'Ferme') AS farm_name,
      COALESCE((item.value->>'subtotal')::numeric,
        COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
      ) AS subtotal,
      COALESCE((item.value->>'commission_rate')::numeric, f.commission_rate, 0) AS commission_rate,
      COALESCE((item.value->>'commission_amount')::numeric,
        COALESCE((item.value->>'subtotal')::numeric,
          COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
        ) * COALESCE((item.value->>'commission_rate')::numeric, f.commission_rate, 0) / 100.0
      ) AS commission_amount,
      COALESCE((item.value->>'farmer_payout_amount')::numeric,
        COALESCE((item.value->>'subtotal')::numeric,
          COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
        ) - COALESCE((item.value->>'commission_amount')::numeric,
          COALESCE((item.value->>'subtotal')::numeric,
            COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
          ) * COALESCE((item.value->>'commission_rate')::numeric, f.commission_rate, 0) / 100.0
        )
      ) AS farmer_payout,
      upper(COALESCE(item.value->>'product_currency', 'CDF')) AS currency
    FROM public.orders o
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(o.items, '[]'::jsonb)) AS item(value)
    LEFT JOIN public.farms f ON f.id = NULLIF(item.value->>'farm_id', '')::uuid
    WHERE item.value->>'farm_id' IS NOT NULL
      AND (
        v_status = 'all'
        OR o.status = v_status
        OR (v_status = 'active' AND o.status IS DISTINCT FROM 'cancelled')
      )
      AND (
        p_days IS NULL
        OR o.created_at >= now() - make_interval(days => GREATEST(1, p_days))
      )
  ),
  agg AS (
    SELECT
      COALESCE(SUM(CASE WHEN currency <> 'USD' THEN subtotal ELSE 0 END), 0) AS gross_cdf,
      COALESCE(SUM(CASE WHEN currency = 'USD' THEN subtotal ELSE 0 END), 0) AS gross_usd,
      COALESCE(SUM(CASE WHEN currency <> 'USD' THEN commission_amount ELSE 0 END), 0) AS commission_cdf,
      COALESCE(SUM(CASE WHEN currency = 'USD' THEN commission_amount ELSE 0 END), 0) AS commission_usd,
      COALESCE(SUM(CASE WHEN currency <> 'USD' THEN farmer_payout ELSE 0 END), 0) AS payout_cdf,
      COALESCE(SUM(CASE WHEN currency = 'USD' THEN farmer_payout ELSE 0 END), 0) AS payout_usd
    FROM line_items
  ),
  by_farm AS (
    SELECT
      li.farm_id,
      MAX(li.farm_name) AS farm_name,
      MAX(f.commission_rate) AS commission_rate,
      COALESCE(SUM(CASE WHEN li.currency <> 'USD' THEN li.farmer_payout ELSE 0 END), 0) AS payout_cdf,
      COALESCE(SUM(CASE WHEN li.currency = 'USD' THEN li.farmer_payout ELSE 0 END), 0) AS payout_usd,
      COALESCE(SUM(CASE WHEN li.currency <> 'USD' THEN li.commission_amount ELSE 0 END), 0) AS commission_cdf,
      COALESCE(SUM(CASE WHEN li.currency = 'USD' THEN li.commission_amount ELSE 0 END), 0) AS commission_usd,
      COUNT(DISTINCT li.order_id) AS order_count
    FROM line_items li
    LEFT JOIN public.farms f ON f.id = li.farm_id
    WHERE li.farm_id IS NOT NULL
    GROUP BY li.farm_id
    ORDER BY payout_cdf + payout_usd * 2500 DESC
  )
  SELECT
    (SELECT jsonb_build_object(
      'gross_cdf', a.gross_cdf,
      'gross_usd', a.gross_usd,
      'commission_cdf', a.commission_cdf,
      'commission_usd', a.commission_usd,
      'payout_cdf', a.payout_cdf,
      'payout_usd', a.payout_usd
    ) FROM agg a),
    (SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'farm_id', bf.farm_id,
      'farm_name', bf.farm_name,
      'commission_rate', bf.commission_rate,
      'payout_cdf', bf.payout_cdf,
      'payout_usd', bf.payout_usd,
      'commission_cdf', bf.commission_cdf,
      'commission_usd', bf.commission_usd,
      'order_count', bf.order_count
    ) ORDER BY bf.payout_cdf + bf.payout_usd * 2500 DESC), '[]'::jsonb) FROM by_farm bf)
  INTO v_totals, v_farms;

  RETURN jsonb_build_object(
    'totals', COALESCE(v_totals, '{}'::jsonb),
    'farms', COALESCE(v_farms, '[]'::jsonb),
    'status_filter', v_status,
    'days', p_days
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_commission_dashboard(integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_commission_dashboard(integer, text) TO authenticated, service_role;
