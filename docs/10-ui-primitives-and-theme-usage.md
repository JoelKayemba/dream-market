# Composants UI Primitifs & Usage du Thème - Dream Market

## Vue d'ensemble

Ce document décrit tous les composants UI primitifs créés pour consommer le design system Dream Market, leurs props, exemples d'usage et règles d'accessibilité.

## 🎨 **Composants Primitifs "Contenu"**

### 1. **Banner.jsx**

**Description** : Héros/bannière d'accueil avec image, titre, sous-titre et CTA optionnel.

**Props** :
```javascript
{
  title: string,           // "Du champ à votre table."
  subtitle: string,        // "Fraîcheur locale, choix responsable."
  imageUrl: string,        // URL de l'image de fond
  ctaLabel: string,        // "Découvrir"
  onCtaPress: function     // Callback du CTA
}
```

**Exemple d'usage** :
```javascript
<Banner
  title="Du champ à votre table."
  subtitle="Fraîcheur locale, choix responsable."
  imageUrl="https://example.com/banner.jpg"
  ctaLabel="Découvrir"
  onCtaPress={() => navigation.navigate('Products')}
/>
```

**Caractéristiques** :
- **Responsive** : Tailles adaptatives selon tablette/mobile
- **Accessible** : Touch targets ≥44dp, labels complets
- **Image** : Placeholder si pas d'image, overlay pour lisibilité
- **CTA** : Bouton primaire vert avec ombre

---

### 2. **CategoryTiles.jsx**

**Description** : Grille de tuiles de catégories (Légumes, Fruits, Élevage, etc.).

**Props** :
```javascript
{
  items: array,            // Array d'objets { id, label, iconName, onPress }
  onItemPress: function    // Callback global (optionnel)
}
```

**Structure des items** :
```javascript
const defaultItems = [
  { id: '1', label: 'Légumes', iconName: '🥬', onPress: () => {} },
  { id: '2', label: 'Fruits', iconName: '🍎', onPress: () => {} },
  { id: '3', label: 'Élevage', iconName: '🐔', onPress: () => {} },
  { id: '4', label: 'Transformés', iconName: '🥫', onPress: () => {} },
  { id: '5', label: 'Intrants', iconName: '🌱', onPress: () => {} },
];
```

**Exemple d'usage** :
```javascript
<CategoryTiles
  items={categories}
  onItemPress={(category) => navigation.navigate('Products', { category: category.id })}
/>
```

**Responsivité** :
- **Mobile** : 2 colonnes
- **Tablette portrait** : 3 colonnes  
- **Tablette paysage** : 4 colonnes

---

## 🃏 **Cartes "Contenu"**

### 3. **ProductCard.jsx**

**Description** : Carte produit avec image (ratio 4:3), nom, prix, fournisseur et badge Sponsorisé.

**Props** :
```javascript
{
  id: string,              // Identifiant unique
  name: string,            // Nom du produit (2 lignes max)
  imageUrl: string,        // URL de l'image
  price: number,           // Prix en FC
  supplier: string,        // Nom du fournisseur
  sponsored: boolean,      // Afficher le badge "Sponsorisé"
  onPress: function,       // Callback de clic sur la carte
  onAddToCart: function    // Callback d'ajout au panier
}
```

**Exemple d'usage** :
```javascript
<ProductCard
  id="prod_123"
  name="Tomates fraîches bio"
  imageUrl="https://example.com/tomatoes.jpg"
  price={2500}
  supplier="Ferme Bio RDC"
  sponsored={true}
  onPress={(id) => navigation.navigate('ProductDetails', { productId: id })}
  onAddToCart={(id) => dispatch(addToCart(id))}
/>
```

**Caractéristiques** :
- **Image** : Ratio 4:3, placeholder si pas d'image
- **Badge** : "Sponsorisé" en jaune maïs si `sponsored={true}`
- **Bouton** : "+" flottant pour ajouter au panier
- **Responsive** : Tailles adaptatives tablette/mobile

---

### 4. **ServiceCard.jsx**

**Description** : Carte service avec image/icône, nom, prix indicatif et durée.

**Props** :
```javascript
{
  id: string,              // Identifiant unique
  name: string,            // Nom du service
  imageUrl: string,        // URL de l'image/icône
  priceHint: string,       // "Prix indicatif"
  durationHint: string,    // "Durée du service"
  onPress: function        // Callback de clic
}
```

