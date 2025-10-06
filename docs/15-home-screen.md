# Écran d'Accueil - Dream Market

## Vue d'ensemble

L'écran d'accueil de Dream Market est le point d'entrée principal de l'application. Il présente une bannière inspirante et cinq sections dynamiques qui consomment les API stubs pour afficher du contenu pertinent et engageant.

## Architecture de l'Écran

### Structure des Sections (ordre d'affichage)

```
┌─────────────────────────────────────┐
│           Bannière d'accueil        │
│    "Du champ à votre table"        │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Produits sponsorisés         │
│    HorizontalRail + ProductCard     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│      Recommandés pour vous         │
│    HorizontalRail + ProductCard     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│           Nouveautés               │
│    HorizontalRail + ProductCard     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│           Catégories               │
│        CategoryTiles Grid          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│       Les plus commandés           │
│    HorizontalRail + ProductCard     │
└─────────────────────────────────────┘
```

### Composants Utilisés

#### 1. Bannière d'Accueil
- **Composant** : `Banner.jsx`
- **Contenu** :
  - Titre : "Du champ à votre table."
  - Sous-titre : "Fraîcheur locale, choix responsable."
  - CTA : "Découvrir le catalogue"
- **Action** : Navigation vers l'onglet Produits

#### 2. Produits Sponsorisés
- **Composant** : `SponsoredProductsSection.jsx`
- **Source** : `promotionsApi.getActive({ placement: 'home' })` + enrichissement `productsApi.getById()`
- **Affichage** : `HorizontalRail` avec `ProductCard`
- **Badge** : "Sponsorisé" (jaune maïs)
- **Tri** : Par priorité de promotion (décroissant)

#### 3. Recommandés pour Vous
- **Composant** : `RecommendedProductsSection.jsx`
- **Source** : `productsApi.getList({ sort: 'price_desc', page: 1, pageSize: 6 })`
- **Affichage** : `HorizontalRail` avec `ProductCard`
- **Logique** : Tri par prix décroissant (simulation de recommandations)

#### 4. Nouveautés
- **Composant** : `NewProductsSection.jsx`
- **Source** : `productsApi.getList({ sort: 'newest', page: 1, pageSize: 6 })`
- **Affichage** : `HorizontalRail` avec `ProductCard`
- **Logique** : Tri par date de création (plus récent en premier)

#### 5. Catégories
- **Composant** : `CategoriesSection.jsx`
- **Contenu** : Données statiques (5 catégories principales)
- **Affichage** : `CategoryTiles` en grille responsive
- **Navigation** : Clic → `ProductsScreen` filtré sur la catégorie

#### 6. Les Plus Commandés
- **Composant** : `PopularProductsSection.jsx`
- **Source** : `productsApi.getList({ page: 1, pageSize: 6 })` + simulation `ordersCount`
- **Affichage** : `HorizontalRail` avec `ProductCard`
- **Logique** : Ajout fictif d'un champ `ordersCount` pour trier par popularité

## API Utilisées

### Promotions API
```javascript
// Récupération des promotions actives pour la page d'accueil
const promotions = await promotionsApi.getActivePromotions({ 
  placement: 'home' 
});

// Structure de retour
{
  id: "prom-001",
  type: "product",
  elementId: "leg-001",
  placement: "home",
  priority: 10,
  start: "2025-08-01T00:00:00Z",
  end: "2025-08-31T23:59:59Z",
  badge: "Sponsorisé"
}
```

### Produits API
```javascript
// Produits sponsorisés (par ID)
const product = await productsApi.getById("leg-001");

// Produits recommandés (tri par prix)
const recommended = await productsApi.getList({ 
  sort: 'price_desc', 
  page: 1, 
  pageSize: 6 
});

// Nouveautés (tri par date)
const newProducts = await productsApi.getList({ 
  sort: 'newest', 
  page: 1, 
  pageSize: 6 
});

// Produits populaires (avec simulation ordersCount)
const popular = await productsApi.getList({ 
  page: 1, 
  pageSize: 6 
});
```

## Gestion des États & Feedback

### Pattern de Feedback Standard

Chaque section suit le même pattern d'affichage :

```
Loading → Error → Empty → Content
```

#### 1. État de Chargement
```javascript
if (isLoading) {
  return (
    <SectionHeader title="..." />
    <LoadingView variant="rail" itemCount={6} />
  );
}
```

#### 2. État d'Erreur
```javascript
if (isError) {
  return (
    <SectionHeader title="..." />
    <ErrorView
      title="Erreur de chargement"
      message="Impossible de charger les données"
      onRetry={retry}
      variant="inline"
    />
  );
}
```

#### 3. État Vide
```javascript
if (isEmpty) {
  return (
    <SectionHeader title="..." />
    <EmptyState
      icon="🌟"
      title="Aucun produit"
      message="Aucun produit disponible"
      actionText="Voir tous les produits"
      onActionPress={onSeeAllPress}
    />
  );
}
```

