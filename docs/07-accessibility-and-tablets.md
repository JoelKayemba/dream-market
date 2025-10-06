# Accessibilité & Support Tablettes - Dream Market

## Vue d'ensemble

Ce document décrit les règles et implémentations pour l'accessibilité et le support des tablettes dans Dream Market. L'objectif est de garantir une expérience utilisateur optimale sur tous les appareils et pour tous les utilisateurs.

## 🎯 Règles d'accessibilité

### Touch Targets
- **Taille minimale** : 44x44 dp pour tous les éléments tactiles
- **Espacement** : Minimum 8dp entre les éléments tactiles
- **Validation** : Respect des standards Material Design et iOS

### Contraste et couleurs
- **Ratio minimum** : 4.5:1 pour le texte normal (WCAG AA)
- **Ratio élevé** : 3:1 pour le texte large (WCAG AA)
- **Couleurs sémantiques** : Utilisation cohérente des couleurs d'état
- **Mode sombre** : Support optionnel pour réduire la fatigue oculaire

### Typographie
- **Taille minimale** : 14dp pour le texte principal
- **Scalabilité** : Support des préférences de taille de police système
- **Hauteur de ligne** : Minimum 1.4 pour une lisibilité optimale
- **Poids de police** : Support des préférences de gras système

### Navigation et focus
- **Lecteurs d'écran** : Support complet VoiceOver (iOS) et TalkBack (Android)
- **Labels explicites** : Description claire de chaque élément interactif
- **Feedback audio** : Indications sonores pour les actions importantes
- **Navigation clavier** : Support des raccourcis et focus visible

### Feedback utilisateur
- **Confirmations visuelles** : Animation ou changement d'état après action
- **Messages d'erreur** : Explications claires avec suggestions de correction
- **Vibration haptique** : Feedback tactile léger si disponible
- **Toast notifications** : Messages temporaires non intrusifs

## 📱 Support des tablettes

### Breakpoints définis
```javascript
export const breakpoints = {
  xs: 0,      // 0dp - 359dp (petits téléphones)
  sm: 360,    // 360dp - 599dp (téléphones standards)
  md: 600,    // 600dp - 899dp (téléphones larges / petites tablettes)
  lg: 900,    // 900dp - 1199dp (tablettes)
  xl: 1200    // 1200dp+ (grands écrans)
};
```

### Types d'appareils
- **Mobile** : 0dp - 599dp (téléphones)
- **Tablet** : 600dp - 1199dp (tablettes)
- **Desktop** : 1200dp+ (grands écrans)

### Grilles adaptatives
- **Mobile** : 1 colonne, espacement 16dp
- **Tablette portrait** : 2 colonnes, espacement 24dp
- **Tablette paysage** : 3 colonnes, espacement 32dp
- **Desktop** : 4 colonnes, espacement 32dp

## 🛠️ Implémentation technique

### Hook useResponsive

Le hook `useResponsive` fournit toutes les informations nécessaires pour l'adaptation :

```javascript
const {
  isMobile,
  isTablet,
  isDesktop,
  deviceType,
  isLandscape,
  isPortrait,
  gridConfig,
  getColumnCount,
  accessibility,
  getSpacing
} = useResponsive();
```

### Utilisation dans les composants

#### Adaptation de la taille des composants
```javascript
const Button = ({ size = 'medium', ...props }) => {
  const { isTablet } = useResponsive();
  
  // Sur tablette, les petits boutons deviennent moyens
  const adaptiveSize = isTablet ? 
    (size === 'small' ? 'medium' : size) : size;
  
  return (
    <TouchableOpacity style={styles[adaptiveSize]}>
      {/* Contenu du bouton */}
    </TouchableOpacity>
  );
};
```

#### Adaptation de la grille
```javascript
const ProductGrid = ({ products }) => {
  const { getColumnCount, gridConfig } = useResponsive();
  
  const columns = getColumnCount(); // 1, 2, 3 ou 4 selon l'appareil
  
  return (
    <FlatList
      data={products}
      numColumns={columns}
      columnWrapperStyle={{ gap: gridConfig.gap }}
      contentContainerStyle={{ padding: gridConfig.padding }}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
};
```

#### Espacement adaptatif
```javascript
const Section = ({ children }) => {
  const { getSpacing } = useResponsive();
  
  const margin = getSpacing('pageMargin');
  const gap = getSpacing('sectionGap');
  
  return (
    <View style={{ margin, gap }}>
      {children}
    </View>
  );
};
```

## 🎨 Composants adaptatifs

