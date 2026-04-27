// Funciones de formato de fecha - Zona horaria de Bolivia (America/La_Paz)
const LOCALE = 'es-BO'
const TIMEZONE = 'America/La_Paz' // Bolivia

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(LOCALE, { timeZone: TIMEZONE })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString(LOCALE, {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString(LOCALE, {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formato específico para eventos: fecha y hora del evento
// Extrae la hora directamente del string ISO sin conversión de zona horaria
export const formatEventDateTime = (startDatetime, endDatetime) => {
  if (!startDatetime) return 'Fecha por definir'
  
  // Parsear directo del string: "2026-04-15T09:00:00Z" → extraer 09:00
  const getTimeFromISO = (isoString) => {
    const timeMatch = isoString.match(/T(\d{2}):(\d{2}):(\d{2})/)
    if (!timeMatch) return null
    return `${timeMatch[1]}:${timeMatch[2]}`
  }

  // Parsear fecha: "2026-04-15T..." → 15 abr 2026
  const getDateFromISO = (isoString) => {
    const dateMatch = isoString.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (!dateMatch) return null
    const date = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T00:00:00`)
    const dayNum = dateMatch[3]
    const monthShort = date.toLocaleDateString(LOCALE, { month: 'short' })
    const year = dateMatch[1]
    return `${dayNum} ${monthShort} ${year}`
  }

  const dateStr = getDateFromISO(startDatetime)
  const startTimeStr = getTimeFromISO(startDatetime)
  
  if (!dateStr || !startTimeStr) return 'Fecha por definir'
  
  // Si hay hora fin diferente a hora inicio, mostrar rango
  if (endDatetime && endDatetime !== startDatetime) {
    const endTimeStr = getTimeFromISO(endDatetime)
    if (endTimeStr) {
      return `${dateStr} · ${startTimeStr} - ${endTimeStr}`
    }
  }
  
  return `${dateStr} · ${startTimeStr}`
}

// Funciones de validación
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 8
}

export const validatePhone = (phone) => {
  const regex = /^[0-9\s\-\+\(\)]{7,}$/
  return regex.test(phone)
}

// Funciones de manipulación de strings
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const truncate = (str, length = 100) => {
  return str.length > length ? str.substring(0, length) + '...' : str
}

export const getInitials = (fullName) => {
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

// Funciones de almacenamiento local
export const localStorage_get = (key) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return null
  }
}

export const localStorage_set = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error writing to localStorage:', error)
  }
}

export const localStorage_remove = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

// Funciones de arrays
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) result[group] = []
    result[group].push(item)
    return result
  }, {})
}

export const sortBy = (array, key, order = 'asc') => {
  const sorted = [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1
    return 0
  })
  return sorted
}

// Funciones de números
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(amount)
}

export const formatNumber = (number) => {
  return new Intl.NumberFormat('es-ES').format(number)
}

// Función de espera (útil para testing)
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Bus Global (para comunicación entre componentes)
// ─────────────────────────────────────────────────────────────────────────────
class EventBus {
  constructor() {
    this.listeners = {}
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }
}

export const eventBus = new EventBus()
