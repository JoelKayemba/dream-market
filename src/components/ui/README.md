# 🎨 Composants UI - Dream Market App

## 📋 Vue d'ensemble

Cette bibliothèque de composants UI fournit une collection complète de composants réutilisables pour l'application Dream Market. Tous les composants sont conçus avec une approche cohérente, utilisant le système de thème unifié et s'intégrant parfaitement avec React Native et Expo.

## 🎯 Caractéristiques

- **🎨 Design System Unifié** : Utilise les couleurs, typographie et espacement définis dans le thème
- **📱 React Native Native** : Optimisé pour les performances mobiles
- **🔧 Personnalisable** : Props flexibles pour adapter chaque composant
- **♿ Accessible** : Support des lecteurs d'écran et navigation au clavier
- **📚 TypeScript Ready** : Props typées et documentation complète
- **🎭 Animations** : Transitions fluides et micro-interactions

## 🚀 Installation et utilisation

### Import des composants

```jsx
// Import individuel
import { Button, Card, Input } from '../components/ui';

// Import de tous les composants
import * as UI from '../components/ui';

// Import par défaut
import UI from '../components/ui';
```

### Utilisation de base

```jsx
import React from 'react';
import { View } from 'react-native';
import { Button, Card, Text } from '../components/ui';

const MyComponent = () => {
  return (
    <View>
      <Card variant="elevated">
        <Text variant="h5">Titre de la carte</Text>
        <Text variant="body">Contenu de la carte</Text>
        <Button 
          title="Action" 
          variant="primary" 
          onPress={() => console.log('Action!')} 
        />
      </Card>
    </View>
  );
};
```

## 📱 Composants disponibles

### 🎯 Composants de base

#### Button
Bouton interactif avec plusieurs variantes et tailles.

```jsx
<Button
  title="Cliquez-moi"
  variant="primary" // primary, secondary, outline, ghost
  size="medium"     // small, medium, large
  onPress={() => {}}
  disabled={false}
  loading={false}
/>
```

#### Card
Conteneur de contenu avec différentes variantes.

```jsx
<Card
  variant="elevated" // default, elevated, outlined, flat
  pressable={true}
  onPress={() => {}}
  shadow={true}
>
  <Text>Contenu de la carte</Text>
</Card>
```

#### Input
Champ de saisie de texte avec validation.

```jsx
<Input
  placeholder="Entrez du texte"
  value={value}
  onChangeText={setValue}
  variant="default" // default, outlined, filled
  size="medium"     // small, medium, large
  error="Message d'erreur"
  leftIcon="search"
  rightIcon="eye"
/>
```

#### Text
Composant de texte avec variantes typographiques.

```jsx
<Text
  variant="h1"      // h1-h6, body, label, caption, button
  color={colors.primary.main}
  align="center"    // left, center, right
  bold={true}
  italic={false}
  numberOfLines={2}
>
  Mon texte
</Text>
```

### 🔧 Composants utilitaires

#### Spacer
Ajoute de l'espacement entre les composants.

```jsx
<Spacer size="md" direction="vertical" />
<Spacer size={20} direction="horizontal" />
```

#### Divider
Ligne de séparation avec différentes variantes.

```jsx
<Divider
  variant="solid"     // solid, dashed, dotted
  orientation="horizontal" // horizontal, vertical
  thickness={2}
  color={colors.border.light}
/>
```

#### Icon
Icône Ionicons avec intégration du thème.

```jsx
<Icon
  name="heart"
  size={24}
  color={colors.primary.main}
  variant="primary"
  pressable={true}
  onPress={() => {}}
/>
```

#### Image
Image avec gestion des états de chargement et d'erreur.

```jsx
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  alt="Description de l'image"
  variant="rounded" // default, rounded, circular, thumbnail
  width={200}
  height={150}
  showLoader={true}
/>
```

### 📋 Composants de formulaire

#### FormField
Champ de formulaire complet avec label et gestion d'erreur.

```jsx
<FormField
  label="Nom du produit"
  placeholder="Entrez le nom"
  value={value}
  onChangeText={setValue}
  error="Ce champ est requis"
  required={true}
  hint="Le nom doit être descriptif"
/>
```

#### Checkbox
Case à cocher avec différentes variantes.

```jsx
<Checkbox
  label="Accepter les conditions"
  checked={checked}
  onChange={setChecked}
  variant="default" // default, rounded, square
  size="medium"     // small, medium, large
  disabled={false}
/>
```

#### RadioButton
Bouton radio pour sélection unique.

```jsx
<RadioButton
  label="Option 1"
  value="option1"
  selected={selected === 'option1'}
  onSelect={setSelected}
  size="medium"
/>
```

#### Select
Sélecteur avec dropdown et options personnalisables.

