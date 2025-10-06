# Mocks & API Stubs - Dream Market

## Vue d'ensemble

Cette étape met en place des jeux de données factices réalistes et une couche d'API simulée pour alimenter les écrans de Dream Market sans backend. L'objectif est de fournir des signatures compatibles Supabase pour la future intégration.

## Architecture des Mocks

### Structure des données

#### 1. Produits (`products.mock.js`)
- **30 produits** répartis sur 5 catégories
- **Catégories** : légumes, fruits, élevage, transformés, intrants
- **Champs obligatoires** : id, name, description, price, imageUrl, supplier, category, isOrganic, createdAt
- **Répartition** : 6 produits par catégorie
- **Textes** : Français naturel, descriptions ≤ 240 caractères

#### 2. Services (`services.mock.js`)
- **8 services** agricoles proposés par OFT
- **Types** : coaching, formation, diagnostic, gestion, certification
- **Champs** : id, name, description, priceHint, durationHint, imageUrl
- **Exemples** : Coaching maraîchage, Formation compost, Diagnostic de production

#### 3. Promotions (`promotions.mock.js`)
- **8 promotions** sponsorisées actives
- **Types** : product, vendor_product
- **Placements** : home, category:legumes, category:fruits, etc.
- **Priorités** : système de tri décroissant (10 → 3)
- **Badge** : "Sponsorisé" uniforme

#### 4. Commandes (`orders.mock.js`)
- **État initial** : tableau vide
- **Modèle** : structure complète pour futures insertions
- **Validation** : items, customer, deliveryMode requis

## API Simulée

### Client HTTP (`httpClient.js`)

**⚠️ ATTENTION** : Aucun appel réseau réel n'est effectué.

```javascript
// Placeholder pour futures implémentations Supabase
export const get = async (url, options) => { /* simulation */ };
export const post = async (url, data, options) => { /* simulation */ };
```

**Commentaire** : "Sera remplacé plus tard par Supabase (Étape backend)."

### Produits API (`productsApi.js`)

#### `getList(params)`
```javascript
// Paramètres
{
  search: string,        // Recherche case-insensitive
  category: string,      // Filtre par catégorie
  sort: 'price_asc' | 'price_desc' | 'newest',
  page: number,          // Défaut: 1
  pageSize: number       // Défaut: 12
}

// Retour
{
  items: Product[],
  page: number,
  pageSize: number,
  total: number,
  totalPages: number
}
```

#### `getById(id)`
- Retourne un produit complet avec statut `sponsored`
- Gestion d'erreur si produit non trouvé

#### Fonctionnalités
- **Filtrage** : par catégorie exacte
- **Recherche** : sur name, description, supplier
- **Tri** : prix croissant/décroissant, nouveauté
- **Pagination** : pages stables, pas de doublons
- **Sponsorisé** : détection via promotions actives

### Promotions API (`promotionsApi.js`)

#### `getActive({ placement })`
```javascript
// Paramètres
{
  placement: string      // 'home' | 'category:legumes' | etc.
}

// Retour
Promotion[] // Triées par priorité décroissante
```

#### Fonctionnalités
- **Filtrage** : par placement et dates actives
- **Tri** : par priorité (décroissant)
- **Validation** : vérification des dates start/end
- **Statistiques** : comptage par type et placement

### Services API (`servicesApi.js`)

#### `getList()`
- Retourne la liste complète des services
- Délai simulé : 200-400ms

#### Fonctionnalités
- **Recherche** : sur name, description, priceHint
- **Filtrage** : par fourchette de prix (low/medium/high)
- **Populaires** : simulation de services recommandés

### Commandes API (`ordersApi.js`)

#### `create(orderPayload)`
```javascript
// Validation requise
{
  items: OrderItem[],           // length > 0
  customer: {
    name: string,               // requis
    phone: string,              // requis
    address: string,            // requis
    pickupPoint?: string        // optionnel
  },
  deliveryMode: 'domicile' | 'point'  // requis
}

// Retour
{
  id: string,
  status: 'pending',
  createdAt: string,
  grandTotal: number
}
```

#### Fonctionnalités
- **Validation** : vérification des données obligatoires
- **Calculs** : totaux automatiques avec frais de livraison
- **Génération** : ID unique et timestamp
- **Stockage** : en mémoire (ordersMock)

### Authentification API (`authApi.js`)

#### `login(credentials)`
```javascript
{
  emailOrPhone: string,  // requis
  password: string       // requis, min 6 caractères
}
```

#### `register(userData)`
```javascript
{
  name: string,          // requis
  email: string,         // requis, format valide
  phone: string,         // requis
  password: string,      // requis, min 6 caractères
  confirmPassword: string // requis, doit correspondre
}
```

#### Fonctionnalités
- **Validation** : règles métier simulées
- **Simulation** : pas de tokens sensibles
- **Gestion d'erreurs** : messages d'erreur détaillés

## Comportements des Stubs

