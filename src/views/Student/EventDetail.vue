<template>
  <div class="event-detail-page">
    <PasswordChangedBanner />

    <!-- ── BACK BUTTON ───────── -->
    <div class="detail-header">
      <button @click="goBack" class="back-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Volver
      </button>
    </div>

    <!-- ── LOADING ───────── -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando evento...</p>
    </div>

    <!-- ── ERROR ───────── -->
    <div v-else-if="error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h3>Error al cargar el evento</h3>
      <p>{{ error }}</p>
      <button @click="goBack" class="btn-retry">Volver atrás</button>
    </div>

    <!-- ── CONTENT ───────── -->
    <div v-else-if="evento" class="detail-container">

      <!-- ── Success Message ────── -->
      <div v-if="successMessage" class="alert alert-success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {{ successMessage }}
      </div>

      <!-- ── Error Message ────── -->
      <div v-if="error" class="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </div>

      <!-- ── Poster Image ────── -->
      <div class="detail-hero">
        <img v-if="evento.posterUrl" :src="evento.posterUrl" :alt="evento.name" class="detail-hero__img">
        <div v-else class="detail-hero__placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
      </div>

      <!-- ── Main Content ────── -->
      <div class="detail-main">

        <!-- Badges -->
        <div class="badge-row">
          <!-- Badge inscrito -->
          <span v-if="evento.isRegistered" class="badge badge-registered">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Inscrito
          </span>
          <!-- Badge recomendado (SCRUM-404) -->
          <span v-if="evento.recommended" class="badge badge-recommended">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Recomendado para ti
          </span>
          <span class="badge badge-type">{{ evento.eventType }}</span>
          <span v-if="evento.category" class="badge badge-category" :style="{ background: evento.category.colorHex || '#64748b' }">
            {{ evento.category.name }}
          </span>
        </div>

          <h1 class="detail-title">{{ evento.name }}</h1>

        <!-- Autor -->
        <div class="author-section">
          <div class="author-avatar">{{ getInitials(evento.authorName) }}</div>
          <div class="author-details">
            <p class="author-name">{{ evento.authorName }}</p>
            <p class="author-date">Publicado {{ formatDateTime(evento.createdAt) }}</p>
          </div>
        </div>

        <!-- ── Event Details Grid ────── -->
        <div class="details-grid">

          <!-- Fecha y Hora -->
          <div class="detail-card">
            <div class="detail-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="detail-text">
              <p class="detail-label">Fecha y Hora</p>
              <p class="detail-value">{{ formatEventDateTime(evento.startDatetime, evento.endDatetime) }}</p>
            </div>
          </div>

          <!-- Ubicación -->
          <div class="detail-card">
            <div class="detail-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="detail-text">
              <p class="detail-label">Ubicación</p>
              <p class="detail-value">{{ evento.location?.name || 'No especificada' }}</p>
              <p v-if="evento.location?.block" class="detail-subtext">{{ evento.location.block }} - {{ evento.location.description }}</p>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div class="detail-text">
              <p class="detail-label">Carrera</p>
              <p class="detail-value">{{ evento.career?.name || 'General' }}</p>
              <p v-if="evento.career?.code" class="detail-subtext">{{ evento.career.code }}</p>
            </div>
          </div>

          <!-- Capacidad -->
          <div class="detail-card" :class="{ 'capacity-full': evento.registeredCount >= evento.maxCapacity }">
            <div class="detail-icon" :class="{ 'capacity-full-icon': evento.registeredCount >= evento.maxCapacity }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div class="detail-text">
              <p class="detail-label">Cupos</p>
              <div class="capacity-display">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="capacity-icon" :class="{ 'capacity-icon-warning': evento.registeredCount >= evento.maxCapacity }">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                <span class="capacity-text" :class="{ 'capacity-text-full': evento.registeredCount >= evento.maxCapacity }">{{ evento.registeredCount || 0 }} de {{ evento.maxCapacity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Description ────── -->
        <div class="description-section">
          <h2 class="section-title">Descripción</h2>
          <p class="description-text">{{ evento.description }}</p>
        </div>

        <!-- ── Metadata ────── -->
        <div class="metadata-section">
          <div class="metadata-item">
            <span class="metadata-label">Última actualización:</span>
            <span class="metadata-value">{{ formatDateTime(evento.updatedAt) }}</span>
          </div>
          
        </div>

        <!-- ── CTA Buttons ────── -->
        <div class="cta-buttons">
          <button @click="goBack" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver al muro
          </button>
          <button 
            @click="toggleRegistration" 
            class="btn registration-btn" 
            :class="[
              evento.isRegistered ? 'btn-unregister' : 'btn-register',
              (evento.registeredCount >= evento.maxCapacity && !evento.isRegistered) ? 'btn-capacity-full' : ''
            ]"
            :disabled="loadingRegistration || eventoPasado || (evento.registeredCount >= evento.maxCapacity && !evento.isRegistered)"
          >
            <span v-if="eventoPasado && !loadingRegistration" class="btn-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Evento finalizado
            </span>
            <span v-else-if="evento.registeredCount >= evento.maxCapacity && !evento.isRegistered && !loadingRegistration" class="btn-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Cupos agotados
            </span>
            <span v-else-if="!evento.isRegistered && !loadingRegistration" class="btn-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Inscribirme
            </span>
            <span v-else-if="evento.isRegistered && !loadingRegistration" class="btn-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Cancelar asistencia
            </span>
            <span v-else class="loading-spinner">Procesando...</span>
          </button>
          
        </div>
      </div>
    </div>

    <!-- ── MODAL DE CONFIRMACIÓN ────── -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h2 class="modal-title">¿Estás seguro?</h2>
        </div>
        
        <div class="modal-body">
          <p>Si cancelas tu inscripción, <strong>perderás tu cupo</strong> en este evento y puede que no haya lugares disponibles después.</p>
          <p class="modal-subtext">Esta acción no se puede deshacer.</p>
        </div>
        
        <div class="modal-footer">
          <button @click="closeConfirmModal" class="modal-btn modal-btn--cancel">
            Mantener inscripción
          </button>
          <button @click="confirmUnregister" class="modal-btn modal-btn--danger" :disabled="loadingRegistration">
            <span v-if="!loadingRegistration">Sí, cancelar inscripción</span>
            <span v-else class="loading-spinner">Procesando...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PasswordChangedBanner from '../../components/PasswordChangedBanner.vue'
import { formatDateTime, formatEventDateTime, eventBus } from '../../utils/index.js'
import { eventService, userService } from '../../services/api.js'

const router = useRouter()
const route = useRoute()
const eventId = route.params.id

const evento = ref(null)
const loading = ref(true)
const error = ref('')
const loadingRegistration = ref(false)
const successMessage = ref('')
const showConfirmModal = ref(false)
const eventoPasado = ref(false)

// Función para verificar si el evento ya pasó
const verificarEventoPasado = () => {
  if (!evento.value || !evento.value.startDatetime) {
    eventoPasado.value = false
    return
  }
  
  const fechaInicio = new Date(evento.value.startDatetime)
  const ahora = new Date()
  eventoPasado.value = fechaInicio < ahora
}

// Obtener detalles del evento
const fetchEventDetail = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await eventService.getById(eventId)
    const raw = data.data || data

    // Marcar recomendado si el backend no lo devuelve
    if (raw.recommended === undefined || raw.recommended === null) {
      try {
        const prefs = await userService.getPreferences()
        const hasPrefs = prefs.eventTypes.length > 0 || prefs.categoryIds.length > 0
        if (hasPrefs) {
          const matchType     = prefs.eventTypes.includes(raw.eventType)
          const matchCategory = raw.category?.id != null && prefs.categoryIds.includes(raw.category.id)
          raw.recommended = matchType || matchCategory
        } else {
          raw.recommended = false
        }
      } catch {
        raw.recommended = false
      }
    }

    evento.value = raw
    
    // Verificar si el evento ya pasó
    verificarEventoPasado()
  } catch (err) {
    console.error('Error al cargar evento:', err)
    error.value = err.message || 'Error desconocido'
  } finally {
    loading.value = false
  }
}