```jsx
<Select
  label="Choisir une option"
  options={[
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' }
  ]}
  value={selected}
  onChange={setSelected}
  placeholder="Sélectionner..."
/>
```

#### Switch
Interrupteur on/off avec animations.

```jsx
<Switch
  value={enabled}
  onChange={setEnabled}
  size="medium"     // small, medium, large
  variant="default" // default, rounded, square
  color={colors.primary.main}
/>
```

### 🎭 Composants de feedback

#### Toast
Notification temporaire avec différents types.

```jsx
<Toast
  visible={visible}
  message="Opération réussie !"
  type="success"        // success, error, warning, info
  position="top"        // top, bottom, center
  duration={3000}
  onClose={() => setVisible(false)}
/>
```

#### Alert
Message d'alerte avec actions et variantes.

```jsx
<Alert
  title="Attention"
  message="Êtes-vous sûr de vouloir continuer ?"
  type="warning"
  variant="bordered"    // default, bordered, filled
  dismissible={true}
  actions={[
    { label: 'Annuler', variant: 'outline', onPress: () => {} },
    { label: 'Continuer', onPress: () => {} }
  ]}
/>
```

#### ProgressBar
Barre de progression avec animations.

```jsx
<ProgressBar
  progress={75}
  variant="striped"     // default, striped, gradient
  size="medium"         // small, medium, large
  showLabel={true}
  labelPosition="inside" // top, bottom, inside
  animated={true}
/>
```

#### Skeleton
Placeholder de chargement animé.

```jsx
<Skeleton
  variant="text"        // text, circle, rectangle, card
  size="medium"         // small, medium, large
  width={200}
  height={20}
  animated={true}
/>
```

### 📱 Composants de navigation

#### TabBar
Barre d'onglets avec différentes variantes.

```jsx
<TabBar
  tabs={[
    { label: 'Accueil', icon: 'home' },
    { label: 'Produits', icon: 'leaf' }
  ]}
  activeTab={activeTab}
  onTabPress={setActiveTab}
  variant="pills"       // default, pills, underline
  position="top"        // top, bottom
/>
```

#### Header
En-tête d'écran avec titre et actions.

```jsx
<Header
  title="Page de produits"
  subtitle="Gestion des produits"
  showBackButton={true}
  onBackPress={() => {}}
  rightAction={<Button title="Ajouter" />}
  variant="elevated"    // default, transparent, elevated
/>
```

#### Drawer
Menu latéral avec navigation.

```jsx
<Drawer
  visible={visible}
  onClose={() => setVisible(false)}
  items={[
    { label: 'Accueil', iconName: 'home', onPress: () => {} },
    { label: 'Produits', iconName: 'leaf', onPress: () => {} }
  ]}
  position="left"       // left, right
  width={280}
  variant="overlay"     // default, overlay, push
/>
```

#### Breadcrumb
Navigation hiérarchique.

```jsx
<Breadcrumb
  items={[
    { label: 'Accueil', onPress: () => {} },
    { label: 'Produits', onPress: () => {} },
    { label: 'Catégorie' }
  ]}
  separator=">"
  variant="compact"     // default, compact, minimal
  showHomeIcon={true}
/>
```

### 📊 Composants de données

#### List
Liste d'éléments avec différentes variantes.

```jsx
<List
  data={products}
  variant="card"        // default, card, bordered
  separator={true}
  selectable={true}
  selectedItems={selected}
  onItemPress={(item) => {}}
  renderItem={({ item }) => (
    <Text>{item.name}</Text>
  )}
/>
```

#### Grid
Grille d'éléments avec colonnes configurables.

```jsx
<Grid
  data={products}
  numColumns={2}
  variant="card"
  gap="md"
  selectable={true}
  renderItem={({ item }) => (
    <Text>{item.name}</Text>
  )}
/>
```

#### Table
Tableau de données avec tri et pagination.

```jsx
<Table
  columns={[
    { key: 'name', title: 'Nom', sortable: true },
    { key: 'price', title: 'Prix', sortable: true }
  ]}
  data={products}
  sortable={true}
  selectable={true}
  paginated={true}
  pageSize={10}
  variant="bordered"    // default, bordered, striped
/>
```

#### Chart
Graphique simple avec barres ou lignes.

```jsx
<Chart
  data={[
    { label: 'Jan', value: 65, color: colors.primary.main },
    { label: 'Fév', value: 45, color: colors.success.main }
  ]}
  type="bar"            // bar, line
  title="Ventes mensuelles"
  height={200}
  showLabels={true}
  showValues={true}
/>
```

#### Pagination
Navigation entre les pages.

```jsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  variant="default"     // default, compact, dots
  showFirstLast={true}
  showPageNumbers={true}
  maxVisiblePages={5}
/>
```

