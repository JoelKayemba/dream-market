-- Script SQL simplifié pour les analytiques (optionnel)
-- Exécutez ce script dans l'éditeur SQL de Supabase si vous voulez utiliser les fonctions SQL

-- 1. Fonction simple pour compter les utilisateurs
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM auth.users;
$$;

-- 2. Fonction pour les revenus des commandes livrées
CREATE OR REPLACE FUNCTION get_delivered_revenue(period_days INTEGER DEFAULT 30)
RETURNS TABLE(
  total_cdf DECIMAL,
  total_usd DECIMAL,
  daily_data JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH daily_revenue AS (
    SELECT 
      DATE(created_at) as date,
      SUM(COALESCE((totals->>'totalCDF')::DECIMAL, (totals->>'total')::DECIMAL, 0)) as cdf,
      SUM(COALESCE((totals->>'totalUSD')::DECIMAL, 0)) as usd
    FROM orders 
    WHERE status = 'delivered' 
      AND created_at >= CURRENT_DATE - INTERVAL '1 day' * period_days
    GROUP BY DATE(created_at)
    ORDER BY date
  )
  SELECT 
    COALESCE(SUM(cdf), 0) as total_cdf,
    COALESCE(SUM(usd), 0) as total_usd,
    json_agg(
      json_build_object('date', date, 'cdf', cdf, 'usd', usd)
    ) as daily_data
  FROM daily_revenue;
$$;

-- 3. Fonction pour les commandes par statut
CREATE OR REPLACE FUNCTION get_orders_by_status(period_days INTEGER DEFAULT 30)
RETURNS TABLE(
  total_orders INTEGER,
  pending INTEGER,
  confirmed INTEGER,
  preparing INTEGER,
  shipped INTEGER,
  delivered INTEGER,
  cancelled INTEGER,
  daily_data JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH daily_orders AS (
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
      COUNT(*) FILTER (WHERE status = 'preparing') as preparing,
      COUNT(*) FILTER (WHERE status = 'shipped') as shipped,
      COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
    FROM orders 
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * period_days
    GROUP BY DATE(created_at)
    ORDER BY date
  )
  SELECT 
    COALESCE(SUM(total), 0)::INTEGER as total_orders,
    COALESCE(SUM(pending), 0)::INTEGER as pending,
    COALESCE(SUM(confirmed), 0)::INTEGER as confirmed,
    COALESCE(SUM(preparing), 0)::INTEGER as preparing,
    COALESCE(SUM(shipped), 0)::INTEGER as shipped,
    COALESCE(SUM(delivered), 0)::INTEGER as delivered,
    COALESCE(SUM(cancelled), 0)::INTEGER as cancelled,
    json_agg(
      json_build_object(
        'date', date,
        'total', total,
        'pending', pending,
        'confirmed', confirmed,
        'preparing', preparing,
        'shipped', shipped,
        'delivered', delivered,
        'cancelled', cancelled
      )
    ) as daily_data
  FROM daily_orders;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION get_user_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_delivered_revenue(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_orders_by_status(INTEGER) TO authenticated;

-- Test des fonctions
SELECT 'Test get_user_count():' as test_name, get_user_count() as result
UNION ALL
SELECT 'Test get_delivered_revenue(7):' as test_name, json_build_object('total_cdf', total_cdf, 'total_usd', total_usd) as result
FROM get_delivered_revenue(7)
UNION ALL
SELECT 'Test get_orders_by_status(7):' as test_name, json_build_object('total_orders', total_orders, 'delivered', delivered) as result
FROM get_orders_by_status(7);
