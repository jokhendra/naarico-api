/**
 * Search Products Tool
 * Comprehensive product search with full filter support
 */

import { SearchProductsSchema } from '../utils/validators';
import { searchProducts } from '../services/products-mcp.service';
import { safeExecute } from '../utils/error-handler';
import { MCPLogger, createLogger } from '../utils/logger';

const logger: MCPLogger = createLogger('SearchProductsTool');

/**
 * Tool name constant
 */
export const TOOL_NAME = 'search_products';

/**
 * Tool description - Optimized for minimal token usage
 */
export const TOOL_DESCRIPTION = 
  'Search products by text, filter by category, brand, price range, stock status. Supports sorting and pagination (max 10 items). Returns: id, title, shortDescription, price, discountPrice, currency, sku, rating, reviewCount, image.';

/**
 * Search products tool parameters schema
 */
export const searchProductsParameters = SearchProductsSchema;

/**
 * Execute search products tool
 */
export async function executeSearchProducts(args: any): Promise<string> {
  const startTime = Date.now();
  logger.toolStart(TOOL_NAME, args);

  try {
    // Execute search with error handling
    const result = await safeExecute(
      () => searchProducts(args),
      TOOL_NAME,
      { params: args },
    );

    const duration = Date.now() - startTime;
    logger.toolSuccess(TOOL_NAME, duration);

    // Return compact JSON (no formatting) to minimize tokens
    return JSON.stringify({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.hasNextPage,
        hasPrev: result.hasPreviousPage,
      },
      executionTime: `${duration}ms`,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.toolError(TOOL_NAME, error as Error, duration);
    throw error; // Re-throw to let FastMCP handle it
  }
}

/**
 * Tool definition for FastMCP
 */
export const searchProductsTool = {
  name: TOOL_NAME,
  description: TOOL_DESCRIPTION,
  parameters: searchProductsParameters,
  execute: executeSearchProducts,
};

