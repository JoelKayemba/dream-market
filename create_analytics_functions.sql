-- Script pour créer les fonctions d'analytiques pour le dashboard admin

-- 1. Fonction pour les statistiques générales du dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'users', json_build_object(
      'total', (SELECT COUNT(*)::INTEGER FROM auth.users),
      'new_today', (SELECT COUNT(*)::INTEGER FROM auth.users WHERE DATE(created_at) = CURRENT_DATE),
      'new_this_week', (SELECT COUNT(*)::INTEGER FROM auth.users WHERE DATE(created_at) >= DATE_TRUNC('week', CURRENT_DATE)),
      'new_this_month', (SELECT COUNT(*)::INTEGER FROM auth.users WHERE DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE))
    ),
    'orders', json_build_object(
      'total', (SELECT COUNT(*)::INTEGER FROM orders),
      'pending', (SELECT COUNT(*)::INTEGER FROM orders WHERE status = 'pending'),
      'delivered', (SELECT COUNT(*)::INTEGER FROM orders WHERE status = 'delivered'),
      'cancelled', (SELECT COUNT(*)::INTEGER FROM orders WHERE status = 'cancelled'),
      'revenue_total', (SELECT COALESCE(SUM((totals->>'total')::DECIMAL), 0) FROM orders WHERE status = 'delivered'),
      'revenue_today', (SELECT COALESCE(SUM((totals->>'total')::DECIMAL), 0) FROM orders WHERE status = 'delivered' AND DATE(created_at) = CURRENT_DATE),
      'revenue_this_month', (SELECT COALESCE(SUM((totals->>'total')::DECIMAL), 0) FROM orders WHERE status = 'delivered' AND DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE))
    ),
    'products', json_build_object(
      'total', (SELECT COUNT(*)::INTEGER FROM products),
      'active', (SELECT COUNT(*)::INTEGER FROM products WHERE is_active = true),
      'inactive', (SELECT COUNT(*)::INTEGER FROM products WHERE is_active = false),
      'organic', (SELECT COUNT(*)::INTEGER FROM products WHERE is_organic = true),
      'new', (SELECT COUNT(*)::INTEGER FROM products WHERE is_new = true)
    ),
    'farms', json_build_object(
      'total', (SELECT COUNT(*)::INTEGER FROM farms),
      'verified', (SELECT COUNT(*)::INTEGER FROM farms WHERE verified = true),
      'unverified', (SELECT COUNT(*)::INTEGER FROM farms WHERE verified = false)
    ),
    'services', json_build_object(
      'total', (SELECT COUNT(*)::INTEGER FROM services),
      'active', (SELECT COUNT(*)::INTEGER FROM services WHERE is_active = true),
      'inactive', (SELECT COUNT(*)::INTEGER FROM services WHERE is_active = false)
    )
  );
$$;

