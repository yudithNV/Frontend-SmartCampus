<template>
  <div class="subscribers-container">
    
    <!-- HEADER UNIFICADO -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <!-- Icono ajustado para coincidir con tu estilo -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a52" stroke-width="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <!-- Cambiamos el título dinámicamente -->
          <h1>{{ currentView === 'list' ? 'Gestión de Inscripciones' : 'Detalle de Inscritos' }}</h1>
          <p>{{ currentView === 'list' ? 'Selecciona un evento para revisar la información de los asistentes' : 'Consulta y gestiona los datos de los inscritos para este evento'}}</p>
        </div>
      </div>
    </div>

    <!-- CONTENIDO DINÁMICO -->
    <div class="header-section" style="margin-top: 20px;">
      
      <!-- VISTA DE LISTA -->
      <div v-if="currentView === 'list'">
        <div v-if="loading" class="state-box">
          <div class="state-spinner"></div>
          <p>Cargando eventos...</p>
        </div>
        <div v-else-if="error" class="state-box state-error">
          <p>{{ error }}</p>
        </div>
        <div v-else>
          <div class="filters-bar" style="margin-bottom: 20px;">
  <div class="search-wrap">
    <svg class="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input v-model="eventSearchQuery" type="text" class="search-input-filter" placeholder="Buscar evento por nombre o ubicación..."/>
  </div>
  <div class="select-wrap">
    <select v-model="categoryFilter" class="filter-select-inline">
      <option value="all">Todas las categorías</option>
      <option v-for="cat in availableCategories" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
    </select>
  </div>
  <div class="select-wrap">
    <select v-model="sortEventFilter" class="filter-select-inline">
      <option value="newest">Más recientes</option>
      <option value="oldest">Más antiguos</option>
      <option value="most">Más inscritos</option>
    </select>
  </div>
