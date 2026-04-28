// Configuración base de API
const API_BASE_URL = 'http://localhost:8081/api'

// ─────────────────────────────────────────────────────────────────────────────
// apiRequest (forma nueva correcta)
// ─────────────────────────────────────────────────────────────────────────────
async function apiRequest(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('ucb_token')
    const isFormData = options.body instanceof FormData

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      mode: 'cors',
      method: 'GET',
      ...options,
      headers
    })

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

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Autenticación
// ─────────────────────────────────────────────────────────────────────────────
export const userService = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  logout: () =>
    apiRequest('/auth/logout', { method: 'POST' }),

  getMe: () =>
    apiRequest('/auth/me'),

  getProfile: () =>
    apiRequest('/profile'),

  updateProfile: (data) =>
    apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Preferencias
  getPreferences: () =>
    apiRequest('/profile/preferences'),

  savePreferences: (dto) =>
    apiRequest('/profile/preferences', {
      method: 'PUT',
      body: JSON.stringify(dto)
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Usuarios (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const adminUserService = {
  getAll: (page = 0, size = 10, search = '', role = '', status = '', career = '', sortBy = 'createdAt', sortType = 'DESC') => {
    const params = new URLSearchParams({ page, size, sortBy, sortType })
    if (search) params.append('search', search)
    if (role)   params.append('role', role)
    if (status) params.append('status', status)
    if (career) params.append('career', career)
    return apiRequest(`/users?${params}`)
  },

  create: (data) =>
    apiRequest('/users', { method: 'POST', body: JSON.stringify(data) }),

  update: (id, data) =>
    apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id) =>
    apiRequest(`/users/${id}`, { method: 'DELETE' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Noticias
// ─────────────────────────────────────────────────────────────────────────────
export const newsService = {
  getAll: () => apiRequest('/news'),
  getById: (id) => apiRequest(`/news/${id}`),
  create: (data) => apiRequest('/news', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/news/${id}`, { method: 'DELETE' }),
  getMy: () => apiRequest('/news/my'),
  getRecent: (queryString) => apiRequest(`/news/recent?${queryString}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizador de eventos
// ─────────────────────────────────────────────────────────────────────────────
function normalizeEvent(event) {
  let cleanDescription = event.description
  if (typeof cleanDescription === 'string' && cleanDescription.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(cleanDescription)
      cleanDescription = parsed.description || ''
    } catch {
      cleanDescription = ''
    }
  }
  return {
    id: event.id,
    name: event.name,
    date: event.startDatetime,
    description: cleanDescription || 'Sin descripción',
    location: event.location
      ? `${event.location.name} - ${event.location.block}`
      : 'Por confirmar',
    eventType: event.eventType,
    posterUrl: event.posterUrl
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Eventos
// ─────────────────────────────────────────────────────────────────────────────
export const eventService = {
  getAll: () => apiRequest('/events'),

  getUpcoming: async () => {
    const response = await apiRequest('/events/upcoming')
    const list = response?.data ?? response
    return Array.isArray(list) ? list.map(normalizeEvent) : []
  },

  getMy: () => apiRequest('/events/my'),
  
  getRegistered: (startDate, endDate) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const queryString = params.toString()
    return apiRequest(`/events/registered${queryString ? '?' + queryString : ''}`)
  },

  getByCareer: (careerId) => apiRequest(`/events/career/${careerId}`),

  getCalendarEvents: async (year, month, day = null, careerId = null, categoryId = null) => {
    const params = new URLSearchParams({ year, month })
    if (day) params.append('day', day)
    if (careerId) params.append('careerId', careerId)
    if (categoryId) params.append('categoryId', categoryId)
    
    const response = await apiRequest(`/events/calendar?${params}`)
    return response?.data ?? response
  },

  getById: (id) => apiRequest(`/events/${id}`),
  create: (data) => apiRequest('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/events/${id}`, { method: 'DELETE' }),
  register: (eventId) => apiRequest(`/events/${eventId}/register`, { method: 'POST' }),
  unregister: (eventId) => apiRequest(`/events/${eventId}/register`, { method: 'DELETE' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Calendario Académico
// ─────────────────────────────────────────────────────────────────────────────
export const academicCalendarService = {
  getMy: () => apiRequest('/academic-calendar'),
  create: (data) => apiRequest('/academic-calendar', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/academic-calendar/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/academic-calendar/${id}`, { method: 'DELETE' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Reservas
// ─────────────────────────────────────────────────────────────────────────────
export const reservationService = {
  getAll: () => apiRequest('/reservations'),
  create: (data) => apiRequest('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  cancel: (id) => apiRequest(`/reservations/${id}/cancel`, { method: 'POST' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios básicos
// ─────────────────────────────────────────────────────────────────────────────
export const careerService   = { getAll: () => apiRequest('/careers') }
export const categoryService = { getAll: () => apiRequest('/categories') }
export const locationService = { getAll: () => apiRequest('/locations') }

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Sugerencias
// ─────────────────────────────────────────────────────────────────────────────
export const suggestionService = {
  create: (data) => apiRequest('/suggestions', { method: 'POST', body: JSON.stringify(data) }),
  getMy:  () => apiRequest('/suggestions/my'),
  delete: (id) => apiRequest(`/suggestions/${id}`, { method: 'DELETE' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Reclamos (VERSIÓN CORRECTA)
// ─────────────────────────────────────────────────────────────────────────────
export const complaintService = {
  getMy: async () => {
    const response = await apiRequest('/complaints/my')
    return response.data || response
  },

  create: async (dto) => {
    const response = await apiRequest('/complaints', {
      method: 'POST',
      body: JSON.stringify({
        title: dto.title,
        category: dto.category,
        body: dto.body
      })
    })
    return response.data || response
  },

  addAttachments: async (id, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    const response = await apiRequest(`/complaints/${id}/adjuntos`, {
      method: 'POST',
      body: formData
    })
    return response.data || response
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Logs
// ─────────────────────────────────────────────────────────────────────────────
export const accessLogService = {
  getAll: () => apiRequest('/access-logs')
}