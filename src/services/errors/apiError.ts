/**
 * Custom API Error Classes
 * Provides consistent error handling and transformation for API responses
 *
 * Related GitHub Issue: #1 - Core Infrastructure
 */

import type { AxiosError, AxiosResponse } from 'axios'

/**
 * Base API Error class
 * All API errors should extend this class
 */
export abstract class BaseApiError extends Error {
  public readonly status: number
  public readonly statusText: string
  public readonly code: string
  public readonly timestamp: Date
  public readonly requestId?: string
  public readonly data?: any

  constructor(
    message: string,
    status: number,
    statusText: string,
    code: string,
    requestId?: string,
    data?: any
  ) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    this.statusText = statusText
    this.code = code
    this.timestamp = new Date()
    this.requestId = requestId
    this.data = data

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Returns a user-friendly error message
   */
  public getUserMessage(): string {
    return this.message
  }

  /**
   * Returns error details for debugging
   */
  public getDebugInfo(): object {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusText: this.statusText,
      code: this.code,
      timestamp: this.timestamp,
      requestId: this.requestId,
      data: this.data,
      stack: this.stack,
    }
  }
}

/**
 * Validation Error (400 Bad Request)
 * Used when the request contains invalid data
 */
export class ValidationError extends BaseApiError {
  public readonly validationErrors: Record<string, string[]>

  constructor(
    message: string = 'Validation failed',
    validationErrors: Record<string, string[]> = {},
    requestId?: string,
    data?: any
  ) {
    super(message, 400, 'Bad Request', 'VALIDATION_ERROR', requestId, data)
    this.validationErrors = validationErrors
  }

  public getUserMessage(): string {
    const firstField = Object.keys(this.validationErrors)[0]
    const firstError = firstField ? this.validationErrors[firstField]?.[0] : null
    return firstError || 'Please check your input and try again.'
  }

  /**
   * Returns formatted validation errors for forms
   */
  public getFieldErrors(): Record<string, string> {
    const errors: Record<string, string> = {}
    Object.keys(this.validationErrors).forEach(field => {
      const fieldErrors = this.validationErrors[field]
      if (fieldErrors && fieldErrors.length > 0) {
        errors[field] = fieldErrors[0] // Take the first error for each field
      }
    })
    return errors
  }
}

/**
 * Authentication Error (401 Unauthorized)
 * Used when authentication is required or invalid
 */
export class AuthenticationError extends BaseApiError {
  constructor(message: string = 'Authentication required', requestId?: string, data?: any) {
    super(message, 401, 'Unauthorized', 'AUTHENTICATION_ERROR', requestId, data)
  }

  public getUserMessage(): string {
    return 'Please log in to continue.'
  }
}

/**
 * Authorization Error (403 Forbidden)
 * Used when user doesn't have permission to access resource
 */
export class AuthorizationError extends BaseApiError {
  public readonly requiredPermissions?: string[]

  constructor(
    message: string = 'Access denied',
    requiredPermissions?: string[],
    requestId?: string,
    data?: any
  ) {
    super(message, 403, 'Forbidden', 'AUTHORIZATION_ERROR', requestId, data)
    this.requiredPermissions = requiredPermissions
  }

  public getUserMessage(): string {
    return "You don't have permission to perform this action."
  }
}

/**
 * Not Found Error (404 Not Found)
 * Used when requested resource doesn't exist
 */
export class NotFoundError extends BaseApiError {
  public readonly resourceType?: string
  public readonly resourceId?: string

  constructor(
    message: string = 'Resource not found',
    resourceType?: string,
    resourceId?: string,
    requestId?: string,
    data?: any
  ) {
    super(message, 404, 'Not Found', 'NOT_FOUND_ERROR', requestId, data)
    this.resourceType = resourceType
    this.resourceId = resourceId
  }

  public getUserMessage(): string {
    if (this.resourceType) {
      return `${this.resourceType} not found.`
    }
    return 'The requested resource was not found.'
  }
}

/**
 * Conflict Error (409 Conflict)
 * Used when request conflicts with current state
 */
export class ConflictError extends BaseApiError {
  public readonly conflictType?: string

  constructor(
    message: string = 'Conflict with current state',
    conflictType?: string,
    requestId?: string,
    data?: any
  ) {
    super(message, 409, 'Conflict', 'CONFLICT_ERROR', requestId, data)
    this.conflictType = conflictType
  }

  public getUserMessage(): string {
    return 'This action conflicts with the current state. Please refresh and try again.'
  }
}

/**
 * Rate Limit Error (429 Too Many Requests)
 * Used when rate limit is exceeded
 */
