-- Table pour stocker les paniers des utilisateurs
-- Chaque ligne représente un produit dans le panier d'un utilisateur

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un utilisateur ne peut avoir qu'un seul enregistrement par produit
  UNIQUE(user_id, product_id)
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_product_id ON carts(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_user_product ON carts(user_id, product_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_carts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_carts_updated_at();

-- RLS (Row Level Security) : Les utilisateurs ne peuvent voir/modifier que leur propre panier
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent lire leur propre panier
CREATE POLICY "Users can view their own cart"
  ON carts FOR SELECT
  USING (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent insérer dans leur propre panier
CREATE POLICY "Users can insert their own cart items"
  ON carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent mettre à jour leur propre panier
CREATE POLICY "Users can update their own cart items"
  ON carts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent supprimer leur propre panier
CREATE POLICY "Users can delete their own cart items"
  ON carts FOR DELETE
  USING (auth.uid() = user_id);

