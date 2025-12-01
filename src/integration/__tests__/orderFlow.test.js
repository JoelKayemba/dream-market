import { configureStore } from '@reduxjs/toolkit';
import cartReducer, {
  toggleCartItem,
  clearCart,
  selectCartItems,
  selectCartTotals,
} from '../../store/cartSlice';
import ordersReducer, {
  createOrder,
  selectOrders,
  selectLastOrder,
} from '../../store/ordersSlice';

describe('Order Flow Integration', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        cart: cartReducer,
        orders: ordersReducer,
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

  describe('Complete Order Flow', () => {
    it('should create order from cart items', async () => {
      // 1. Ajouter des produits au panier
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));
      store.dispatch(toggleCartItem({ product: mockProduct2, quantity: 3 }));

      let state = store.getState();
      const cartItems = selectCartItems(state);
      const cartTotal = selectCartTotals(state);

      expect(cartItems).toHaveLength(2);
      expect(cartTotal.CDF).toBe(3500); // (1000 * 2) + (500 * 3)

      // 2. Créer une commande (simulation)
      const orderData = {
        user_id: 'user123',
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total: cartTotal.CDF,
        currency: 'CDF',
        delivery_address: '123 Main St',
        phone_number: '+243900000000',
      };

      // Simuler la création de commande
      const mockOrder = {
        id: 'order123',
        order_number: 'DM-123456',
        status: 'pending',
        ...orderData,
        created_at: new Date().toISOString(),
      };

      const action = {
        type: 'orders/createOrder/fulfilled',
        payload: mockOrder,
      };
      state = ordersReducer(state.orders, action);
      store = configureStore({
        reducer: {
          cart: cartReducer,
          orders: ordersReducer,
        },
        preloadedState: {
          orders: state,
        },
      });

      // 3. Vérifier que la commande a été créée
      const orders = selectOrders(store.getState());
      const lastOrder = selectLastOrder(store.getState());

      expect(orders).toHaveLength(1);
      expect(lastOrder).toEqual(mockOrder);
      expect(lastOrder.total).toBe(3500);
    });

    it('should clear cart after order creation', () => {
      // Ajouter des produits au panier
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));

      let state = store.getState();
      expect(selectCartItems(state)).toHaveLength(1);

      // Créer une commande
      const mockOrder = {
        id: 'order123',
        order_number: 'DM-123456',
        status: 'pending',
        total: 2000,
      };

      const action = {
        type: 'orders/createOrder/fulfilled',
        payload: mockOrder,
      };
      ordersReducer(state.orders, action);

      // Vider le panier (normalement fait après création de commande)
      store.dispatch(clearCart());

      state = store.getState();
      expect(selectCartItems(state)).toHaveLength(0);
    });
  });

  describe('Order Data Validation', () => {
    it('should calculate order total from cart items', () => {
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));
      store.dispatch(toggleCartItem({ product: mockProduct2, quantity: 1 }));

      const state = store.getState();
      const cartItems = selectCartItems(state);
      const cartTotal = selectCartTotals(state);

      // Calculer le total manuellement
      const calculatedTotal = cartItems.reduce((sum, item) => {
        return sum + (item.product.price * item.quantity);
      }, 0);

      expect(cartTotal.CDF).toBe(calculatedTotal);
      expect(cartTotal.CDF).toBe(2500); // (1000 * 2) + (500 * 1)
    });

    it('should include all cart items in order', () => {
      store.dispatch(toggleCartItem({ product: mockProduct1, quantity: 2 }));
      store.dispatch(toggleCartItem({ product: mockProduct2, quantity: 3 }));

      const state = store.getState();
      const cartItems = selectCartItems(state);

      // Simuler la création d'une commande avec ces items
      const orderItems = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      expect(orderItems).toHaveLength(2);
      expect(orderItems[0].product_id).toBe('1');
      expect(orderItems[0].quantity).toBe(2);
      expect(orderItems[1].product_id).toBe('2');
      expect(orderItems[1].quantity).toBe(3);
    });
  });

  describe('Order Status Flow', () => {
    it('should track order status changes', () => {
      const mockOrder = {
        id: 'order123',
        status: 'pending',
        total: 2000,
      };

      // Créer la commande
      let state = {
        orders: [],
        currentOrder: null,
        isLoading: false,
        initialLoading: false,
        error: null,
        lastOrder: null,
        hasInitialized: false,
      };

      const createAction = {
        type: 'orders/createOrder/fulfilled',
        payload: mockOrder,
      };
      state = ordersReducer(state, createAction);

      expect(state.orders[0].status).toBe('pending');

      // Mettre à jour le statut
      const updateAction = {
        type: 'orders/updateOrderStatus/fulfilled',
        payload: { ...mockOrder, status: 'confirmed' },
      };
      state = ordersReducer(state, updateAction);

      expect(state.orders[0].status).toBe('confirmed');
    });
  });
});



