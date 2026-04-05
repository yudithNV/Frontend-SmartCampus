<template>
  <div class="events-feed-page">
    <PasswordChangedBanner />

    <!-- ── HEADER ───────── -->
    <div class="feed-header">
      <div class="feed-header__left">
        <div class="feed-header__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div>
          <h1 class="feed-header__title">Muro de Eventos</h1>
          <p class="feed-header__sub">Explora y participa en las actividades de la comunidad UCB</p>
        </div>
      </div>
    </div>

    <!-- ── EMPTY STATE ────────────────────────────────────────────── -->
    <div v-if="loading" class="feed-list">
      <div v-for="i in 3" :key="i" class="event-card skeleton-blink" style="height: 200px; background: #edeff2; border: none;"></div>
    </div>

    <div v-else-if="eventos.length > 0" class="feed-list">
      <article
        v-for="(evento, i) in eventos"
        :key="evento.id"
        class="event-card"
        :style="{ '--delay': i * 0.08 + 's' }"
        @click="goToDetail(evento.id)"
      >
        <div class="event-card__header">
          <div class="author-avatar">{{ getInitials(evento.authorName) }}</div>
          <div class="author-meta">
            <span class="author-name">{{ evento.authorName }}</span>
            <span class="event-date">{{ formatDateTime(evento.createdAt) }}</span>
          </div>
        </div>

        <div class="event-card__body">
          <h2 class="event-card__title">{{ evento.name }}</h2>
          <p class="event-card__text">{{ evento.description }}</p>
          <div class="event-meta-info">
            <span class="meta-tag">📅 {{ formatDate(evento.startDatetime) }}</span>
            <span class="meta-tag">🎯 {{ evento.eventType }}</span>
          </div>
        </div>

        <div v-if="evento.posterUrl" class="event-card__media">
          <img :src="evento.posterUrl" :alt="evento.name" class="event-card__img" />
        </div>
      </article>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state__visual">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <h3>No hay eventos publicados</h3>
      <p>Vuelve pronto para encontrar eventos del campus.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PasswordChangedBanner from '../../components/PasswordChangedBanner.vue'

const router = useRouter()
const eventos = ref([])
const loading = ref(true) // <--- AÑADE ESTA LÍNEA1.

// PA: Los eventos deben mostrarse en orden descendente (lo más reciente primero)
// Nota: El orden DESC debe venir preferiblemente desde el Backend en la consulta SQL
const fetchEventos = async () => {
  loading.value = true // <--- AÑADE ESTA LÍNEA2.
  try {
    const response = await fetch('http://localhost:8081/api/events')
    const result = await response.json()
    // El endpoint devuelve { success, message, data: [...] }
    eventos.value = result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error("Error al cargar eventos:", error)
  } finally {
    loading.value = false // <--- AÑADE ESTA LÍNEA3.
  }
}

// PA: Redirigir a la vista detallada del evento
const goToDetail = (id) => {
  router.push(`/estudiante/eventos/${id}`)
}

const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('es-BO', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return d.toLocaleString('es-BO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

onMounted(fetchEventos)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');

.events-feed-page {
  --navy:    #1a3a52;
  --gold:    #FFD200;
  --ink:     #0f1f2e;
  --slate:   #64748b;
  --muted:   #94a3b8;
  --surface: #ffffff;
  --bg:      #f0f2f5;
  --border:  #e2e8f0;
  --radius:  12px;

  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  padding: 0 0 4rem;
}

/* ── Header ───────── */
.feed-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1.5rem 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

.feed-header__left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.feed-header__icon {
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

.feed-header__title {
  font-family: 'Fraunces', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 0.1rem;
  line-height: 1.2;
}

.feed-header__sub {
  font-size: 0.78rem;
  color: var(--slate);
  margin: 0;
}

/* ── Feed list ──────── */
.feed-list {
  max-width: 680px;
  margin: 0 auto;
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Card ────────── */
.event-card {
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
  animation: cardReveal 0.45s ease both;
  animation-delay: var(--delay, 0s);
  transition: box-shadow 0.2s, cursor 0.2s;
  cursor: pointer;
}

.event-card:hover {
  box-shadow: 0 4px 20px rgba(26,58,82,0.1);
}

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Card Header (autor) ────── */
.event-card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.1rem 0.6rem;
}

.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--navy), #2e6a8a);
  color: var(--gold);
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.5px;
}

.author-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.author-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.2;
}

.event-date {
  font-size: 0.75rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* ── Card Body ──────── */
.event-card__body {
  padding: 0.5rem 1.1rem 0.9rem;
}

.event-card__title {
  font-family: 'Fraunces', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 0.55rem;
  line-height: 1.35;
}

.event-card__text {
  font-size: 0.9rem;
  color: #374151;
  margin: 0 0 0.7rem;
  line-height: 1.7;
  white-space: pre-line;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-meta-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-tag {
  font-size: 0.8rem;
  color: var(--slate);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

/* ── Card Media ──────────────── */
.event-card__media {
  width: 100%;
  overflow: hidden;
  background: #e8f0f6;
  margin-top: 0.5rem;
}

.event-card__img {
  width: 100%;
  display: block;
  object-fit: cover;
  max-height: 380px;
  transition: transform 0.4s ease;
}

.event-card:hover .event-card__img {
  transform: scale(1.02);
}

/* ── Empty State ───────── */
.empty-state {
  margin: 4rem auto;
  text-align: center;
  max-width: 380px;
  padding: 0 1.5rem;
}

.empty-state__visual {
  width: 88px;
  height: 88px;
  background: #e8f0f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  color: #7fa8c4;
}

.empty-state h3 {
  font-family: 'Fraunces', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 0.875rem;
  color: var(--slate);
  margin: 0;
  line-height: 1.6;
}

.skeleton-blink {
  animation: pulse 1.5s infinite ease-in-out;
  border: none !important;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

/* ── Responsive ──────────── */
@media (max-width: 720px) {
  .feed-list { padding: 0; }
  .event-card { border-radius: 0; border-left: none; border-right: none; }
}
</style>