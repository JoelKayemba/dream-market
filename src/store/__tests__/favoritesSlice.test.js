import favoritesReducer, {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
  setLoading,
  setError,
} from '../favoritesSlice';

describe('favoritesSlice', () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
  };

  const mockProduct = {
    id: 'product123',
    type: 'product',
    data: { name: 'Tomate', price: 1000 },
  };

  const mockFarm = {
    id: 'farm123',
    type: 'farm',
    data: { name: 'Ferme Bio', location: 'Kinshasa' },
  };

  describe('addToFavorites', () => {
    it('should add item to favorites', () => {
      const action = addToFavorites(mockProduct);
      const state = favoritesReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(mockProduct);
    });

    it('should not add duplicate items', () => {
      const stateWithItem = {
        ...initialState,
        items: [mockProduct],
      };

      const action = addToFavorites(mockProduct);
      const state = favoritesReducer(stateWithItem, action);

      expect(state.items).toHaveLength(1);
    });

    it('should add multiple different items', () => {
      let state = favoritesReducer(initialState, addToFavorites(mockProduct));
      state = favoritesReducer(state, addToFavorites(mockFarm));

      expect(state.items).toHaveLength(2);
    });
  });

  describe('removeFromFavorites', () => {
    it('should remove item from favorites', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockProduct, mockFarm],
      };

      const action = removeFromFavorites({ id: 'product123', type: 'product' });
      const state = favoritesReducer(stateWithItems, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(mockFarm);
    });

    it('should not remove if item not in favorites', () => {
      const stateWithItem = {
        ...initialState,
        items: [mockProduct],
      };

      const action = removeFromFavorites({ id: 'nonexistent', type: 'product' });
      const state = favoritesReducer(stateWithItem, action);

      expect(state.items).toHaveLength(1);
    });
  });

  describe('toggleFavorite', () => {
    it('should add item if not in favorites', () => {
      const action = toggleFavorite(mockProduct);
      const state = favoritesReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(mockProduct);
    });

    it('should remove item if already in favorites', () => {
      const stateWithItem = {
        ...initialState,
        items: [mockProduct],
      };

      const action = toggleFavorite(mockProduct);
      const state = favoritesReducer(stateWithItem, action);

      expect(state.items).toHaveLength(0);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites', () => {
      const stateWithItems = {
        ...initialState,
        items: [mockProduct, mockFarm],
      };

      const action = clearFavorites();
      const state = favoritesReducer(stateWithItems, action);

      expect(state.items).toHaveLength(0);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      const action = setLoading(true);
      const state = favoritesReducer(initialState, action);

      expect(state.loading).toBe(true);
    });

    it('should unset loading state', () => {
      const stateWithLoading = {
        ...initialState,
        loading: true,
      };

      const action = setLoading(false);
      const state = favoritesReducer(stateWithLoading, action);

      expect(state.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const action = setError('Une erreur est survenue');
      const state = favoritesReducer(initialState, action);

      expect(state.error).toBe('Une erreur est survenue');
    });

    it('should clear error when set to null', () => {
      const stateWithError = {
        ...initialState,
        error: 'Une erreur',
      };

      const action = setError(null);
      const state = favoritesReducer(stateWithError, action);

      expect(state.error).toBeNull();
    });
  });

  describe('fetchUserFavorites async actions', () => {
    it('should set loading to true when pending', () => {
      const action = { type: 'favorites/fetchUserFavorites/pending' };
      const state = favoritesReducer(initialState, action);

      expect(state.loading).toBe(true);
    });

    it('should transform and set favorites when fulfilled', () => {
      // Le backend retourne { item_id, item_type, details }
      const backendFavorites = [
        { item_id: 'product123', item_type: 'product', details: { name: 'Tomate', price: 1000 } },
        { item_id: 'farm123', item_type: 'farm', details: { name: 'Ferme Bio', location: 'Kinshasa' } },
      ];
      const action = {
        type: 'favorites/fetchUserFavorites/fulfilled',
        payload: backendFavorites,
      };
      const state = favoritesReducer(initialState, action);

      expect(state.items).toHaveLength(2);
      expect(state.items[0].id).toBe('product123');
      expect(state.items[0].type).toBe('product');
      expect(state.items[0].data).toEqual({ name: 'Tomate', price: 1000 });
      expect(state.loading).toBe(false);
    });

    it('should set error when rejected', () => {
      const action = {
        type: 'favorites/fetchUserFavorites/rejected',
        payload: 'Erreur de chargement',
      };
      const state = favoritesReducer(initialState, action);

      expect(state.error).toBe('Erreur de chargement');
      expect(state.loading).toBe(false);
    });
  });

  describe('toggleFavoriteBackend async actions', () => {
    it('should not modify state when fulfilled (optimistic update)', () => {
      // Le reducer utilise optimistic update, donc il ne modifie pas l'état ici
      const action = {
        type: 'favorites/toggleFavoriteBackend/fulfilled',
        payload: {
          itemType: 'product',
          itemId: 'product123',
          isFavorite: true,
        },
      };
      const state = favoritesReducer(initialState, action);

      // L'état ne change pas car l'optimistic update a déjà été fait
      expect(state.items).toHaveLength(0);
    });

    it('should set error when rejected', () => {
      const action = {
        type: 'favorites/toggleFavoriteBackend/rejected',
        payload: 'Erreur de synchronisation',
      };
      const state = favoritesReducer(initialState, action);

      expect(state.error).toBe('Erreur de synchronisation');
    });
  });
});

