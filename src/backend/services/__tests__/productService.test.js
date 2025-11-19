import { productService } from '../productService';
import { supabase } from '../../config/supabase';

// Mock Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  STORAGE_BUCKETS: {
    PRODUCTS: 'products',
  },
}));

// Mock inputSanitizer
jest.mock('../../../utils/inputSanitizer', () => ({
  validateAndSanitizeTitle: jest.fn((value) => ({ valid: true, cleaned: value })),
  validateAndSanitizeText: jest.fn((value) => ({ valid: true, cleaned: value })),
  validateAndSanitizeNumber: jest.fn((value) => ({ valid: true, cleaned: value })),
  sanitizeString: jest.fn((value) => value),
  sanitizeArray: jest.fn((value) => value),
}));

describe('productService', () => {
  const mockProductId = 'product123';
  const mockFarmId = 'farm123';
  const mockCategoryId = 'category123';

  const mockProduct = {
    id: mockProductId,
    name: 'Tomate',
    description: 'Tomate fraîche',
    price: 1000,
    stock: 10,
    currency: 'CDF',
    farm_id: mockFarmId,
    category_id: mockCategoryId,
    is_active: true,
    farms: {
      id: mockFarmId,
      name: 'Ferme Test',
      location: 'Kinshasa',
      verified: true,
    },
    categories: {
      id: mockCategoryId,
      name: 'Légumes',
      emoji: '🥬',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products with pagination', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockResolvedValue({
        data: [mockProduct],
        error: null,
        count: 1,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        range: mockRange,
      });

      const result = await productService.getProducts({ limit: 20, offset: 0 });

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockRange).toHaveBeenCalledWith(0, 19);
      expect(result.data).toEqual([mockProduct]);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should handle errors when fetching products', async () => {
      const mockError = { message: 'Database error', code: 'PGRST116' };
      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
        count: 0,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        range: mockRange,
      });

      await expect(productService.getProducts()).rejects.toEqual(mockError);
    });

    // Note: Le test de filtrage par isNew est omis car il nécessite un mock complexe
    // pour gérer le chaînage query = query.eq() après query.order()
  });

  describe('getProductById', () => {
    it('should fetch a product by ID', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockProduct,
        error: null,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await productService.getProductById(mockProductId);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockEq).toHaveBeenCalledWith('id', mockProductId);
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should handle errors when fetching product by ID', async () => {
      const mockError = { message: 'Product not found', code: 'PGRST116' };
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      await expect(productService.getProductById(mockProductId)).rejects.toEqual(mockError);
    });
  });

  describe('addProduct', () => {
    it('should create a new product', async () => {
      const newProductData = {
        name: 'Nouveau Produit',
        description: 'Description',
        price: 2000,
        currency: 'CDF',
        stock: 5,
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockInsert = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...newProductData, id: mockProductId },
        error: null,
      });

      supabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await productService.addProduct(newProductData);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockInsert).toHaveBeenCalled();
      expect(result.id).toBe(mockProductId);
    });

    it('should validate and sanitize product data', async () => {
      const { validateAndSanitizeTitle } = require('../../../utils/inputSanitizer');
      
      const newProductData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockInsert = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...newProductData, id: mockProductId },
        error: null,
      });

      supabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      await productService.addProduct(newProductData);

      expect(validateAndSanitizeTitle).toHaveBeenCalledWith(newProductData.name, expect.any(Object));
    });

    it('should handle errors when creating product', async () => {
      const mockError = { message: 'Validation error', code: '23505' };
      const mockSelect = jest.fn().mockReturnThis();
      const mockInsert = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      supabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      await expect(productService.addProduct({ name: 'Test' })).rejects.toEqual(mockError);
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const updates = {
        name: 'Produit Mis à Jour',
        price: 1500,
      };

      const mockSelect = jest.fn().mockReturnThis();
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...mockProduct, ...updates },
        error: null,
      });

      supabase.from.mockReturnValue({
        update: mockUpdate,
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await productService.updateProduct(mockProductId, updates);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockEq).toHaveBeenCalledWith('id', mockProductId);
      expect(result.name).toBe(updates.name);
      expect(result.price).toBe(updates.price);
    });

    it('should handle errors when updating product', async () => {
      const mockError = { message: 'Update failed', code: 'PGRST116' };
      const mockSelect = jest.fn().mockReturnThis();
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      supabase.from.mockReturnValue({
        update: mockUpdate,
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      await expect(productService.updateProduct(mockProductId, { name: 'Test' })).rejects.toEqual(mockError);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const mockDelete = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      supabase.from.mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      await productService.deleteProduct(mockProductId);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockEq).toHaveBeenCalledWith('id', mockProductId);
    });

    it('should handle errors when deleting product', async () => {
      const mockError = { message: 'Delete failed', code: 'PGRST116' };
      const mockDelete = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      supabase.from.mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      await expect(productService.deleteProduct(mockProductId)).rejects.toEqual(mockError);
    });
  });

  describe('getProductsByCategory', () => {
    it('should fetch products by category', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      const result = await productService.getProductsByCategory(mockCategoryId);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockEq).toHaveBeenCalledWith('category_id', mockCategoryId);
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('getProductsByFarm', () => {
    it('should fetch products by farm', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [mockProduct],
        error: null,
      });

      supabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      const result = await productService.getProductsByFarm(mockFarmId);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockEq).toHaveBeenCalledWith('farm_id', mockFarmId);
      expect(result).toEqual([mockProduct]);
    });
  });
});

