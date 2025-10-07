-- Script pour créer les fonctions RPC pour compter les utilisateurs

-- 1. Fonction pour compter tous les utilisateurs (depuis auth.users)
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM auth.users;
$$;

-- 2. Fonction pour récupérer les statistiques des utilisateurs
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total', (SELECT COUNT(*)::INTEGER FROM auth.users),
    'customers', (SELECT COUNT(*)::INTEGER FROM profiles WHERE role = 'customer'),
    'farmers', (SELECT COUNT(*)::INTEGER FROM profiles WHERE role = 'farmer'),
    'admins', (SELECT COUNT(*)::INTEGER FROM profiles WHERE role = 'admin')
  );
$$;

-- 3. Fonction pour récupérer le nombre d'utilisateurs par rôle
CREATE OR REPLACE FUNCTION get_users_by_role()
RETURNS TABLE(role TEXT, count INTEGER)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(p.role, 'unknown') as role,
    COUNT(*)::INTEGER as count
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  GROUP BY p.role;
$$;

-- 4. Fonction pour récupérer les utilisateurs récents (pour le dashboard)
CREATE OR REPLACE FUNCTION get_recent_users(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    u.id,
    u.email,
    COALESCE(p.role, 'unknown') as role,
    u.created_at
  FROM auth.users u
  LEFT JOIN profiles p ON u.id = p.id
  ORDER BY u.created_at DESC
  LIMIT limit_count;
$$;

-- 5. Accorder les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION get_user_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_by_role() TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_users(INTEGER) TO authenticated;

-- 6. Test des fonctions
SELECT 'Test get_user_count():' as test_name, get_user_count() as result
UNION ALL
SELECT 'Test get_user_stats():' as test_name, get_user_stats() as result
UNION ALL
SELECT 'Test get_users_by_role():' as test_name, json_agg(row_to_json(t)) as result
FROM get_users_by_role() t;
