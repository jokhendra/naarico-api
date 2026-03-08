# E-Commerce MCP Server

Production-ready FastMCP server with proper architecture, error handling, and integration with NestJS services.

## 🏗️ Architecture

```
src/mcp-server/
├── server.ts                 # Main server entry point
├── config/
│   └── mcp.config.ts        # Configuration management
├── tools/
│   ├── index.ts             # Tool exports
│   └── search-products.tool.ts  # Search products implementation
├── services/
│   └── products-mcp.service.ts  # MCP service layer (wraps NestJS)
├── types/
│   └── mcp.types.ts         # TypeScript type definitions
├── utils/
│   ├── error-handler.ts     # Error handling utilities
│   ├── logger.ts            # Structured logging
│   └── validators.ts        # Zod validation schemas
└── __tests__/
    └── (test files)
```

## ✨ Features

- ✅ **Clean Architecture** - Proper separation of concerns
- ✅ **Type Safety** - Full TypeScript with Zod validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Logging** - Structured logging with context
- ✅ **Service Integration** - Clean integration with NestJS ProductsService
- ✅ **Configuration** - Environment-based configuration
- ✅ **Graceful Shutdown** - Proper cleanup on exit
- ✅ **Production Ready** - Suitable for production deployment

## 🚀 Quick Start

### Run the Server

```bash
# Development mode with hot reload
npx fastmcp dev src/mcp-server/server.ts

# Inspector mode (Web UI)
npx fastmcp inspect src/mcp-server/server.ts

# Direct execution
npx ts-node src/mcp-server/server.ts
```

### Environment Variables

Create a `.env` file or set these variables:

```bash
# Server Configuration
MCP_SERVER_NAME="E-Commerce MCP Server"
MCP_SERVER_VERSION="1.0.0"
MCP_SERVER_DESCRIPTION="Production-ready MCP server"

# Transport Configuration
MCP_TRANSPORT_TYPE="stdio"  # or "sse"
MCP_PORT=4000               # Required if using SSE

# Features
MCP_ENABLE_CACHING=true
MCP_ENABLE_RATE_LIMIT=true

# Environment
NODE_ENV="development"  # or "production"
```

## 🔧 Available Tools

### 1. search_products

Comprehensive product search with full filtering support.

**Parameters:**

```typescript
{
  // Search (REQUIRED)
  search: string;             // Text search (REQUIRED, min 1 character)

  // Pagination
  page?: number;              // Page number (default: 1)
  limit?: number;             // Items per page (max: 100, default: 10)

  // Category Filters
  categoryId?: string;        // Category UUID
  categorySlug?: string;      // Category slug
  recursive?: boolean;        // Include subcategories (default: false)
  subCategoryId?: string;     // Subcategory UUID

  // Brand Filter
  brandId?: string;           // Brand UUID

  // Tag Filters
  tagIds?: string[];          // Array of tag UUIDs

  // Price Range
  minPrice?: number;          // Minimum price
  maxPrice?: number;          // Maximum price

  // Stock & Features
  inStock?: boolean;          // Only in-stock products
  isFeatured?: boolean;       // Only featured products

  // Visibility
  visibility?: 'PUBLIC' | 'HIDDEN' | 'DRAFT';

  // Sorting
  sortBy?: string;            // Sort field (default: 'createdAt')
  sortOrder?: 'asc' | 'desc'; // Sort direction (default: 'desc')
}
```

**Examples:**

```json
// Simple search (minimum required)
{
  "search": "laptop"
}

// Search with category and price range
{
  "search": "phone",
  "categorySlug": "electronics",
  "minPrice": 100,
  "maxPrice": 2000,
  "inStock": true,
  "limit": 20
}

// Full filter with all options
{
  "search": "smartphone",
  "brandId": "123e4567-e89b-12d3-a456-426614174000",
  "minPrice": 300,
  "maxPrice": 1000,
  "inStock": true,
  "sortBy": "price",
  "sortOrder": "asc",
  "limit": 20
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Product Title",
      "slug": "product-slug",
      "description": "Product description",
      "price": 999.99,
      "compareAtPrice": 1299.99,
      "sku": "SKU123",
      "quantity": 50,
      "isActive": true,
      "isFeatured": true,
      ...
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "meta": {
    "executionTime": "45ms",
    "timestamp": "2025-01-11T..."
  }
}
```