</div>
          <div v-if="filteredEvents.length === 0" class="empty-state">
            <p>No tienes eventos creados o publicados.</p>
          </div>
          <div v-else>
          <div class="events-grid">
            <div v-for="event in filteredEvents" :key="event.id" class="event-card" @click="goToEvent(event)">
              <!-- Poster -->
              <div class="card-poster">
                <img v-if="event.posterUrl" :src="event.posterUrl" alt="poster" class="poster-img"/>
                <div v-else class="poster-placeholder">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <span class="card-badge" :style="{ background: event.category?.colorHex || '#007bff' }">
                  {{ event.category?.name || event.eventType }}
                </span>
              </div>
              <!-- Info -->
              <div class="card-body">
                <!-- Ejemplo con un icono para la fecha -->
                <p class="card-date">
                  <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  {{ formatDateRange(event.startDatetime, event.endDatetime) }}
                </p>

                <h3 class="card-title">{{ event.name }}</h3>
                <p class="card-desc">{{ event.description }}</p>

                <!-- Aquí está tu icono de ubicación -->
                <p class="card-location">
                  <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {{ event.location?.name }}
                </p>

                <div class="card-footer">
                  <span class="card-count">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                    
                    {{ event.registeredCount ?? 0 }} / {{ event.maxCapacity }} inscritos
                  </span>
                  <span class="card-active" :class="event.isActive ? 'active' : 'inactive'">
                    {{ event.isActive ? '● Publicado' : '● Inactivo' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- PAGINACIÓN -->
          <div class="pagination">
            <span class="pagination-info">Mostrando {{ events.length }} de {{ totalElements }} eventos (página {{ currentPage + 1 }} de {{ totalPages }})</span>
            <div class="pagination-controls">
              <button :disabled="currentPage === 0" @click="changePage(currentPage - 1)" class="btn-page">‹ Anterior</button>
              <span class="page-indicator">Página <strong>{{ currentPage + 1 }}</strong> de {{ totalPages }}</span>
              <button :disabled="currentPage >= totalPages - 1" @click="changePage(currentPage + 1)" class="btn-page">Siguiente ›</button>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- VISTA DE DETALLE: Botón volver + Buscador de Inscritos -->
      <div v-else>
        <button @click="currentView = 'list'" class="btn-back">← Volver a eventos</button>
        <h2>Inscritos: {{ selectedEvent?.name }} <span class="total-badge">{{ subscribersTotalElements }} inscritos</span></h2>
        <div class="filter-section" style="margin-top: 15px;">
          <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o correo..." class="search-input"/>
        </div>
      </div>
    </div>

    <!-- Tabla (Solo visible en detalle) -->
    <div v-if="currentView === 'detail'" class="table-section">
      <div v-if="loadingSubscribers" class="state-box" style="border: none; box-shadow: none;">
        <div class="state-spinner"></div>
        <p>Cargando inscritos...</p>
      </div>
      <div v-else-if="subscribersError" class="state-box state-error" style="border: none; box-shadow: none;">
        <p>{{ subscribersError }}</p>
      </div>
      <div v-else class="table-wrapper">
        <table class="subscribers-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Carrera / Área</th>
              <th>Fecha de Inscripción</th>
          
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredSubscribers.length === 0">
              <td colspan="4" class="no-data">No se encontraron inscritos</td>
            </tr>
            <tr v-for="subscriber in filteredSubscribers" :key="subscriber.id">
              <td class="name-cell"><span class="subscriber-name">{{ subscriber.name }}</span></td>
              <td class="email-cell">{{ subscriber.email }}</td>
              <td class="career-cell">{{ subscriber.career }}</td>
              <td class="date-cell">{{ formatDate(subscriber.enrollmentDate) }}</td>
              
              <td class="actions-cell">
                <button class="btn-icon" @click="viewSubscriber(subscriber)" title="Ver perfil">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination">
          <span class="pagination-info">Mostrando {{ subscribers.length }} de {{ subscribersTotalElements }} inscritos (página {{ subscribersPage + 1 }} de {{ subscribersTotalPages }})</span>
          <div class="pagination-controls">
            <button :disabled="subscribersPage === 0" @click="changeSubscribersPage(subscribersPage - 1)" class="btn-page">‹ Anterior</button>
            <span class="page-indicator">Página <strong>{{ subscribersPage + 1 }}</strong> de {{ subscribersTotalPages }}</span>
            <button :disabled="subscribersPage >= subscribersTotalPages - 1" @click="changeSubscribersPage(subscribersPage + 1)" class="btn-page">Siguiente ›</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="modal-fade">
      <div v-if="showSubscriberModal" class="modal-overlay" @click.self="showSubscriberModal = false">
        <div class="modal-content" v-if="selectedSubscriber">
          <button class="modal-close" @click="showSubscriberModal = false">×</button>
          
          <div class="modal-header">
            <div class="subscriber-avatar">
              {{ selectedSubscriber.name.charAt(0) }}
            </div>
            <div>
              <h3>{{ selectedSubscriber.name }}</h3>
              <p class="modal-subtitle">{{ selectedSubscriber.email }}</p>
            </div>
          </div>

          <div class="modal-body">
            <div class="info-row">
              <span class="info-label">Carrera:</span>
              <span class="info-value">{{ selectedSubscriber.career }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Teléfono:</span>
              <span class="info-value">{{ selectedSubscriber.phone || 'Sin teléfono aún' }}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Bio:</span>
              <span class="info-value">{{ selectedSubscriber.bio || 'Sin bio aún' }}</span>
            </div>
            <div class="info-row" v-if="selectedSubscriber.status">
            <span class="info-label">Estado cuenta:</span>
            <span class="info-value" :style="{ color: selectedSubscriber.status === 'ACTIVO' ? '#16a34a' : '#dc2626' }">
              {{ selectedSubscriber.status }}
            </span>
          </div>
          </div>

          <div class="modal-actions">
            <button class="btn-close-modal" @click="showSubscriberModal = false">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { eventService, adminUserService, categoryService } from '../../services/api.js'

const categories = ref([])
const currentView = ref('list') // 'list' o 'detail'
const selectedEvent = ref(null) // Para guardar el objeto evento completo
const searchQuery = ref('')
const showSubscriberModal = ref(false)
const selectedSubscriber = ref(null)
const eventSearchQuery = ref('')

const categoryFilter = ref('all')
const sortEventFilter = ref('newest')

const currentPage = ref(0)
const totalPages = ref(1)
const totalElements = ref(0)
const pageSize = 10

const events = ref([])
const subscribers = ref([])
const loading = ref(false)
const error = ref('')
const loadingSubscribers = ref(false)
const subscribersError = ref('')

const subscribersPage = ref(0)
const subscribersTotalPages = ref(1)
const subscribersTotalElements = ref(0)
const subscribersPageSize = 10

const availableCategories = computed(() => categories.value)

// Nueva función para navegar y cargar inscritos
async function goToEvent(event) {
  selectedEvent.value = event // Guarda el evento clickeado
  currentView.value = 'detail' // Cambia la vista para mostrar la tabla
  searchQuery.value = ''       // Limpia el buscador al entrar
  await loadSubscribers(event.id)
}

// Cargar eventos del publicador
async function loadEvents(page = 0) {
  loading.value = true
  error.value = ''
  const catResponse = await categoryService.getAll()
  categories.value = catResponse.data || catResponse || []
  try {
    const response = await eventService.getMy(page, pageSize, 'createdAt', 'DESC')
    if (response && response.content) {
      events.value = response.content
      totalPages.value = response.totalPages ?? 1
      totalElements.value = response.totalElements ?? 0
      currentPage.value = response.number ?? page
    } else if (Array.isArray(response)) {
      events.value = response
    }
  } catch (err) {
    error.value = 'No se pudieron cargar tus eventos.'
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  currentPage.value = page
  loadEvents(page)
}

// Cargar inscritos a un evento específico
async function loadSubscribers(eventId, page = 0) {
  loadingSubscribers.value = true
  subscribersError.value = ''
  subscribers.value = []
  try {
    const response = await eventService.getAttendees(eventId, page, subscribersPageSize)
    if (response && response.content) {
      subscribers.value = response.content
      subscribersTotalPages.value = response.totalPages ?? 1
      subscribersTotalElements.value = response.totalElements ?? 0
      subscribersPage.value = response.number ?? page
    } else if (Array.isArray(response)) {
      subscribers.value = response
    }
  } catch (err) {
    subscribersError.value = 'No se pudieron cargar los inscritos de este evento.'
  } finally {
    loadingSubscribers.value = false
  }
}

function changeSubscribersPage(page) {
  subscribersPage.value = page
  loadSubscribers(selectedEvent.value.id, page)
}

// Computed para filtrar inscritos según el evento seleccionado y la búsqueda
const filteredSubscribers = computed(() => {
  if (!selectedEvent.value) return []
  
  return subscribers.value
    .map(sub => ({
      id: sub.id,
      name: sub.nombreCompleto || sub.name || 'Sin nombre',
      email: sub.correo || sub.email || 'Sin correo',
      career: sub.carreraArea || sub.career || 'No registrada',
      enrollmentDate: sub.fechaInscripcion || sub.enrollmentDate,
      status: (sub.estado || sub.status || 'pendiente').toLowerCase(),
      phone: sub.telefono || sub.phone || 'No registrado',
      notes: sub.notas || sub.notes || ''
    }))
    .filter(sub => 
      sub.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

const filteredEvents = computed(() => {
  let list = [...events.value]
  const q = eventSearchQuery.value.toLowerCase()
  if (q) list = list.filter(e =>
    e.name?.toLowerCase().includes(q) ||
    e.location?.name?.toLowerCase().includes(q)
  )
  if (categoryFilter.value !== 'all')
    list = list.filter(e => e.category?.name === categoryFilter.value)
  if (sortEventFilter.value === 'oldest')
    list = list.sort((a, b) => new Date(a.startDatetime) - new Date(b.startDatetime))
  else if (sortEventFilter.value === 'most')
    list = list.sort((a, b) => (b.registeredCount ?? 0) - (a.registeredCount ?? 0))
  return list
})

// Formatear fecha (soporta cadenas ISO devueltas por el JSON)
function formatDate(dateValue) {
  if (!dateValue) return 'Por confirmar'
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) return dateValue
    return new Intl.DateTimeFormat('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date)
  } catch (e) {
    return dateValue
  }
}

// Formatear estado
function formatStatus(status) {
  if (!status) return 'Pendiente'
  const cleanStatus = status.toLowerCase()
  const statuses = {
    confirmado: 'Confirmado',
    pendiente: 'Pendiente',
    cancelado: 'Cancelado'
  }
  return statuses[cleanStatus] || status
}

// Ver detalles del inscrito
async function viewSubscriber(subscriber) {
  selectedSubscriber.value = {
    name: subscriber.name,
    email: subscriber.email,
    career: subscriber.career,
    enrollmentDate: subscriber.enrollmentDate,
    phone: 'Cargando...',
    bio: null,
    status: null
  }
  showSubscriberModal.value = true

  try {
    const response = await adminUserService.getPublicProfile(subscriber.id)
    const data = response.data || response
    selectedSubscriber.value = {
      name: subscriber.name,
      email: subscriber.email,
      career: subscriber.career,
      enrollmentDate: subscriber.enrollmentDate,
      phone: data.phone || 'No registrado',
      bio: data.bio || null,
      status: data.status || null
    }
  } catch (err) {
    selectedSubscriber.value.phone = 'No disponible'
  }
}

function formatDateRange(start, end) {
  if (!start) return 'Sin fecha'
  const fmt = (d) => new Intl.DateTimeFormat('es-BO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
  const startStr = fmt(start)
  const endTime = end ? new Intl.DateTimeFormat('es-BO', { hour: '2-digit', minute: '2-digit' }).format(new Date(end)) : ''
  return endTime ? `${startStr} - ${endTime}` : startStr
}

onMounted(loadEvents)
</script>

<style scoped>

/*page-header*/
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}
.header-left { display:flex; align-items:center; gap:0.9rem; }
.header-icon {
  width:46px; height:46px; background:#FFD200; border-radius:12px;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
  box-shadow:0 2px 8px rgba(255,210,0,0.3);
}

.header-left h1 {
  font-size: 1.5rem;
  color: #1a3a52;
  margin: 0;
}

.header-left p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.event-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.event-card:hover {
  transform: translateY(-5px);
  border-color: #FFD200;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.event-card h3 {
  margin: 0 0 0.5rem 0;
  color: #1a3a52;
  font-size: 1.2rem;
}

.event-card p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-back {
  background: #f1f5f9;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 1rem;
  color: #1a3a52;
  font-weight: 600;
}
.subscribers-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 2rem;
}

.header-section h2 {
  font-size: 1.8rem;
  color: #1a3a52;
  margin: 0 0 1.5rem 0;
  font-weight: 700;
}

.filter-section {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select,
.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.filter-select {
  min-width: 280px;
  background: #ffffff;
  color: #1a3a52;
  cursor: pointer;
}

.filter-select:hover,
.filter-select:focus {
  border-color: #FFD200;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

.search-input {
  flex: 1;
  min-width: 250px;
  color: #1a3a52;
}

.search-input:focus {
  outline: none;
  border-color: #FFD200;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

.event-info {
  background: #f0f9ff;
  color: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
  color: #94a3b8;
}

.empty-state svg {
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

.table-section {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.table-wrapper {
  overflow-x: auto;
}

.subscribers-table {
  width: 100%;
  border-collapse: collapse;
}

.subscribers-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.subscribers-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a3a52;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.subscribers-table tbody tr {
  border-bottom: 1px solid #e2e8f0;
  transition: background 0.2s ease;
}

.subscribers-table tbody tr:hover {
  background: #f8fafc;
}

.subscribers-table td {
  padding: 1rem;
  font-size: 0.95rem;
  color: #64748b;
}

.name-cell {
  font-weight: 600;
  color: #1a3a52;
}

.subscriber-name {
  display: flex;
  align-items: center;
}

.email-cell {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.career-cell {
  color: #475569;
  font-size: 0.9rem;
}

.date-cell {
  font-size: 0.9rem;
  color: #94a3b8;
}

.status-cell {
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-confirmado {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-pendiente {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-cancelado {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.actions-cell {
  text-align: center;
}

.btn-icon {
  background: transparent;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
}

.no-data {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding: 2rem !important;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modalPopIn 0.3s ease;
  position: relative;
}

@keyframes modalPopIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  transition: color 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1a3a52;
}

.modal-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.subscriber-avatar {
  width: 56px;
  height: 56px;
  background: #FFD200;
  color: #1a3a52;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.modal-header h3 {
  font-size: 1.3rem;
  color: #1a3a52;
  margin: 0;
  font-weight: 700;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: #94a3b8;
  margin: 0.25rem 0 0 0;
  word-break: break-all;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  align-items: flex-start;
}

.info-label {
  font-weight: 600;
  color: #1a3a52;
  min-width: 140px;
  flex-shrink: 0;
}

.info-value {
  color: #64748b;
  flex: 1;
  word-break: break-word;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-close-modal {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #FFD200;
  color: #1a3a52;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.btn-close-modal:hover {
  background: #ffed4e;
}

/* Transición modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-section {
    flex-direction: column;
  }

  .filter-select,
  .search-input {
    width: 100%;
    min-width: unset;
  }

  .event-info {
    width: 100%;
    text-align: center;
  }

  .subscribers-table th:nth-child(4),
  .subscribers-table td:nth-child(4),
  .subscribers-table th:nth-child(5),
  .subscribers-table td:nth-child(5) {
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .header-section h2 {
    font-size: 1.5rem;
  }

  .table-wrapper {
    font-size: 0.85rem;
  }

  .subscribers-table th,
  .subscribers-table td {
    padding: 0.75rem 0.5rem;
  }

  .subscribers-table th {
    font-size: 0.75rem;
  }

  .modal-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .subscribers-table th:nth-child(4),
  .subscribers-table td:nth-child(4),
  .subscribers-table th:nth-child(5),
  .subscribers-table td:nth-child(5),
  .subscribers-table th:nth-child(6),
  .subscribers-table td:nth-child(6) {
    display: none;
  }

  .subscribers-table th,
  .subscribers-table td {
    padding: 0.5rem;
  }
}

/* States and Spinners */
.state-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  margin: 1.5rem 0;
}
.state-spinner {
  width: 34px;
  height: 34px;
  border: 2.5px solid #f1f5f9;
  border-top-color: #FFD200;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.state-box p {
  font-size: 0.86rem;
  color: #64748b;
  margin: 0;
}
.state-error p {
  color: #dc2626;
}

.total-badge {
  font-size: 0.85rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: 500;
  vertical-align: middle;
}

.card-poster {
  position: relative;
  height: 160px;
  background: #f1f5f9;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}
.poster-img { width: 100%; height: 100%; object-fit: cover; }
.poster-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}
.card-badge {
  position: absolute; top: 10px; right: 10px;
  color: white; font-size: 0.75rem; font-weight: 600;
  padding: 0.3rem 0.7rem; border-radius: 20px;
}
.card-body { padding: 1rem; }
.card-date { font-size: 0.82rem; color: #64748b; margin: 0 0 0.4rem 0; }
.card-title { font-size: 1.05rem; font-weight: 700; color: #1a3a52; margin: 0 0 0.4rem 0; }
.card-desc {
  font-size: 0.85rem; color: #94a3b8; margin: 0 0 0.5rem 0;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.card-location { font-size: 0.85rem; color: #475569; margin: 0 0 0.75rem 0; }
.card-footer { display: flex; justify-content: space-between; align-items: center; }
.card-count { font-size: 0.82rem; color: #64748b; }
.card-active { font-size: 0.8rem; font-weight: 600; }
.card-active.active { color: #16a34a; }
.card-active.inactive { color: #94a3b8; }

.pagination {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1.5rem; padding: 1rem; flex-wrap: wrap; gap: 0.5rem;
}
.pagination-info { font-size: 0.85rem; color: #64748b; }
.pagination-controls { display: flex; align-items: center; gap: 0.75rem; }
.btn-page {
  padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 8px;
  background: white; cursor: pointer; font-weight: 600; color: #1a3a52;
  transition: all 0.2s;
}
.btn-page:hover:not(:disabled) { border-color: #FFD200; background: #fffbeb; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.page-indicator { font-size: 0.9rem; color: #475569; }

.card-body p {
  display: flex;
  align-items: center;
  gap: 8px; /* Espacio entre el icono y el texto */
}
.icon {
  flex-shrink: 0; /* Evita que el icono se deforme */
}
.card-count {
  display: inline-flex; /* Para alinear icono y texto */
  align-items: center;
  gap: 6px; /* Espacio entre el icono y el texto */
}

.filters-bar {
  display: flex; align-items: center; gap: 0.8rem;
  margin-bottom: 20px; flex-wrap: wrap;
}
.search-wrap {
  position: relative; display: flex; align-items: center; flex: 1; min-width: 200px;
}
.search-ico { position: absolute; left: 0.85rem; pointer-events: none; }
.search-input-filter {
  width: 100%; padding: 0.62rem 1rem 0.62rem 2.3rem;
  border: 1.5px solid #e2e8f0; border-radius: 9px;
  font-size: 0.85rem; font-family: 'Inter', sans-serif;
  color: #1e293b; background: #fff; outline: none; transition: border-color 0.18s;
}
.search-input-filter:focus { border-color: #FFD200; box-shadow: 0 0 0 3px rgba(255,210,0,0.08); }
.filter-select-inline {
  padding: 0.58rem 1rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.82rem; font-family: 'Inter', sans-serif;
  color: #475569; background: #fff; outline: none; cursor: pointer;
  transition: border-color 0.18s;
}
.filter-select-inline:focus { border-color: #FFD200; }
</style>
