<template>
  <div class="calendar-wrapper">
    <div class="calendar-container">
      <div class="calendar-header">
        <button @click="previousMonth" class="nav-btn" title="Mes anterior">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="month-year">{{ monthYear }}</div>
        <button @click="nextMonth" class="nav-btn" title="Siguiente mes">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div class="weekdays">
        <div class="weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
      </div>

      <div class="calendar-grid">
        <div
          v-for="(date, index) in filteredCalendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'other-month': !date.isCurrentMonth,
            'today': date.isToday,
            'has-events': date.events.length > 0,
            'has-filtered-events': date.filteredEvents.length > 0
          }"
          @click="selectDate(date)"
        >
          <div class="day-number">{{ date.day }}</div>
          <div class="events-indicator" v-if="date.filteredEvents.length > 0">
            <span class="event-count">{{ date.filteredEvents.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel lateral con filtros y eventos -->
    <div class="sidebar">
      <div class="filters-section">
        <h3 class="filters-title">Filtros</h3>
        
        <div class="filter-group">
          <label class="filter-label">Carrera</label>
          <select v-model="selectedCareer" class="filter-select">
            <option value="">Todas las carreras</option>
            <option value="informatica">Ingeniería Informática</option>
            <option value="sistemas">Ingeniería de Sistemas</option>
            <option value="administracion">Administración de Empresas</option>
            <option value="contabilidad">Contabilidad</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Categoría</label>
          <select v-model="selectedCategory" class="filter-select">
            <option value="">Todas las categorías</option>
            <option value="conferencia">Conferencia</option>
            <option value="taller">Taller</option>
            <option value="examen">Examen</option>
            <option value="reunion">Reunión</option>
            <option value="tutoria">Tutoría</option>
          </select>
        </div>

        <button @click="clearFilters" class="clear-filters-btn">Limpiar filtros</button>
      </div>

      <!-- Evento seleccionado -->
      <transition name="fade">
        <div class="selected-date-section" v-if="selectedDate">
          <h3 class="selected-date-title">{{ formatDateTitle(selectedDate) }}</h3>
          <div v-if="selectedDate.filteredEvents.length === 0" class="no-events">
            <p v-if="selectedDate.events.length > 0">
              No hay eventos que coincidan con los filtros
            </p>
            <p v-else>
              No hay eventos programados para esta fecha
            </p>
          </div>
          <div v-else class="events-list">
            <div v-for="event in selectedDate.filteredEvents" :key="event.id" class="event-item">
              <div class="event-time">{{ event.time }}</div>
              <div class="event-content">
                <h4>{{ event.title }}</h4>
                <p v-if="event.category" class="event-category">🏷️ {{ event.category }}</p>
                <p v-if="event.career" class="event-career">📚 {{ event.career }}</p>
                <p v-if="event.location" class="event-location">📍 {{ event.location }}</p>
                <p v-if="event.description" class="event-description">{{ event.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentDate = ref(new Date())
const selectedDate = ref(null)
const selectedCareer = ref('')
const selectedCategory = ref('')

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Mock data - Eventos de ejemplo con carrera y categoría
const mockEvents = {
  '2026-4-9': [
    { id: 1, title: 'Conferencia sobre Ciberseguridad 9', time: '09:13 - 11:13', location: 'Auditorio 2', description: 'Conferencia académica sobre ciberseguridad', career: 'Ingeniería Informática', category: 'Conferencia' }
  ],
  '2026-4-15': [
    { id: 2, title: 'Taller de Programación', time: '14:00 - 16:00', location: 'Lab 3', description: 'Desarrollo de aplicaciones web', career: 'Ingeniería Sistemas', category: 'Taller' }
  ],
  '2026-4-20': [
    { id: 3, title: 'Reunión de Estudiantes', time: '10:00 - 11:00', location: 'Sala 101', description: 'Planificación del semestre', career: 'Administración de Empresas', category: 'Reunión' },
    { id: 4, title: 'Tutoría', time: '15:00 - 16:30', location: 'Oficina 5', description: 'Revisión de trabajos', career: 'Ingeniería Informática', category: 'Tutoría' }
  ],
  '2026-4-25': [
    { id: 5, title: 'Examen Parcial', time: '08:00 - 10:00', location: 'Auditorio 1', description: 'Matemáticas II', career: 'Ingeniería Sistemas', category: 'Examen' }
  ]
}

// Mapeo de carreras a valores cortos para filtrado
const careerMap = {
  'informatica': 'Ingeniería Informática',
  'sistemas': 'Ingeniería de Sistemas',
  'administracion': 'Administración de Empresas',
  'contabilidad': 'Contabilidad'
}

const categoryMap = {
  'conferencia': 'Conferencia',
  'taller': 'Taller',
  'examen': 'Examen',
  'reunion': 'Reunión',
  'tutoria': 'Tutoría'
}

const monthYear = computed(() => {
  const options = { year: 'numeric', month: 'long' }
  return currentDate.value.toLocaleDateString('es-ES', options).replace(/^\w/, (c) => c.toUpperCase())
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevLastDay = new Date(year, month, 0)

  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  let date = new Date(startDate)

  while (date <= lastDay || days.length % 7 !== 0) {
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    const isCurrentMonth = date.getMonth() === month
    const isToday = isDateToday(date)

    const dayEvents = getEventsForDate(dateStr)
    const filteredDayEvents = filterEvents(dayEvents)

    days.push({
      day: date.getDate(),
      date: new Date(date),
      dateStr,
      isCurrentMonth,
      isToday,
      events: dayEvents,
      filteredEvents: filteredDayEvents
    })

    date.setDate(date.getDate() + 1)
  }

  return days
})

const filteredCalendarDays = computed(() => {
  return calendarDays.value.map(day => ({
    ...day,
    filteredEvents: filterEvents(day.events)
  }))
})

function filterEvents(events) {
  return events.filter(event => {
    const careerMatch = !selectedCareer.value || event.career === careerMap[selectedCareer.value]
    const categoryMatch = !selectedCategory.value || event.category === categoryMap[selectedCategory.value]
    return careerMatch && categoryMatch
  })
}

function getEventsForDate(dateStr) {
  return mockEvents[dateStr] || []
}

function isDateToday(date) {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  selectedDate.value = null
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  selectedDate.value = null
}

function selectDate(date) {
  selectedDate.value = date
}

function clearFilters() {
  selectedCareer.value = ''
  selectedCategory.value = ''
}

function formatDateTitle(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  return date.date.toLocaleDateString('es-ES', options).replace(/^\w/, (c) => c.toUpperCase())
}
</script>

<style scoped>
.calendar-wrapper {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.calendar-container {
  display: flex;
  flex-direction: column;
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

.nav-btn:hover {
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

.calendar-day.has-events {
  background: #E8F4FF;
  border-color: #3B82F6;
}

.calendar-day.has-filtered-events {
  background: #E8F4FF;
  border-color: #3B82F6;
}

.calendar-day.has-events.today {
  background: #FFF0D6;
  border-color: #FFD200;
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

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  max-height: 800px;
  overflow-y: auto;
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

.filter-select:hover {
  border-color: #FFD200;
}

.filter-select:focus {
  outline: none;
  border-color: #FFD200;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
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

.clear-filters-btn:hover {
  background: #FFD200;
  border-color: #FFD200;
}

.selected-date-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.selected-date-title {
  color: #1a3a52;
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 700;
  word-break: break-word;
}

.no-events {
  text-align: center;
  color: #64748b;
  padding: 1rem 0;
  font-style: italic;
  font-size: 0.9rem;
}

.no-events p {
  margin: 0;
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
  color: #8b5cf6;
  font-size: 0.8rem;
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
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .sidebar {
    max-height: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .filters-section {
    grid-column: 1 / 2;
  }

  .selected-date-section {
    grid-column: 2 / 3;
  }
}

@media (max-width: 768px) {
  .calendar-wrapper {
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

  .sidebar {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .selected-date-section {
    grid-column: auto;
  }
}
</style>
