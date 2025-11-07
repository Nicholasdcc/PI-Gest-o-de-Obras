/**
 * Dashboard Layout
 * 
 * Persistent layout with sidebar navigation for dashboard and related pages
 */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearAuth, isAuthenticated } from '@/utils/auth'
import { motion } from 'motion/react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Logo size states
  const logoSizeSmall = 10
  const logoSizeLarge = 48
  // const smallScale = logoSizeSmall / logoSizeLarge

  // Check authentication on mount and route changes
  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        // Not authenticated, redirect to login with current path
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      } else {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const menuItems = [
    { name: 'Principal', icon: '🏠', link: '/dashboard' },
    { name: 'Projetos', icon: '🏗️', link: '/projects' },
    { name: 'Perfil', icon: '👤', link: '/profile' },
  ]

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  const isActive = (link: string) => {
    if (link === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(link)
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#001489] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Sidebar */}
      <div
        className="bg-[#001489] shadow-2xl flex flex-col transition-all duration-500 ease-in-out fixed left-0 top-0 h-full z-50 overflow-hidden"
        style={{ width: isSidebarExpanded ? '256px' : '80px' }}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-center border-b border-white/20">
          <div className="text-white text-center">
            <motion.img
              src="/Metro_SP_Logo.svg"
              alt="Metrô-SP Logo"
              className="mx-auto block"
              animate={{ 
                height: isSidebarExpanded ? logoSizeLarge : logoSizeSmall 
              }}
              transition={{
                duration: 0.45,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              style={{ 
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <motion.div
              initial={false}
              animate={{ 
                opacity: isSidebarExpanded ? 1 : 0,
                height: isSidebarExpanded ? 'auto' : 0,
                marginTop: isSidebarExpanded ? 8 : 0
              }}
              transition={{ 
                duration: 0.35,
                delay: isSidebarExpanded ? 0.2 : 0,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="text-xs font-light whitespace-nowrap overflow-hidden"
              style={{ opacity: 0.9 }}
            >
              Portal de Inspeção
            </motion.div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6">
          {menuItems.map((item, index) => {
            const active = isActive(item.link)
            return (
              <Link
                key={item.name}
                href={item.link}
                className={`flex items-center px-6 py-4 text-white transition-all duration-300 hover:bg-white/10 ${
                  active ? 'bg-white/20 border-l-4 border-white' : ''
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <motion.span
                  initial={false}
                  animate={{
                    opacity: isSidebarExpanded ? 1 : 0,
                    width: isSidebarExpanded ? 'auto' : 0,
                    marginLeft: isSidebarExpanded ? 16 : 0
                  }}
                  transition={{
                    duration: 0.3,
                    delay: isSidebarExpanded ? 0.1 + (index * 0.05) : 0,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  {item.name}
                </motion.span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-6 py-4 text-white transition-all duration-300 hover:bg-white/10"
          >
            <span className="text-2xl">🚪</span>
            <motion.span
              initial={false}
              animate={{
                opacity: isSidebarExpanded ? 1 : 0,
                width: isSidebarExpanded ? 'auto' : 0,
                marginLeft: isSidebarExpanded ? 16 : 0
              }}
              transition={{
                duration: 0.3,
                delay: isSidebarExpanded ? 0.25 : 0,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className="font-medium whitespace-nowrap overflow-hidden"
            >
              Sair
            </motion.span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 transition-all duration-500"
        style={{ marginLeft: isSidebarExpanded ? '256px' : '80px' }}
      >
        {children}
      </div>
    </div>
  )
}
