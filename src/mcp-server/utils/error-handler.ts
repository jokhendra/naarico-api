/**
 * Error handling utilities for MCP Server
 * Transforms various error types into user-friendly MCP errors
 */

import { UserError } from 'fastmcp';
import { MCPLogger } from './logger';

const logger = new MCPLogger('ErrorHandler');

/**
 * Error codes for different error types
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_ERROR = 'SERVICE_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

/**
 * Check if error is a NestJS HTTP exception
 */
function isNestJSError(error: any): boolean {
  return (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    'message' in error
  );
}

/**
 * Get error code from NestJS error status
 */
function getErrorCodeFromStatus(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 401:
    case 403:
      return ErrorCode.UNAUTHORIZED;
    default:
      return ErrorCode.INTERNAL_ERROR;
  }
}

/**
 * Transform any error into a user-friendly UserError
 */
export function handleToolError(
  error: any,
  toolName: string,
  context?: any,
): UserError {
  // Log the error for debugging
  logger.error(`Error in tool ${toolName}`, error, context);

  // If it's already a UserError, return it
  if (error instanceof UserError) {
    return error;
  }

  // Handle NestJS HTTP exceptions
  if (isNestJSError(error)) {
    const code = getErrorCodeFromStatus(error.status);
    const message = Array.isArray(error.message)
      ? error.message.join(', ')
      : error.message;

    return new UserError(`${code}: ${message}`);
  }

  // Handle validation errors
  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    const message = error.errors
      ? error.errors.map((e: any) => e.message).join(', ')
      : error.message;
    return new UserError(`${ErrorCode.VALIDATION_ERROR}: ${message}`);
  }

  // Handle database errors
  if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2025') {
      return new UserError(`${ErrorCode.NOT_FOUND}: Record not found`);
    }
    if (error.code === 'P2002') {
      return new UserError(
        `${ErrorCode.BAD_REQUEST}: A record with this data already exists`,
      );
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return new UserError(`${ErrorCode.INTERNAL_ERROR}: ${error.message}`);
  }

  // Fallback for unknown errors
  return new UserError(
    `${ErrorCode.INTERNAL_ERROR}: An unexpected error occurred`,
  );
}

/**
 * Safely execute a function and handle errors
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  toolName: string,
  context?: any,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw handleToolError(error, toolName, context);
  }
}

/**
 * Validate required parameters
 */
export function validateRequired(
  params: Record<string, any>,
  required: string[],
  toolName: string,
): void {
  const missing = required.filter((key) => !params[key]);

  if (missing.length > 0) {
    throw new UserError(
      `${ErrorCode.VALIDATION_ERROR}: Missing required parameters in ${toolName}: ${missing.join(', ')}`,
    );
  }
}

