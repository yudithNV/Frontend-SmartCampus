// Configuración base de API
const API_BASE_URL = 'http://localhost:8081/api'

// Función genérica para hacer peticiones
async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const token = localStorage.getItem('ucb_token')

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors'
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`
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

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Autenticación
// ─────────────────────────────────────────────────────────────────────────────
export const userService = {
  login: (email, password) =>
    apiRequest('/auth/login', 'POST', { email, password }),

  logout: () =>
    apiRequest('/auth/logout', 'POST'),

  // Obtener información del usuario autenticado (para sidebars)
  getMe: () =>
    apiRequest('/auth/me', 'GET'),

  // ✅ Corregido: el backend usa /api/profile (ProfileController)
  getProfile: () =>
    apiRequest('/profile', 'GET'),

  updateProfile: (data) =>
    apiRequest('/profile', 'PUT', data)
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Usuarios (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const adminUserService = {
  getAll: (page = 0, size = 10, search = '', role = '', status = '', career = '', sortBy = 'createdAt', sortType = 'DESC') => {
    const params = new URLSearchParams({ page, size, sortBy, sortType })
    if (search) params.append('search', search)
    if (role) params.append('role', role)
    if (status) params.append('status', status)
    if (career) params.append('career', career)
    return apiRequest(`/users?${params}`, 'GET')
  },

  create: (data) =>
    apiRequest('/users', 'POST', data),

  update: (id, data) =>
    apiRequest(`/users/${id}`, 'PUT', data),

  delete: (id) =>
    apiRequest(`/users/${id}`, 'DELETE')
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Noticias
// ─────────────────────────────────────────────────────────────────────────────
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
    apiRequest(`/news/${id}`, 'DELETE'),

   getMy: () =>
    apiRequest('/news/my', 'GET'),

  getRecent: (queryString) =>
    apiRequest(`/news/recent?${queryString}`, 'GET'),
}
// ─────────────────────────────────────────────────────────────
// Normalizador de eventos (Adapter Pattern)
// ─────────────────────────────────────────────────────────────
function normalizeEvent(event) {
  let cleanDescription = event.description

  // Si viene como JSON raro → parsear
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
  /** Todos los eventos publicados */
  getAll: () =>
    apiRequest('/events', 'GET'),

  /** Eventos próximos (desde hoy en adelante) */
  getUpcoming: async () => {
    const response = await apiRequest('/events/upcoming', 'GET')
    const list = response?.data ?? response

    return Array.isArray(list)
      ? list.map(normalizeEvent)
      : []
  },

  /** Eventos del publicador autenticado */
  getMy: () =>
    apiRequest('/events/my', 'GET'),

  /** Eventos filtrados por carrera — usado por el calendario del estudiante */
  getByCareer: (careerId) =>
    apiRequest(`/events/career/${careerId}`, 'GET'),

  getById: (id) =>
    apiRequest(`/events/${id}`, 'GET'),

  create: (data) =>
    apiRequest('/events', 'POST', data),

  update: (id, data) =>
    apiRequest(`/events/${id}`, 'PUT', data),

  delete: (id) =>
    apiRequest(`/events/${id}`, 'DELETE')
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Calendario Académico (tareas personales del estudiante)
// Usa la tabla academic_calendar de la BD
// ─────────────────────────────────────────────────────────────────────────────
export const academicCalendarService = {
  /** Obtiene todas las tareas del estudiante autenticado */
  getMy: () =>
    apiRequest('/academic-calendar', 'GET'),

  /** Crea una nueva tarea personal */
  create: (data) =>
    apiRequest('/academic-calendar', 'POST', data),

  /** Actualiza una tarea existente */
  update: (id, data) =>
    apiRequest(`/academic-calendar/${id}`, 'PUT', data),

  /** Elimina una tarea */
  delete: (id) =>
    apiRequest(`/academic-calendar/${id}`, 'DELETE')
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Reservas
// ─────────────────────────────────────────────────────────────────────────────
export const reservationService = {
  getAll: () =>
    apiRequest('/reservations', 'GET'),

  create: (data) =>
    apiRequest('/reservations', 'POST', data),

  cancel: (id) =>
    apiRequest(`/reservations/${id}/cancel`, 'POST')
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Carreras
// ─────────────────────────────────────────────────────────────────────────────
export const careerService = {
  getAll: () =>
    apiRequest('/careers', 'GET')
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Categorías
// ─────────────────────────────────────────────────────────────────────────────
export const categoryService = {
  getAll: () =>
    apiRequest('/categories', 'GET')
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Ubicaciones
// ─────────────────────────────────────────────────────────────────────────────
export const locationService = {
  getAll: () =>
    apiRequest('/locations', 'GET')
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Sugerencias
// ─────────────────────────────────────────────────────────────────────────────
export const suggestionService = {
  /** Envía una nueva sugerencia — POST /api/suggestions */
  create: (data) =>
    apiRequest('/suggestions', 'POST', data),

  /** Historial de sugerencias del estudiante — GET /api/suggestions/my */
  getMy: () =>
    apiRequest('/suggestions/my', 'GET')
}

// ─────────────────────────────────────────────────────────────────────────────
// Servicios de Reclamos
// ─────────────────────────────────────────────────────────────────────────────
export const complaintService = {
  /** Obtiene todos los reclamos del estudiante autenticado — GET /api/complaints/my */
  getMy: async () => {
    const response = await apiRequest('/complaints/my', 'GET')
    // El backend devuelve { success, message, data: [...] }
    return response.data || response
  },

  /** Crea un nuevo reclamo con evidencia opcional */
  create: async (data) => {
    const token = localStorage.getItem('ucb_token')

    // Si NO hay evidencia → usar endpoint JSON simple
    if (!data.evidence) {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: data.title,
          category: data.category,
          body: data.description
        }),
        mode: 'cors'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.message || errorData?.error || `Error ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()
      return result.data || result
    }

    // Si HAY evidencia → usar endpoint multipart
    const formData = new FormData()

    const complaintData = {
      title: data.title,
      category: data.category,
      body: data.description
    }

    formData.append('complaint', JSON.stringify(complaintData))
    formData.append('evidence', data.evidence)

    const response = await fetch(`${API_BASE_URL}/complaints/with-evidence`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
      mode: 'cors'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      const errorMessage = errorData?.message || errorData?.error || `Error ${response.status}`
      throw new Error(errorMessage)
    }

    const result = await response.json()
    return result.data || result
  }
}

