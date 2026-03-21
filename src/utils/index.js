// Funciones de formato de fecha
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES')
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('es-ES')
}

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
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
