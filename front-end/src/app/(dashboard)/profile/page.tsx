/**
 * Profile Page
 * 
 * User profile page with information
 */

'use client'

import React from 'react'
import Link from 'next/link'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import WorkIcon from '@mui/icons-material/Work'
import EmailIcon from '@mui/icons-material/Email'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

export default function ProfilePage() {
  const user = {
    name: 'Administrador',
    email: 'admin@example.com',
    role: 'Engenheiro de Processos',
    joinDate: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-[#001489] hover:underline mb-4 inline-flex items-center gap-2 font-semibold"
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} /> Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#001489] mb-2 mt-4">
            Perfil do Usuário
          </h1>
          <p className="text-gray-600">
            Informações da sua conta
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          {/* Avatar Section */}
          <div className="flex items-center mb-8 pb-8 border-b border-gray-200">
            <div className="w-24 h-24 bg-[#001489] rounded-full flex items-center justify-center mr-6">
              <PersonIcon sx={{ fontSize: 60, color: 'white' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600 text-lg">{user.role}</p>
            </div>
          </div>

          {/* Information Grid */}
          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <EmailIcon sx={{ fontSize: 24, color: '#001489' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">
                  E-mail
                </h3>
                <p className="text-lg text-gray-800">{user.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <WorkIcon sx={{ fontSize: 24, color: '#001489' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">
                  Cargo
                </h3>
                <p className="text-lg text-gray-800">{user.role}</p>
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-start">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <CalendarTodayIcon sx={{ fontSize: 24, color: '#001489' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">
                  Membro desde
                </h3>
                <p className="text-lg text-gray-800">{user.joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