// Manejar registro/desregistro del evento
const toggleRegistration = () => {
  if (!evento.value.isRegistered) {
    // Si no está registrado, inscribirse directamente
    proceedWithRegistration()
  } else {
    // Si está registrado, mostrar modal de confirmación
    showConfirmModal.value = true
  }
}

// Proceder con la inscripción
const proceedWithRegistration = async () => {
  loadingRegistration.value = true
  successMessage.value = ''
  error.value = ''
  
  try {
    const response = await eventService.register(eventId)
    successMessage.value = '¡Inscripción realizada con éxito!'
    
    // Actualizar evento con los datos devueltos por el servidor
    const eventoActualizado = response.data || response
    if (eventoActualizado) {
      evento.value = eventoActualizado
    }
    
    // Emitir evento para actualizar el calendario
    eventBus.emit('event-registered', eventId)
    
    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error al procesar registro:', err)
    const errorMsg = err.message || 'Error al procesar la solicitud'
    
    // Mostrar mensaje de error específico
    if (errorMsg.includes('inscrito')) {
      error.value = 'Ya estás inscrito en este evento'
    } else if (errorMsg.includes('Cupo')) {
      error.value = 'El evento ha alcanzado su capacidad máxima'
    } else if (errorMsg.includes('no encontrado')) {
      error.value = 'Evento no encontrado'
    } else {
      error.value = errorMsg
    }
    
    // Limpiar mensaje de error después de 5 segundos
    setTimeout(() => {
      error.value = ''
    }, 5000)
  } finally {
    loadingRegistration.value = false
  }
}

