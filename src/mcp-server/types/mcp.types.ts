/**
 * Type definitions for MCP Server
 */

import { ProductVisibility } from '@prisma/client';

/**
 * Search products parameters matching ProductFilterDto
 */
export interface SearchProductsParams {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  categorySlug?: string;
  recursive?: boolean;
  subCategoryId?: string;
  brandId?: string;
  tagIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  visibility?: ProductVisibility;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Product response structure
 */
export interface ProductResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  costPerItem: number | null;
  sku: string | null;
  barcode: string | null;
  trackQuantity: boolean;
  quantity: number;
  categoryId: string | null;
  brandId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  visibility: ProductVisibility;
  weight: number | null;
  weightUnit: string | null;
  requiresShipping: boolean;
  taxable: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MCP Configuration
 */
export interface MCPConfig {
  server: {
    name: string;
    version: string;
    description: string;
  };
  transport: {
    type: 'stdio' | 'sse';
    port?: number;
  };
  features: {
    caching: boolean;
    rateLimit: boolean;
  };
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}

/**
 * Tool execution context
 */
export interface ToolContext {
  toolName: string;
  startTime: number;
  params: any;
}

