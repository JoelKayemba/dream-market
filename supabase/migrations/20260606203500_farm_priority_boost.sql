-- Permet de booster l'affichage des produits rattachés à certaines fermes.
-- Exemple : fermes partenaires stratégiques ou ferme propriétaire Dream Market.

ALTER TABLE public.farms
  ADD COLUMN IF NOT EXISTS is_priority boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.farms.is_priority IS
  'Si true, la ferme et ses produits reçoivent un bonus dans l’algorithme local d’affichage.';

CREATE INDEX IF NOT EXISTS idx_farms_is_priority
  ON public.farms (is_priority)
  WHERE is_priority = true;

UPDATE public.farms
SET is_priority = true
WHERE lower(trim(name)) = 'dream market';
