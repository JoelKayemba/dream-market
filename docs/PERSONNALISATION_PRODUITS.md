# 🎯 Système de Personnalisation des Produits - Dream Market

## 📊 Problème Actuel

**Tous les utilisateurs voient les produits dans le même ordre** (tri par `created_at` décroissant), ce qui ne permet pas de personnaliser l'expérience selon les préférences de chaque utilisateur.

## 🎯 Objectifs

1. **Personnaliser l'ordre des produits** selon les préférences de chaque utilisateur
2. **Améliorer la découverte** de produits pertinents
3. **Augmenter l'engagement** et les conversions
4. **Respecter la vie privée** (pas de tracking invasif)

## 💡 Suggestions d'Implémentation

### 1. **Système de Scoring/Ranking Personnalisé**

#### Critères de Scoring (par ordre de priorité)

1. **Historique de Recherche** (Poids: 30%)
   - Catégories recherchées récemment
   - Mots-clés recherchés
   - Fréquence des recherches

2. **Historique d'Achat** (Poids: 25%)
   - Produits achetés précédemment
   - Catégories préférées
   - Fermes préférées

3. **Favoris** (Poids: 20%)
   - Produits ajoutés aux favoris
   - Catégories des favoris

4. **Interactions** (Poids: 15%)
   - Vues de produits (ProductDetailScreen)
   - Temps passé sur un produit
   - Ajouts au panier (même sans achat)

5. **Facteurs Globaux** (Poids: 10%)
   - Popularité générale (`is_popular`)
   - Nouveautés (`is_new`)
   - Promotions (`old_price`)
   - Disponibilité du stock

### 2. **Table de Tracking Utilisateur**

Créer une table `user_product_interactions` pour tracker :

```sql
CREATE TABLE user_product_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  interaction_type text NOT NULL, -- 'view', 'search', 'cart_add', 'favorite', 'purchase'
  category_id uuid REFERENCES categories(id),
  search_query text,
  interaction_count integer DEFAULT 1,
  last_interaction_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, product_id, interaction_type)
);

CREATE INDEX idx_user_interactions_user ON user_product_interactions(user_id);
CREATE INDEX idx_user_interactions_product ON user_product_interactions(product_id);
CREATE INDEX idx_user_interactions_type ON user_product_interactions(interaction_type);
CREATE INDEX idx_user_interactions_recent ON user_product_interactions(user_id, last_interaction_at DESC);
```

### 3. **Service de Personnalisation**

Créer `personalizationService.js` avec :

```javascript
// Calcul du score personnalisé pour un produit
calculateProductScore(userId, product, userInteractions) {
  let score = 0;
  
  // Historique de recherche (30%)
  const searchMatches = userInteractions.filter(i => 
    i.interaction_type === 'search' && 
    (i.category_id === product.category_id || 
     product.name.toLowerCase().includes(i.search_query?.toLowerCase() || ''))
  );
  score += searchMatches.length * 30;
  
  // Historique d'achat (25%)
  const purchaseMatches = userInteractions.filter(i => 
    i.interaction_type === 'purchase' && 
    (i.product_id === product.id || i.category_id === product.category_id)
  );
  score += purchaseMatches.length * 25;
  
  // Favoris (20%)
  const favoriteMatches = userInteractions.filter(i => 
    i.interaction_type === 'favorite' && 
    (i.product_id === product.id || i.category_id === product.category_id)
  );
  score += favoriteMatches.length * 20;
  
  // Interactions (15%)
  const viewMatches = userInteractions.filter(i => 
    i.interaction_type === 'view' && i.product_id === product.id
  );
  score += viewMatches.length * 15;
  
  // Facteurs globaux (10%)
  if (product.is_popular) score += 5;
  if (product.is_new) score += 3;
  if (product.old_price && product.old_price > 0) score += 2;
  if (product.stock > 0) score += 1;
  
  return score;
}

// Trier les produits par score personnalisé
sortProductsByPersonalization(products, userId, userInteractions) {
  return products.map(product => ({
    ...product,
    personalizationScore: calculateProductScore(userId, product, userInteractions)
  })).sort((a, b) => b.personalizationScore - a.personalizationScore);
}
```

### 4. **Tracking des Interactions**

#### Points de tracking à implémenter :

1. **Recherche** (`SearchScreen.jsx`)
   - Enregistrer chaque recherche avec catégorie et mots-clés

2. **Vue de Produit** (`ProductDetailScreen.jsx`)
   - Enregistrer chaque vue de produit

3. **Ajout au Panier** (`ProductCard.jsx`, `CartScreen.jsx`)
   - Enregistrer chaque ajout au panier

4. **Favoris** (`useFavorites.js`)
   - Enregistrer chaque ajout/suppression de favori

