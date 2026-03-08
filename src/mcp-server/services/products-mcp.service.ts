/**
 * MCP Service Layer for Products
 * Standalone implementation using Prisma directly
 * Keeps MCP server completely independent from NestJS
 */

import { PrismaClient, Prisma, ProductVisibility } from '@prisma/client';
import { SearchProductsInput, GetProductInput } from '../utils/validators';
import { MCPLogger } from '../utils/logger';
import { PaginatedResponse, ProductResponse } from '../types/mcp.types';

const logger = new MCPLogger('ProductsMCPService');

/**
 * Singleton Prisma client for MCP server
 */
let prisma: PrismaClient | null = null;

/**
 * Initialize Prisma client
 */
export async function initializePrismaClient(): Promise<PrismaClient> {
  if (!prisma) {
    logger.info('Initializing Prisma client...');
    try {
      prisma = new PrismaClient({
        log: [], // No logging to avoid STDIO interference
      });
      await prisma.$connect();
      logger.info('✅ Prisma client connected');
    } catch (error) {
      logger.error('Failed to initialize Prisma client', error);
      throw error;
    }
  }
  return prisma;
}

/**
 * Get Prisma client instance
 */
async function getPrisma(): Promise<PrismaClient> {
  return await initializePrismaClient();
}

/**
 * Build Prisma where clause from search parameters
 */
function buildWhereClause(params: SearchProductsInput): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    isActive: true, // Only active products by default
  };

  // Text search across multiple fields
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { metaKeywords: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  // Category filtering
  if (params.categorySlug) {
    where.category = { slug: params.categorySlug };
  } else if (params.categoryId) {
    where.categoryId = params.categoryId;
  }

  // Subcategory filtering
  if (params.subCategoryId) {
    where.categoryId = params.subCategoryId;
  }

  // Brand filtering
  if (params.brandId) {
    where.brandId = params.brandId;
  }

  // Tag filtering
  if (params.tagIds && params.tagIds.length > 0) {
    where.tags = {
      some: {
        tagId: { in: params.tagIds },
      },
    };
  }

  // Price range
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    where.price = {};
    if (params.minPrice !== undefined) {
      where.price.gte = params.minPrice;
    }
    if (params.maxPrice !== undefined) {
      where.price.lte = params.maxPrice;
    }
  }

  // Stock availability
  if (params.inStock !== undefined) {
    where.stockQuantity = params.inStock ? { gt: 0 } : { lte: 0 };
  }

  // Featured products
  if (params.isFeatured !== undefined) {
    where.isFeatured = params.isFeatured;
  }

  // Visibility
  if (params.visibility) {
    where.visibility = params.visibility;
  }

  return where;
}

/**
 * Build Prisma orderBy clause from sort parameters
 */
function buildOrderByClause(
  sortBy: string,
  sortOrder: 'asc' | 'desc',
): Prisma.ProductOrderByWithRelationInput {
  return { [sortBy]: sortOrder };
}

/**
 * Search products using Prisma directly (standalone, no NestJS dependencies)
 */
export async function searchProducts(
  params: SearchProductsInput,
): Promise<PaginatedResponse<any>> {
  logger.debug('Searching products with params', params);

  const client = await getPrisma();
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  try {
    // Build query
    const where = buildWhereClause(params);
    const orderBy = buildOrderByClause(
      params.sortBy || 'createdAt',
      params.sortOrder || 'desc',
    );

    // Execute query with pagination - Optimized for minimal token usage
    const [products, total] = await Promise.all([
      client.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          shortDescription: true,
          price: true,
          discountPrice: true,
          currency: true,
          sku: true,
          averageRating: true,
          reviewCount: true,
          images: {
            select: {
              imageUrl: true,
            },
            orderBy: {
              position: 'asc',
            },
            take: 1, // Only first image for token optimization
          },
        },
      }),
      client.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.debug('Products search completed', {
      total,
      page,
      limit,
      totalPages,
    });

    return {
      data: products,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  } catch (error) {
    logger.error('Error searching products', error, { params });
    throw error;
  }
}

/**
 * Get single product by ID or slug
 */
export async function getProduct(
  params: GetProductInput,
): Promise<any> {
  const client = await getPrisma();

  try {
    logger.debug('Fetching product', { params });

    // Build where clause - prioritize ID over slug
    const where: Prisma.ProductWhereInput = {
      isActive: true, // Only active products
    };

    if (params.id) {
      where.id = params.id;
    } else if (params.slug) {
      where.slug = params.slug;
    }

    // Build include clause based on options
    const include: Prisma.ProductInclude = {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logo: true,
        },
      },
      images: {
        select: {
          id: true,
          imageUrl: true,
          altText: true,
          position: true,
        },
        orderBy: {
          position: 'asc',
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    };

    // Include variants if requested
    if (params.includeVariants) {
      include.variants = {
        select: {
          id: true,
          variantName: true,
          sku: true,
          price: true,
          additionalPrice: true,
          stockQuantity: true,
          color: true,
          colorHex: true,
          size: true,
          variantImage: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      };
    }

    // Include reviews if requested
    if (params.includeReviews) {
      include.reviews = {
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          isVerifiedPurchase: true,
          helpfulCount: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Limit to recent 10 reviews
      };
    }

    // Fetch the product
    const product = await client.product.findFirst({
      where,
      include,
    });

    if (!product) {
      throw new Error(
        `Product not found with ${params.id ? `id: ${params.id}` : `slug: ${params.slug}`}`,
      );
    }

    logger.debug('Product fetched successfully', {
      productId: product.id,
      title: product.title,
    });

    // If related products are requested, fetch them
    let relatedProducts: any[] | null = null;
    if (params.includeRelated && product.categoryId) {
      relatedProducts = await client.product.findMany({
        where: {
          categoryId: product.categoryId,
          isActive: true,
          id: { not: product.id }, // Exclude current product
        },
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          discountPrice: true,
          isFeatured: true,
          averageRating: true,
          reviewCount: true,
          images: {
            select: {
              imageUrl: true,
              altText: true,
            },
            orderBy: {
              position: 'asc',
            },
            take: 1, // Only first image
          },
        },
        take: 6, // Limit to 6 related products
        orderBy: {
          createdAt: 'desc',
        },
      });

      logger.debug('Related products fetched', {
        count: relatedProducts?.length || 0,
      });
    }

    // Return product with optional related products
    return {
      product,
      relatedProducts,
    };
  } catch (error) {
    logger.error('Error fetching product', error, { params });
    throw error;
  }
}

/**
 * Graceful shutdown of Prisma client
 */
export async function shutdownNestContext(): Promise<void> {
  if (prisma) {
    logger.info('Disconnecting Prisma client...');
    try {
      await prisma.$disconnect();
      prisma = null;
      logger.info('✅ Prisma client disconnected');
    } catch (error) {
      logger.error('Error disconnecting Prisma client', error);
    }
  }
}

/**
 * Health check for the service layer
 */
export async function checkServiceHealth(): Promise<boolean> {
  try {
    const client = await getPrisma();
    // Test database connection
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Service health check failed', error);
    return false;
  }
}

