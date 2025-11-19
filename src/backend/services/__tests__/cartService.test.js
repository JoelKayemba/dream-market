import { cartService } from '../cartService';
import { supabase, TABLES } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  TABLES: {
    CARTS: 'carts',
    PRODUCTS: 'products',
  },
}));

describe('cartService', () => {
  const mockUserId = 'user123';
  const mockProductId = 'product123';

  const mockProduct = {
    id: mockProductId,
    name: 'Tomate',
    price: 1000,
    stock: 10,
    currency: 'CDF',
  };

  const mockCartItem = {
    id: 'cart123',
    user_id: mockUserId,
    product_id: mockProductId,
    quantity: 2,
    created_at: '2024-01-01T00:00:00Z',
    products: mockProduct,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCart', () => {
    it('should fetch user cart with product details', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [mockCartItem],
        error: null,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await cartService.getUserCart(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith(TABLES.CARTS);
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toHaveLength(1);
      expect(result[0].product).toEqual(mockProduct);
      expect(result[0].quantity).toBe(2);
    });

    it('should handle errors when fetching cart', async () => {
      const mockError = { message: 'Database error', code: 'PGRST301' };
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        order: mockOrder,
      });

      await expect(cartService.getUserCart(mockUserId)).rejects.toEqual(mockError);
    });

    it('should return empty array if no cart items', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        order: mockOrder,
      });

      const result = await cartService.getUserCart(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('addOrUpdateCartItem', () => {
    it('should add new item to cart', async () => {
      // Mock check for existing item - chain properly
      const mockCheckSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Not found
      });

      const mockCheckEq2 = {
        single: mockCheckSingle,
      };

      const mockCheckEq1 = {
        eq: jest.fn().mockReturnValue(mockCheckEq2),
      };

      const mockCheckSelect = {
        eq: jest.fn().mockReturnValue(mockCheckEq1),
      };

      // Mock insert
      const mockInsertSingle = jest.fn().mockResolvedValue({
        data: mockCartItem,
        error: null,
      });

      const mockInsertSelect = {
        single: mockInsertSingle,
      };

      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue(mockInsertSelect),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue(mockCheckSelect),
      }).mockReturnValueOnce({
        insert: mockInsert,
      });

      const result = await cartService.addOrUpdateCartItem(mockUserId, mockProductId, 2);

      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUserId,
        product_id: mockProductId,
        quantity: 2,
      });
      expect(result).toEqual(mockCartItem);
    });

    it('should update existing item quantity', async () => {
      // Mock check for existing item
      const mockCheckSingle = jest.fn().mockResolvedValue({
        data: { ...mockCartItem, quantity: 1 },
        error: null,
      });

      const mockCheckEq2 = {
        single: mockCheckSingle,
      };

      const mockCheckEq1 = {
        eq: jest.fn().mockReturnValue(mockCheckEq2),
      };

      const mockCheckSelect = {
        eq: jest.fn().mockReturnValue(mockCheckEq1),
      };

      // Mock update
      const mockUpdateSingle = jest.fn().mockResolvedValue({
        data: { ...mockCartItem, quantity: 3 },
        error: null,
      });

      const mockUpdateSelect = {
        single: mockUpdateSingle,
      };

      const mockUpdateEq2 = {
        select: jest.fn().mockReturnValue(mockUpdateSelect),
      };

      const mockUpdateEq1 = {
        eq: jest.fn().mockReturnValue(mockUpdateEq2),
      };

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue(mockUpdateEq1),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue(mockCheckSelect),
      }).mockReturnValueOnce({
        update: mockUpdate,
      });

      const result = await cartService.addOrUpdateCartItem(mockUserId, mockProductId, 3);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 3 })
      );
      expect(result.quantity).toBe(3);
    });
  });

  describe('removeCartItem', () => {
    it('should remove item from cart', async () => {
      const mockEq2 = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockEq1 = {
        eq: jest.fn().mockReturnValue(mockEq2),
      };

      const mockDelete = {
        eq: jest.fn().mockReturnValue(mockEq1),
      };

      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockDelete),
      });

      await cartService.removeCartItem(mockUserId, mockProductId);

      expect(supabase.from).toHaveBeenCalledWith(TABLES.CARTS);
    });
  });

  describe('clearUserCart', () => {
    it('should clear all items from user cart', async () => {
      const mockEq = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockDelete = {
        eq: jest.fn().mockReturnValue(mockEq),
      };

      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue(mockDelete),
      });

      await cartService.clearUserCart(mockUserId);

      expect(supabase.from).toHaveBeenCalledWith(TABLES.CARTS);
    });
  });
});

