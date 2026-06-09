-- Fix ORDER BY dans get_admin_commission_dashboard (colonne payout_cdf introuvable)
-- + ventes fermier séparées CDF / USD

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
  ),
  by_farm_ranked AS (
    SELECT
      bf.*,
      (bf.payout_cdf + bf.payout_usd * 2500) AS sort_key
    FROM by_farm bf
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
      'farm_id', bfr.farm_id,
      'farm_name', bfr.farm_name,
      'commission_rate', bfr.commission_rate,
      'payout_cdf', bfr.payout_cdf,
      'payout_usd', bfr.payout_usd,
      'commission_cdf', bfr.commission_cdf,
      'commission_usd', bfr.commission_usd,
      'order_count', bfr.order_count
    ) ORDER BY bfr.sort_key DESC), '[]'::jsonb) FROM by_farm_ranked bfr)
  INTO v_totals, v_farms;

  RETURN jsonb_build_object(
    'totals', COALESCE(v_totals, '{}'::jsonb),
    'farms', COALESCE(v_farms, '[]'::jsonb),
    'status_filter', v_status,
    'days', p_days
  );
END;
$$;

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
      COALESCE(SUM(CASE WHEN upper(COALESCE(item.value->>'product_currency', 'CDF')) <> 'USD' THEN
        COALESCE((item.value->>'subtotal')::numeric,
          COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0), 0)
      ELSE 0 END), 0) AS farm_subtotal_cdf,
      COALESCE(SUM(CASE WHEN upper(COALESCE(item.value->>'product_currency', 'CDF')) = 'USD' THEN
        COALESCE((item.value->>'subtotal')::numeric,
          COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0), 0)
      ELSE 0 END), 0) AS farm_subtotal_usd,
      COALESCE(SUM(CASE WHEN upper(COALESCE(item.value->>'product_currency', 'CDF')) <> 'USD' THEN
        COALESCE((item.value->>'commission_amount')::numeric,
          COALESCE((item.value->>'subtotal')::numeric,
            COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
          ) * COALESCE((item.value->>'commission_rate')::numeric, v_commission_rate) / 100.0, 0)
      ELSE 0 END), 0) AS farm_commission_cdf,
      COALESCE(SUM(CASE WHEN upper(COALESCE(item.value->>'product_currency', 'CDF')) = 'USD' THEN
        COALESCE((item.value->>'commission_amount')::numeric,
          COALESCE((item.value->>'subtotal')::numeric,
            COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
          ) * COALESCE((item.value->>'commission_rate')::numeric, v_commission_rate) / 100.0, 0)
      ELSE 0 END), 0) AS farm_commission_usd,
      COALESCE(SUM(CASE WHEN upper(COALESCE(item.value->>'product_currency', 'CDF')) <> 'USD' THEN
        COALESCE((item.value->>'farmer_payout_amount')::numeric,
          COALESCE((item.value->>'subtotal')::numeric,
            COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
          ) - COALESCE((item.value->>'commission_amount')::numeric,
            COALESCE((item.value->>'subtotal')::numeric,
              COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
            ) * COALESCE((item.value->>'commission_rate')::numeric, v_commission_rate) / 100.0
          ), 0)
      ELSE 0 END), 0) AS farm_payout_cdf,
      COALESCE(SUM(CASE WHEN upper(COALESCE(item.value->>'product_currency', 'CDF')) = 'USD' THEN
        COALESCE((item.value->>'farmer_payout_amount')::numeric,
          COALESCE((item.value->>'subtotal')::numeric,
            COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
          ) - COALESCE((item.value->>'commission_amount')::numeric,
            COALESCE((item.value->>'subtotal')::numeric,
              COALESCE((item.value->>'product_price')::numeric, 0) * COALESCE((item.value->>'quantity')::numeric, 0)
            ) * COALESCE((item.value->>'commission_rate')::numeric, v_commission_rate) / 100.0
          ), 0)
      ELSE 0 END), 0) AS farm_payout_usd
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
    'farm_subtotal_cdf', fo.farm_subtotal_cdf,
    'farm_subtotal_usd', fo.farm_subtotal_usd,
    'farm_commission_cdf', fo.farm_commission_cdf,
    'farm_commission_usd', fo.farm_commission_usd,
    'farm_payout_cdf', fo.farm_payout_cdf,
    'farm_payout_usd', fo.farm_payout_usd
  )), '[]'::jsonb)
  INTO v_result
  FROM farm_orders fo;

  RETURN jsonb_build_object('sales', COALESCE(v_result, '[]'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_commission_dashboard(integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_commission_dashboard(integer, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_farmer_sales(integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_farmer_sales(integer, integer) TO authenticated, service_role;
