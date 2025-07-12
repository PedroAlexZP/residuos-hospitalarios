/**
 * Utilidades para formateo de datos
 */

// Formateo de fechas
export const formatDate = (date: string | Date, locale: string = 'es-ES'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (date: string | Date, locale: string = 'es-ES'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatRelativeTime = (date: string | Date, locale: string = 'es-ES'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'hace unos segundos'
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`
  
  return formatDate(dateObj, locale)
}

// Formateo de números
export const formatNumber = (num: number, locale: string = 'es-ES'): string => {
  return num.toLocaleString(locale)
}

export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'es-ES'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatWeight = (weight: number, unit: string = 'kg'): string => {
  if (weight < 1 && unit === 'kg') {
    return `${(weight * 1000).toFixed(0)} g`
  }
  return `${weight.toFixed(2)} ${unit}`
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

// Formateo de texto
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Formateo de identificadores
export const formatId = (id: string, prefix?: string): string => {
  const shortId = id.slice(-8).toUpperCase()
  return prefix ? `${prefix}-${shortId}` : shortId
}

export const formatCertificateNumber = (number: string): string => {
  return number.toUpperCase().replace(/(.{4})/g, '$1-').slice(0, -1)
}
