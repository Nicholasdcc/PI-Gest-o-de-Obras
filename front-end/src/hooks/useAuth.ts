/**
 * useAuth Hook
 * 
 * Manages authentication state and operations
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login as apiLogin } from '@/lib/api/endpoints'
import { saveToken, saveUser, clearAuth, getToken, getUser } from '@/utils/auth'
import { getErrorMessage } from '@/utils/errors'
import type { User, LoginRequest } from '@/lib/api/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  clearError: () => void
}

export function useAuth(): AuthState & AuthActions {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // Check authentication on mount
  useEffect(() => {
    const token = getToken()
    const user = getUser()
    
    setState({
      user,
      isAuthenticated: !!token,
      isLoading: false,
      error: null,
    })
  }, [])

  /**
   * Login user
   */
  const login = async (credentials: LoginRequest) => {
    setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await apiLogin(credentials)
      
      // Save token and user to localStorage
      saveToken(response.access_token)
      saveUser(response.user)
      
      // Update state
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setState((prev: AuthState) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }))
      throw error // Re-throw so caller can handle it
    }
  }

  /**
   * Logout user
   */
  const logout = () => {
    clearAuth()
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
    router.push('/login')
  }

  /**
   * Clear error message
   */
  const clearError = () => {
    setState((prev: AuthState) => ({ ...prev, error: null }))
  }

  return {
    ...state,
    login,
    logout,
    clearError,
  }
}
