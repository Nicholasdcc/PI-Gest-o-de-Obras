/**
 * Dashboard Layout
 * 
 * Persistent layout with sidebar navigation for dashboard and related pages
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { clearAuth } from '@/utils/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

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
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Metrô-SP_logo.svg"
              alt="Metrô-SP Logo"
              width={isSidebarExpanded ? 48 : 40}
              height={isSidebarExpanded ? 48 : 40}
              className="object-contain transition-all duration-500 mx-auto"
              priority
            />
            {isSidebarExpanded && (
              <div className="text-xs font-light opacity-90 whitespace-nowrap mt-2">
                Portal de Inspeção
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6">
          {menuItems.map((item) => {
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
                {isSidebarExpanded && (
                  <span className="ml-4 font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                )}
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
            {isSidebarExpanded && (
              <span className="ml-4 font-medium whitespace-nowrap">Sair</span>
            )}
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
