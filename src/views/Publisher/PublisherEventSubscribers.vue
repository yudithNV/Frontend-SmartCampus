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
        <div class="filter-section" style="margin-bottom: 20px;">
          <input v-model="eventSearchQuery" type="text" placeholder="Buscar evento por nombre..." class="search-input">
        </div>
        <div class="events-grid">
          <div v-for="event in filteredEvents" :key="event.id" class="event-card" @click="goToEvent(event)">
            <h3>{{ event.name }}</h3>
            <p>{{ event.subscriberCount }} inscritos</p>
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
      <div class="table-wrapper">
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
import { ref, computed } from 'vue'

const currentView = ref('list') // 'list' o 'detail'
const selectedEvent = ref(null) // Para guardar el objeto evento completo
const searchQuery = ref('')
const showSubscriberModal = ref(false)
const selectedSubscriber = ref(null)
const eventSearchQuery = ref('')

// Nueva función para navegar
function goToEvent(event) {
  selectedEvent.value = event // Guarda el evento clickeado
  currentView.value = 'detail' // Cambia la vista para mostrar la tabla
  searchQuery.value = ''       // Limpia el buscador al entrar
}

// Datos mock de eventos
const mockEvents = [
  {
    id: 1,
    name: 'Charla: Inteligencia Artificial en Educación',
    subscriberCount: 45
  },
  {
    id: 2,
    name: 'Taller: Desarrollo Web Moderno',
    subscriberCount: 62
  },
  {
    id: 3,
    name: 'Seminario: Transformación Digital',
    subscriberCount: 38
  },
  {
    id: 4,
    name: 'Workshop: Cloud Computing',
    subscriberCount: 52
  },
  {
    id: 5,
    name: 'Conferencia: Ciberseguridad',
    subscriberCount: 28
  }
]

