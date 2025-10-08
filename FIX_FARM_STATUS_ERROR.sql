-- ============================================
-- FIX: Erreur "record old has no field status"
-- ============================================

-- 1. IDENTIFIER le trigger problématique
SELECT 
  trigger_name, 
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'farms'
ORDER BY trigger_name;

-- 2. VOIR les fonctions qui utilisent 'status'
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    pg_get_functiondef(p.oid) LIKE '%OLD.status%'
    OR pg_get_functiondef(p.oid) LIKE '%NEW.status%'
    OR pg_get_functiondef(p.oid) LIKE '%farms%'
  )
ORDER BY p.proname;

-- 3. SUPPRIMER les triggers courants sur farms
-- (Ajustez selon ce qui est trouvé à l'étape 1)

DROP TRIGGER IF EXISTS farms_status_change ON farms;
DROP TRIGGER IF EXISTS notify_farm_status ON farms;
DROP TRIGGER IF EXISTS farm_notification_trigger ON farms;
DROP TRIGGER IF EXISTS update_farm_status ON farms;
DROP TRIGGER IF EXISTS check_farm_status ON farms;

-- 4. VOIR la structure de la table farms
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'farms'
ORDER BY ordinal_position;

-- 5. VÉRIFIER qu'il n'y a plus de triggers
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'farms';
-- Résultat attendu: vide ou triggers sans 'status'

