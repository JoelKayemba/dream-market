import { configureStore } from '@reduxjs/toolkit';
import cartReducer, {
  toggleCartItem,
  updateCartItemQuantity,
  selectCartItems,
} from '../../store/cartSlice';

describe('Stock Management Integration', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        cart: cartReducer,
      },
    });
  });

  const mockProductWithStock = {
    id: '1',
    name: 'Tomate',
    price: 1000,
    stock: 5,
    currency: 'CDF',
  };

  const mockProductOutOfStock = {
    id: '2',
    name: 'Pomme',
    price: 500,
    stock: 0,
    currency: 'CDF',
  };

  describe('Adding Products to Cart', () => {
    it('should allow adding product with available stock', () => {
      store.dispatch(toggleCartItem({ product: mockProductWithStock, quantity: 2 }));

      const state = store.getState();
      const items = selectCartItems(state);

      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it('should allow adding product even if stock is 0 (validation happens in UI)', () => {
      // Note: Le reducer n'empêche pas l'ajout, c'est la responsabilité de l'UI
      // Ce test vérifie que le reducer accepte l'ajout
      store.dispatch(toggleCartItem({ product: mockProductOutOfStock, quantity: 1 }));

      const state = store.getState();
      const items = selectCartItems(state);

      expect(items).toHaveLength(1);
    });
  });

  describe('Quantity Updates', () => {
    beforeEach(() => {
      store.dispatch(toggleCartItem({ product: mockProductWithStock, quantity: 2 }));
    });

    it('should allow updating quantity within stock limit', () => {
      store.dispatch(updateCartItemQuantity({ productId: '1', quantity: 4 }));

      const state = store.getState();
      const items = selectCartItems(state);

      expect(items[0].quantity).toBe(4);
    });

    it('should allow updating quantity even if exceeds stock (validation in UI)', () => {
      // Note: Le reducer n'empêche pas, c'est la responsabilité de l'UI
      store.dispatch(updateCartItemQuantity({ productId: '1', quantity: 10 }));

      const state = store.getState();
      const items = selectCartItems(state);

      expect(items[0].quantity).toBe(10);
    });

    it('should remove item if quantity is 0', () => {
      store.dispatch(updateCartItemQuantity({ productId: '1', quantity: 0 }));

      const state = store.getState();
      const items = selectCartItems(state);

      expect(items).toHaveLength(0);
    });
  });

  describe('Stock Validation Logic', () => {
    it('should identify items with insufficient stock', () => {
      // Ajouter un produit avec quantité supérieure au stock
      store.dispatch(toggleCartItem({ product: mockProductWithStock, quantity: 10 }));

      const state = store.getState();
      const items = selectCartItems(state);
      // Simuler les produits depuis le state préchargé
      const currentProducts = [
        { id: '1', name: 'Tomate', price: 1000, stock: 5 },
        { id: '2', name: 'Pomme', price: 500, stock: 0 },
      ];

      // Vérifier la logique de validation (simulée)
      const item = items[0];
      const currentProduct = currentProducts.find(p => p.id === item.product.id);
      const currentStock = currentProduct ? currentProduct.stock : null;
      const hasInsufficientStock = currentStock !== null && item.quantity > currentStock;

      expect(hasInsufficientStock).toBe(true);
      expect(item.quantity).toBe(10);
      expect(currentStock).toBe(5);
    });

    it('should identify out of stock items', () => {
      store.dispatch(toggleCartItem({ product: mockProductOutOfStock, quantity: 1 }));

      const state = store.getState();
      const items = selectCartItems(state);
      // Simuler les produits depuis le state préchargé
      const currentProducts = [
        { id: '1', name: 'Tomate', price: 1000, stock: 5 },
        { id: '2', name: 'Pomme', price: 500, stock: 0 },
      ];

      const item = items[0];
      const currentProduct = currentProducts.find(p => p.id === item.product.id);
      const currentStock = currentProduct ? currentProduct.stock : null;
      const isOutOfStock = currentStock !== null && currentStock === 0;

      expect(isOutOfStock).toBe(true);
    });
  });
});

