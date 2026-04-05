<template>
  <div class="events-container">
    <PasswordChangedBanner />
    
    <header class="page-header">
      <div class="header-icon-box">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <div class="header-text">
        <h2>Muro de Eventos</h2>
        <p>Explora y participa en las actividades de la comunidad UCB</p>
      </div>
    </header>

    <div class="events-list">
      <div 
        v-for="evento in eventos" 
        :key="evento.id" 
        class="event-card"
        @click="goToDetail(evento.id)" 
      >
        <div class="event-thumb">
          <img :src="evento.posterUrl || '/placeholder-event.png'" alt="Evento">
        </div>

        <div class="event-body">
          <div class="event-main-info">
            <h3>{{ evento.name }}</h3>
            <div class="event-meta">
              <span class="meta-item">📅 {{ formatDate(evento.startDatetime) }}</span>
              <span class="meta-item">🎯 {{ evento.eventType }}</span>
            </div>
          </div>
          <div class="event-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PasswordChangedBanner from '../../components/PasswordChangedBanner.vue'

const router = useRouter()
const eventos = ref([])

// PA: Los eventos deben mostrarse en orden descendente (lo más reciente primero)
// Nota: El orden DESC debe venir preferiblemente desde el Backend en la consulta SQL
const fetchEventos = async () => {
  try {
    const response = await fetch('http://localhost:8081/api/events')
    const result = await response.json()
    // El endpoint devuelve { success, message, data: [...] }
    eventos.value = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error("Error al cargar eventos:", error)
  }
}

// PA: Redirigir a la vista detallada del evento
const goToDetail = (id) => {
  router.push(`/estudiante/eventos/${id}`)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('es-BO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(fetchEventos)
</script>

<style scoped>
.events-container {
  padding: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.header-icon-box {
  background: #f1f5f9;
  padding: 12px;
  border-radius: 10px;
  color: #1a3a52;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.event-card:hover {
  transform: translateX(5px);
  border-color: #FFD200;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.event-thumb {
  width: 180px;
  min-width: 180px;
  height: 120px;
}

.event-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-body {
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
}

.event-main-info h3 {
  color: #1a3a52;
  margin-bottom: 0.5rem;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.9rem;
  color: #64748b;
}

.event-arrow {
  color: #cbd5e1;
}
</style>