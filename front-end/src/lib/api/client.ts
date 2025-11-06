/**
 * HTTP Client Module
 * 
 * Centralized HTTP client with automatic auth header injection and error handling
 */

import { getToken } from '@/utils/auth'
import { API_CONFIG } from './config'
import type { ErrorResponse } from './types'

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Make an authenticated HTTP request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // Merge additional headers
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value
      }
    })
  }
  
  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const url = `${API_CONFIG.baseURL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    // Handle non-2xx responses
    if (!response.ok) {
      let errorData: ErrorResponse
      
      try {
        errorData = await response.json()
      } catch {
        // If response body is not JSON, create a generic error
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR'
        )
      }
      
      throw new ApiError(
        errorData.error.message,
        errorData.error.code,
        errorData.error.details
      )
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }
    
    // Parse JSON response
    const data = await response.json()
    return data as T
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error
    }
    
    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError(
        'Erro de conexão. Verifique sua internet.',
        'NETWORK_ERROR'
      )
    }
    
    // Handle other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Erro desconhecido',
      'UNKNOWN_ERROR'
    )
  }
}

/**
 * Make a GET request
 */
export async function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' })
}

/**
 * Make a POST request
 */
export async function post<T>(
  endpoint: string,
  data?: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * Make a PUT request
 */
export async function put<T>(
  endpoint: string,
  data?: any
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * Make a DELETE request
 */
export async function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}

/**
 * Upload a file with multipart/form-data
 */
export async function uploadFile<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const token = getToken()
  
  const headers: Record<string, string> = {}
  
  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // Don't set Content-Type - browser will set it with boundary
  
  const url = `${API_CONFIG.baseURL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })
    
    if (!response.ok) {
      let errorData: ErrorResponse
      
      try {
        errorData = await response.json()
      } catch {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          'HTTP_ERROR'
        )
      }
      
      throw new ApiError(
        errorData.error.message,
        errorData.error.code,
        errorData.error.details
      )
    }
    
    const data = await response.json()
    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    if (error instanceof TypeError) {
      throw new ApiError(
        'Erro de conexão. Verifique sua internet.',
        'NETWORK_ERROR'
      )
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Erro desconhecido',
      'UNKNOWN_ERROR'
    )
  }
}
