'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogoExpanded, setIsLogoExpanded] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  
  const { login, isLoading, error, clearError } = useAuth();

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Email inválido';
    }
    
    // Password validation (minimum 8 characters)
    if (!password) {
      errors.password = 'Senha é obrigatória';
    } else if (password.length < 8) {
      errors.password = 'Senha deve ter no mínimo 8 caracteres';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    clearError();
    setValidationErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      await login({ email, password });
      // Router.push is called inside useAuth hook after successful login
    } catch (error) {
      // Error is already set in useAuth hook
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div
        className="flex-1 relative bg-cover bg-center hidden md:block"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url('https://mobilidade.estadao.com.br/wp-content/uploads/2023/11/CPTM-e1703719914975.jpg')`,
        }}
      >
        <div className="absolute top-0 left-0 w-full h-24 flex overflow-hidden">
          <div className="h-full w-1/5 bg-[#A8034F] animate-pulse"></div>
          <div className="h-full w-1/5 bg-[#00829B] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-full w-1/5 bg-[#F55F1A] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <div className="h-full w-1/5 bg-[#1C146B] animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          <div className="h-full w-1/5 bg-[#00B052] animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        </div>
        <div className="absolute top-24 left-0 w-full h-32 bg-gradient-to-b from-black/40 to-transparent"></div>

        <div className="absolute bottom-8 right-6 z-10">
          <div className="bg-gradient-to-r from-[#00829B]/90 to-[#1C146B]/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4 mb-3">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/b/ba/CPTM.svg"
                alt="CPTM Logo"
                width={48}
                height={48}
                onMouseEnter={() => setIsLogoExpanded(true)}
                className="object-contain bg-white rounded-lg p-1 cursor-pointer hover:scale-110 transition-transform"
                priority
              />
              <div>
                <h2 className="text-3xl font-bold text-white">CPTM</h2>
                <p className="text-sm text-white/90">Companhia Paulista de Trens Metropolitanos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLogoExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all duration-500 pointer-events-none">
          <div
            className="relative bg-white rounded-3xl p-16 shadow-2xl transform transition-all duration-700 ease-out scale-100 opacity-100 pointer-events-auto"
            onMouseLeave={() => setIsLogoExpanded(false)}
            style={{
              animation: 'slideIn 0.6s ease-out'
            }}
          >
            <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[#00829B] to-[#1C146B] text-white text-xs px-3 py-1 rounded-full shadow-lg">
              Hover to view
            </div>
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/b/ba/CPTM.svg"
              alt="CPTM Logo Expanded"
              width={500}
              height={500}
              className="object-contain transition-transform duration-500"
            />
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">CPTM Official Logo</h3>
              <p className="text-gray-600 text-sm">Companhia Paulista de Trens Metropolitanos</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      <div className="w-full md:w-[480px] bg-[#001489] shadow-2xl flex flex-col">
        <div className="pt-12 pb-8 px-12 border-b border-white/10">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Metrô-SP_logo.svg"
              alt="Metrô-SP Logo"
              width={96}
              height={96}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-center text-white text-xs mt-2 uppercase tracking-widest">Acesse o Portal</p>
        </div>

        <div className="flex-1 flex items-center px-12">
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white mb-8 uppercase tracking-wide">Bem-vindo</h2>
            </div>

            {/* API Error Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors((prev: typeof validationErrors) => ({ ...prev, email: undefined }));
                  }
                }}
                className={`w-full px-4 py-3 border-2 ${
                  validationErrors.email ? 'border-red-500' : 'border-white'
                } bg-white text-[#001489] rounded-xl focus:outline-none focus:ring-2 focus:ring-white transition placeholder-gray-500 font-normal`}
                placeholder="Digite seu email"
                disabled={isLoading}
                required
              />
              {validationErrors.email && (
                <p className="text-red-300 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-white mb-2 uppercase tracking-wide">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors((prev: typeof validationErrors) => ({ ...prev, password: undefined }));
                  }
                }}
                className={`w-full px-4 py-3 border-2 ${
                  validationErrors.password ? 'border-red-500' : 'border-white'
                } bg-white text-[#001489] rounded-xl focus:outline-none focus:ring-2 focus:ring-white transition placeholder-gray-500 font-normal`}
                placeholder="Digite sua senha"
                disabled={isLoading}
                required
              />
              {validationErrors.password && (
                <p className="text-red-300 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            <button
              type="button"
              className="text-xs text-white hover:text-white/80 transition underline"
              disabled={isLoading}
            >
              Esqueceu a senha?
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-white text-[#001489] py-3 rounded-xl font-bold uppercase tracking-wide transition shadow-lg text-sm ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <div className="px-12 py-6 border-t border-white/10">
          <p className="text-xs text-white/60 text-center leading-relaxed">
            © 2024 Companhia do Metropolitano de São Paulo - Metrô
          </p>
        </div>
      </div>
    </div>
  );
}
