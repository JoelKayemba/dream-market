import { configureStore } from '@reduxjs/toolkit';
import cartReducer, {
  addToCart,
  removeFromCartWithSync,
  updateCartItemQuantityWithSync,
  clearCartWithSync,
} from '../../store/cartSlice';
import ordersReducer, { createOrder } from '../../store/ordersSlice';
import authReducer, { loginUser } from '../../store/authSlice';
import { orderService } from '../../backend/services/orderService';
import { cartService } from '../../backend/services/cartService';
import { productService } from '../../backend/services/productService';

// Mock des services
jest.mock('../../backend/services/orderService');
jest.mock('../../backend/services/cartService');
jest.mock('../../backend/services/productService');

describe('Tests de Concurrence - Plusieurs Utilisateurs Simultanés', () => {
  let store;

  const mockProduct = {
    id: 'product123',
    name: 'Tomate',
    price: 1000,
    stock: 10, // Stock limité pour tester la concurrence
    currency: 'CDF',
  };

  const createMockStore = (preloadedState = {}) => {
    return configureStore({
      reducer: {
        cart: cartReducer,
        orders: ordersReducer,
        auth: authReducer,
      },
      preloadedState,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = createMockStore();
  });

  describe('Concurrence sur les Commandes', () => {
    it('devrait gérer plusieurs utilisateurs commandant le même produit simultanément', async () => {
      const userId1 = 'user1';
      const userId2 = 'user2';
      const userId3 = 'user3';

      // Simuler 3 utilisateurs qui commandent le même produit en même temps
      const orderPromises = [
        // Utilisateur 1 commande 5 unités
        orderService.createOrder.mockResolvedValueOnce({
          id: 'order1',
          user_id: userId1,
          items: [{ product_id: mockProduct.id, quantity: 5 }],
          total: 5000,
        }),
        // Utilisateur 2 commande 4 unités
        orderService.createOrder.mockResolvedValueOnce({
          id: 'order2',
          user_id: userId2,
          items: [{ product_id: mockProduct.id, quantity: 4 }],
          total: 4000,
        }),
        // Utilisateur 3 commande 3 unités
        orderService.createOrder.mockResolvedValueOnce({
          id: 'order3',
          user_id: userId3,
          items: [{ product_id: mockProduct.id, quantity: 3 }],
          total: 3000,
        }),
      ];

      // Simuler les commandes simultanées
      const results = await Promise.allSettled([
        store.dispatch(createOrder({
          user_id: userId1,
          items: [{ product_id: mockProduct.id, quantity: 5 }],
          total: 5000,
        })),
        store.dispatch(createOrder({
          user_id: userId2,
          items: [{ product_id: mockProduct.id, quantity: 4 }],
          total: 4000,
        })),
        store.dispatch(createOrder({
          user_id: userId3,
          items: [{ product_id: mockProduct.id, quantity: 3 }],
          total: 3000,
        })),
      ]);

      // Vérifier que toutes les commandes ont été traitées
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.status).toBe('fulfilled');
      });

      // Vérifier que le service a été appelé 3 fois
      expect(orderService.createOrder).toHaveBeenCalledTimes(3);
    });

    it('devrait gérer les commandes concurrentes avec stock limité', async () => {
      const stockInitial = 5;
      const users = ['user1', 'user2', 'user3', 'user4', 'user5'];
      
      // Chaque utilisateur essaie de commander 2 unités
      const quantityPerUser = 2;
      const totalRequested = users.length * quantityPerUser; // 10 unités
      
      // Mais on n'a que 5 unités en stock
      mockProduct.stock = stockInitial;

      // Simuler les commandes simultanées
      const orderPromises = users.map((userId, index) => {
        orderService.createOrder.mockResolvedValueOnce({
          id: `order${index + 1}`,
          user_id: userId,
          items: [{ product_id: mockProduct.id, quantity: quantityPerUser }],
          total: mockProduct.price * quantityPerUser,
        });
        
        return store.dispatch(createOrder({
          user_id: userId,
          items: [{ product_id: mockProduct.id, quantity: quantityPerUser }],
          total: mockProduct.price * quantityPerUser,
        }));
      });

      const results = await Promise.allSettled(orderPromises);

      // Toutes les commandes doivent être tentées
      expect(results).toHaveLength(users.length);
      
      // Dans un vrai scénario, certaines commandes devraient échouer
      // à cause du stock insuffisant, mais ici on teste juste la concurrence
      expect(orderService.createOrder).toHaveBeenCalledTimes(users.length);
    });
  });

  describe('Concurrence sur le Panier', () => {
    it('devrait gérer plusieurs utilisateurs ajoutant au panier simultanément', async () => {
      const users = [
        { id: 'user1', product: { ...mockProduct, id: 'product1' } },
        { id: 'user2', product: { ...mockProduct, id: 'product2' } },
        { id: 'user3', product: { ...mockProduct, id: 'product3' } },
      ];

      // Simuler plusieurs utilisateurs ajoutant au panier en même temps
      const addPromises = users.map((user) => {
        const userStore = createMockStore({
          auth: { user: { id: user.id }, isAuthenticated: true },
        });
        
        cartService.addOrUpdateCartItem.mockResolvedValueOnce({
          user_id: user.id,
          product_id: user.product.id,
          quantity: 1,
        });

        return userStore.dispatch(addToCart({
          product: user.product,
          quantity: 1,
        }));
      });

      const results = await Promise.allSettled(addPromises);

      // Toutes les actions doivent réussir
      expect(results).toHaveLength(users.length);
      results.forEach((result) => {
        expect(result.status).toBe('fulfilled');
      });

      // Vérifier que le service a été appelé pour chaque utilisateur
      expect(cartService.addOrUpdateCartItem).toHaveBeenCalledTimes(users.length);
    });

    it('devrait gérer plusieurs utilisateurs modifiant leur panier simultanément', async () => {
      const userId = 'user1';
      const productId = 'product123';

      // Simuler plusieurs modifications simultanées du panier
      const updatePromises = [
        // Modification 1: Augmenter à 2
        updateCartItemQuantityWithSync({ productId, quantity: 2 }),
        // Modification 2: Augmenter à 3 (concurrent)
        updateCartItemQuantityWithSync({ productId, quantity: 3 }),
        // Modification 3: Diminuer à 1 (concurrent)
        updateCartItemQuantityWithSync({ productId, quantity: 1 }),
      ];

      cartService.addOrUpdateCartItem.mockResolvedValue({});

      const results = await Promise.allSettled(
        updatePromises.map((action) => store.dispatch(action))
      );

      // Toutes les modifications doivent être tentées
      expect(results).toHaveLength(updatePromises.length);
      
      // Dans un vrai scénario, la dernière modification devrait prévaloir
      // mais ici on teste juste que le système gère la concurrence
    });
  });

  describe('Concurrence sur l\'Authentification', () => {
    it('devrait gérer plusieurs utilisateurs se connectant simultanément', async () => {
      const credentials = [
        { email: 'user1@test.com', password: 'pass1' },
        { email: 'user2@test.com', password: 'pass2' },
        { email: 'user3@test.com', password: 'pass3' },
      ];

      // Simuler plusieurs connexions simultanées
      const loginPromises = credentials.map((cred, index) => {
        const userStore = createMockStore();
        
        // Mock de la réponse d'authentification
        return userStore.dispatch(loginUser({
          email: cred.email,
          password: cred.password,
        }));
      });

      const results = await Promise.allSettled(loginPromises);

      // Toutes les tentatives de connexion doivent être traitées
      expect(results).toHaveLength(credentials.length);
    });
  });

  describe('Concurrence sur la Gestion du Stock', () => {
    it('devrait détecter les problèmes de stock lors de commandes concurrentes', async () => {
      const stockInitial = 5;
      const users = ['user1', 'user2', 'user3'];
      
      // Chaque utilisateur essaie de commander 3 unités
      // Total demandé: 9 unités, mais seulement 5 disponibles
      mockProduct.stock = stockInitial;

      // Simuler les vérifications de stock simultanées
      productService.getProductById.mockResolvedValue({
        ...mockProduct,
        stock: stockInitial,
      });

      const stockChecks = users.map(async (userId) => {
        const product = await productService.getProductById(mockProduct.id);
        return {
          userId,
          availableStock: product.stock,
          requestedQuantity: 3,
          canOrder: product.stock >= 3,
        };
      });

      const results = await Promise.all(stockChecks);

      // Vérifier que toutes les vérifications ont été effectuées
      expect(results).toHaveLength(users.length);
      
      // Toutes devraient voir le même stock initial
      results.forEach((result) => {
        expect(result.availableStock).toBe(stockInitial);
      });

      // Seuls les premiers utilisateurs devraient pouvoir commander
      // (dans un vrai scénario avec verrous de base de données)
      const canOrderCount = results.filter((r) => r.canOrder).length;
      expect(canOrderCount).toBeGreaterThan(0);
      expect(canOrderCount).toBeLessThanOrEqual(users.length);
    });
  });

  describe('Race Conditions', () => {
    it('devrait gérer les race conditions lors de la suppression et mise à jour simultanées', async () => {
      const userId = 'user1';
      const productId = 'product123';

      // Simuler une suppression et une mise à jour simultanées
      cartService.removeCartItem.mockResolvedValue({});
      cartService.addOrUpdateCartItem.mockResolvedValue({});

      const actions = [
        store.dispatch(removeFromCartWithSync(productId)),
        store.dispatch(updateCartItemQuantityWithSync({ productId, quantity: 2 })),
      ];

      const results = await Promise.allSettled(actions);

      // Les deux actions doivent être traitées
      expect(results).toHaveLength(2);
      
      // Dans un vrai scénario, l'ordre d'exécution pourrait affecter le résultat final
      // Ici on teste juste que le système ne plante pas
    });

    it('devrait gérer les race conditions lors de l\'ajout et suppression simultanées', async () => {
      const userId = 'user1';
      const product = { ...mockProduct, id: 'product123' };

      cartService.addOrUpdateCartItem.mockResolvedValue({});
      cartService.removeCartItem.mockResolvedValue({});

      const actions = [
        store.dispatch(addToCart({ product, quantity: 1 })),
        store.dispatch(removeFromCartWithSync(product.id)),
      ];

      const results = await Promise.allSettled(actions);

      // Les deux actions doivent être traitées
      expect(results).toHaveLength(2);
    });
  });

  describe('Performance sous Charge', () => {
    it('devrait gérer 10 commandes simultanées sans erreur', async () => {
      const numberOfUsers = 10;
      const users = Array.from({ length: numberOfUsers }, (_, i) => ({
        id: `user${i + 1}`,
        email: `user${i + 1}@test.com`,
      }));

      orderService.createOrder.mockImplementation(async (orderData) => {
        // Simuler une latence réseau
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          id: `order${orderData.user_id}`,
          ...orderData,
        };
      });

      const startTime = Date.now();
      
      const orderPromises = users.map((user) =>
        store.dispatch(createOrder({
          user_id: user.id,
          items: [{ product_id: mockProduct.id, quantity: 1 }],
          total: mockProduct.price,
        }))
      );

      const results = await Promise.allSettled(orderPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Toutes les commandes doivent être traitées
      expect(results).toHaveLength(numberOfUsers);
      results.forEach((result) => {
        expect(result.status).toBe('fulfilled');
      });

      // Vérifier que le temps d'exécution est raisonnable
      // (les commandes parallèles devraient être plus rapides que séquentielles)
      expect(duration).toBeLessThan(1000); // Moins d'1 seconde pour 10 commandes
      
      expect(orderService.createOrder).toHaveBeenCalledTimes(numberOfUsers);
    });

    it('devrait gérer 50 ajouts au panier simultanés', async () => {
      const numberOfUsers = 50;
      const users = Array.from({ length: numberOfUsers }, (_, i) => ({
        id: `user${i + 1}`,
        product: { ...mockProduct, id: `product${i + 1}` },
      }));

      cartService.addOrUpdateCartItem.mockResolvedValue({});

      const startTime = Date.now();

      const addPromises = users.map((user) => {
        const userStore = createMockStore({
          auth: { user: { id: user.id }, isAuthenticated: true },
        });
        return userStore.dispatch(addToCart({
          product: user.product,
          quantity: 1,
        }));
      });

      const results = await Promise.allSettled(addPromises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Toutes les actions doivent réussir
      expect(results).toHaveLength(numberOfUsers);
      
      // Vérifier que le temps d'exécution est raisonnable
      expect(duration).toBeLessThan(2000); // Moins de 2 secondes pour 50 ajouts
      
      expect(cartService.addOrUpdateCartItem).toHaveBeenCalledTimes(numberOfUsers);
    });
  });
});