// Confirmar desuscripción desde el modal
const confirmUnregister = async () => {
  loadingRegistration.value = true
  error.value = ''
  successMessage.value = ''
  
  try {
    const response = await eventService.unregister(eventId)
    successMessage.value = '¡Inscripción cancelada con éxito!'
    
    // Actualizar evento con los datos devueltos por el servidor
    const eventoActualizado = response.data || response
    if (eventoActualizado) {
      evento.value = eventoActualizado
    }
    
    // Cerrar modal
    showConfirmModal.value = false
    
    // Emitir evento para actualizar el calendario
    eventBus.emit('event-registered', eventId)
    
    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    console.error('Error al cancelar inscripción:', err)
    const errorMsg = err.message || 'Error al procesar la solicitud'
    
    // Mostrar mensaje de error específico
    if (errorMsg.includes('no inscrito')) {
      error.value = 'No estabas inscrito en este evento'
    } else if (errorMsg.includes('no encontrado')) {
      error.value = 'Evento no encontrado'
    } else {
      error.value = errorMsg
    }
    
    // Limpiar mensaje de error después de 5 segundos
    setTimeout(() => {
      error.value = ''
    }, 5000)
  } finally {
    loadingRegistration.value = false
  }
}

// Cerrar modal sin hacer nada
const closeConfirmModal = () => {
  showConfirmModal.value = false
}

// Helpers
const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchEventDetail()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');

:root {
  --navy:    #1a3a52;
  --gold:    #FFD200;
  --ink:     #0f1f2e;
  --slate:   #64748b;
  --muted:   #94a3b8;
  --surface: #ffffff;
  --bg:      #f0f2f5;
  --border:  #e2e8f0;
  --success: #10b981;
  --error:   #ef4444;
  --radius:  12px;
}

.event-detail-page {
  --navy: #1a3a52; --navy2: #1e4d6b; --gold: #FFD200;
  --ink: #0f1f2e; --slate: #64748b; --muted: #94a3b8;
  --surface: #ffffff; --bg: #f0f2f5; --border: #e2e8f0;
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  padding-bottom: 3rem;
}