### 🎨 Composants de mise en page

#### Container
Conteneur avec marges et paddings cohérents.

```jsx
<Container
  variant="narrow"      // default, fluid, narrow, wide
  padding="lg"          // none, xs, sm, md, lg, xl
  margin="md"
  centerContent={true}
  elevated={true}
  borderRadius={8}
>
  <Text>Contenu centré</Text>
</Container>
```

#### Row
Ligne horizontale avec options de flexbox.

```jsx
<Row
  alignItems="center"
  justifyContent="space-between"
  wrap={true}
  gap="md"
  padding="md"
  margin="sm"
>
  <Text>Élément 1</Text>
  <Text>Élément 2</Text>
</Row>
```

#### Column
Colonne verticale avec options de flexbox.

```jsx
<Column
  alignItems="stretch"
  justifyContent="flex-start"
  gap="md"
  padding="md"
  flex={1}
>
  <Text>Élément 1</Text>
  <Text>Élément 2</Text>
</Column>
```

#### Section
Section de contenu avec titre et contenu.

```jsx
<Section
  title="Titre de la section"
  subtitle="Sous-titre optionnel"
  variant="card"        // default, card, bordered
  padding="lg"
  margin="md"
  elevated={true}
  headerAction={<Button title="Action" />}
>
  <Text>Contenu de la section</Text>
</Section>
```

#### Hero
Section d'en-tête avec image de fond et contenu principal.

```jsx
<Hero
  title="Titre principal"
  subtitle="Sous-titre"
  description="Description détaillée"
  backgroundImage="https://example.com/hero.jpg"
  backgroundColor={colors.primary.main}
  variant="centered"    // default, centered, left-aligned
  height="medium"       // small, medium, large, full
  overlay={true}
  actions={[
    { label: 'Commencer', variant: 'primary', onPress: () => {} },
    { label: 'En savoir plus', variant: 'outline', onPress: () => {} }
  ]}
/>
```

## 🎨 Système de thème

Tous les composants utilisent le système de thème unifié défini dans `src/theme/` :

### Couleurs
```jsx
import { colors } from '../theme';

// Couleurs principales
colors.primary.main
colors.primary.light
colors.primary.dark

// Couleurs sémantiques
colors.success.main
colors.error.main
colors.warning.main
colors.info.main

// Couleurs de texte
colors.text.primary
colors.text.secondary
colors.text.disabled
```

### Typographie
```jsx
import { typography } from '../theme';

// Variantes de texte
typography.fontSize.h1
typography.fontWeight.bold
typography.lineHeight.body
```

### Espacement
```jsx
import { spacing } from '../theme';

// Espacements prédéfinis
spacing.spacing.xs
spacing.spacing.sm
spacing.spacing.md
spacing.spacing.lg
spacing.spacing.xl
```

## 🔧 Personnalisation

### Props communes

La plupart des composants partagent ces props communes :

- **`variant`** : Style visuel du composant
- **`size`** : Taille du composant (small, medium, large)
- **`disabled`** : État désactivé
- **`style`** : Styles personnalisés
- **`...props`** : Autres props React Native

### Styles personnalisés

```jsx
<Button
  title="Bouton personnalisé"
  style={{
    backgroundColor: 'custom-color',
    borderRadius: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }}
/>
```

## 📱 Responsive Design

Les composants s'adaptent automatiquement aux différentes tailles d'écran :

```jsx
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Utilisation conditionnelle selon la taille d'écran
<Container
  variant={width > 768 ? 'wide' : 'narrow'}
  padding={height > 800 ? 'xl' : 'md'}
>
  <Text>Contenu adaptatif</Text>
</Container>
```

## ♿ Accessibilité

Tous les composants incluent le support d'accessibilité :

```jsx
<Button
  title="Action importante"
  accessibilityLabel="Bouton d'action principale"
  accessibilityHint="Double-tapez pour exécuter l'action"
  accessibilityRole="button"
  accessibilityState={{ disabled: false }}
/>
```

## 🧪 Tests

### Test des composants

```jsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../components/ui';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

## 📚 Exemples d'utilisation

### Formulaire complet

```jsx
import React, { useState } from 'react';
import { View } from 'react-native';
import * as UI from '../components/ui';

const ProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    available: false,
    notifications: false
  });

  const handleSubmit = () => {
    // Logique de soumission
  };

  return (
    <UI.Container variant="narrow" padding="lg">
      <UI.Section title="Nouveau produit" variant="card">
        <UI.FormField
          label="Nom du produit"
          placeholder="Entrez le nom"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          required
        />
        
        <UI.Select
          label="Catégorie"
          options={[
            { label: 'Fruits', value: 'fruits' },
            { label: 'Légumes', value: 'vegetables' }
          ]}
          value={formData.category}
          onChange={(option) => setFormData({ ...formData, category: option })}
        />
        
        <UI.FormField
          label="Prix"
          placeholder="0.00"
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          keyboardType="numeric"
        />
        
        <UI.Checkbox
          label="Produit disponible"
          checked={formData.available}
          onChange={(checked) => setFormData({ ...formData, available: checked })}
        />
        
        <UI.Switch
          label="Notifications"
          value={formData.notifications}
          onChange={(value) => setFormData({ ...formData, notifications: value })}
        />
        
        <UI.Row gap="md" justifyContent="flex-end">
          <UI.Button
            title="Annuler"
            variant="outline"
            onPress={() => {}}
          />
          <UI.Button
            title="Enregistrer"
            variant="primary"
            onPress={handleSubmit}
          />
        </UI.Row>
      </UI.Section>
    </UI.Container>
  );
};
```

### Tableau avec données

```jsx
import React, { useState } from 'react';
import { View } from 'react-native';
import * as UI from '../components/ui';

const ProductTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const columns = [
    { key: 'name', title: 'Nom', sortable: true },
    { key: 'category', title: 'Catégorie', sortable: true },
    { key: 'price', title: 'Prix', sortable: true },
    { key: 'stock', title: 'Stock', sortable: true },
    {
      key: 'actions',
      title: 'Actions',
      render: (value, row) => (
        <UI.Row gap="sm">
          <UI.Button
            title="Modifier"
            size="small"
            variant="outline"
            onPress={() => handleEdit(row)}
          />
          <UI.Button
            title="Supprimer"
            size="small"
            variant="error"
            onPress={() => handleDelete(row)}
          />
        </UI.Row>
      )
    }
  ];

  return (
    <UI.Container>
      <UI.Section
        title="Liste des produits"
        headerAction={
          <UI.Button
            title="Ajouter un produit"
            variant="primary"
            onPress={() => {}}
          />
        }
      >
        <UI.Table
          columns={columns}
          data={products}
          sortable
          selectable
          selectedItems={selectedProducts}
          onItemSelect={(product) => {
            setSelectedProducts(prev => 
              prev.includes(product.id)
                ? prev.filter(id => id !== product.id)
                : [...prev, product.id]
            );
          }}
          paginated
          pageSize={10}
          variant="bordered"
        />
        
        {selectedProducts.length > 0 && (
          <UI.Alert
            title={`${selectedProducts.length} produit(s) sélectionné(s)`}
            type="info"
            actions={[
              { label: 'Supprimer', variant: 'error', onPress: handleBulkDelete },
              { label: 'Exporter', onPress: handleExport }
            ]}
          />
        )}
      </UI.Section>
    </UI.Container>
  );
};
```

## 🚀 Performance

### Optimisations recommandées

1. **Memoization des composants** : Utilisez `React.memo` pour les composants qui ne changent pas souvent
2. **Lazy loading** : Chargez les composants lourds uniquement quand nécessaire
3. **Virtualisation** : Utilisez `FlatList` pour les longues listes
4. **Images optimisées** : Utilisez des formats WebP et des tailles appropriées

```jsx
import React, { memo } from 'react';
import { ProductCard } from '../components';

const ProductList = memo(({ products }) => {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProductCard product={item} />}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
});
```

## 🔍 Débogage

### Outils de développement

```jsx
// Log des props dans les composants
const Button = ({ title, onPress, ...props }) => {
  console.log('Button props:', { title, onPress, ...props });
  
  return (
    <TouchableOpacity onPress={onPress} {...props}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

// Utilisation de React DevTools
// Installer react-devtools pour le débogage
```

## 📖 Ressources

- [Documentation React Native](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Elements](https://reactnativeelements.com/)
- [NativeBase](https://nativebase.io/)

## 🤝 Contribution

### Ajout d'un nouveau composant

1. Créer le fichier du composant dans `src/components/ui/`
2. Ajouter les exports dans `src/components/ui/index.js`
3. Créer les tests unitaires
4. Mettre à jour la documentation
5. Ajouter des exemples d'utilisation

### Structure recommandée

```jsx
// MonComposant.jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

/**
 * 📝 Description du composant
 * 
 * @param {Object} props - Propriétés du composant
 * @param {string} props.title - Description du paramètre
 */
const MonComposant = ({ title, ...props }) => {
  return (
    <View style={styles.container} {...props}>
      {/* Contenu du composant */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Styles du composant
  },
});

export default MonComposant;
```

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

**🎯 Objectif** : Créer une bibliothèque de composants UI complète, cohérente et performante pour l'application Dream Market.

**🔧 Maintenance** : Cette documentation doit être mise à jour à chaque modification des composants.

**📞 Support** : Pour toute question ou suggestion, contactez l'équipe de développement.