// Datos mock de inscritos (combinados para diferentes eventos)
const mockSubscribersByEvent = {
  1: [
    { id: 101, name: 'Juan Carlos Mendoza', email: 'juan.mendoza@ucb.edu.bo', career: 'Ingeniería en Sistemas', phone: '+591 7123456', enrollmentDate: new Date('2026-05-20'), status: 'confirmado', notes: 'Interesado en IA' },
    { id: 102, name: 'María García López', email: 'maria.garcia@ucb.edu.bo', career: 'Ingeniería en Informática', phone: '+591 7234567', enrollmentDate: new Date('2026-05-21'), status: 'confirmado', notes: '' },
    { id: 103, name: 'Roberto Silva Fernández', email: 'roberto.silva@ucb.edu.bo', career: 'Ingeniería en Sistemas', phone: '+591 7345678', enrollmentDate: new Date('2026-05-19'), status: 'pendiente', notes: '' },
    { id: 104, name: 'Ana Martínez Ruiz', email: 'ana.martinez@ucb.edu.bo', career: 'Administración de Sistemas', phone: '+591 7456789', enrollmentDate: new Date('2026-05-22'), status: 'confirmado', notes: '' },
    { id: 105, name: 'Carlos Eduardo Ochoa', email: 'carlos.ochoa@ucb.edu.bo', career: 'Ingeniería en Sistemas', phone: '+591 7567890', enrollmentDate: new Date('2026-05-18'), status: 'confirmado', notes: '' },
    { id: 106, name: 'Patricia Álvarez Torres', email: 'patricia.alvarez@ucb.edu.bo', career: 'Ciencias de la Computación', phone: '+591 7678901', enrollmentDate: new Date('2026-05-21'), status: 'cancelado', notes: 'Cambio de horario' },
    { id: 107, name: 'David Rojas Gómez', email: 'david.rojas@ucb.edu.bo', career: 'Ingeniería en Informática', phone: '+591 7789012', enrollmentDate: new Date('2026-05-20'), status: 'confirmado', notes: '' },
  ],
  2: [
    { id: 201, name: 'Sofía Valenzuela Quispe', email: 'sofia.valenzuela@ucb.edu.bo', career: 'Ingeniería en Sistemas', phone: '+591 7890123', enrollmentDate: new Date('2026-05-15'), status: 'confirmado', notes: 'Frontend developer' },
    { id: 202, name: 'Miguel Ángel Ramírez', email: 'miguel.ramirez@ucb.edu.bo', career: 'Ingeniería en Informática', phone: '+591 7901234', enrollmentDate: new Date('2026-05-16'), status: 'confirmado', notes: '' },
    { id: 203, name: 'Laura Sánchez Morales', email: 'laura.sanchez@ucb.edu.bo', career: 'Administración de Sistemas', phone: '+591 7012345', enrollmentDate: new Date('2026-05-17'), status: 'pendiente', notes: '' },
    { id: 204, name: 'Andrés Felipe Córdoba', email: 'andres.cordoba@ucb.edu.bo', career: 'Ingeniería en Sistemas', phone: '+591 7123401', enrollmentDate: new Date('2026-05-16'), status: 'confirmado', notes: '' },
    { id: 205, name: 'Catalina Vera Gómez', email: 'catalina.vera@ucb.edu.bo', career: 'Ciencias de la Computación', phone: '+591 7234502', enrollmentDate: new Date('2026-05-18'), status: 'confirmado', notes: '' },
  ],
  3: [
    { id: 301, name: 'Fernando López Chávez', email: 'fernando.lopez@ucb.edu.bo', career: 'Ingeniería en Sistemas', phone: '+591 7345603', enrollmentDate: new Date('2026-05-14'), status: 'confirmado', notes: '' },
    { id: 302, name: 'Valeria Ortiz Peña', email: 'valeria.ortiz@ucb.edu.bo', career: 'Administración de Sistemas', phone: '+591 7456704', enrollmentDate: new Date('2026-05-15'), status: 'confirmado', notes: '' },
    { id: 303, name: 'Gustavo Herrera Rodríguez', email: 'gustavo.herrera@ucb.edu.bo', career: 'Ingeniería en Informática', phone: '+591 7567805', enrollmentDate: new Date('2026-05-16'), status: 'pendiente', notes: '' },
  ],
  4: [
    { id: 401, name: 'Elena Castillo Vargas', email: 'elena.castillo@ucb.edu.bo', career: 'Ingeniería en Sistemas', phone: '+591 7678906', enrollmentDate: new Date('2026-05-12'), status: 'confirmado', notes: 'Interesada en DevOps' },
    { id: 402, name: 'Lucas Fuentes Medina', email: 'lucas.fuentes@ucb.edu.bo', career: 'Ciencias de la Computación', phone: '+591 7789007', enrollmentDate: new Date('2026-05-13'), status: 'confirmado', notes: '' },
  ],
  5: [
    { id: 501, name: 'Stephanie Guzmán Cortés', email: 'stephanie.guzman@ucb.edu.bo', career: 'Ingeniería en Sistemas', phone: '+591 7890108', enrollmentDate: new Date('2026-05-10'), status: 'confirmado', notes: '' },
    { id: 502, name: 'Óscar Vega Soto', email: 'oscar.vega@ucb.edu.bo', career: 'Administración de Sistemas', phone: '+591 7901209', enrollmentDate: new Date('2026-05-11'), status: 'pendiente', notes: '' },
  ]
}

// Computed para filtrar inscritos según el evento seleccionado y la búsqueda
const filteredSubscribers = computed(() => {
  // Si no hay evento, retornamos vacío
  if (!selectedEvent.value) return []
  
  // Usamos el ID del evento seleccionado para buscar en el objeto mock
  const subscribers = mockSubscribersByEvent[selectedEvent.value.id] || []
  
  return subscribers.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    sub.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredEvents = computed(() => {
  return mockEvents.filter(event => 
    event.name.toLowerCase().includes(eventSearchQuery.value.toLowerCase())
  )
})

// Formatear fecha
function formatDate(date) {
  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

// Formatear estado
function formatStatus(status) {
  const statuses = {
    confirmado: 'Confirmado',
    pendiente: 'Pendiente',
    cancelado: 'Cancelado'
  }
  return statuses[status] || status
}

// Ver detalles del inscrito
function viewSubscriber(subscriber) {
  selectedSubscriber.value = subscriber
  showSubscriberModal.value = true
}
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
</style>