**Exemple d'usage** :
```javascript
<ServiceCard
  id="service_456"
  name="Diagnostic de sol"
  imageUrl="https://example.com/diagnostic.jpg"
  priceHint="À partir de 50.000 FC"
  durationHint="2-3 heures sur site"
  onPress={(id) => navigation.navigate('ServiceBooking', { serviceId: id })}
/>
```

**Caractéristiques** :
- **Layout** : Horizontal avec image à gauche
- **Navigation** : Flèche "›" pour indiquer l'action
- **Responsive** : Tailles d'image adaptatives

---

### 5. **PromoBadge.jsx**

**Description** : Badge "Sponsorisé" jaune maïs clair et lisible.

**Props** :
```javascript
{
  label: string,           // Texte du badge (défaut: "Sponsorisé")
  variant: string          // "sponsored", "new", "sale"
}
```

**Variants disponibles** :
- **sponsored** : Jaune maïs (couleur secondaire)
- **new** : Vert (couleur succès)
- **sale** : Rouge (couleur erreur)

**Exemple d'usage** :
```javascript
<PromoBadge label="Sponsorisé" variant="sponsored" />
<PromoBadge label="Nouveau" variant="new" />
<PromoBadge label="Promo" variant="sale" />
```

---

## 🚂 **"Rails" & Listes Horizontales**

### 6. **HorizontalRail.jsx**

**Description** : Conteneur de liste horizontale avec SectionHeader intégré.

**Props** :
```javascript
{
  title: string,           // Titre de la section
  data: array,             // Données à afficher
  renderItem: function,    // Fonction de rendu des items
  onSeeAll: function,      // Callback "Voir tout"
  showSeeAll: boolean,     // Afficher le bouton "Voir tout"
  horizontalPadding: boolean, // Padding horizontal
  snapToInterval: boolean  // Snapping doux optionnel
}
```

**Exemple d'usage** :
```javascript
<HorizontalRail
  title="Produits sponsorisés"
  data={sponsoredProducts}
  renderItem={({ item }) => (
    <ProductCard
      id={item.id}
      name={item.name}
      price={item.price}
      sponsored={true}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
    />
  )}
  onSeeAll={() => navigation.navigate('Products', { filter: 'sponsored' })}
  showSeeAll={true}
/>
```

**Caractéristiques** :
- **SectionHeader** : Intégré avec bouton "Voir tout"
- **Spacing** : Cohérent avec le thème
- **Placeholder** : Affiché si pas de données
- **Snapping** : Optionnel pour une expérience fluide

---

## 🔧 **État & Feedback Visuel**

### 7. **EmptyState.jsx** (existant)

**Description** : Visuel + message clair pour sections vides.

**Props** :
```javascript
{
  title: string,           // Titre principal
  subtitle: string,        // Sous-titre explicatif
  iconName: string,        // Emoji ou nom d'icône
  actionLabel: string,     // Texte du bouton d'action
  onAction: function       // Callback de l'action
}
```

### 8. **Loader.jsx** (existant)

**Description** : Spinner/skeleton respectant le thème.

**Props** :
```javascript
{
  variant: string          // "spinner" | "skeleton"
}
```

---

## 🎯 **Règles d'Accessibilité Appliquées**

### Touch Targets
- **Minimum** : 44x44 dp pour tous les éléments interactifs
- **Boutons** : Hauteur minimale de 44dp
- **Cartes** : Largeur minimale de 44dp

### Contrastes
- **WCAG AA** : Respecté pour tous les textes
- **Badges** : Couleurs contrastées (jaune maïs sur fond sombre)
- **Overlays** : Semi-transparence pour la lisibilité

### Labels & Hints
- **accessibilityLabel** : Descriptions complètes
- **accessibilityHint** : Actions attendues
- **accessibilityRole** : Rôles appropriés (button, image)

### Textes
- **Taille minimale** : 14dp pour tous les textes
- **Hiérarchie** : Title > Body > Small claire
- **Line-height** : 1.4 minimum pour la lisibilité

---

## 📱 **Règles Tablettes (Responsivité)**

### Colonnes Adaptatives
- **Mobile** : 1 colonne (liste)
- **Tablette portrait** : 2-3 colonnes
- **Tablette paysage** : 3-4 colonnes

### Marges & Espacements
- **Mobile** : 16dp (spacing.md)
- **Tablette** : 24dp (spacing.lg)
- **Desktop** : 40dp (spacing.xl)

### Tailles d'Images
- **Mobile** : 120dp (ratio 4:3)
- **Tablette** : 160dp (ratio 4:3 maintenu)
- **Responsive** : Via hook useResponsive

---

## 🎨 **Conseils de Composition**

