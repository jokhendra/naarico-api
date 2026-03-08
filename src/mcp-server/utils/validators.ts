/**
 * Validation utilities for MCP tools
 * Provides Zod schemas for parameter validation
 */

import { z } from 'zod';
import { ProductVisibility } from '@prisma/client';

/**
 * Schema for search products parameters
 * Matches ProductFilterDto from NestJS
 */
export const SearchProductsSchema = z.object({
  // Pagination
  page: z
    .number()
    .min(1)
    .optional()
    .default(1)
    .describe('Page number'),
  limit: z
    .number()
    .min(1)
    .max(10)
    .optional()
    .default(10)
    .describe('Items per page (max 10)'),

  // Search
  search: z
    .string()
    .min(2, 'Search term must be at least 2 characters')
    .max(100)
    .describe('Search term (min 2 chars)'),

  // Category filters
  categoryId: z.string().uuid().optional().describe('Category ID'),
  categorySlug: z.string().optional().describe('Category slug'),
  recursive: z.boolean().optional().default(false).describe('Include subcategories'),
  subCategoryId: z.string().uuid().optional().describe('Subcategory ID'),

  // Brand filter
  brandId: z.string().uuid().optional().describe('Brand ID'),

  // Tag filters
  tagIds: z.array(z.string().uuid()).optional().describe('Tag IDs'),

  // Price range
  minPrice: z.number().min(0).optional().describe('Min price'),
  maxPrice: z.number().min(0).optional().describe('Max price'),

  // Stock and features
  inStock: z.boolean().optional().describe('In stock only'),
  isFeatured: z.boolean().optional().describe('Featured only'),

  // Visibility
  visibility: z.nativeEnum(ProductVisibility).optional().describe('Visibility level'),

  // Sorting
  sortBy: z.string().optional().default('createdAt').describe('Sort field'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc').describe('Sort order'),
});

/**
 * Type inference from schema
 */
export type SearchProductsInput = z.infer<typeof SearchProductsSchema>;

/**
 * Validate and parse search products parameters
 */
export function validateSearchProducts(params: unknown): SearchProductsInput {
  return SearchProductsSchema.parse(params);
}

/**
 * Safe validation that returns validation errors
 */
export function safeValidateSearchProducts(params: unknown): {
  success: boolean;
  data?: SearchProductsInput;
  error?: z.ZodError;
} {
  const result = SearchProductsSchema.safeParse(params);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Schema for get product by ID or slug
 */
export const GetProductSchema = z.object({
  id: z.string().uuid().optional().describe('Product ID'),
  slug: z.string().min(1).optional().describe('Product slug'),
  includeVariants: z.boolean().optional().default(true).describe('Include variants'),
  includeReviews: z.boolean().optional().default(false).describe('Include reviews'),
  includeRelated: z.boolean().optional().default(false).describe('Include related'),
}).refine(
  (data) => data.id || data.slug,
  {
    message: 'Either id or slug must be provided',
    path: ['id'],
  }
);

/**
 * Type inference from get product schema
 */
export type GetProductInput = z.infer<typeof GetProductSchema>;

/**
 * Validate and parse get product parameters
 */
export function validateGetProduct(params: unknown): GetProductInput {
  return GetProductSchema.parse(params);
}

/**
 * Safe validation for get product
 */
export function safeValidateGetProduct(params: unknown): {
  success: boolean;
  data?: GetProductInput;
  error?: z.ZodError;
} {
  const result = GetProductSchema.safeParse(params);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

