-- Script pour déboguer et corriger les politiques RLS sur la table profiles

-- 1. Vérifier les politiques existantes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 2. Vérifier le nombre total de profils (sans RLS)
SET row_security = off;
SELECT COUNT(*) as total_profiles_without_rls FROM profiles;
SET row_security = on;

-- 3. Vérifier le nombre de profils avec RLS activé
SELECT COUNT(*) as total_profiles_with_rls FROM profiles;

-- 4. Vérifier les rôles des utilisateurs
SELECT role, COUNT(*) as count 
FROM profiles 
GROUP BY role 
ORDER BY count DESC;

-- 5. Supprimer les anciennes politiques (si elles existent)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 6. Créer de nouvelles politiques plus permissives pour les admins
-- Politique pour que les utilisateurs voient leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Politique pour que les utilisateurs modifient leur propre profil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour que les utilisateurs créent leur propre profil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour que les admins voient TOUS les profils
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Politique pour que les admins modifient tous les profils
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 7. Vérifier les nouvelles politiques
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 8. Test final - compter les profils en tant qu'admin
-- (Cette requête devrait maintenant retourner tous les profils si l'utilisateur connecté est admin)
SELECT COUNT(*) as final_count FROM profiles;