### Button
- **Mobile** : Taille standard, padding 12dp vertical
- **Tablette** : Taille augmentée, padding 14dp vertical
- **Desktop** : Taille large, padding 16dp vertical

### Card
- **Mobile** : Border radius 12dp, margin 8dp
- **Tablette** : Border radius 16dp, margin 12dp
- **Desktop** : Border radius 20dp, margin 16dp

### SectionHeader
- **Mobile** : Hauteur 56dp, padding horizontal 16dp
- **Tablette** : Hauteur 64dp, padding horizontal 24dp
- **Desktop** : Hauteur 72dp, padding horizontal 32dp

## 📐 Layouts spécifiques

### Page d'accueil
- **Mobile** : Bannière pleine largeur, produits en 1 colonne
- **Tablette** : Bannière avec marges, produits en 2-3 colonnes
- **Desktop** : Bannière centrée, produits en 4 colonnes

### Catalogue produits
- **Mobile** : Liste verticale avec images 4:3
- **Tablette** : Grille 2x2 ou 3x3 selon l'orientation
- **Desktop** : Grille 4 colonnes avec espacement généreux

### Modales et overlays
- **Mobile** : Plein écran ou bottom sheet
- **Tablette** : Centrées, dimensionnées en pourcentage
- **Desktop** : Taille fixe avec marges automatiques

## ♿ Fonctionnalités d'accessibilité

### Lecteurs d'écran
```javascript
// Exemple de bouton accessible
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Ajouter au panier"
  accessibilityHint="Appuie pour ajouter ce produit à ton panier"
  accessibilityState={{ disabled: false }}
  accessibilityActions={[
    { name: 'activate', label: 'Ajouter au panier' }
  ]}
>
  <Text>Ajouter au panier</Text>
</TouchableOpacity>
```

### Réduction des animations
```javascript
const { accessibility } = useResponsive();

<TouchableOpacity
  activeOpacity={accessibility.isReduceMotionEnabled ? 1 : 0.8}
>
  {/* Contenu */}
</TouchableOpacity>
```

### Support du contraste élevé
```javascript
const { accessibility } = useResponsive();

const buttonStyle = {
  backgroundColor: accessibility.isHighContrastEnabled 
    ? colors.primary.dark 
    : colors.primary.main
};
```

## 🧪 Tests et validation

### Tests d'accessibilité
- **VoiceOver** : Test sur iOS avec lecteur d'écran
- **TalkBack** : Test sur Android avec lecteur d'écran
- **Contraste** : Validation avec outils de test WCAG
- **Touch targets** : Vérification des tailles minimales

### Tests de responsivité
- **Simulateurs** : Test sur différentes tailles d'écran
- **Appareils physiques** : Validation sur tablettes réelles
- **Orientation** : Test portrait et paysage
- **Breakpoints** : Vérification des transitions

### Métriques de validation
- **Temps de chargement** : <3s sur tous les appareils
- **Fluidité** : 60 FPS sur la majorité des appareils
- **Accessibilité** : 100% des éléments avec labels appropriés
- **Responsivité** : Adaptation automatique à tous les écrans

## 📚 Bonnes pratiques

### Accessibilité
1. **Toujours** utiliser des labels explicites
2. **Toujours** respecter les tailles minimales de touch targets
3. **Toujours** tester avec les lecteurs d'écran
4. **Toujours** fournir des alternatives textuelles

### Responsivité
1. **Utiliser** le hook `useResponsive` pour toutes les adaptations
2. **Éviter** les valeurs fixes en dur
3. **Tester** sur différentes tailles d'écran
4. **Prévoir** les cas d'orientation changeante

### Performance
1. **Optimiser** les images selon la taille d'écran
2. **Limiter** les re-renders inutiles
3. **Utiliser** la virtualisation pour les longues listes
4. **Adapter** la qualité selon les capacités de l'appareil

## 🔮 Évolutions futures

### Accessibilité avancée
- Support des gestes alternatifs
- Personnalisation des raccourcis clavier
- Adaptation automatique aux préférences utilisateur
- Support des technologies d'assistance émergentes

### Responsivité étendue
- Support des écrans pliables
- Adaptation aux écrans multi-moniteurs
- Support des écrans haute densité
- Optimisation pour les appareils IoT

### Performance
- Lazy loading intelligent selon l'appareil
- Cache adaptatif selon l'espace disponible
- Compression automatique des ressources
- Préchargement contextuel

## 📖 Références

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)

---

**Note** : Ce document doit être mis à jour à chaque modification des règles d'accessibilité ou de responsivité. Tous les développeurs doivent s'assurer de respecter ces règles lors de la création de nouveaux composants ou fonctionnalités.



















