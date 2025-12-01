import { configureStore } from '@reduxjs/toolkit';
import cartReducer, {
  toggleCartItem,
  updateCartItemQuantity,
  removeFromCart,
  selectCartItems,
  selectCartItemsCount,
  selectCartTotals,
} from '../../store/cartSlice';

describe('Cart Integration Tests', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        cart: cartReducer,
      },
    });
  });

  const mockProduct1 = {
    id: '1',
    name: 'Tomate',
    price: 1000,
    stock: 10,
    currency: 'CDF',
  };

  const mockProduct2 = {
    id: '2',
    name: 'Pomme',
    price: 500,
    stock: 5,
    currency: 'CDF',
  };

  describe('Add to Cart Flow', () => {
    it('should add product to empty cart', () => {
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));

      const state = store.getState();
      const items = selectCartItems(state);
      const count = selectCartItemsCount(state);

      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe('1');
      expect(items[0].quantity).toBe(2);
      expect(count).toBe(2);
    });

    it('should add multiple different products', () => {
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));
      store.dispatch(toggleCartItem({ product: mockProduct2, quantity: 3 }));

      const state = store.getState();
      const items = selectCartItems(state);
      const count = selectCartItemsCount(state);

      expect(items).toHaveLength(2);
      expect(count).toBe(5); // 2 + 3
    });

    it('should remove product if already in cart (toggle behavior)', () => {
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 1 }));

      const state = store.getState();
      const items = selectCartItems(state);

      expect(items).toHaveLength(0);
    });
  });

  describe('Update Quantity Flow', () => {
    beforeEach(() => {
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));
    });

    it('should update quantity of existing item', () => {
      store.dispatch(updateCartItemQuantity({ productId: '1', quantity: 5 }));

      const state = store.getState();
      const items = selectCartItems(state);

      expect(items[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0', () => {
      store.dispatch(updateCartItemQuantity({ productId: '1', quantity: 0 }));

      const state = store.getState();
      const items = selectCartItems(state);

      expect(items).toHaveLength(0);
    });

    it('should calculate totals correctly after quantity update', () => {
      store.dispatch(updateCartItemQuantity({ productId: '1', quantity: 3 }));

      const state = store.getState();
      const totals = selectCartTotals(state);

      expect(totals.CDF).toBe(3000); // 1000 * 3
    });
  });

  describe('Remove from Cart Flow', () => {
    beforeEach(() => {
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));
      store.dispatch(toggleCartItem({ product: mockProduct2, quantity: 3 }));
    });

    it('should remove specific product from cart', () => {
      store.dispatch(removeFromCart('1'));

      const state = store.getState();
      const items = selectCartItems(state);

      expect(items).toHaveLength(1);
      expect(items[0].product.id).toBe('2');
    });

    it('should update totals after removal', () => {
      const totalsBefore = selectCartTotals(store.getState());
      expect(totalsBefore.CDF).toBe(3500); // (1000 * 2) + (500 * 3)

      store.dispatch(removeFromCart('1'));

      const totalsAfter = selectCartTotals(store.getState());
      expect(totalsAfter.CDF).toBe(1500); // 500 * 3
    });
  });

  describe('Cart Totals Calculation', () => {
    it('should calculate totals for single currency', () => {
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));
      store.dispatch(toggleCartItem({ product: mockProduct2, quantity: 3 }));

      const state = store.getState();
      const totals = selectCartTotals(state);

      expect(totals.CDF).toBe(3500); // (1000 * 2) + (500 * 3)
    });

    it('should calculate totals for multiple currencies', () => {
      const usdProduct = {
        id: '3',
        name: 'Banane',
        price: 200,
        currency: 'USD',
      };

      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 1 }));
      store.dispatch(toggleCartItem({ product: usdProduct, quantity: 2 }));

      const state = store.getState();
      const totals = selectCartTotals(state);

      expect(totals.CDF).toBe(1000);
      expect(totals.USD).toBe(400); // 200 * 2
    });

    it('should return empty totals for empty cart', () => {
      const state = store.getState();
      const totals = selectCartTotals(state);

      expect(totals).toEqual({});
    });
  });

  describe('Cart Count Calculation', () => {
    it('should return 0 for empty cart', () => {
      const state = store.getState();
      const count = selectCartItemsCount(state);

      expect(count).toBe(0);
    });

    it('should return correct count for multiple items', () => {
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));
      store.dispatch(toggleCartItem({ product: mockProduct2, quantity: 3 }));

      const state = store.getState();
      const count = selectCartItemsCount(state);

      expect(count).toBe(5);
    });

    it('should update count after quantity change', () => {
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));

      let count = selectCartItemsCount(store.getState());
      expect(count).toBe(2);

      store.dispatch(updateCartItemQuantity({ productId: '1', quantity: 5 }));

      count = selectCartItemsCount(store.getState());
      expect(count).toBe(5);
    });
  });
});