#### 4. État de Succès
```javascript
return (
  <SectionHeader title="..." />
  <HorizontalRail
    data={products}
    renderItem={({ item }) => (
      <ProductCard {...item} onPress={onProductPress} />
    )}
  />
);
```

### Hook useAsync

Chaque section utilise le hook `useAsync` pour gérer les états :

```javascript
const {
  data: products,
  isLoading,
  isError,
  error,
  retry,
} = useAsync(
  () => productsApi.getList(params),
  true // Exécution immédiate
);
```

## Responsivité & Tablettes

### Breakpoints Utilisés
- **Mobile** : Rails = 1-2 cartes visibles
- **Tablette Portrait** : Rails = 2-3 cartes visibles
- **Tablette Paysage** : Rails = 3-4 cartes visibles

### Adaptation des Composants
```javascript
const { isTablet } = useResponsive();

// Adaptation des tailles selon l'écran
const itemWidth = isTablet ? 200 : 160;
const itemHeight = isTablet ? 250 : 200;
```

### Grille des Catégories
- **Mobile** : 2 colonnes
- **Tablette Portrait** : 3 colonnes
- **Tablette Paysage** : 4 colonnes

## Navigation & Actions

### Actions Principales
1. **Bannière CTA** : Navigation vers onglet Produits
2. **Catégories** : Navigation vers Produits + filtre catégorie
3. **Produits** : Navigation vers détails produit
4. **"Voir tout"** : Navigation vers onglet Produits
5. **Ajouter au panier** : Log (sera implémenté plus tard)

### Navigation Implémentée
```javascript
// Navigation vers l'onglet Produits
const handleNavigateToProducts = () => {
  navigation.navigate('MainTabs', { screen: 'Products' });
};

// Navigation vers une catégorie spécifique
const handleCategoryPress = (category) => {
  navigation.navigate('MainTabs', { 
    screen: 'Products',
    params: { category: category.id }
  });
};

// Navigation vers les détails d'un produit
const handleProductPress = (product) => {
  navigation.navigate('ProductDetails', { productId: product.id });
};
```

## Textes & Localisation

### Textes par Défaut (FR)
- **Bannière** : "Du champ à votre table." / "Fraîcheur locale, choix responsable."
- **Sections** : "Produits sponsorisés", "Recommandés pour vous", "Nouveautés", "Catégories", "Les plus commandés"
- **Actions** : "Découvrir le catalogue", "Voir tout", "Réessayer"
- **États** : "Erreur de chargement", "Aucun produit", "Impossible de charger les données"

### Paramétrage Futur
Les textes sont actuellement hardcodés mais seront paramétrables côté admin dans les étapes suivantes.

## Performance & Optimisations

### Gestion des Requêtes
- **Exécution immédiate** : Promotions et produits de base
- **Exécution différée** : Détails des produits sponsorisés
- **Annulation** : Gestion des requêtes annulées lors du démontage

### Mémoire & Rendu
- **Skeleton loading** : 6 cartes par défaut
- **Lazy loading** : Composants montés uniquement quand nécessaire
- **Optimisation** : Réutilisation des composants entre sections

## Gestion des Erreurs

### Types d'Erreurs Gérées
1. **Erreurs réseau** : API stubs simulées
2. **Erreurs de données** : Produits invalides ou manquants
3. **Erreurs de navigation** : Routes inexistantes

### Stratégies de Récupération
- **Retry inline** : Bouton "Réessayer" dans chaque section
- **Fallback gracieux** : Affichage d'EmptyState en cas d'échec
- **Logs de debug** : Messages d'erreur détaillés en mode DEV

## Tests & Validation

### Vérifications Fonctionnelles
- [ ] Bannière s'affiche avec texte et image
- [ ] 5 sections se chargent sans erreur
- [ ] États loading/error/empty fonctionnent
- [ ] Navigation vers Produits fonctionne
- [ ] Navigation vers catégories fonctionne
- [ ] Navigation vers détails produit fonctionne

### Vérifications Techniques
- [ ] Hook useAsync fonctionne correctement
- [ ] Composants de feedback s'affichent
- [ ] Responsivité mobile/tablette
- [ ] Gestion des erreurs robuste
- [ ] Performance acceptable (pas de lag)

### Démarrage de l'App
L'application doit :
1. **Démarrer** sans erreur
2. **Afficher** la bannière d'accueil
3. **Charger** progressivement les 5 sections
4. **Gérer** les états de chargement
5. **Permettre** la navigation vers les autres écrans

## Évolution Future

### Prochaines Étapes
1. **Intégration Redux** : Consommation des données depuis le store
2. **Persistance locale** : Cache des données d'accueil
3. **Analytics** : Tracking des interactions utilisateur
4. **Personnalisation** : Recommandations basées sur l'historique
5. **Supabase** : Remplacement des stubs par l'API réelle

### Améliorations Possibles
- **Pull-to-refresh** : Actualisation manuelle du contenu
- **Infinite scroll** : Chargement progressif des sections
- **Animations** : Transitions fluides entre états
- **Offline** : Affichage du contenu en cache
- **A/B Testing** : Variantes de contenu pour optimiser l'engagement








