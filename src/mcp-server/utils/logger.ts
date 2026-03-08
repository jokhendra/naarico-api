/**
 * Logging utilities for MCP Server
 * Provides structured logging with different severity levels
 */

import { isDevelopment } from '../config/mcp.config';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class MCPLogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] [${this.context}] ${message}${metaStr}`;
  }

  /**
   * Log debug message (only in development)
   * Uses stderr to avoid interfering with STDIO transport
   */
  debug(message: string, meta?: any): void {
    if (isDevelopment()) {
      process.stderr.write(this.formatMessage(LogLevel.DEBUG, message, meta) + '\n');
    }
  }

  /**
   * Log info message
   * Uses stderr to avoid interfering with STDIO transport
   */
  info(message: string, meta?: any): void {
    process.stderr.write(this.formatMessage(LogLevel.INFO, message, meta) + '\n');
  }

  /**
   * Log warning message
   * Uses stderr to avoid interfering with STDIO transport
   */
  warn(message: string, meta?: any): void {
    process.stderr.write(this.formatMessage(LogLevel.WARN, message, meta) + '\n');
  }

  /**
   * Log error message
   * Uses stderr to avoid interfering with STDIO transport
   */
  error(message: string, error?: Error | any, meta?: any): void {
    const errorMeta = error
      ? {
          ...meta,
          error: {
            message: error.message,
            stack: isDevelopment() ? error.stack : undefined,
            ...error,
          },
        }
      : meta;

    process.stderr.write(this.formatMessage(LogLevel.ERROR, message, errorMeta) + '\n');
  }

  /**
   * Log tool execution start
   */
  toolStart(toolName: string, params: any): void {
    this.info(`Tool execution started: ${toolName}`, { params });
  }

  /**
   * Log tool execution success
   */
  toolSuccess(toolName: string, duration: number): void {
    this.info(`Tool execution completed: ${toolName}`, { duration: `${duration}ms` });
  }

  /**
   * Log tool execution error
   */
  toolError(toolName: string, error: Error, duration: number): void {
    this.error(`Tool execution failed: ${toolName}`, error, { duration: `${duration}ms` });
  }
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: string): MCPLogger {
  return new MCPLogger(context);
}

