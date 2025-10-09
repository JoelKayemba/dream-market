-- ============================================
-- SYSTÈME DE RÉINITIALISATION PAR CODE OTP
-- Script complet - Copier-coller dans SQL Editor
-- ============================================

-- 1. NETTOYER (supprimer anciennes versions)
DROP FUNCTION IF EXISTS request_password_reset(TEXT);
DROP FUNCTION IF EXISTS reset_password_with_code(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS verify_reset_code(TEXT, TEXT);
DROP FUNCTION IF EXISTS mark_code_as_used(TEXT, TEXT);
DROP FUNCTION IF EXISTS cleanup_expired_codes();
DROP FUNCTION IF EXISTS generate_reset_code();

DROP TABLE IF EXISTS password_reset_codes CASCADE;

-- 2. ACTIVER l'extension de cryptage
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. CRÉER la table des codes
CREATE TABLE password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE
);

-- 4. INDEX pour performance
CREATE INDEX idx_password_reset_email ON password_reset_codes(email);
CREATE INDEX idx_password_reset_code ON password_reset_codes(code);
CREATE INDEX idx_password_reset_expires ON password_reset_codes(expires_at);

-- 5. RLS (Row Level Security)
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access codes" ON password_reset_codes;
CREATE POLICY "Public access codes"
ON password_reset_codes FOR ALL
USING (true)
WITH CHECK (true);

-- 6. FONCTION: Demander un code de réinitialisation
CREATE OR REPLACE FUNCTION request_password_reset(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  new_code TEXT;
  expiry TIMESTAMP WITH TIME ZONE;
  user_exists UUID;
BEGIN
  -- Vérifier que l'utilisateur existe
  SELECT id INTO user_exists
  FROM profiles
  WHERE email = user_email
  LIMIT 1;
  
  IF user_exists IS NULL THEN
    RAISE EXCEPTION 'Aucun compte associé à cet email';
  END IF;
  
  -- Générer code 6 chiffres
  new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Expiration dans 15 minutes
  expiry := NOW() + INTERVAL '15 minutes';
  
  -- Invalider tous les anciens codes de cet email
  UPDATE password_reset_codes
  SET used = TRUE, used_at = NOW()
  WHERE email = user_email AND used = FALSE;
  
  -- Créer le nouveau code
  INSERT INTO password_reset_codes (email, code, expires_at, user_id)
  VALUES (user_email, new_code, expiry, user_exists);
  
  -- Retourner le code
  RETURN json_build_object(
    'code', new_code,
    'expires_at', expiry,
    'email', user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FONCTION: Réinitialiser le mot de passe avec code
CREATE OR REPLACE FUNCTION reset_password_with_code(
  user_email TEXT,
  user_code TEXT,
  new_password TEXT
)
RETURNS JSON AS $$
DECLARE
  reset_record RECORD;
  user_uuid UUID;
BEGIN
  -- Vérifier le code
  SELECT * INTO reset_record
  FROM password_reset_codes
  WHERE email = user_email
    AND code = user_code
    AND used = FALSE
    AND expires_at > NOW()
  LIMIT 1;
  
  IF reset_record IS NULL THEN
    RAISE EXCEPTION 'Code invalide ou expiré';
  END IF;
  
  -- Récupérer l'ID utilisateur depuis auth.users
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Utilisateur introuvable';
  END IF;
  
  -- Changer le mot de passe (crypté avec bcrypt)
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE id = user_uuid;
  
  -- Marquer le code comme utilisé
  UPDATE password_reset_codes
  SET used = TRUE, used_at = NOW()
  WHERE id = reset_record.id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Mot de passe réinitialisé avec succès'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. VÉRIFICATION
SELECT 'Configuration terminée ✅' as status;

-- 9. VOIR la structure créée
SELECT 
  'Table password_reset_codes' as type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'password_reset_codes'
ORDER BY ordinal_position;