/* ── Back Button Header ────── */
.detail-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0.75rem 1.25rem;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}
.back-btn:hover { background: #f8fafc; border-color: var(--navy); color: var(--navy); }

.back-btn:hover {
  background: #f8fafc;
  border-color: var(--navy);
  color: var(--navy);
}

/* ── Loading / Error States ────── */
.loading-state,
.error-state {
  max-width: 600px;
  margin: 4rem auto;
  padding: 2rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--navy);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state svg {
  margin-bottom: 1rem;
}

.error-state h3 {
  font-family: 'Fraunces', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 0.5rem;
}

.error-state p {
  color: var(--slate);
  margin: 0 0 1.5rem;
}

.btn-retry {
  padding: 0.6rem 1.25rem;
  background: var(--navy);
  color: var(--gold);
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-retry:hover {
  background: #0f2a3d;
}
.btn-retry:hover { background: #0f2a3d; }

/* ── Detail Container ────── */
.detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem;
}

/* ── Hero Image ────── */
.detail-hero {
  width: 100%;
  height: 380px;
  background: linear-gradient(135deg, #e8f0f6, #d1e0f0);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-hero__placeholder {
  color: #7fa8c4;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-hero__img { width: 100%; height: 100%; object-fit: cover; }
.detail-hero__placeholder { color: #7fa8c4; }

/* ── Main Content ────── */
.detail-main {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 1.75rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

/* ── Badges ────── */
.badge-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.badge-registered {
  background: #d1fae5;
  color: #047857;
  text-transform: capitalize;
  font-weight: 600;
}

.badge-status {
  background: #dbeafe;
  color: #1e40af;
}

.badge-status.status-draft {
  background: #fef3c7;
  color: #92400e;
}

.badge-type {
  background: #e9d5ff;
  color: #6b21a8;
}

.badge-category {
  color: #ffffff;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  display: inline-block;
}

/* ── Title ────── */
.detail-title {
  font-family: 'Fraunces', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 1.25rem;
  line-height: 1.2;
}

/* ── Author Section ────── */
.author-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--navy), #2e6a8a);
  color: var(--gold);
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.author-details {
  min-width: 0;
}

.author-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}

.author-date {
  font-size: 0.8rem;
  color: var(--slate);
  margin: 0.25rem 0 0;
}

/* ── Details Grid ────── */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: #f8fafc;
  transition: all 0.2s;
}

.detail-card:hover {
  border-color: var(--navy);
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(26,58,82,0.08);
}

.detail-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--navy), #2e6a8a);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
  flex-shrink: 0;
}

.detail-text {
  min-width: 0;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--slate);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  margin: 0 0 0.4rem;
}
.detail-label { font-size: 0.7rem; color: var(--slate); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin: 0 0 0.35rem; }
.detail-value { font-size: 0.9rem; font-weight: 700; color: var(--ink); margin: 0; line-height: 1.3; }
.detail-subtext { font-size: 0.75rem; color: var(--muted); margin: 0.25rem 0 0; }

.detail-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
  line-height: 1.3;
}

.detail-subtext {
  font-size: 0.8rem;
  color: var(--muted);
  margin: 0.3rem 0 0;
}

/* ── Capacity Display ────── */
.capacity-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.capacity-icon {
  color: var(--navy);
  flex-shrink: 0;
  opacity: 0.8;
}

.capacity-icon-warning {
  color: #ef4444;
  opacity: 1;
}

.capacity-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.3;
}

.capacity-text-full {
  color: #ef4444;
  font-weight: 700;
}

.detail-card.capacity-full {
  border-color: #fecaca;
  background: #fef2f2;
}

.detail-card.capacity-full .detail-icon.capacity-full-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

/* ── Description Section ────── */
.description-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 4px solid var(--navy);
}

.section-title {
  font-family: 'Fraunces', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 0.75rem;
}

