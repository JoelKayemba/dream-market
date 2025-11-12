-- Table pour les retours et feedbacks des utilisateurs
CREATE TABLE IF NOT EXISTS feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'complaint', 'compliment', 'other')),
  category VARCHAR(100),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  admin_notes TEXT,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_status ON feedbacks(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_type ON feedbacks(type);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_feedbacks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_update_feedbacks_updated_at
  BEFORE UPDATE ON feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_feedbacks_updated_at();

-- RLS (Row Level Security) Policies
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres feedbacks
CREATE POLICY "Users can view their own feedbacks"
  ON feedbacks FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent créer leurs propres feedbacks
CREATE POLICY "Users can create their own feedbacks"
  ON feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres feedbacks (seulement si status = 'pending')
CREATE POLICY "Users can update their own pending feedbacks"
  ON feedbacks FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Policy: Les admins peuvent voir tous les feedbacks
CREATE POLICY "Admins can view all feedbacks"
  ON feedbacks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Les admins peuvent mettre à jour tous les feedbacks
CREATE POLICY "Admins can update all feedbacks"
  ON feedbacks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Les admins peuvent supprimer tous les feedbacks
CREATE POLICY "Admins can delete all feedbacks"
  ON feedbacks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Vue pour les statistiques de feedbacks (pour les admins)
CREATE OR REPLACE VIEW feedback_stats AS
SELECT 
  type,
  status,
  priority,
  COUNT(*) as count,
  AVG(rating) as avg_rating
FROM feedbacks
GROUP BY type, status, priority;

-- Commentaires pour la documentation
COMMENT ON TABLE feedbacks IS 'Table pour stocker les retours et feedbacks des utilisateurs';
COMMENT ON COLUMN feedbacks.type IS 'Type de feedback: bug, feature, improvement, complaint, compliment, other';
COMMENT ON COLUMN feedbacks.status IS 'Statut: pending, reviewed, in_progress, resolved, closed';
COMMENT ON COLUMN feedbacks.priority IS 'Priorité: low, normal, high, urgent';
COMMENT ON COLUMN feedbacks.rating IS 'Note de satisfaction (1-5)';