5. **Achat** (`CheckoutScreen.jsx`)
   - Enregistrer chaque produit acheté

### 5. **Ordre de Tri Personnalisé**

#### Options de tri disponibles :

1. **Personnalisé** (par défaut si utilisateur connecté)
   - Basé sur le scoring personnalisé

2. **Nouveautés**
   - `created_at` décroissant

3. **Popularité**
   - `is_popular` + nombre de ventes

4. **Prix croissant/décroissant**
   - `price` ASC/DESC

5. **Promotions**
   - `old_price` non null

6. **Stock disponible**
   - `stock > 0` en premier

### 6. **Fallback pour Utilisateurs Non Connectés**

Pour les utilisateurs non connectés :
- Utiliser un tri par défaut intelligent :
  1. Promotions en premier
  2. Nouveautés
  3. Produits populaires
  4. Stock disponible
  5. Date de création

### 7. **Mise en Cache**

- **Cache local** : Stocker les scores personnalisés dans AsyncStorage
- **Durée de vie** : 1 heure pour les interactions récentes
- **Invalidation** : Après chaque nouvelle interaction

## 🚀 Plan d'Implémentation

### Phase 1 : Infrastructure (Priorité Haute)
- [ ] Créer la table `user_product_interactions`
- [ ] Créer `personalizationService.js`
- [ ] Créer `interactionTracker.js` (utilitaire pour tracker)

### Phase 2 : Tracking (Priorité Haute)
- [ ] Implémenter le tracking dans `SearchScreen`
- [ ] Implémenter le tracking dans `ProductDetailScreen`
- [ ] Implémenter le tracking dans `ProductCard` (ajout panier)
- [ ] Implémenter le tracking dans `useFavorites`
- [ ] Implémenter le tracking dans `CheckoutScreen` (achat)

### Phase 3 : Personnalisation (Priorité Moyenne)
- [ ] Modifier `productsSlice.js` pour utiliser le scoring personnalisé
- [ ] Ajouter un sélecteur `selectPersonalizedProducts`
- [ ] Implémenter le tri personnalisé dans `HomeScreen` et `ProductsScreen`

### Phase 4 : UI/UX (Priorité Moyenne)
- [ ] Ajouter un sélecteur de tri dans `ProductsScreen`
- [ ] Afficher "Recommandé pour vous" dans `HomeScreen`
- [ ] Badge "Recommandé" sur les produits personnalisés

### Phase 5 : Optimisation (Priorité Basse)
- [ ] Mise en cache des scores
- [ ] Calcul asynchrone des scores
- [ ] Analytics pour mesurer l'efficacité

## 📈 Métriques de Succès

- **Taux de clic** sur les produits recommandés
- **Taux de conversion** (vue → panier → achat)
- **Temps passé** sur les pages produits
- **Nombre de recherches** nécessaires pour trouver un produit
- **Satisfaction utilisateur** (feedback)

## 🔒 Respect de la Vie Privée

- **Opt-in** : L'utilisateur peut désactiver la personnalisation
- **Données anonymes** : Les données sont liées à l'utilisateur mais pas partagées
- **Suppression** : L'utilisateur peut supprimer son historique
- **Transparence** : Afficher "Pourquoi ce produit est recommandé"

## 🎨 Exemples d'Affichage

### HomeScreen
```
┌─────────────────────────────────┐
│ Recommandé pour vous            │
│ Basé sur vos recherches         │
└─────────────────────────────────┘
[Produit 1] [Produit 2] [Produit 3]
```

### ProductsScreen
```
┌─────────────────────────────────┐
│ Trier par: [Personnalisé ▼]    │
│ ○ Personnalisé                  │
│ ○ Nouveautés                    │
│ ○ Prix croissant                │
│ ○ Prix décroissant              │
│ ○ Promotions                    │
└─────────────────────────────────┘
```

## 💻 Code d'Exemple

### Tracking d'une recherche
```javascript
import { trackInteraction } from '../utils/interactionTracker';

// Dans SearchScreen
const handleSearch = async (query) => {
  // ... logique de recherche existante
  
  // Track la recherche
  await trackInteraction({
    type: 'search',
    searchQuery: query,
    categoryId: selectedCategory?.id,
  });
};
```

### Affichage personnalisé
```javascript
import { selectPersonalizedProducts } from '../store/client/productsSlice';

// Dans HomeScreen ou ProductsScreen
const personalizedProducts = useSelector(selectPersonalizedProducts);
```

## 🔄 Migration

Pour les utilisateurs existants :
1. Commencer avec un tri par défaut intelligent
2. Construire progressivement le profil de personnalisation
3. Après 3-5 interactions, activer la personnalisation complète

---

**Date de création** : 19 novembre 2025
**Statut** : Proposition
**Priorité** : Haute

