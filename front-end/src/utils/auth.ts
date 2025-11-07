/**
 * Authentication Utility Module
 * 
 * Manages authentication tokens in localStorage and cookies
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

/**
 * Set a cookie
 */
function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window !== 'undefined') {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  }
}

/**
 * Get a cookie
 */
function getCookie(name: string): string | null {
  if (typeof window !== 'undefined') {
    const nameEQ = name + '='
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
  }
  return null
}

/**
 * Delete a cookie
 */
function deleteCookie(name: string): void {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  }
}

/**
 * Save authentication token to localStorage and cookies
 */
export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
    setCookie(TOKEN_KEY, token, 7) // Cookie expires in 7 days
  }
}

/**
 * Get authentication token from localStorage or cookies
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    // Try localStorage first
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) return token
    
    // Fallback to cookies
    return getCookie(TOKEN_KEY)
  }
  return null
}

/**
 * Remove authentication token from localStorage and cookies
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
    deleteCookie(TOKEN_KEY)
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
