import {
  selectCartItems,
  selectCartItemsCount,
  selectCartTotals,
  selectCartTotal,
  selectIsInCart,
  selectCartItemQuantity,
} from '../cartSlice';

describe('Cart Selectors', () => {
  const mockState = {
    cart: {
      items: [
        { product: { id: '1', price: 1000, currency: 'CDF' }, quantity: 2 },
        { product: { id: '2', price: 500, currency: 'CDF' }, quantity: 3 },
        { product: { id: '3', price: 200, currency: 'USD' }, quantity: 1 },
      ],
      loading: false,
      error: null,
      currentUserId: 'user123',
    },
  };

  describe('selectCartItems', () => {
    it('should return all cart items', () => {
      const items = selectCartItems(mockState);
      expect(items).toHaveLength(3);
      expect(items[0].product.id).toBe('1');
    });

    it('should return empty array if no items', () => {
      const emptyState = { cart: { items: [] } };
      expect(selectCartItems(emptyState)).toHaveLength(0);
    });
  });

  describe('selectCartItemsCount', () => {
    it('should return total quantity of all items', () => {
      expect(selectCartItemsCount(mockState)).toBe(6); // 2 + 3 + 1
    });

    it('should return 0 if cart is empty', () => {
      const emptyState = { cart: { items: [] } };
      expect(selectCartItemsCount(emptyState)).toBe(0);
    });
  });

  describe('selectCartTotals', () => {
    it('should calculate totals by currency', () => {
      const totals = selectCartTotals(mockState);
      expect(totals.CDF).toBe(3500); // (1000 * 2) + (500 * 3)
      expect(totals.USD).toBe(200); // 200 * 1
    });

    it('should return empty object if cart is empty', () => {
      const emptyState = { cart: { items: [] } };
      const totals = selectCartTotals(emptyState);
      expect(totals).toEqual({});
    });

    it('should handle products without currency (default to CDF)', () => {
      const stateWithNoCurrency = {
        cart: {
          items: [
            { product: { id: '1', price: 1000 }, quantity: 1 },
          ],
        },
      };
      const totals = selectCartTotals(stateWithNoCurrency);
      expect(totals.CDF).toBe(1000);
    });
  });

  describe('selectCartTotal', () => {
    it('should return CDF total if available', () => {
      expect(selectCartTotal(mockState)).toBe(3500);
    });

    it('should return USD total if CDF not available', () => {
      const usdOnlyState = {
        cart: {
          items: [
            { product: { id: '1', price: 100, currency: 'USD' }, quantity: 1 },
          ],
        },
      };
      expect(selectCartTotal(usdOnlyState)).toBe(100);
    });

    it('should return 0 if cart is empty', () => {
      const emptyState = { cart: { items: [] } };
      expect(selectCartTotal(emptyState)).toBe(0);
    });
  });

  describe('selectIsInCart', () => {
    it('should return true if product is in cart', () => {
      expect(selectIsInCart(mockState, '1')).toBe(true);
      expect(selectIsInCart(mockState, '2')).toBe(true);
      expect(selectIsInCart(mockState, '3')).toBe(true);
    });

    it('should return false if product is not in cart', () => {
      expect(selectIsInCart(mockState, '999')).toBe(false);
    });

    it('should return false if cart is empty', () => {
      const emptyState = { cart: { items: [] } };
      expect(selectIsInCart(emptyState, '1')).toBe(false);
    });
  });

  describe('selectCartItemQuantity', () => {
    it('should return quantity of product in cart', () => {
      expect(selectCartItemQuantity(mockState, '1')).toBe(2);
      expect(selectCartItemQuantity(mockState, '2')).toBe(3);
      expect(selectCartItemQuantity(mockState, '3')).toBe(1);
    });

    it('should return 0 if product is not in cart', () => {
      expect(selectCartItemQuantity(mockState, '999')).toBe(0);
    });

    it('should return 0 if cart is empty', () => {
      const emptyState = { cart: { items: [] } };
      expect(selectCartItemQuantity(emptyState, '1')).toBe(0);
    });
  });
});

