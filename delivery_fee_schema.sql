-- Script pour gérer le paramétrage des frais de livraison dans Supabase

-- 1. Table de configuration (si elle n'existe pas encore)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enregistrer/mettre à jour le frais de livraison
--    Remplace ou crée l'entrée 'delivery_fee'
INSERT INTO app_settings (key, value, updated_at)
VALUES (
  'delivery_fee',
  jsonb_build_object(
    'amount', 0,
    'currency', 'CDF'
  ),
  NOW()
)
ON CONFLICT (key)
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- 3. (Optionnel) Colonnes supplémentaires dans orders pour tracer le frais appliqué
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_fee_amount NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee_currency TEXT DEFAULT 'CDF';

-- 4. Exemple de lecture du paramètre
SELECT
  (value->>'amount')::NUMERIC AS delivery_fee_amount,
  (value->>'currency')       AS delivery_fee_currency
FROM app_settings
WHERE key = 'delivery_fee';
