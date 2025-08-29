# Règles de Travail

## Philosophie de développement

### Approche itérative et modulaire
- **Développement par étapes** : Chaque étape est autonome et livrable
- **Pas d'anticipation** : Ne pas créer de fonctionnalités non demandées
- **Architecture modulaire** : Composants réutilisables et découplés
- **Évolution progressive** : Base solide pour les étapes futures

### Qualité et maintenabilité
- **Code propre** : Standards de codage stricts et respectés
- **Documentation** : Code documenté et architecture claire
- **Tests** : Couverture de tests appropriée à chaque étape
- **Révision** : Code review systématique avant validation

## Règles de progression

### Entre les étapes
- **Validation complète** : L'étape précédente doit être 100% terminée
- **Tests réussis** : Tous les tests de l'étape doivent passer
- **Documentation** : Mise à jour de la documentation technique
- **Code review** : Validation par un pair ou le chef de projet

### Entre les phases
- **Validation exhaustive** : Toutes les étapes de la phase terminées
- **Démonstration** : Présentation des fonctionnalités implémentées
- **Tests d'intégration** : Validation du fonctionnement global
- **Préparation suivante** : Planification détaillée de la phase suivante

## Standards de codage

### Structure des fichiers
- **Extensions** : `.jsx` pour tous les composants React
- **Organisation** : Structure de dossiers claire et logique
- **Nommage** : Conventions cohérentes et explicites
- **Imports** : Organisation logique des imports

### Exemple de structure
```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   ├── forms/          # Composants de formulaires
│   └── layout/         # Composants de mise en page
├── screens/             # Écrans de l'application
│   ├── home/           # Écran d'accueil
│   ├── products/       # Écrans produits
│   └── auth/           # Écrans d'authentification
├── navigation/          # Configuration de navigation
├── store/               # Redux Toolkit store
│   ├── slices/         # Slices Redux
│   └── middleware/     # Middleware personnalisés
├── services/            # Services et API
├── utils/               # Utilitaires et helpers
├── hooks/               # Hooks personnalisés
├── constants/           # Constantes de l'application
└── assets/              # Images, fonts, etc.
```

### Conventions de nommage
- **Composants** : PascalCase (ex: `ProductCard`, `UserProfile`)
- **Fonctions** : camelCase (ex: `getUserData`, `handleSubmit`)
- **Constantes** : UPPER_SNAKE_CASE (ex: `API_BASE_URL`, `MAX_RETRY_COUNT`)
- **Fichiers** : kebab-case (ex: `product-card.jsx`, `user-profile.jsx`)
- **Dossiers** : kebab-case (ex: `product-details/`, `auth-forms/`)

## Gestion des dépendances

### Installation des packages
- **Approbation requise** : Toute nouvelle dépendance doit être validée
- **Justification** : Documenter pourquoi la dépendance est nécessaire
- **Alternatives** : Évaluer les alternatives avant installation
- **Maintenance** : Vérifier la maintenance et la sécurité

### Exemple de justification
```javascript
// ✅ CORRECT - Justification claire
// Package: react-native-image-cache
// Raison: Gestion optimisée du cache d'images pour les performances
// Alternatives évaluées: expo-image (limitations), react-native-fast-image (complexité)
// Maintenance: Active, dernière mise à jour < 30 jours
// Sécurité: Aucune vulnérabilité connue

// ❌ INCORRECT - Pas de justification
// Package: some-random-package
// Raison: Besoin
```

### Gestion des versions
- **Lock file** : Utiliser package-lock.json ou yarn.lock
- **Mises à jour** : Évaluer l'impact avant mise à jour
- **Compatibilité** : Tester la compatibilité avec Expo
- **Sécurité** : Mettre à jour les dépendances vulnérables

## Architecture et patterns

### Composants React
- **Fonctionnels** : Utiliser des composants fonctionnels avec hooks
- **Props** : Props typées et validation des données
- **État local** : useState pour l'état simple, useReducer pour l'état complexe
- **Effets** : useEffect avec cleanup approprié

### Exemple de composant
```javascript
// ✅ CORRECT - Composant bien structuré
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onPress, 
  isSponsored = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddToCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await onAddToCart(product.id, 1);
    } catch (error) {
      console.error('Erreur ajout au panier:', error);
    } finally {
      setIsLoading(false);
    }
  }, [product.id, onAddToCart]);
  
  useEffect(() => {
    // Cleanup si nécessaire
    return () => {
      // Nettoyage des ressources
    };
  }, []);
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      {isSponsored && (
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Sponsorisé</Text>
        </View>
      )}
      
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>{product.formattedPrice}</Text>
      
      <TouchableOpacity 
        style={[styles.addButton, isLoading && styles.loadingButton]}
        onPress={handleAddToCart}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Ajout...' : 'Ajouter'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // ... autres styles
});

export default ProductCard;
```

### Redux Toolkit
- **Slices modulaires** : Un slice par domaine fonctionnel
- **Actions** : Actions claires et descriptives
- **Sélecteurs** : Sélecteurs memoizés pour les performances
- **Middleware** : Middleware personnalisé si nécessaire

### Exemple de slice
```javascript
// ✅ CORRECT - Slice Redux bien structuré
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Actions asynchrones
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (category, { rejectWithValue }) => {
    try {
      const response = await api.getProducts(category);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
    filters: {
      category: null,
      priceRange: null,
      search: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: null,
        priceRange: null,
        search: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;
```

## Gestion des erreurs

### Stratégie de gestion d'erreurs
- **Try-catch** : Gestion d'erreurs appropriée dans les composants
- **Boundaries** : Error boundaries pour les erreurs React
- **Logging** : Logging structuré sans données sensibles
- **Fallbacks** : Interfaces de fallback en cas d'erreur

