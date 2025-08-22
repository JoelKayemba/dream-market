# Règles Sécurité & Conformité

## Principes de sécurité

### Philosophie "Security by Design"
- **Intégration** : Sécurité intégrée dès la conception
- **Minimisation** : Accès minimal aux données et fonctionnalités
- **Transparence** : Communication claire sur les pratiques de sécurité
- **Évolution** : Adaptation continue aux menaces émergentes

### Conformité RDC
- **Législation locale** : Respect des lois congolaises sur la protection des données
- **Standards internationaux** : Bonnes pratiques reconnues
- **Secteur agricole** : Normes spécifiques au domaine alimentaire
- **Commerce électronique** : Réglementations applicables

## Gestion des secrets et configuration

### Variables d'environnement
- **Préfixe obligatoire** : `EXPO_PUBLIC_` pour toutes les variables publiques
- **Aucun secret embarqué** : Pas de clés API, mots de passe ou tokens dans le code
- **Configuration runtime** : Variables chargées dynamiquement selon l'environnement

### Exemples de variables autorisées
```bash
EXPO_PUBLIC_API_URL=https://api.dreammarket.rdc
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_SUPPORT_EMAIL=support@oft.rdc
```

### Exemples de variables interdites
```bash
# ❌ INTERDIT - Secrets embarqués
API_SECRET_KEY=sk_live_123456789
DATABASE_PASSWORD=password123
JWT_SECRET=mysecretkey

# ❌ INTERDIT - Clés privées
STRIPE_SECRET_KEY=sk_test_123
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Protection des données personnelles (PII)

### Données collectées (minimales)
- **Profil basique** : Nom, téléphone, adresse de livraison
- **Préférences** : Produits favoris, historique d'achat
- **Données de session** : Panier, préférences temporaires

### Données NON collectées
- **Informations sensibles** : Numéro de carte, données bancaires
- **Données biométriques** : Empreintes, reconnaissance faciale
- **Localisation précise** : GPS, adresse IP exacte
- **Données de santé** : Informations médicales, allergies

### Stockage local sécurisé
- **expo-secure-store** : Chiffrement automatique des données sensibles
- **Pas d'AsyncStorage** : Éviter le stockage en clair
- **Pas de redux-persist** : Contrôle manuel de la persistance
- **Chiffrement** : Clés dérivées du device ID

### Exemple d'implémentation
```javascript
// ✅ CORRECT - Utilisation d'expo-secure-store
import * as SecureStore from 'expo-secure-store';

// Stockage sécurisé
await SecureStore.setItemAsync('user_profile', JSON.stringify(profile));

// Récupération sécurisée
const profile = await SecureStore.getItemAsync('user_profile');

// ❌ INCORRECT - Utilisation d'AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
```

## Validation et sanitisation

### Règles de validation des inputs
- **Nom** : 2-50 caractères, lettres et espaces uniquement
- **Téléphone** : Format RDC (+243), validation regex stricte
- **Adresse** : 10-200 caractères, caractères spéciaux limités
- **Email** : Format standard, validation côté client et serveur

### Exemple de validation
```javascript
// Validation du téléphone RDC
const validatePhone = (phone) => {
  const phoneRegex = /^(\+243|243)?[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error('Format de téléphone invalide. Utilisez le format RDC (+243)');
  }
  return phone.replace(/^(\+243|243)/, '+243');
};

// Sanitisation de l'adresse
const sanitizeAddress = (address) => {
  return address
    .trim()
    .replace(/[<>]/g, '') // Supprimer les balises HTML
    .substring(0, 200);   // Limiter la longueur
};
```

### Protection contre les injections
- **HTML** : Échappement des caractères spéciaux
- **SQL** : Utilisation de requêtes paramétrées (Supabase)
- **XSS** : Validation stricte des entrées utilisateur
- **CSRF** : Tokens de sécurité pour les actions sensibles

## Journalisation et monitoring

### Politique de logs
- **Niveau de détail** : Limité en production, détaillé en développement
- **Données sensibles** : Aucune information personnelle dans les logs
- **Rotation** : Limitation de la taille et de la durée de conservation
- **Accès** : Restreint aux administrateurs système

### Exemples de logs autorisés
```javascript
// ✅ AUTORISÉ - Informations techniques
logger.info('User authenticated successfully', { userId: 'user_123' });
logger.warn('Network request failed', { endpoint: '/api/products', status: 500 });
logger.error('Database connection error', { error: 'Connection timeout' });

