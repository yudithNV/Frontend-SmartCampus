// Configuración base de API
const API_BASE_URL = 'http://localhost:8081/api'

// Función genérica para hacer peticiones
async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        // Aquí irían tokens de autenticación cuando sea necesario
        // 'Authorization': `Bearer ${token}`
      },
      mode: 'cors'
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.message || errorData?.error || `Error ${response.status}`
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('API Request failed:', error)
    throw error
  }
}

// Servicios de Usuario
export const userService = {
  login: (email, password) =>
    apiRequest('/auth/login', 'POST', { email, password }),

  logout: () =>
    apiRequest('/auth/logout', 'POST'),

  getProfile: () =>
    apiRequest('/users/profile', 'GET'),

  updateProfile: (data) =>
    apiRequest('/users/profile', 'PUT', data)
}

// Servicios de Usuarios (Admin)
export const adminUserService = {
  getAll: () =>
    apiRequest('/users', 'GET'),

  create: (data) =>
    apiRequest('/users', 'POST', data),

  update: (id, data) =>
    apiRequest(`/users/${id}`, 'PUT', data),

  delete: (id) =>
    apiRequest(`/users/${id}`, 'DELETE')
}

// Servicios de Noticias
export const newsService = {
  getAll: () =>
    apiRequest('/news', 'GET'),

  getById: (id) =>
    apiRequest(`/news/${id}`, 'GET'),

  create: (data) =>
    apiRequest('/news', 'POST', data),

  update: (id, data) =>
    apiRequest(`/news/${id}`, 'PUT', data),

  delete: (id) =>
    apiRequest(`/news/${id}`, 'DELETE')
}

// Servicios de Reservas
export const reservationService = {
  getAll: () =>
    apiRequest('/reservations', 'GET'),

  create: (data) =>
    apiRequest('/reservations', 'POST', data),

  cancel: (id) =>
    apiRequest(`/reservations/${id}/cancel`, 'POST')
}

// Servicios de Carreras
export const careerService = {
  getAll: () =>
    apiRequest('/careers', 'GET')
}