### Page d'Accueil
```javascript
// Structure recommandée
<ScrollView>
  <Banner 
    title="Du champ à votre table."
    subtitle="Fraîcheur locale, choix responsable."
    ctaLabel="Découvrir"
    onCtaPress={() => navigation.navigate('Products')}
  />
  
  <HorizontalRail
    title="Produits sponsorisés"
    data={sponsoredProducts}
    renderItem={renderProductCard}
    onSeeAll={() => navigation.navigate('Products', { filter: 'sponsored' })}
  />
  
  <HorizontalRail
    title="Recommandés pour vous"
    data={recommendedProducts}
    renderItem={renderProductCard}
    onSeeAll={() => navigation.navigate('Products', { filter: 'recommended' })}
  />
  
  <CategoryTiles
    items={categories}
    onItemPress={(category) => navigation.navigate('Products', { category: category.id })}
  />
</ScrollView>
```

### Page Catalogue
```javascript
// Grille de produits responsive
<FlatList
  data={products}
  renderItem={({ item }) => (
    <ProductCard
      id={item.id}
      name={item.name}
      imageUrl={item.imageUrl}
      price={item.price}
      supplier={item.supplier}
      sponsored={item.sponsored}
      onPress={(id) => navigation.navigate('ProductDetails', { productId: id })}
      onAddToCart={(id) => dispatch(addToCart(id))}
    />
  )}
  numColumns={getColumnCount()} // 1 mobile, 2-3 tablette
  keyExtractor={(item) => item.id}
/>
```

---

## 🚀 **Intégration avec le Thème**

### Couleurs
```javascript
import { colors } from '../theme';

// Utilisation cohérente
backgroundColor: colors.background.primary,
color: colors.text.primary,
borderColor: colors.border.primary,
```

### Espacements
```javascript
import { spacing } from '../theme';

// Espacements adaptatifs
padding: spacing.md,        // 16dp
margin: spacing.lg,         // 24dp
gap: spacing.sm,            // 8dp
```

### Typographie
```javascript
import { typography } from '../theme';

// Styles de texte cohérents
...typography.textStyles.title,
...typography.textStyles.body,
...typography.textStyles.small,
```

### Breakpoints
```javascript
import { useResponsive } from '../hooks';

const { isMobile, isTablet, getColumnCount, getSpacing } = useResponsive();

// Adaptation responsive
const numColumns = getColumnCount();
const containerPadding = getSpacing('pageMargin');
```

---

## 📋 **Validation (Definition of Done)**

### ✅ Composants Créés
- [ ] Banner.jsx - Bannière d'accueil responsive
- [ ] CategoryTiles.jsx - Grille de catégories adaptative
- [ ] ProductCard.jsx - Carte produit avec badge
- [ ] ServiceCard.jsx - Carte service horizontale
- [ ] PromoBadge.jsx - Badge "Sponsorisé" jaune
- [ ] HorizontalRail.jsx - Liste horizontale avec header

### ✅ Thème Consommé
- [ ] Couleurs du design system
- [ ] Espacements adaptatifs
- [ ] Typographie cohérente
- [ ] Breakpoints responsifs

### ✅ Accessibilité
- [ ] Touch targets ≥44dp
- [ ] Contrastes WCAG AA
- [ ] Labels et hints complets
- [ ] Textes ≥14dp

### ✅ Responsivité
- [ ] Adaptation mobile/tablette
- [ ] Colonnes adaptatives
- [ ] Espacements responsifs
- [ ] Hook useResponsive intégré

### ✅ Documentation
- [ ] Props et exemples documentés
- [ ] Règles d'accessibilité expliquées
- [ ] Conseils de composition inclus
- [ ] Intégration thème détaillée

---

## 🔧 **Dépannage**

### Erreurs Courantes

1. **Composant non trouvé**
   - Vérifier l'import depuis `../components`
   - Utiliser l'index centralisé

2. **Styles non appliqués**
   - Vérifier l'import du thème
   - Utiliser les constantes de spacing/colors

3. **Responsivité non fonctionnelle**
   - Vérifier l'import de useResponsive
   - Utiliser getSpacing() et getColumnCount()

### Bonnes Pratiques

- **Imports** : Utiliser l'index centralisé des composants
- **Props** : Toujours définir des valeurs par défaut
- **Accessibilité** : Inclure labels et hints complets
- **Responsivité** : Tester sur différents appareils

---

**Note** : Ces composants sont prêts pour l'implémentation des écrans réels dans les étapes suivantes (Étape 12-16).