## 📦 Available Resources

### 1. mcp://server/info

Get server information and available tools.

**Access:** Read this resource URI to get server details

**Response:**
```json
{
  "server": {
    "name": "E-Commerce MCP Server",
    "version": "1.0.0",
    "description": "...",
    "uptime": 3600
  },
  "tools": {
    "total": 1,
    "available": ["search_products"]
  },
  "features": {
    "caching": true,
    "rateLimit": true
  },
  "environment": "development",
  "status": "healthy"
}
```

## 🧪 Testing

### Manual Testing

```bash
# Start inspector
npx fastmcp inspect src/mcp-server/server.ts

# In the web UI, test the search_products tool with:
{
  "search": "test",
  "limit": 5
}
```

### Unit Testing

```bash
# Run tests
npm test src/mcp-server

# Watch mode
npm test src/mcp-server -- --watch

# Coverage
npm test src/mcp-server -- --coverage
```

## 🔍 Debugging

### Enable Debug Logging

```bash
NODE_ENV=development npx ts-node src/mcp-server/server.ts
```

Debug logs will show (on stderr):
- Tool execution start/end
- Parameter validation
- Service calls
- Error details

**⚠️ IMPORTANT:** All logging uses `stderr` instead of `stdout` to avoid interfering with STDIO transport. The MCP protocol uses stdout for communication, so console.log would break the connection.

### Common Issues

**Issue:** "Failed to initialize NestJS context"
- **Solution:** Ensure database is running and accessible
- Check `DATABASE_URL` in `.env`

**Issue:** "Service health check failed"
- **Solution:** Check all dependencies are installed
- Run `npm install`

**Issue:** "Validation Error"
- **Solution:** Check parameter types match schema
- Review Zod error messages in logs

## 📈 Performance

### Optimization Tips

1. **Caching:** Results are cached by default
2. **Pagination:** Use appropriate `limit` values
3. **Filters:** More specific filters = faster queries
4. **Database:** Ensure proper indexes on frequently queried fields

### Monitoring

Logs include execution time for all tool calls:

```
[INFO] Tool execution completed: search_products { duration: '45ms' }
```

## 🔐 Security

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for sensitive config
- [ ] Enable rate limiting (`MCP_ENABLE_RATE_LIMIT=true`)
- [ ] Implement authentication if needed
- [ ] Monitor logs for unusual activity
- [ ] Keep dependencies updated

## 🚀 Deployment

### Using PM2

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/src/mcp-server/server.js --name mcp-server

# Monitor
pm2 logs mcp-server
pm2 monit
```

### Using Docker

```dockerfile
# Add to your Dockerfile
EXPOSE 4000
CMD ["node", "dist/src/mcp-server/server.js"]
```

## 🔄 Adding New Tools

1. **Create tool file** in `tools/` directory:

```typescript
// tools/get-product.tool.ts
import { z } from 'zod';
import { createLogger } from '../utils/logger';

const logger = createLogger('GetProductTool');

export const getProductTool = {
  name: 'get_product',
  description: 'Get product by ID',
  parameters: z.object({
    productId: z.string().uuid(),
  }),
  execute: async (args) => {
    // Implementation
    return JSON.stringify(result);
  },
};
```

2. **Export from** `tools/index.ts`:

```typescript
export { getProductTool } from './get-product.tool';
```

3. **Register in** `server.ts`:

```typescript
import { searchProductsTool, getProductTool } from './tools';

server.addTool(searchProductsTool);
server.addTool(getProductTool);
```

## 📚 Resources

- **FastMCP:** https://github.com/punkpeye/fastmcp
- **MCP Spec:** https://modelcontextprotocol.io/specification
- **Zod:** https://zod.dev

## 🆘 Support

For issues:
1. Check logs for error details
2. Verify configuration
3. Test with `npx fastmcp dev`
4. Review this documentation

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2025-01-11