// ❌ INTERDIT - Données personnelles
logger.info('User profile updated', { 
  name: 'Jean Mukeba', 
  phone: '+243123456789',
  address: '123 Avenue du Commerce, Kinshasa'
});
```

### Monitoring de sécurité
- **Tentatives de connexion** : Détection des attaques par force brute
- **Activité suspecte** : Changements de profil inhabituels
- **Erreurs système** : Alertes sur les défaillances de sécurité
- **Performance** : Surveillance des temps de réponse et des ressources

## Badge "Sponsorisé" obligatoire

### Règles d'affichage
- **Visibilité** : Badge clairement visible, non masquable
- **Position** : Toujours visible avec le contenu sponsorisé
- **Design** : Distinction visuelle claire du contenu organique
- **Cohérence** : Même style sur tous les écrans

### Implémentation technique
```javascript
// Composant Badge Sponsorisé
const SponsoredBadge = () => (
  <View style={styles.sponsoredBadge}>
    <Text style={styles.sponsoredText}>Sponsorisé</Text>
  </View>
);

// Utilisation obligatoire
const ProductCard = ({ product, isSponsored }) => (
  <View style={styles.card}>
    {isSponsored && <SponsoredBadge />}
    <ProductContent product={product} />
  </View>
);
```

### Contrôles admin
- **Gestion centralisée** : Interface admin pour activer/désactiver
- **Audit trail** : Historique des modifications de statut
- **Validation** : Contrôle obligatoire avant publication
- **Reporting** : Statistiques sur le contenu sponsorisé

## RLS Supabase (Row Level Security)

### Principes d'implémentation
- **Politique par défaut** : Tout refuser sauf si explicitement autorisé
- **Rôles séparés** : Clients, admins, système avec permissions distinctes
- **Audit complet** : Traçabilité de toutes les actions
- **Tests automatisés** : Validation des politiques de sécurité

### Exemples de politiques
```sql
-- Politique pour le catalogue (lecture publique)
CREATE POLICY "Catalogue public" ON products
FOR SELECT USING (true);

-- Politique pour les commandes (utilisateur identifié)
CREATE POLICY "Commandes utilisateur" ON orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour les admins (gestion complète)
CREATE POLICY "Admin complet" ON products
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### Séparation des rôles
- **Client** : Lecture catalogue, gestion profil, commandes
- **Admin** : Gestion complète des données, promotions
- **Système** : Opérations techniques, maintenance
- **Audit** : Lecture seule des logs et métriques

## Gestion des sessions

### Authentification
- **JWT tokens** : Tokens courts durée, renouvellement automatique
- **Refresh tokens** : Renouvellement transparent des sessions
- **Déconnexion** : Invalidation immédiate des tokens
- **Multi-device** : Support de plusieurs appareils par utilisateur

### Sécurité des sessions
- **Expiration** : Sessions automatiquement expirées
- **Inactivité** : Déconnexion après période d'inactivité
- **Device tracking** : Suivi des appareils connectés
- **Anomalies** : Détection des connexions suspectes

## Tests de sécurité

### Tests automatisés
- **Validation des inputs** : Tests unitaires sur tous les validators
- **Authentification** : Tests des mécanismes de connexion
- **Autorisation** : Validation des politiques d'accès
- **Injection** : Tests contre les attaques XSS et SQL

### Tests manuels
- **Audit de sécurité** : Revue du code par experts
- **Tests de pénétration** : Simulation d'attaques réelles
- **Revue des dépendances** : Vérification des vulnérabilités
- **Tests d'intégration** : Validation des flux complets

## Plan de réponse aux incidents

### Détection
- **Monitoring 24/7** : Surveillance continue des systèmes
- **Alertes automatiques** : Notifications immédiates des anomalies
- **Escalade** : Procédure de remontée des incidents
- **Documentation** : Enregistrement détaillé de tous les événements

### Réponse
- **Isolation** : Contrôle immédiat de l'incident
- **Investigation** : Analyse rapide de la cause
- **Correction** : Résolution du problème de sécurité
- **Communication** : Information des parties prenantes

### Récupération
- **Restoration** : Retour à l'état sécurisé
- **Analyse post-mortem** : Revue complète de l'incident
- **Amélioration** : Mise à jour des procédures
- **Prévention** : Renforcement des mesures de sécurité
