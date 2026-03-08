/**
 * Tests for search_products tool
 */

import { validateSearchProducts } from '../utils/validators';
import { ProductVisibility } from '@prisma/client';

describe('Search Products Tool', () => {
  describe('Parameter Validation', () => {
    it('should validate basic search parameters', () => {
      const params = {
        search: 'laptop',
        limit: 10,
      };

      const result = validateSearchProducts(params);

      expect(result.search).toBe('laptop');
      expect(result.limit).toBe(10);
      expect(result.page).toBe(1); // default value
    });

    it('should validate with all parameters', () => {
      const params = {
        search: 'smartphone',
        page: 2,
        limit: 20,
        categorySlug: 'electronics',
        recursive: true,
        minPrice: 100,
        maxPrice: 1000,
        inStock: true,
        isFeatured: false,
        visibility: ProductVisibility.PUBLIC,
        sortBy: 'price',
        sortOrder: 'asc' as const,
      };

      const result = validateSearchProducts(params);

      expect(result.search).toBe('smartphone');
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.categorySlug).toBe('electronics');
      expect(result.recursive).toBe(true);
      expect(result.minPrice).toBe(100);
      expect(result.maxPrice).toBe(1000);
      expect(result.inStock).toBe(true);
      expect(result.isFeatured).toBe(false);
      expect(result.sortBy).toBe('price');
      expect(result.sortOrder).toBe('asc');
    });

    it('should apply default values when search is provided', () => {
      const params = {
        search: 'test',
      };

      const result = validateSearchProducts(params);

      expect(result.search).toBe('test');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
      expect(result.recursive).toBe(false);
    });

    it('should reject missing search parameter', () => {
      const params = {};

      expect(() => validateSearchProducts(params)).toThrow();
    });

    it('should reject empty search string', () => {
      const params = {
        search: '',
      };

      expect(() => validateSearchProducts(params)).toThrow();
    });

    it('should reject invalid page number', () => {
      const params = {
        page: 0,
      };

      expect(() => validateSearchProducts(params)).toThrow();
    });

    it('should reject limit over 100', () => {
      const params = {
        limit: 150,
      };

      expect(() => validateSearchProducts(params)).toThrow();
    });

    it('should reject negative prices', () => {
      const params = {
        minPrice: -10,
      };

      expect(() => validateSearchProducts(params)).toThrow();
    });

    it('should validate UUID format for IDs', () => {
      const validParams = {
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      expect(() => validateSearchProducts(validParams)).not.toThrow();

      const invalidParams = {
        categoryId: 'invalid-uuid',
      };

      expect(() => validateSearchProducts(invalidParams)).toThrow();
    });

    it('should validate array of tag IDs', () => {
      const params = {
        tagIds: [
          '123e4567-e89b-12d3-a456-426614174000',
          '223e4567-e89b-12d3-a456-426614174000',
        ],
      };

      const result = validateSearchProducts(params);
      expect(result.tagIds).toHaveLength(2);
    });

    it('should validate sort order enum', () => {
      const validAsc = { sortOrder: 'asc' as const };
      const validDesc = { sortOrder: 'desc' as const };

      expect(() => validateSearchProducts(validAsc)).not.toThrow();
      expect(() => validateSearchProducts(validDesc)).not.toThrow();

      const invalid = { sortOrder: 'invalid' };
      expect(() => validateSearchProducts(invalid)).toThrow();
    });
  });

  describe('Schema Properties', () => {
    it('should have correct default values', () => {
      const result = validateSearchProducts({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
      expect(result.recursive).toBe(false);
    });

    it('should handle optional parameters when search is provided', () => {
      const result = validateSearchProducts({ search: 'test' });

      expect(result.search).toBe('test');
      expect(result.categoryId).toBeUndefined();
      expect(result.brandId).toBeUndefined();
      expect(result.minPrice).toBeUndefined();
    });

    it('should require search parameter even with other filters', () => {
      const paramsWithoutSearch = {
        categorySlug: 'electronics',
        minPrice: 100,
      };

      expect(() => validateSearchProducts(paramsWithoutSearch)).toThrow();
    });
  });
});

describe('Integration Tests', () => {
  describe('Search Products Tool Execution', () => {
    // These tests would require actual database setup
    // For now, they serve as examples

    it.skip('should search products by text', async () => {
      // TODO: Add integration test
    });

    it.skip('should filter by category', async () => {
      // TODO: Add integration test
    });

    it.skip('should handle pagination correctly', async () => {
      // TODO: Add integration test
    });
  });
});