-- 2. Fonction pour les revenus par période
CREATE OR REPLACE FUNCTION get_revenue_analytics(period_days INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH daily_revenue AS (
    SELECT 
      DATE(created_at) as date,
      SUM((totals->>'total')::DECIMAL) as revenue
    FROM orders 
    WHERE status = 'delivered' 
      AND created_at >= CURRENT_DATE - INTERVAL '1 day' * period_days
    GROUP BY DATE(created_at)
    ORDER BY date
  )
  SELECT json_build_object(
    'period_days', period_days,
    'total_revenue', (SELECT COALESCE(SUM(revenue), 0) FROM daily_revenue),
    'average_daily', (SELECT COALESCE(AVG(revenue), 0) FROM daily_revenue),
    'best_day', (SELECT json_build_object('date', date, 'revenue', revenue) FROM daily_revenue ORDER BY revenue DESC LIMIT 1),
    'daily_data', json_agg(
      json_build_object('date', date, 'revenue', COALESCE(revenue, 0))
    )
  ) FROM daily_revenue;
$$;

-- 3. Fonction pour les commandes par statut (évolution temporelle)
CREATE OR REPLACE FUNCTION get_orders_analytics(period_days INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH daily_orders AS (
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as total_orders,
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
  SELECT json_build_object(
    'period_days', period_days,
    'total_orders', (SELECT SUM(total_orders) FROM daily_orders),
    'average_daily', (SELECT COALESCE(AVG(total_orders), 0) FROM daily_orders),
    'daily_data', json_agg(
      json_build_object(
        'date', date,
        'total', total_orders,
        'pending', pending,
        'confirmed', confirmed,
        'preparing', preparing,
        'shipped', shipped,
        'delivered', delivered,
        'cancelled', cancelled
      )
    )
  ) FROM daily_orders;
$$;

-- 4. Fonction pour les top produits les plus vendus
CREATE OR REPLACE FUNCTION get_top_products(limit_count INTEGER DEFAULT 10)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH product_sales AS (
    SELECT 
      p.id,
      p.name,
      p.price,
      p.currency,
      p.images,
      f.name as farm_name,
      COUNT(oi.id) as sales_count,
      SUM((oi.quantity * oi.price)::DECIMAL) as total_revenue
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
    LEFT JOIN farms f ON p.farm_id = f.id
    GROUP BY p.id, p.name, p.price, p.currency, p.images, f.name
    ORDER BY sales_count DESC, total_revenue DESC
    LIMIT limit_count
  )
  SELECT json_build_object(
    'limit', limit_count,
    'products', json_agg(
      json_build_object(
        'id', id,
        'name', name,
        'price', price,
        'currency', currency,
        'images', images,
        'farm_name', farm_name,
        'sales_count', sales_count,
        'total_revenue', COALESCE(total_revenue, 0)
      )
    )
  ) FROM product_sales;
$$;

-- 5. Fonction pour les top fermes par performance
CREATE OR REPLACE FUNCTION get_top_farms(limit_count INTEGER DEFAULT 10)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH farm_performance AS (
    SELECT 
      f.id,
      f.name,
      f.location,
      f.verified,
      f.rating,
      f.review_count,
      COUNT(DISTINCT p.id) as products_count,
      COUNT(DISTINCT oi.id) as total_sales,
      SUM((oi.quantity * oi.price)::DECIMAL) as total_revenue,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'delivered') as delivered_orders
    FROM farms f
    LEFT JOIN products p ON f.id = p.farm_id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
    GROUP BY f.id, f.name, f.location, f.verified, f.rating, f.review_count
    ORDER BY total_revenue DESC, delivered_orders DESC
    LIMIT limit_count
  )
  SELECT json_build_object(
    'limit', limit_count,
    'farms', json_agg(
      json_build_object(
        'id', id,
        'name', name,
        'location', location,
        'verified', verified,
        'rating', rating,
        'review_count', review_count,
        'products_count', products_count,
        'total_sales', total_sales,
        'total_revenue', COALESCE(total_revenue, 0),
        'delivered_orders', delivered_orders
      )
    )
  ) FROM farm_performance;
$$;

-- 6. Fonction pour les utilisateurs les plus actifs
CREATE OR REPLACE FUNCTION get_active_users(limit_count INTEGER DEFAULT 10)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH user_activity AS (
    SELECT 
      p.id,
      p.email,
      p.first_name,
      p.last_name,
      p.role,
      COUNT(DISTINCT o.id) as total_orders,
      SUM((o.totals->>'total')::DECIMAL) as total_spent,
      MAX(o.created_at) as last_order_date,
      COUNT(DISTINCT f.id) as favorites_count
    FROM profiles p
    LEFT JOIN orders o ON p.id = o.user_id
    LEFT JOIN favorites f ON p.id = f.user_id
    WHERE p.role IN ('customer', 'farmer')
    GROUP BY p.id, p.email, p.first_name, p.last_name, p.role
    ORDER BY total_spent DESC, total_orders DESC
    LIMIT limit_count
  )
  SELECT json_build_object(
    'limit', limit_count,
    'users', json_agg(
      json_build_object(
        'id', id,
        'email', email,
        'first_name', first_name,
        'last_name', last_name,
        'role', role,
        'total_orders', total_orders,
        'total_spent', COALESCE(total_spent, 0),
        'last_order_date', last_order_date,
        'favorites_count', favorites_count
      )
    )
  ) FROM user_activity;
$$;

-- 7. Fonction pour les métriques de croissance
CREATE OR REPLACE FUNCTION get_growth_metrics()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH current_month AS (
    SELECT 
      COUNT(*) FILTER (WHERE table_name = 'users') as users_current,
      COUNT(*) FILTER (WHERE table_name = 'orders') as orders_current,
      COUNT(*) FILTER (WHERE table_name = 'products') as products_current,
      COUNT(*) FILTER (WHERE table_name = 'farms') as farms_current
    FROM (
      SELECT 'users' as table_name FROM auth.users WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
      UNION ALL
      SELECT 'orders' as table_name FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
      UNION ALL
      SELECT 'products' as table_name FROM products WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
      UNION ALL
      SELECT 'farms' as table_name FROM farms WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    ) t
  ),
  previous_month AS (
    SELECT 
      COUNT(*) FILTER (WHERE table_name = 'users') as users_previous,
      COUNT(*) FILTER (WHERE table_name = 'orders') as orders_previous,
      COUNT(*) FILTER (WHERE table_name = 'products') as products_previous,
      COUNT(*) FILTER (WHERE table_name = 'farms') as farms_previous
    FROM (
      SELECT 'users' as table_name FROM auth.users WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      UNION ALL
      SELECT 'orders' as table_name FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      UNION ALL
      SELECT 'products' as table_name FROM products WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      UNION ALL
      SELECT 'farms' as table_name FROM farms WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    ) t
  )
  SELECT json_build_object(
    'users', json_build_object(
      'current', c.users_current,
      'previous', p.users_previous,
      'growth_percent', CASE 
        WHEN p.users_previous > 0 THEN ROUND(((c.users_current - p.users_previous)::DECIMAL / p.users_previous * 100)::DECIMAL, 2)
        ELSE 0 
      END
    ),
    'orders', json_build_object(
      'current', c.orders_current,
      'previous', p.orders_previous,
      'growth_percent', CASE 
        WHEN p.orders_previous > 0 THEN ROUND(((c.orders_current - p.orders_previous)::DECIMAL / p.orders_previous * 100)::DECIMAL, 2)
        ELSE 0 
      END
    ),
    'products', json_build_object(
      'current', c.products_current,
      'previous', p.products_previous,
      'growth_percent', CASE 
        WHEN p.products_previous > 0 THEN ROUND(((c.products_current - p.products_previous)::DECIMAL / p.products_previous * 100)::DECIMAL, 2)
        ELSE 0 
      END
    ),
    'farms', json_build_object(
      'current', c.farms_current,
      'previous', p.farms_previous,
      'growth_percent', CASE 
        WHEN p.farms_previous > 0 THEN ROUND(((c.farms_current - p.farms_previous)::DECIMAL / p.farms_previous * 100)::DECIMAL, 2)
        ELSE 0 
      END
    )
  ) FROM current_month c, previous_month p;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_analytics(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_orders_analytics(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_products(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_farms(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_users(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_growth_metrics() TO authenticated;