.description-text {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.7;
  white-space: pre-wrap;
  margin: 0;
}
.section-title { font-family: 'Fraunces', serif; font-size: 1.05rem; font-weight: 700; color: var(--ink); margin: 0 0 0.65rem; }
.description-text { font-size: 0.925rem; color: #374151; line-height: 1.75; white-space: pre-wrap; margin: 0; }

/* ── Metadata Section ────── */
.metadata-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 10px;
  margin-bottom: 2rem;
  border: 1px dashed var(--border);
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metadata-label {
  font-size: 0.8rem;
  color: var(--slate);
  font-weight: 600;
  min-width: 180px;
}

.metadata-value {
  font-size: 0.85rem;
  color: var(--ink);
  font-weight: 500;
}

.metadata-value.mono {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: #7c3aed;
  background: #f3e8ff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* ── CTA Buttons ────── */
.cta-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.metadata-item { display: flex; align-items: center; gap: 1rem; }
.metadata-label { font-size: 0.78rem; color: var(--slate); font-weight: 600; min-width: 160px; }
.metadata-value { font-size: 0.82rem; color: var(--ink); font-weight: 500; }

/* ── CTA ──────────────────────────────────────────────────────────────────── */
.cta-buttons { display: flex; gap: 0.875rem; flex-wrap: wrap; }
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 180px;
}

.btn-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--navy);
  color: var(--gold);
}

.btn-primary:hover {
  background: #0f2a3d;
  box-shadow: 0 4px 12px rgba(26,58,82,0.3);
}

.btn-secondary {
  background: var(--border);
  color: var(--ink);
}

.btn-secondary:hover {
  background: #cbd5e1;
}

/* ── Registration Buttons ────── */
.registration-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-register {
  background: #2563eb;
  color: white;
  font-weight: 700;
}

.btn-register:hover:not(:disabled) {
  background: #1d4ed8;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.btn-register:active:not(:disabled) {
  transform: translateY(0);
}

.btn-capacity-full {
  background: #6b7280;
  color: white;
}

.btn-capacity-full:hover:not(:disabled) {
  background: #4b5563;
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.btn-unregister {
  background: #ef4444;
  color: white;
  font-weight: 700;
}

.btn-unregister:hover:not(:disabled) {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.btn-unregister:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none !important;
}

.loading-spinner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-spinner::after {
  content: '';
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ── Responsive ────── */
@media (max-width: 640px) {
  .detail-main {
    padding: 1.25rem;
  }

  .detail-title {
    font-size: 1.5rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    min-width: unset;
  }

  .metadata-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }

  .metadata-label {
    min-width: unset;
  }
}

/* ── Alerts ────── */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-success {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #10b981;
}

.alert-success svg {
  color: #10b981;
  flex-shrink: 0;
}

.alert-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #ef4444;
}

.alert-error svg {
  color: #ef4444;
  flex-shrink: 0;
}

/* ── Modal de Confirmación ────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #ffffff; /* Cambia var(--surface) por #ffffff directamente */
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  max-width: 420px;
  width: 90%;
  padding: 0;
  animation: slideUp 0.3s ease;
  z-index: 10000; /* Asegúrate de que esté por encima de todo */
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header svg {
  flex-shrink: 0;
}

.modal-title {
  font-family: 'Fraunces', serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.6;
  margin: 0 0 1rem;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-body strong {
  font-weight: 700;
  color: #ef4444;
}

.modal-subtext {
  font-size: 0.85rem;
  color: var(--slate);
  font-style: italic;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--border);
}

.modal-btn {
  flex: 1;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.modal-btn--cancel {
  background: var(--border);
  color: var(--ink);
}

.modal-btn--cancel:hover {
  background: #cbd5e1;
}

.modal-btn--danger {
  background: #ef4444;
  color: white;
}

.modal-btn--danger:hover {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Responsive ────── */
@media (max-width: 640px) {
  .modal-content {
    width: 95%;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
  }
}
</style>
