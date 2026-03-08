/**
 * Get Product Tool
 * Fetch detailed information about a single product by ID or slug
 */

import { GetProductSchema } from '../utils/validators';
import { getProduct } from '../services/products-mcp.service';
import { safeExecute } from '../utils/error-handler';
import { MCPLogger, createLogger } from '../utils/logger';

const logger: MCPLogger = createLogger('GetProductTool');

/**
 * Tool name constant
 */
export const TOOL_NAME = 'get_product_details';

/**
 * Tool description - Optimized for minimal token usage
 */
export const TOOL_DESCRIPTION = 
  'Get single product details by ID or slug. Optional: includeVariants, includeReviews, includeRelated. Returns full product info with category, brand, images, tags.';

/**
 * Get product tool parameters schema
 */
export const getProductParameters = GetProductSchema;

/**
 * Execute get product tool
 */
export async function executeGetProduct(args: any): Promise<string> {
  const startTime = Date.now();
  logger.toolStart(TOOL_NAME, args);

  try {
    // Execute get product with error handling
    const result = await safeExecute(
      () => getProduct(args),
      TOOL_NAME,
      { params: args },
    );

    const duration = Date.now() - startTime;
    logger.toolSuccess(TOOL_NAME, duration);

    // Return compact JSON (no formatting) to minimize tokens
    return JSON.stringify({
      success: true,
      data: result.product,
      related: result.relatedProducts,
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
export const getProductTool = {
  name: TOOL_NAME,
  description: TOOL_DESCRIPTION,
  parameters: getProductParameters,
  execute: executeGetProduct,
};

