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
          <div class="filter-section" style="margin-bottom: 20px;">
            <input v-model="eventSearchQuery" type="text" placeholder="Buscar evento por nombre..." class="search-input">
          </div>
          <div v-if="filteredEvents.length === 0" class="empty-state">
            <p>No tienes eventos creados o publicados.</p>
          </div>
          <div v-else class="events-grid">
            <div v-for="event in filteredEvents" :key="event.id" class="event-card" @click="goToEvent(event)">
              <h3>{{ event.name }}</h3>
              <p>{{ event.registeredCount ?? 0 }} inscritos</p>
            </div>
          </div>
        </div>
      </div>

      <!-- VISTA DE DETALLE: Botón volver + Buscador de Inscritos -->
      <div v-else>
        <button @click="currentView = 'list'" class="btn-back">← Volver a eventos</button>
        <h2>Inscritos: {{ selectedEvent?.name }}</h2>
        <div class="filter-section" style="margin-top: 15px;">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            class="search-input"
          >
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
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredSubscribers.length === 0">
              <td colspan="6" class="no-data">No se encontraron inscritos</td>
            </tr>
            <tr v-for="subscriber in filteredSubscribers" :key="subscriber.id">
              <td class="name-cell"><span class="subscriber-name">{{ subscriber.name }}</span></td>
              <td class="email-cell">{{ subscriber.email }}</td>
              <td class="career-cell">{{ subscriber.career }}</td>
              <td class="date-cell">{{ formatDate(subscriber.enrollmentDate) }}</td>
              <td class="status-cell">
                <span class="status-badge" :class="`status-${subscriber.status}`">
                  {{ formatStatus(subscriber.status) }}
                </span>
              </td>
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
              <span class="info-value">{{ selectedSubscriber.phone }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estado:</span>
              <span class="info-value">{{ formatStatus(selectedSubscriber.status) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Notas:</span>
              <span class="info-value">{{ selectedSubscriber.notes || 'Sin notas' }}</span>
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
import { eventService } from '../../services/api.js'

const currentView = ref('list') // 'list' o 'detail'
const selectedEvent = ref(null) // Para guardar el objeto evento completo
const searchQuery = ref('')
const showSubscriberModal = ref(false)
const selectedSubscriber = ref(null)
const eventSearchQuery = ref('')

const events = ref([])
const subscribers = ref([])
const loading = ref(false)
const error = ref('')
const loadingSubscribers = ref(false)
const subscribersError = ref('')

// Nueva función para navegar y cargar inscritos
async function goToEvent(event) {
  selectedEvent.value = event // Guarda el evento clickeado
  currentView.value = 'detail' // Cambia la vista para mostrar la tabla
  searchQuery.value = ''       // Limpia el buscador al entrar
  await loadSubscribers(event.id)
}

// Cargar eventos del publicador
async function loadEvents() {
  loading.value = true
  error.value = ''
  try {
    const response = await eventService.getMy(0, 100, 'createdAt', 'DESC')
    let list = []
    if (response && response.content && Array.isArray(response.content)) {
      list = response.content
    } else if (Array.isArray(response)) {
      list = response
    } else if (response && response.data && Array.isArray(response.data)) {
      list = response.data
    }
    events.value = list
  } catch (err) {
    console.error('Error al cargar eventos:', err)
    error.value = 'No se pudieron cargar tus eventos.'
  } finally {
    loading.value = false
  }
}

// Cargar inscritos a un evento específico
async function loadSubscribers(eventId) {
  loadingSubscribers.value = true
  subscribersError.value = ''
  subscribers.value = []
  try {
    const response = await eventService.getAttendees(eventId, 0, 100)
    let list = []
    if (response && response.content && Array.isArray(response.content)) {
      list = response.content
    } else if (Array.isArray(response)) {
      list = response
    } else if (response && response.data && Array.isArray(response.data)) {
      list = response.data
    }
    subscribers.value = list
  } catch (err) {
    console.error('Error al cargar inscritos:', err)
    subscribersError.value = 'No se pudieron cargar los inscritos de este evento.'
  } finally {
    loadingSubscribers.value = false
  }
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
  return events.value.filter(event => 
    event.name.toLowerCase().includes(eventSearchQuery.value.toLowerCase())
  )
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
function viewSubscriber(subscriber) {
  selectedSubscriber.value = {
    name: subscriber.nombreCompleto || subscriber.name,
    email: subscriber.correo || subscriber.email,
    career: subscriber.carreraArea || subscriber.career,
    phone: subscriber.telefono || subscriber.phone || 'No registrado',
    status: subscriber.estado || subscriber.status || 'pendiente',
    notes: subscriber.notas || subscriber.notes || ''
  }
  showSubscriberModal.value = true
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
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
</style>