export class RateLimitError extends BaseApiError {
  public readonly retryAfter?: number

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    requestId?: string,
    data?: any
  ) {
    super(message, 429, 'Too Many Requests', 'RATE_LIMIT_ERROR', requestId, data)
    this.retryAfter = retryAfter
  }

  public getUserMessage(): string {
    if (this.retryAfter) {
      return `Too many requests. Please wait ${this.retryAfter} seconds before trying again.`
    }
    return 'Too many requests. Please wait a moment before trying again.'
  }
}

/**
 * Server Error (5xx Server Error)
 * Used for internal server errors
 */
export class ServerError extends BaseApiError {
  constructor(
    message: string = 'Internal server error',
    status: number = 500,
    statusText: string = 'Internal Server Error',
    requestId?: string,
    data?: any
  ) {
    super(message, status, statusText, 'SERVER_ERROR', requestId, data)
  }

  public getUserMessage(): string {
    return 'Something went wrong on our end. Please try again later.'
  }
}

/**
 * Network Error
 * Used when network request fails (no response from server)
 */
export class NetworkError extends BaseApiError {
  constructor(message: string = 'Network error', requestId?: string) {
    super(message, 0, 'Network Error', 'NETWORK_ERROR', requestId)
  }

  public getUserMessage(): string {
    return 'Unable to connect to the server. Please check your internet connection.'
  }
}

/**
 * Timeout Error
 * Used when request times out
 */
export class TimeoutError extends BaseApiError {
  constructor(message: string = 'Request timeout', requestId?: string) {
    super(message, 0, 'Timeout', 'TIMEOUT_ERROR', requestId)
  }

  public getUserMessage(): string {
    return 'The request took too long to complete. Please try again.'
  }
}

/**
 * API Error Factory
 * Creates appropriate error instances based on HTTP status codes
 */
export class ApiErrorFactory {
  /**
   * Creates an API error from an Axios error
   */
  public static fromAxiosError(error: AxiosError): BaseApiError {
    const response = error.response
    const requestId = response?.headers?.['x-request-id'] as string

    // Network errors (no response)
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        return new TimeoutError(error.message, requestId)
      }
      return new NetworkError(error.message, requestId)
    }

    // HTTP status code based errors
    return ApiErrorFactory.fromResponse(response, error.message)
  }

  /**
   * Creates an API error from an Axios response
   */
  public static fromResponse(response: AxiosResponse, fallbackMessage?: string): BaseApiError {
    const status = response.status
    const statusText = response.statusText
    const requestId = response.headers?.['x-request-id'] as string
    const data = response.data

    // Extract error message from response data
    const message = data?.message || data?.error || fallbackMessage || statusText

    switch (status) {
      case 400:
        return new ValidationError(
          message,
          data?.validationErrors || data?.errors || {},
          requestId,
          data
        )

      case 401:
        return new AuthenticationError(message, requestId, data)

      case 403:
        return new AuthorizationError(message, data?.requiredPermissions, requestId, data)

      case 404:
        return new NotFoundError(message, data?.resourceType, data?.resourceId, requestId, data)

      case 409:
        return new ConflictError(message, data?.conflictType, requestId, data)

      case 429:
        return new RateLimitError(
          message,
          data?.retryAfter || (response.headers?.['retry-after'] as number),
          requestId,
          data
        )

      default:
        if (status >= 500) {
          return new ServerError(message, status, statusText, requestId, data)
        }

        // For other 4xx errors, create a generic validation error
        if (status >= 400 && status < 500) {
          return new ValidationError(message, {}, requestId, data)
        }

        // Fallback for unexpected status codes
        return new ServerError(
          `Unexpected status code: ${status}`,
          status,
          statusText,
          requestId,
          data
        )
    }
  }

  /**
   * Determines if an error is retryable
   */
  public static isRetryable(error: BaseApiError): boolean {
    // Network errors and server errors are retryable
    return (
      error instanceof NetworkError ||
      error instanceof TimeoutError ||
      (error instanceof ServerError && error.status >= 500)
    )
  }

  /**
   * Determines retry delay for retryable errors
   */
  public static getRetryDelay(error: BaseApiError, attempt: number): number {
    if (error instanceof RateLimitError && error.retryAfter) {
      return error.retryAfter * 1000 // Convert to milliseconds
    }

    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000) // Max 30 seconds
  }
}

/**
 * Type guard to check if error is an API error
 */
export function isApiError(error: any): error is BaseApiError {
  return error instanceof BaseApiError
}

/**
 * Type guard to check if error is a specific API error type
 */
export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError
}

export function isAuthenticationError(error: any): error is AuthenticationError {
  return error instanceof AuthenticationError
}

export function isAuthorizationError(error: any): error is AuthorizationError {
  return error instanceof AuthorizationError
}

export function isNotFoundError(error: any): error is NotFoundError {
  return error instanceof NotFoundError
}

export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError
}

export function isServerError(error: any): error is ServerError {
  return error instanceof ServerError
}

// Copilot: This file may have been generated or refactored by GitHub Copilot.
