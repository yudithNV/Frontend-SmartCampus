<template>
  <div class="calendar-wrapper" :class="{ 'sidebar-visible': selectedDate }">
    <div class="calendar-container">
      <div class="calendar-header">
        <button @click="previousMonth" class="nav-btn" title="Mes anterior" :disabled="loading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="month-year">{{ monthYear }}</div>
        <button @click="nextMonth" class="nav-btn" title="Siguiente mes" :disabled="loading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <button @click="toggleFiltersSidebar" class="filter-btn" title="Filtrar eventos">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          Filtrar
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando eventos...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>Error al cargar eventos</h3>
        <p>{{ error }}</p>
        <button @click="loadCalendarEvents" class="btn-retry">Reintentar</button>
      </div>

      <!-- Calendar Content -->
      <template v-else>
        <div class="weekdays">
          <div class="weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
        </div>

        <div class="calendar-grid">
          <div
            v-for="(date, index) in calendarDays"
            :key="index"
            class="calendar-day"
            :class="{
              'other-month': !date.isCurrentMonth,
              'today': date.isToday,
              'has-events': date.events.length > 0,
              'has-filtered-events': date.filteredEvents.length > 0,
              'has-past-events': date.hasPastEvents,
              'is-selected': date.dateStr === selectedDate?.dateStr
            }"
            @click="selectDate(date)"
          >
            <div class="day-number">{{ date.day }}</div>
            <div class="events-indicator" v-if="date.filteredEvents.length > 0">
              <span class="event-count">{{ date.filteredEvents.length }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Filters Sidebar -->
    <aside class="event-sidebar" :class="{ 'visible': selectedDate || showFiltersSidebar }">
      <!-- Evento Seleccionado - Prioridad 1 -->
      <template v-if="selectedDate">
        <div class="sidebar-header">
          <h3 class="selected-date-title">{{ formatDateTitle(selectedDate) }}</h3>
          <button @click="closeSidebar" class="close-sidebar-btn" title="Cerrar panel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Loading eventos del día -->
        <div v-if="loadingDayEvents" class="loading-day">
          <div class="spinner-small"></div>
          <p>Cargando eventos...</p>
        </div>

        <!-- No hay eventos -->
        <div v-else-if="selectedDate.filteredEvents.length === 0" class="no-events">
          <p v-if="selectedDate.events.length > 0 && (selectedCareerId || selectedCategoryId)">
            No se encontraron eventos con esos filtros
          </p>
          <p v-else-if="selectedDate.events.length > 0">
            No hay eventos que coincidan con los filtros
          </p>
          <p v-else>
            No hay eventos programados para esta fecha
          </p>
          <button @click="goToEvents" class="btn-view-events">Ver eventos disponibles</button>
        </div>

        <!-- Lista de eventos -->
        <div v-else class="events-list">
          <div 
            v-for="event in selectedDate.filteredEvents" 
            :key="event.id" 
            class="event-item"
            @click="goToEventDetail(event.id)"
          >
            <div class="event-time">{{ formatEventTime(event.startDatetime, event.endDatetime) }}</div>
            <div class="event-content">
              <h4>{{ event.name }}</h4>
              <p v-if="event.category" class="event-category" :style="{ color: event.category.colorHex }">
                🏷️ {{ event.category.name }}
              </p>
              <p v-if="event.career" class="event-career">📚 {{ event.career.name }}</p>
              <p v-if="event.location" class="event-location">📍 {{ event.location.name }} ({{ event.location.block }})</p>
              <p v-if="event.description" class="event-description">{{ event.description }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Filtros - Prioridad 2 (si NO hay evento seleccionado) -->
      <template v-else-if="showFiltersSidebar">
        <div class="sidebar-header">
          <h3 class="filters-title">Filtros</h3>
          <button @click="closeFiltersSidebar" class="close-sidebar-btn" title="Cerrar filtros">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="filters-section">
          <div class="filter-group">
            <label class="filter-label">Carrera</label>
            <select v-model="selectedCareerId" @change="applyFilters" class="filter-select" :disabled="loadingFilters">
              <option value="">Todas las carreras</option>
              <option v-for="career in careers" :key="career.id" :value="career.id">
                {{ career.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Categoría</label>
            <select v-model="selectedCategoryId" @change="applyFilters" class="filter-select" :disabled="loadingFilters">
              <option value="">Todas las categorías</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <button 
            @click="clearFilters" 
            class="clear-filters-btn" 
            :disabled="!selectedCareerId && !selectedCategoryId"
          >
            Limpiar filtros
          </button>
        </div>
      </template>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { eventService, careerService, categoryService } from '../../services/api'
import { eventBus } from '../../utils'

const router = useRouter()

const currentDate = ref(new Date())
const selectedDate = ref(null)
const showFiltersSidebar = ref(false)
const selectedCareerId = ref('')
const selectedCategoryId = ref('')

const loading = ref(false)
const error = ref(null)
const loadingFilters = ref(false)
const loadingDayEvents = ref(false)

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const events = ref([])
const careers = ref([])
const categories = ref([])

const monthYear = computed(() => {
  const options = { year: 'numeric', month: 'long' }
  return currentDate.value.toLocaleDateString('es-ES', options).replace(/^\w/, (c) => c.toUpperCase())
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  let date = new Date(startDate)

  while (date <= lastDay || days.length % 7 !== 0) {
    const year = date.getFullYear()
    const month_padded = String(date.getMonth() + 1).padStart(2, '0')
    const day_padded = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month_padded}-${day_padded}`
    const isCurrentMonth = date.getMonth() === month
    const isToday = isDateToday(date)

    const dayEvents = getEventsForDate(dateStr)
    const filteredDayEvents = filterEvents(dayEvents)
    
    // Detectar si los eventos de este día ya pasaron
    const hasPastEvents = dayEvents.length > 0 && dayEvents.some(event => {
      const eventEndDate = new Date(event.endDatetime)
      const now = new Date()
      return eventEndDate < now
    })

    days.push({
      day: date.getDate(),
      date: new Date(date),
      dateStr,
      isCurrentMonth,
      isToday,
      events: dayEvents,
      filteredEvents: filteredDayEvents,
      hasPastEvents
    })

    date.setDate(date.getDate() + 1)
  }

  return days
})

function getEventsForDate(dateStr) {
  return events.value.filter(event => {
    // Extraer fecha del string ISO (YYYY-MM-DD) evitando problemas de zona horaria
    const eventDatePart = event.startDatetime.split('T')[0]
    return eventDatePart === dateStr
  })
}

function filterEvents(eventsList) {
  return eventsList.filter(event => {
    // Convertimos a número para asegurar la comparación
    const careerId = selectedCareerId.value ? parseInt(selectedCareerId.value) : null;
    const categoryId = selectedCategoryId.value ? parseInt(selectedCategoryId.value) : null;

    const careerMatch = !careerId || (event.career && event.career.id === careerId);
    // Usamos categoryId directamente de la raíz del objeto según tu JSON
    const categoryMatch = !categoryId || (event.categoryId === categoryId);
    
    return careerMatch && categoryMatch;
  })
}

function isDateToday(date) {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function formatDateTitle(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return date.date.toLocaleDateString('es-ES', options).replace(/^\w/, (c) => c.toUpperCase())
}

function formatEventTime(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const startTime = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const endTime = endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return `${startTime} - ${endTime}`
}

async function loadCalendarEvents() {
  loading.value = true
  error.value = null
  try {
    // Calcular el rango de fechas visible en el calendario
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // startDate: primer día visible (puede incluir días del mes anterior)
    const calendarStartDate = new Date(firstDay)
    calendarStartDate.setDate(calendarStartDate.getDate() - firstDay.getDay())
    
    // endDate: último día visible (puede incluir días del mes siguiente)
    let calendarEndDate = new Date(lastDay)
    const daysUntilSunday = 6 - lastDay.getDay()
    calendarEndDate.setDate(calendarEndDate.getDate() + daysUntilSunday)
    
    // Formatear fechas a YYYY-MM-DD
    const formatDate = (date) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    
    const startDateStr = formatDate(calendarStartDate)
    const endDateStr = formatDate(calendarEndDate)
    
    // Llamar al API con los parámetros de fecha
    const data = await eventService.getRegistered(startDateStr, endDateStr)
    
    // La respuesta ahora viene en data.events en lugar de directamente
    events.value = Array.isArray(data?.data?.events) ? data.data.events : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []))
    
    // Actualizar selectedDate con eventos filtrados si está seleccionada
    if (selectedDate.value) {
      const updatedDate = calendarDays.value.find(d => d.dateStr === selectedDate.value.dateStr)
      if (updatedDate) {
        selectedDate.value = updatedDate
      }
    }
  } catch (err) {
    error.value = err.message || 'No se pudieron cargar los eventos'
    console.error('Error loading calendar events:', err)
  } finally {
    loading.value = false
  }
}

async function loadFiltersData() {
  loadingFilters.value = true
  try {
    const [careersData, categoriesData] = await Promise.all([
      careerService.getAll(),
      categoryService.getAll()
    ])
    careers.value = careersData?.data ?? careersData ?? []
    categories.value = categoriesData?.data ?? categoriesData ?? []
  } catch (err) {
    console.error('Error loading filter data:', err)
  } finally {
    loadingFilters.value = false
  }
}

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  selectedDate.value = null
  loadCalendarEvents()
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  selectedDate.value = null
  loadCalendarEvents()
}

function selectDate(date) {
  // Resetear los filtros
  selectedCareerId.value = ''
  selectedCategoryId.value = ''
  
  // Establecer la fecha seleccionada (esto trigger el recalc de filteredEvents en calendarDays)
  selectedDate.value = date
}

function closeSidebar() {
  selectedDate.value = null
}

function toggleFiltersSidebar() {
  showFiltersSidebar.value = !showFiltersSidebar.value
}

function closeFiltersSidebar() {
  showFiltersSidebar.value = false
}

async function applyFilters() {
  await loadCalendarEvents()
  // 1. Buscamos el primer día que tenga eventos con el filtro aplicado
  const firstDayWithEvents = calendarDays.value.find(day => day.filteredEvents.length > 0);
  
  if (firstDayWithEvents) {
    // 2. Forzamos a que el sidebar muestre ese día (ej. el día 30)
    selectedDate.value = firstDayWithEvents;
  } else {
    // Si no hay nada con ese filtro, podrías limpiar la selección o dejarla
    selectedDate.value = null; 
  }
}

function clearFilters() {
  selectedCareerId.value = ''
  selectedCategoryId.value = ''
  loadCalendarEvents()
}

function goToEventDetail(eventId) {
  router.push({ name: 'EventDetail', params: { id: eventId } })
}

function goToEvents() {
  router.push({ name: 'StudentEvents' })
}

onMounted(() => {
  loadFiltersData()
  loadCalendarEvents()
  
  // Escuchar evento cuando se inscribe a un evento
  eventBus.on('event-registered', loadCalendarEvents)
})

onUnmounted(() => {
  // Limpiar listener cuando se desmonta el componente
  eventBus.off('event-registered', loadCalendarEvents)
})
</script>

<style scoped>
.calendar-wrapper {
  display: flex;
  gap: 2rem;
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.calendar-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
}

.nav-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  color: #1a3a52;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  background: #FFD200;
  border-color: #FFD200;
  color: #1a3a52;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: #1a3a52;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  margin-left: auto;
}

.filter-btn:hover {
  background: #FFD200;
  border-color: #FFD200;
  color: #1a3a52;
}

.month-year {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a3a52;
  min-width: 200px;
  text-align: center;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem 2rem;
  min-height: 300px;
}

.loading-state {
  color: #64748b;
}

.error-state {
  color: #ef4444;
  text-align: center;
}

.error-state h3 {
  margin: 0.5rem 0;
}

.error-state p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.spinner {
  border: 4px solid #e2e8f0;
  border-top: 4px solid #FFD200;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.spinner-small {
  border: 3px solid #e2e8f0;
  border-top: 3px solid #FFD200;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-retry {
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.btn-retry:hover {
  background: #dc2626;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.weekday {
  text-align: center;
  font-weight: 600;
  color: #1a3a52;
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-day {
  aspect-ratio: 1;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  background: #ffffff;
  min-height: 80px;
}

.calendar-day:hover {
  border-color: #FFD200;
  box-shadow: 0 2px 8px rgba(255, 210, 0, 0.15);
}

.calendar-day.other-month {
  background: #f8fafc;
  color: #cbd5e1;
}

.calendar-day.today {
  background: #FFF8E7;
  border-color: #FFD200;
  font-weight: 600;
}

.calendar-day.is-selected {
  border: 3px solid #3B82F6;
  background: #E0F0FF;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
}

.calendar-day.has-events {
  background: #E8F4FF;
  border-color: #3B82F6;
}

.calendar-day.has-filtered-events {
  background: #E8F4FF;
  border-color: #3B82F6;
}

.calendar-day.has-past-events {
  background: #E5E7EB;
  border-color: #9CA3AF;
  opacity: 0.7;
}

.calendar-day.has-events.today {
  background: #FFF0D6;
  border-color: #FFD200;
}

.calendar-day.has-past-events.today {
  background: #FFF0D6;
  border-color: #FFD200;
  opacity: 1;
}

.day-number {
  font-weight: 600;
  color: #1a3a52;
  font-size: 0.9rem;
}

.calendar-day.other-month .day-number {
  color: #cbd5e1;
}

.events-indicator {
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-count {
  background: #3B82F6;
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

.calendar-day.today .event-count {
  background: #FFD200;
  color: #1a3a52;
}

.calendar-day.has-past-events .event-count {
  background: #9CA3AF;
  color: white;
}

.calendar-day.has-past-events.today .event-count {
  background: #FFD200;
  color: #1a3a52;
}

/* Sidebar */
.event-sidebar {
  display: none;
  flex-direction: column;
  gap: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  min-width: 340px;
  max-width: 380px;
  max-height: 800px;
  overflow-y: auto;
  flex-shrink: 0;
}

.event-sidebar.visible {
  display: flex;
  animation: slideIn 0.3s ease-out;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filters-title {
  margin: 0;
  color: #1a3a52;
  font-size: 1.1rem;
  font-weight: 700;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  color: #1a3a52;
  font-weight: 600;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  color: #1a3a52;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:hover:not(:disabled) {
  border-color: #FFD200;
}

.filter-select:focus {
  outline: none;
  border-color: #FFD200;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

.filter-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-filters-btn {
  padding: 0.75rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #1a3a52;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.clear-filters-btn:hover:not(:disabled) {
  background: #FFD200;
  border-color: #FFD200;
}

.clear-filters-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.close-sidebar-btn {
  position: static;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  color: #1a3a52;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-sidebar-btn:hover {
  background: #FFD200;
  border-color: #FFD200;
  color: #1a3a52;
}

.selected-date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.selected-date-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.selected-date-title {
  color: #1a3a52;
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  word-break: break-word;
}

.loading-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0;
  color: #64748b;
  text-align: center;
}

.loading-day p {
  margin: 0;
  font-size: 0.9rem;
}

.no-events {
  text-align: center;
  color: #64748b;
  padding: 1rem 0;
  font-style: italic;
  font-size: 0.9rem;
}

.no-events p {
  margin: 0 0 1rem 0;
}

.btn-view-events {
  padding: 0.75rem 1.5rem;
  background: #FFD200;
  color: #1a3a52;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view-events:hover {
  background: #FFC700;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 210, 0, 0.3);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  background: #f8fafc;
  border-left: 4px solid #3B82F6;
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.event-item:hover {
  background: #e2e8f0;
  transform: translateX(4px);
}

.event-time {
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a3a52;
}

.event-content h4 {
  margin: 0;
  color: #1a3a52;
  font-size: 0.9rem;
}

.event-category {
  margin: 0.25rem 0;
  font-size: 0.8rem;
  font-weight: 600;
}

.event-career {
  margin: 0.25rem 0;
  color: #0891b2;
  font-size: 0.8rem;
}

.event-location {
  margin: 0.25rem 0;
  color: #64748b;
  font-size: 0.8rem;
}

.event-description {
  margin: 0.5rem 0 0 0;
  color: #475569;
  font-size: 0.8rem;
  line-height: 1.3;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .calendar-wrapper {
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .event-sidebar {
    max-height: none;
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .calendar-wrapper {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .calendar-day {
    min-height: 70px;
    font-size: 0.85rem;
  }

  .month-year {
    font-size: 1.2rem;
    min-width: auto;
  }

  .event-sidebar {
    padding: 1rem;
    width: 100%;
    max-width: 100%;
  }

  .filter-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
