/**
 * E-Commerce MCP Server
 * Production-ready FastMCP server with proper architecture
 *
 * Features:
 * - Clean separation of concerns
 * - Comprehensive error handling
 * - Structured logging
 * - Type safety with Zod
 * - Integration with NestJS services
 * - Graceful shutdown
 */

// Load environment variables first
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env file from the root of e-commerce-api directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { FastMCP } from 'fastmcp';
import {
  getMCPConfig,
  validateConfig,
  isDevelopment,
} from './config/mcp.config';
import { createLogger } from './utils/logger';
import {
  initializePrismaClient,
  shutdownNestContext,
  checkServiceHealth,
} from './services/products-mcp.service';
import { searchProductsTool, getProductTool } from './tools';

// Initialize logger
const logger = createLogger('MCPServer');

/**
 * Main server instance
 */
let server: FastMCP | null = null;

/**
 * Initialize and start the MCP server
 */
async function startServer(): Promise<void> {
  try {
    logger.info('Starting E-Commerce MCP Server...');

    // Load and validate configuration
    const config = getMCPConfig();
    validateConfig(config);

    logger.info('Configuration loaded', {
      serverName: config.server.name,
      version: config.server.version,
      transport: config.transport.type,
      environment: isDevelopment() ? 'development' : 'production',
    });

    // Initialize Prisma client (standalone, no NestJS)
    logger.info('Initializing database connection...');
    await initializePrismaClient();

    // Check database connection health
    const isHealthy = await checkServiceHealth();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }
    logger.info('✅ Database connection healthy');

    // Create FastMCP server
    server = new FastMCP({
      name: config.server.name,
      version: config.server.version as `${number}.${number}.${number}`,
    });

    logger.info('Registering tools...');

    // Register tools
    server.addTool(searchProductsTool);
    // server.addTool(getProductTool);

    logger.info(`✅ ${2} tools registered successfully`);

    // Add server information resource
    server.addResource({
      uri: 'mcp://server/info',
      name: 'Server Information',
      mimeType: 'application/json',
      description: 'Get server information and available tools',
      load: async () => {
        return {
          text: JSON.stringify(
            {
              server: {
                name: config.server.name,
                version: config.server.version,
                description: config.server.description,
                uptime: process.uptime(),
              },
              tools: {
                total: 1,
                available: ['search_products'],
              },
              features: config.features,
              environment: isDevelopment() ? 'development' : 'production',
              status: 'healthy',
            },
            null,
            2,
          ),
        };
      },
    });

    server.addPrompt({
      name: "git-commit",
      description: "Generate a Git commit message",
      arguments: [
        {
          name: "changes",
          description: "Git diff or description of changes",
          required: true,
        },
      ],
      load: async (args) => {
        return `Generate a concise but descriptive commit message for these changes:\n\n${args.changes}`;
      },
    });

    logger.info('✅ Resources registered successfully');

    // Start server with configured transport
    if (config.transport.type === 'stdio') {
      server.start({
          transportType: "httpStream",
          httpStream: {
          port: 3000
        },
      });
    } else {
      // Note: FastMCP uses 'httpStream' not 'sse'
      // Using stdio as fallback since httpStream setup differs
      logger.warn('SSE transport requested but using stdio (FastMCP limitation)');
      server.start({
          transportType: "httpStream",
          httpStream: {
          port: 3000,
        },
      });
    }

    logger.info('=' .repeat(60));
    logger.info('🚀 E-Commerce MCP Server started successfully!');
    logger.info('=' .repeat(60));
    logger.info(`Server Name: ${config.server.name}`);
    logger.info(`Version: ${config.server.version}`);
    logger.info(`Transport: ${config.transport.type}`);
    if (config.transport.type === 'sse') {
      logger.info(`Port: ${config.transport.port}`);
    }
    logger.info(`Environment: ${isDevelopment() ? 'development' : 'production'}`);
    logger.info('=' .repeat(60));
    logger.info('Available Tools:');
    logger.info('  - search_products: Comprehensive product search');
    logger.info('=' .repeat(60));
    logger.info('Available Resources:');
    logger.info('  - mcp://server/info: Server information');
    logger.info('=' .repeat(60));

    if (isDevelopment()) {
      logger.info('💡 Development Tips:');
      logger.info('  - Test with: npx fastmcp dev src/mcp-server/server.ts');
      logger.info('  - Inspect with: npx fastmcp inspect src/mcp-server/server.ts');
      logger.info('=' .repeat(60));
    }

    logger.info('✅ Server ready to accept connections');
  } catch (error) {
    logger.error('Failed to start MCP server', error as Error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Shutdown Prisma client
    await shutdownNestContext();

    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error as Error);
    process.exit(1);
  }
}

/**
 * Register shutdown handlers
 */
function registerShutdownHandlers(): void {
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGHUP', () => shutdown('SIGHUP'));

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection', reason, { promise });
    shutdown('UNHANDLED_REJECTION');
  });
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  // Register shutdown handlers
  registerShutdownHandlers();

  // Start server
  await startServer();

  // Keep process alive
  await new Promise(() => {});
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('Fatal error in main', error);
    process.exit(1);
  });
}

export { startServer, shutdown };