### Latence simulée
- **Délai** : 200-400ms (aléatoire)
- **Simulation** : `setTimeout` avec Promise
- **Réalisme** : variation pour simuler les conditions réseau

### Erreurs simulées
- **Fréquence** : 5-10% de chance (configurable)
- **Types** : "Erreur réseau simulée"
- **Désactivation** : flag `shouldSimulateError()`

### Recherche et filtres
- **Case-insensitive** : recherche tolérante
- **Filtres** : catégorie exacte, placement
- **Tri** : stable, pas de doublons

### Pagination
- **Pages stables** : même contenu pour même page
- **Pas de doublons** : articles uniques par page
- **Métadonnées** : total, totalPages, page courante

## Sécurité & Confidentialité

### Guidelines strictes
1. **Aucune PII réelle** : noms/numéros fictifs
2. **Aucun secret** : pas de clés/tokens
3. **Taille modeste** : URLs placeholders uniquement
4. **Logs prudents** : erreurs simulées en DEV uniquement

### Données sensibles
- **Mots de passe** : validation simulée uniquement
- **Tokens** : pas de stockage côté client
- **PII** : données fictives pour tests

## Compatibilité avec les Écrans

### Accueil
- **Rails sponsorisés** : `productsApi.getSponsored('home')`
- **Recommandés** : `productsApi.getList({ sort: 'newest', pageSize: 6 })`
- **Nouveautés** : `productsApi.getList({ sort: 'newest', pageSize: 4 })`

### Catalogue
- **Filtres** : `productsApi.getList({ category, sort, page, pageSize })`
- **Recherche** : `productsApi.getList({ search, page, pageSize })`
- **Pagination** : navigation entre pages

### Détails produit
- **Badge sponsorisé** : `promotionsApi.isProductSponsored(id)`
- **Informations** : `productsApi.getById(id)`

### Panier/Checkout
- **Création commande** : `ordersApi.create(orderPayload)`
- **Validation** : vérification des données obligatoires

### Services
- **Liste** : `servicesApi.getList()`
- **Recherche** : `servicesApi.search(term)`
- **Populaires** : `servicesApi.getPopular(4)`

### Historique commandes
- **Lecture** : `ordersApi.getMyOrders()`
- **Filtrage** : `ordersApi.getByStatus(status)`
- **Statistiques** : `ordersApi.getStats()`

## Préparation Supabase

### Signatures compatibles
- **Pagination** : structure identique aux requêtes Supabase
- **Filtres** : paramètres standardisés
- **Recherche** : syntaxe compatible
- **Gestion d'erreurs** : format d'erreur standard

### Migration future
1. **Remplacement** : `httpClient.js` par Supabase client
2. **Adaptation** : endpoints vers tables Supabase
3. **Authentification** : RLS et auth Supabase
4. **Validation** : contraintes base de données

### API Layer
- **Abstraction** : couche d'API centralisée
- **Sélecteurs** : compatibles avec données distantes
- **Actions** : standardisées pour synchronisation

## Utilisation

### Import des mocks
```javascript
import productsMock from '@/mocks/products.mock';
import servicesMock from '@/mocks/services.mock';
import promotionsMock from '@/mocks/promotions.mock';
```

### Import des APIs
```javascript
import productsApi from '@/api/productsApi';
import servicesApi from '@/api/servicesApi';
import ordersApi from '@/api/ordersApi';
import authApi from '@/api/authApi';
```

### Exemple d'utilisation
```javascript
// Récupérer des produits sponsorisés
const sponsoredProducts = await productsApi.getSponsored('home');

// Créer une commande
const order = await ordersApi.create({
  items: cartItems,
  customer: { name: 'Jean', phone: '+243...', address: '...' },
  deliveryMode: 'domicile'
});

// Connexion utilisateur
const authResult = await authApi.login({
  emailOrPhone: 'user@example.com',
  password: 'password123'
});
```

## Tests & Validation

### Vérifications
- [ ] Mocks créés et riches en données
- [ ] APIs retournent des Promises avec latence
- [ ] Zéro appel réseau réel
- [ ] Gestion des erreurs simulées
- [ ] Validation des données d'entrée
- [ ] Signatures compatibles Supabase

### Démarrage de l'App
L'application doit :
1. **Démarrer** sans erreur
2. **Charger** les mocks en mémoire
3. **Préparer** les APIs simulées
4. **Rester** prête pour consommation future

## Évolution Future

### Prochaines étapes
1. **Intégration Redux** : consommation des APIs dans les slices
2. **Écrans fonctionnels** : affichage des données mockées
3. **Navigation enrichie** : utilisation des données dans les composants
4. **Supabase Integration** : remplacement des stubs par l'API réelle

### Maintenance
- **Mise à jour mocks** : données réalistes et actuelles
- **Évolution APIs** : nouvelles fonctionnalités simulées
- **Documentation** : exemples d'utilisation et cas d'usage








