/**
 * Authentication Utility Module
 * 
 * Manages authentication tokens in localStorage
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

/**
 * Save authentication token to localStorage
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

/**
 * Get authentication token from localStorage
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return null
}

/**
 * Remove authentication token from localStorage
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

/**
 * Save user information to localStorage
 */
export function saveUser(user: { id: string; name: string; email: string; role?: string }): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

/**
 * Get user information from localStorage
 */
export function getUser(): { id: string; name: string; email: string; role?: string } | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem(USER_KEY)
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

/**
 * Remove user information from localStorage
 */
export function removeUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY)
  }
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return getToken() !== null
}

/**
 * Clear all authentication data (logout)
 */
export function clearAuth(): void {
  removeToken()
  removeUser()
}
