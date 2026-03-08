/**
 * MCP Server Configuration
 * Centralized configuration management for the MCP server
 */

import { MCPConfig } from '../types/mcp.types';

/**
 * Get MCP server configuration from environment or defaults
 */
export function getMCPConfig(): MCPConfig {
  return {
    server: {
      name: process.env.MCP_SERVER_NAME || 'E-Commerce MCP Server',
      version: process.env.MCP_SERVER_VERSION || '1.0.0',
      description: process.env.MCP_SERVER_DESCRIPTION || 
        'Production-ready MCP server for e-commerce operations',
    },
    transport: {
      type: (process.env.MCP_TRANSPORT_TYPE as 'stdio' | 'sse') || 'stdio',
      port: process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 4000,
    },
    features: {
      caching: process.env.MCP_ENABLE_CACHING !== 'false',
      rateLimit: process.env.MCP_ENABLE_RATE_LIMIT !== 'false',
    },
  };
}

/**
 * Validate configuration on startup
 */
export function validateConfig(config: MCPConfig): void {
  if (!config.server.name) {
    throw new Error('MCP_SERVER_NAME is required');
  }

  if (!config.server.version) {
    throw new Error('MCP_SERVER_VERSION is required');
  }

  if (config.transport.type === 'sse' && !config.transport.port) {
    throw new Error('MCP_PORT is required for SSE transport');
  }

  // Use stderr for logging to avoid STDIO interference
  process.stderr.write('✅ MCP Configuration validated successfully\n');
}

/**
 * Get environment-specific settings
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV || 'development';
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

