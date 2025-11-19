import ordersReducer, {
  setCurrentOrder,
  clearCurrentOrder,
  clearError,
  clearLastOrder,
  selectOrders,
  selectCurrentOrder,
} from '../ordersSlice';

describe('ordersSlice', () => {
  const initialState = {
    orders: [],
    currentOrder: null,
    isLoading: false,
    initialLoading: false,
    error: null,
    lastOrder: null,
    hasInitialized: false,
  };

  const mockOrder = {
    id: 'order123',
    order_number: 'DM-123456',
    status: 'pending',
    total: 5000,
    currency: 'CDF',
    user_id: 'user123',
    items: [
      { product_id: '1', quantity: 2, price: 2500 },
    ],
  };

  describe('setCurrentOrder', () => {
    it('should set current order', () => {
      const action = setCurrentOrder(mockOrder);
      const state = ordersReducer(initialState, action);

      expect(state.currentOrder).toEqual(mockOrder);
    });
  });

  describe('clearCurrentOrder', () => {
    it('should clear current order', () => {
      const stateWithOrder = {
        ...initialState,
        currentOrder: mockOrder,
      };

      const action = clearCurrentOrder();
      const state = ordersReducer(stateWithOrder, action);

      expect(state.currentOrder).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const stateWithError = {
        ...initialState,
        error: 'Une erreur est survenue',
      };

      const action = clearError();
      const state = ordersReducer(stateWithError, action);

      expect(state.error).toBeNull();
    });
  });

  describe('clearLastOrder', () => {
    it('should clear last order', () => {
      const stateWithLastOrder = {
        ...initialState,
        lastOrder: mockOrder,
      };

      const action = clearLastOrder();
      const state = ordersReducer(stateWithLastOrder, action);

      expect(state.lastOrder).toBeNull();
    });
  });

  describe('fetchUserOrders async actions', () => {
    it('should set initialLoading to true when pending and not initialized', () => {
      const action = { type: 'orders/fetchUserOrders/pending' };
      const state = ordersReducer(initialState, action);

      expect(state.initialLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should not set initialLoading when already initialized', () => {
      const initializedState = {
        ...initialState,
        hasInitialized: true,
      };

      const action = { type: 'orders/fetchUserOrders/pending' };
      const state = ordersReducer(initializedState, action);

      expect(state.initialLoading).toBe(false);
    });

    it('should set orders when fulfilled', () => {
      const orders = [mockOrder, { ...mockOrder, id: 'order456' }];
      const action = {
        type: 'orders/fetchUserOrders/fulfilled',
        payload: orders,
      };
      const state = ordersReducer(initialState, action);

      expect(state.orders).toEqual(orders);
      expect(state.initialLoading).toBe(false);
      expect(state.hasInitialized).toBe(true);
    });

    it('should handle non-array payload', () => {
      const action = {
        type: 'orders/fetchUserOrders/fulfilled',
        payload: null,
      };
      const state = ordersReducer(initialState, action);

      expect(state.orders).toEqual([]);
    });

    it('should set error when rejected', () => {
      const action = {
        type: 'orders/fetchUserOrders/rejected',
        payload: 'Erreur de chargement',
      };
      const state = ordersReducer(initialState, action);

      expect(state.error).toBe('Erreur de chargement');
      expect(state.initialLoading).toBe(false);
    });
  });

  describe('createOrder async actions', () => {
    it('should set isLoading to true when pending', () => {
      const action = { type: 'orders/createOrder/pending' };
      const state = ordersReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should add order to list and set lastOrder when fulfilled', () => {
      const action = {
        type: 'orders/createOrder/fulfilled',
        payload: mockOrder,
      };
      const state = ordersReducer(initialState, action);

      expect(state.lastOrder).toEqual(mockOrder);
      expect(state.orders).toHaveLength(1);
      expect(state.orders[0]).toEqual(mockOrder);
      expect(state.isLoading).toBe(false);
    });

    it('should prepend new order to existing orders', () => {
      const existingOrder = { ...mockOrder, id: 'order456' };
      const stateWithOrders = {
        ...initialState,
        orders: [existingOrder],
      };

      const action = {
        type: 'orders/createOrder/fulfilled',
        payload: mockOrder,
      };
      const state = ordersReducer(stateWithOrders, action);

      expect(state.orders).toHaveLength(2);
      expect(state.orders[0]).toEqual(mockOrder);
      expect(state.orders[1]).toEqual(existingOrder);
    });

    it('should set error when rejected', () => {
      const action = {
        type: 'orders/createOrder/rejected',
        payload: 'Erreur de création',
      };
      const state = ordersReducer(initialState, action);

      expect(state.error).toBe('Erreur de création');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updateOrderStatus async actions', () => {
    it('should update order status when fulfilled', () => {
      const stateWithOrder = {
        ...initialState,
        orders: [mockOrder],
      };

      const updatedOrder = { ...mockOrder, status: 'confirmed' };
      const action = {
        type: 'orders/updateOrderStatus/fulfilled',
        payload: updatedOrder,
      };
      const state = ordersReducer(stateWithOrder, action);

      expect(state.orders[0].status).toBe('confirmed');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('fetchOrderById async actions', () => {
    it('should set currentOrder when fulfilled', () => {
      const action = {
        type: 'orders/fetchOrderById/fulfilled',
        payload: mockOrder,
      };
      const state = ordersReducer(initialState, action);

      expect(state.currentOrder).toEqual(mockOrder);
      expect(state.isLoading).toBe(false);
    });

    it('should set error when rejected', () => {
      const action = {
        type: 'orders/fetchOrderById/rejected',
        payload: 'Commande non trouvée',
      };
      const state = ordersReducer(initialState, action);

      expect(state.error).toBe('Commande non trouvée');
      expect(state.isLoading).toBe(false);
    });
  });
});

describe('Orders Selectors', () => {
  const mockState = {
    orders: {
      orders: [
        { id: '1', status: 'pending', total: 1000 },
        { id: '2', status: 'confirmed', total: 2000 },
      ],
      currentOrder: { id: '1', status: 'pending' },
      isLoading: false,
      error: null,
    },
  };

  describe('selectOrders', () => {
    it('should return orders array', () => {
      expect(selectOrders(mockState)).toHaveLength(2);
      expect(selectOrders(mockState)[0].id).toBe('1');
    });

    it('should return empty array if orders is not an array', () => {
      const invalidState = {
        orders: {
          orders: null,
        },
      };
      expect(selectOrders(invalidState)).toEqual([]);
    });

    it('should return empty array if state.orders is undefined', () => {
      expect(selectOrders({})).toEqual([]);
    });

    it('should return empty array if state is null', () => {
      expect(selectOrders(null)).toEqual([]);
    });
  });

  describe('selectCurrentOrder', () => {
    it('should return current order', () => {
      expect(selectCurrentOrder(mockState)).toEqual({ id: '1', status: 'pending' });
    });

    it('should return null if no current order', () => {
      const stateWithoutCurrent = {
        orders: {
          ...mockState.orders,
          currentOrder: null,
        },
      };
      expect(selectCurrentOrder(stateWithoutCurrent)).toBeNull();
    });

    it('should return null if orders state is undefined', () => {
      expect(selectCurrentOrder({})).toBeNull();
    });
  });
});