### Exemple de gestion d'erreurs
```javascript
// ✅ CORRECT - Gestion d'erreurs robuste
const useApiCall = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Une erreur est survenue';
      setError(errorMessage);
      
      // Logging sans données sensibles
      console.error('API Error:', {
        function: apiFunction.name,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);
  
  return { data, loading, error, execute };
};
```

## Tests et qualité

### Stratégie de tests
- **Tests unitaires** : Tests des composants et fonctions isolés
- **Tests d'intégration** : Tests des interactions entre composants
- **Tests de régression** : Validation que les nouvelles fonctionnalités ne cassent pas l'existant
- **Tests de performance** : Validation des critères de performance

### Exemple de test
```javascript
// ✅ CORRECT - Test bien structuré
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProductCard from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Tomates Bio',
    price: 2500,
    formattedPrice: '2 500 FC',
    image: 'https://example.com/tomatoes.jpg',
  };
  
  const mockOnAddToCart = jest.fn();
  const mockOnPress = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('affiche correctement les informations du produit', () => {
    const { getByText } = render(
      <ProductCard 
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onPress={mockOnPress}
      />
    );
    
    expect(getByText('Tomates Bio')).toBeTruthy();
    expect(getByText('2 500 FC')).toBeTruthy();
  });
  
  it('affiche le badge sponsorisé quand isSponsored est true', () => {
    const { getByText } = render(
      <ProductCard 
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onPress={mockOnPress}
        isSponsored={true}
      />
    );
    
    expect(getByText('Sponsorisé')).toBeTruthy();
  });
  
  it('appelle onAddToCart quand le bouton est pressé', async () => {
    const { getByText } = render(
      <ProductCard 
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onPress={mockOnPress}
      />
    );
    
    const addButton = getByText('Ajouter');
    fireEvent.press(addButton);
    
    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith('1', 1);
    });
  });
});
```

## Documentation

### Standards de documentation
- **Code** : Commentaires pour la logique complexe
- **Composants** : Props documentées et exemples d'usage
- **API** : Documentation des endpoints et paramètres
- **Architecture** : Schémas et explications des choix techniques

### Exemple de documentation
```javascript
/**
 * Composant ProductCard - Affiche une carte de produit avec actions
 * 
 * @component
 * @param {Object} props - Propriétés du composant
 * @param {Product} props.product - Données du produit à afficher
 * @param {Function} props.onAddToCart - Callback appelé lors de l'ajout au panier
 * @param {Function} props.onPress - Callback appelé lors du clic sur la carte
 * @param {boolean} [props.isSponsored=false] - Affiche le badge "Sponsorisé" si true
 * 
 * @example
 * <ProductCard
 *   product={productData}
 *   onAddToCart={(id, quantity) => addToCart(id, quantity)}
 *   onPress={(product) => navigateToProduct(product.id)}
 *   isSponsored={true}
 * />
 * 
 * @returns {React.Element} Composant ProductCard rendu
 */
const ProductCard = ({ product, onAddToCart, onPress, isSponsored = false }) => {
  // ... implémentation
};
```

## Processus de validation

### Code review
- **Obligatoire** : Toute modification doit passer en review
- **Critères** : Qualité du code, respect des standards, tests
- **Feedback** : Commentaires constructifs et suggestions d'amélioration
- **Validation** : Approbation requise avant merge

### Checklist de validation
- [ ] Code respecte les standards de codage
- [ ] Tests passent (nouveaux et existants)
- [ ] Documentation mise à jour
- [ ] Performance validée
- [ ] Sécurité vérifiée
- [ ] Accessibilité respectée
- [ ] Support tablette validé

### Déploiement
- **Environnements** : Dev, Staging, Production
- **Tests** : Tests complets sur staging avant production
- **Rollback** : Plan de rollback en cas de problème
- **Monitoring** : Surveillance post-déploiement

## Communication et collaboration

### Règles de communication
- **Clarté** : Messages clairs et précis
- **Documentation** : Décisions et discussions documentées
- **Feedback** : Retours constructifs et respectueux
- **Escalade** : Remontée des problèmes selon la procédure

### Outils de collaboration
- **Versioning** : Git avec branches feature et pull requests
- **Suivi** : Issues et milestones pour le planning
- **Communication** : Slack/Teams pour les échanges quotidiens
- **Documentation** : Wiki ou docs partagés pour la documentation

### Réunions et points
- **Daily standup** : Point quotidien sur l'avancement
- **Sprint review** : Revue des fonctionnalités implémentées
- **Retrospective** : Amélioration continue du processus
- **Planning** : Planification des prochaines étapes

## Gestion des changements

### Processus de changement
- **Évaluation** : Impact et risques du changement
- **Validation** : Approbation des parties prenantes
- **Implémentation** : Mise en œuvre du changement
- **Validation** : Tests et vérification post-changement

### Types de changements
- **Mineurs** : Corrections de bugs, améliorations mineures
- **Majeurs** : Nouvelles fonctionnalités, refactoring
- **Critiques** : Changements de sécurité, corrections urgentes
- **Architecturaux** : Modifications de l'architecture

### Gestion des risques
- **Identification** : Détection précoce des risques
- **Évaluation** : Analyse de l'impact et de la probabilité
- **Mitigation** : Mesures préventives et correctives
- **Suivi** : Monitoring continu des risques identifiés

## Conclusion

Ces règles de travail garantissent :
- **Qualité** : Code maintenable et robuste
- **Efficacité** : Développement fluide et prévisible
- **Collaboration** : Travail d'équipe efficace
- **Évolution** : Base solide pour les étapes futures

Le respect de ces règles est essentiel pour la réussite du projet Dream Market et la satisfaction de toutes les parties prenantes.

