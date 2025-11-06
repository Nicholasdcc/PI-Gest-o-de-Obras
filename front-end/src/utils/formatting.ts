/**
 * Formatting Utility Module
 * 
 * Provides utilities for formatting dates, numbers, and file sizes
 */

/**
 * Format ISO date string to localized date/time
 */
export function formatDateTime(isoString: string | undefined): string {
  if (!isoString) return 'N/A'
  
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date)
  } catch {
    return isoString
  }
}

/**
 * Format ISO date string to localized date only
 */
export function formatDate(isoString: string | undefined): string {
  if (!isoString) return 'N/A'
  
  try {
    const date = new Date(isoString)
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
    }).format(date)
  } catch {
    return isoString
  }
}

/**
 * Format ISO date string to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(isoString: string | undefined): string {
  if (!isoString) return 'N/A'
  
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return 'agora mesmo'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `há ${days} ${days === 1 ? 'dia' : 'dias'}`
    } else {
      return formatDate(isoString)
    }
  } catch {
    return isoString
  }
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number | undefined): string {
  if (!bytes || bytes === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) return '0'
  
  return new Intl.NumberFormat('pt-BR').format(num)
}

/**
 * Format confidence score (0-1) to percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

/**
 * Format project status to Portuguese
 */
export function formatProjectStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'Ativo',
    paused: 'Pausado',
    completed: 'Concluído',
    archived: 'Arquivado',
  }
  
  return statusMap[status] || status
}

/**
 * Format analysis status to Portuguese
 */
export function formatAnalysisStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    completed: 'Concluído',
    error: 'Erro',
  }
  
  return statusMap[status] || status
}

/**
 * Format issue severity to Portuguese
 */
export function formatIssueSeverity(severity: string | undefined): string {
  if (!severity) return 'N/A'
  
  const severityMap: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
  }
  
  return severityMap[severity] || severity
}

/**
 * Get color class for issue severity
 */
export function getSeverityColor(severity: string | undefined): string {
  if (!severity) return 'text-gray-500'
  
  const colorMap: Record<string, string> = {
    low: 'text-blue-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600',
  }
  
  return colorMap[severity] || 'text-gray-500'
}

/**
 * Get color class for analysis status
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'text-gray-600',
    processing: 'text-blue-600',
    completed: 'text-green-600',
    error: 'text-red-600',
  }
  
  return colorMap[status] || 'text-gray-600'
}
