/**
 * Error Handling Utility Module
 * 
 * Provides user-friendly error messages and error handling utilities
 */

import { ERROR_CODES, type ApiError } from '@/lib/api/types'

/**
 * Convert API error to user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  // Handle API error objects
  if (error && typeof error === 'object' && 'message' in error) {
    const apiError = error as ApiError
    
    // Map specific error codes to user-friendly messages
    switch (apiError.code) {
      case ERROR_CODES.INVALID_CREDENTIALS:
        return 'Email ou senha inválidos. Por favor, tente novamente.'
      
      case ERROR_CODES.UNAUTHORIZED:
        return 'Sua sessão expirou. Por favor, faça login novamente.'
      
      case ERROR_CODES.NOT_FOUND:
        return 'Recurso não encontrado.'
      
      case ERROR_CODES.ALREADY_EXISTS:
        return 'Este item já existe.'
      
      case ERROR_CODES.ALREADY_PROCESSING:
        return 'Esta evidência já está sendo processada.'
      
      case ERROR_CODES.FILE_TOO_LARGE:
        return 'O arquivo é muito grande. Tamanho máximo: 10MB.'
      
      case ERROR_CODES.UNSUPPORTED_FORMAT:
        return 'Formato de arquivo não suportado. Use JPEG, PNG ou WEBP.'
      
      case ERROR_CODES.VALIDATION_ERROR:
        return apiError.message || 'Erro de validação. Verifique os dados informados.'
      
      case ERROR_CODES.RATE_LIMIT_EXCEEDED:
        return 'Muitas requisições. Por favor, aguarde um momento.'
      
      case ERROR_CODES.INTERNAL_ERROR:
      default:
        return apiError.message || 'Ocorreu um erro. Por favor, tente novamente.'
    }
  }
  
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.'
  }
  
  // Handle generic errors
  if (error instanceof Error) {
    return error.message
  }
  
  // Fallback for unknown errors
  return 'Ocorreu um erro inesperado. Por favor, tente novamente.'
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes('fetch')
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const apiError = error as ApiError
    return apiError.code === ERROR_CODES.UNAUTHORIZED
  }
  return false
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const apiError = error as ApiError
    return apiError.code === ERROR_CODES.VALIDATION_ERROR
  }
  return false
}

/**
 * Format validation error details for display
 */
export function formatValidationErrors(error: ApiError): string[] {
  if (error.details && typeof error.details === 'object') {
    return Object.entries(error.details).map(([field, message]) => {
      return `${field}: ${message}`
    })
  }
  return [error.message]
}
