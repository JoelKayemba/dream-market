import cartReducer, {
  toggleCartItem,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  switchUser,
} from '../cartSlice';

describe('cartSlice', () => {
  const initialState = {
    items: [],
    loading: false,
    error: null,
    orderLoading: false,
    orderError: null,
    lastOrder: null,
    currentUserId: null,
  };

  const mockProduct = {
    id: '1',
    name: 'Tomate',
    price: 1000,
    stock: 10,
    currency: 'CDF',
  };

  describe('toggleCartItem', () => {
    it('should add product to empty cart', () => {
      const action = toggleCartItem({ product: mockProduct, quantity: 2 });
      const state = cartReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].product.id).toBe('1');
      expect(state.items[0].quantity).toBe(2);
      expect(state.items[0].addedAt).toBeDefined();
    });

    it('should remove product if already in cart', () => {
      const stateWithItem = {
        ...initialState,
        items: [{ product: mockProduct, quantity: 2, addedAt: '2024-01-01' }],
      };

      const action = toggleCartItem({ product: mockProduct, quantity: 1 });
      const state = cartReducer(stateWithItem, action);

      expect(state.items).toHaveLength(0);
    });

    it('should add multiple different products', () => {
      const product2 = { ...mockProduct, id: '2', name: 'Pomme' };
      
      let state = cartReducer(initialState, toggleCartItem({ product: mockProduct, quantity: 1 }));
      state = cartReducer(state, toggleCartItem({ product: product2, quantity: 2 }));

      expect(state.items).toHaveLength(2);
      expect(state.items[0].product.id).toBe('1');
      expect(state.items[1].product.id).toBe('2');
    });
  });

  describe('updateCartItemQuantity', () => {
    it('should update quantity of existing item', () => {
      const stateWithItem = {
        ...initialState,
        items: [{ product: mockProduct, quantity: 2, addedAt: '2024-01-01' }],
      };

      const action = updateCartItemQuantity({ productId: '1', quantity: 5 });
      const state = cartReducer(stateWithItem, action);

      expect(state.items[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      const stateWithItem = {
        ...initialState,
        items: [{ product: mockProduct, quantity: 2, addedAt: '2024-01-01' }],
      };

      const action = updateCartItemQuantity({ productId: '1', quantity: 0 });
      const state = cartReducer(stateWithItem, action);

      expect(state.items).toHaveLength(0);
    });

    it('should remove item if quantity is negative', () => {
      const stateWithItem = {
        ...initialState,
        items: [{ product: mockProduct, quantity: 2, addedAt: '2024-01-01' }],
      };

      const action = updateCartItemQuantity({ productId: '1', quantity: -1 });
      const state = cartReducer(stateWithItem, action);

      expect(state.items).toHaveLength(0);
    });

    it('should not update if product not in cart', () => {
      const action = updateCartItemQuantity({ productId: '999', quantity: 5 });
      const state = cartReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });
  });

  describe('removeFromCart', () => {
    it('should remove product from cart', () => {
      const product2 = { ...mockProduct, id: '2', name: 'Pomme' };
      const stateWithItems = {
        ...initialState,
        items: [
          { product: mockProduct, quantity: 2, addedAt: '2024-01-01' },
          { product: product2, quantity: 1, addedAt: '2024-01-01' },
        ],
      };

      const action = removeFromCart('1');
      const state = cartReducer(stateWithItems, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0].product.id).toBe('2');
    });

    it('should not remove if product not in cart', () => {
      const stateWithItem = {
        ...initialState,
        items: [{ product: mockProduct, quantity: 2, addedAt: '2024-01-01' }],
      };

      const action = removeFromCart('999');
      const state = cartReducer(stateWithItem, action);

      expect(state.items).toHaveLength(1);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const stateWithItems = {
        ...initialState,
        items: [
          { product: mockProduct, quantity: 2, addedAt: '2024-01-01' },
          { product: { ...mockProduct, id: '2' }, quantity: 1, addedAt: '2024-01-01' },
        ],
      };

      const action = clearCart();
      const state = cartReducer(stateWithItems, action);

      expect(state.items).toHaveLength(0);
    });
  });

  describe('switchUser', () => {
    it('should clear cart when switching to different user', () => {
      const stateWithItems = {
        ...initialState,
        items: [{ product: mockProduct, quantity: 2, addedAt: '2024-01-01' }],
        currentUserId: 'user1',
      };

      const action = switchUser('user2');
      const state = cartReducer(stateWithItems, action);

      expect(state.items).toHaveLength(0);
      expect(state.currentUserId).toBe('user2');
    });

    it('should not clear cart when switching to same user', () => {
      const stateWithItems = {
        ...initialState,
        items: [{ product: mockProduct, quantity: 2, addedAt: '2024-01-01' }],
        currentUserId: 'user1',
      };

      const action = switchUser('user1');
      const state = cartReducer(stateWithItems, action);

      expect(state.items).toHaveLength(1);
      expect(state.currentUserId).toBe('user1');
    });
  });
});


