-- FIX: Erreur "record old has no field status" dans farms
-- Le trigger essaie d'accéder à un champ 'status' qui n'existe pas

-- 1. VOIR les triggers sur la table farms
SELECT 
  trigger_name, 
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'farms';

-- 2. VOIR les fonctions liées aux farms
SELECT 
  proname as function_name,
  prosrc as source
FROM pg_proc
WHERE proname LIKE '%farm%'
ORDER BY proname;

-- 3. SOLUTION RAPIDE : Supprimer les triggers problématiques
-- (Remplacer 'nom_du_trigger' par le nom trouvé à l'étape 1)

-- Exemples de triggers possibles à supprimer :
-- DROP TRIGGER IF EXISTS farms_status_change ON farms;
-- DROP TRIGGER IF EXISTS notify_farm_status ON farms;
-- DROP TRIGGER IF EXISTS farm_notification_trigger ON farms;

-- 4. SOLUTION ALTERNATIVE : Ajouter la colonne 'status' si elle est nécessaire
-- ALTER TABLE farms ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 5. VOIR la structure actuelle de la table farms
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'farms'
ORDER BY ordinal_position;

-- 6. Si vous trouvez un trigger qui utilise OLD.status ou NEW.status,
-- il faut soit :
-- a) Supprimer le trigger (si pas nécessaire)
-- b) Modifier le trigger pour utiliser un champ qui existe (ex: verified)
-- c) Ajouter la colonne status à la table

-- Exemple de modification d'un trigger :
-- CREATE OR REPLACE FUNCTION notify_farm_change()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- Utiliser 'verified' au lieu de 'status'
--   IF NEW.verified IS DISTINCT FROM OLD.verified THEN
--     -- votre logique ici
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

