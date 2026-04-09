<template>
  <div class="landing">
    <Header @go-to-login="$router.push('/login')" />
    <Hero />
    <Features />

    <!-- ══════════════════════════════════════════════════════════════
         SECCIÓN: EVENTOS DESTACADOS (público, sin token)
    ══════════════════════════════════════════════════════════════ -->
    <section class="section-public" id="eventos">
      <div class="section-container">
        <div class="section-header">
          <span class="section-badge">📅 Próximos Eventos</span>
          <h2 class="section-title">Eventos en la UCB</h2>
          <p class="section-subtitle">
            Entérate de los eventos académicos y culturales de la universidad.
          </p>
        </div>

        <!-- Estado: cargando -->
        <div v-if="loadingEvents" class="cards-grid">
          <div v-for="n in 3" :key="n" class="card card-skeleton"></div>
        </div>

        <!-- Estado: error -->
        <div v-else-if="errorEvents" class="empty-state">
          <p>No se pudieron cargar los eventos. Intenta más tarde.</p>
        </div>

        <!-- Estado: sin resultados -->
        <div v-else-if="events.length === 0" class="empty-state">
          <p>No hay eventos disponibles por el momento.</p>
        </div>

        <!-- Tarjetas de eventos -->
        <div v-else class="cards-grid">
          <div
            v-for="event in events"
            :key="event.id"
            class="card"
          >
            <div class="card-img-wrapper">
              <img
                v-if="event.posterUrl"
                :src="event.posterUrl"
                :alt="event.name"
                class="card-img"
              />
              <div v-else class="card-img-placeholder">
                <span class="placeholder-icon">📅</span>
              </div>
              <span class="card-badge card-badge--event">{{ formatEventType(event.eventType) }}</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ event.name }}</h3>
              <p class="card-meta">
                <span class="meta-icon">📍</span> {{ event.location || 'Por confirmar' }}
              </p>
              <p class="card-meta">
                <span class="meta-icon">🗓</span> {{ formatDate(event.startDatetime) }}
              </p>
              <p class="card-desc">{{ truncate(event.description, 100) }}</p>
              <button class="btn-ver-mas" @click="goToLogin">
                Ver más →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════════════════
         SECCIÓN: NOTICIAS DESTACADAS (público, sin token)
    ══════════════════════════════════════════════════════════════ -->
    <section class="section-public section-public--alt" id="noticias">
      <div class="section-container">
        <div class="section-header">
          <span class="section-badge">📰 Últimas Noticias</span>
          <h2 class="section-title">Noticias de la UCB</h2>
          <p class="section-subtitle">
            Mantente informado con las últimas noticias institucionales.
          </p>
        </div>

        <!-- Estado: cargando -->
        <div v-if="loadingNews" class="cards-grid">
          <div v-for="n in 3" :key="n" class="card card-skeleton"></div>
        </div>

        <!-- Estado: error -->
        <div v-else-if="errorNews" class="empty-state">
          <p>No se pudieron cargar las noticias. Intenta más tarde.</p>
        </div>

        <!-- Estado: sin resultados -->
        <div v-else-if="news.length === 0" class="empty-state">
          <p>No hay noticias disponibles por el momento.</p>
        </div>

        <!-- Tarjetas de noticias -->
        <div v-else class="cards-grid">
          <div
            v-for="article in news"
            :key="article.id"
            class="card"
          >
            <div class="card-img-wrapper">
              <img
                v-if="article.coverUrl || article.imageUrl"
                :src="article.coverUrl || article.imageUrl"
                :alt="article.title"
                class="card-img"
              />
              <div v-else class="card-img-placeholder">
                <span class="placeholder-icon">📰</span>
              </div>
              <span class="card-badge card-badge--news">{{ formatNewsCategory(article.category) }}</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ article.title }}</h3>
              <p class="card-meta">
                <span class="meta-icon">🗓</span> {{ formatDate(article.createdAt) }}
              </p>
              <p class="card-desc">{{ truncate(article.body || article.content, 100) }}</p>
              <button class="btn-ver-mas" @click="goToLogin">
                Ver más →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CTA />
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import Header   from '../components/Header.vue'
import Hero     from '../components/Hero.vue'
import Features from '../components/Features.vue'
import CTA      from '../components/CTA.vue'
import Footer   from '../components/Footer.vue'

import { eventService, newsService } from '../services/api.js'

const router = useRouter()

// ── Estado de eventos ──────────────────────────────────────────────
const events       = ref([])
const loadingEvents = ref(true)
const errorEvents   = ref(false)

// ── Estado de noticias ─────────────────────────────────────────────
const news       = ref([])
const loadingNews = ref(true)
const errorNews   = ref(false)

// ── Máximo de tarjetas visibles en la landing ──────────────────────
const MAX_CARDS = 3

// ── Carga de datos al montar el componente ─────────────────────────
onMounted(async () => {
  await Promise.allSettled([fetchEvents(), fetchNews()])
})

async function fetchEvents() {
  try {
    loadingEvents.value = true
    errorEvents.value   = false
    const response = await eventService.getUpcoming()
    // El backend devuelve { success, message, data: [...] }
    const list = response?.data ?? response
    events.value = Array.isArray(list) ? list.slice(0, MAX_CARDS) : []
  } catch (e) {
    console.error('Error al cargar eventos:', e)
    errorEvents.value = true
  } finally {
    loadingEvents.value = false
  }
}

async function fetchNews() {
  try {
    loadingNews.value = true
    errorNews.value   = false
    const response = await newsService.getAll()
    const list = response?.data ?? response
    news.value = Array.isArray(list) ? list.slice(0, MAX_CARDS) : []
  } catch (e) {
    console.error('Error al cargar noticias:', e)
    errorNews.value = true
  } finally {
    loadingNews.value = false
  }
}

// ── Redirigir a login al hacer "Ver más" ───────────────────────────
function goToLogin() {
  router.push('/login')
}

// ── Helpers de formato ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return 'Fecha no disponible'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-BO', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

function truncate(text, maxLength) {
  if (!text) return 'Sin descripción disponible.'
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text
}

function formatEventType(type) {
  const map = {
    ACADEMICO:  'Académico',
    CULTURAL:   'Cultural',
    DEPORTIVO:  'Deportivo',
    SOCIAL:     'Social',
    OTRO:       'Otro'
  }
  return map[type] || type || 'Evento'
}

function formatNewsCategory(category) {
  const map = {
    ACADEMICO:      'Académico',
    INSTITUCIONAL:  'Institucional',
    CULTURAL:       'Cultural',
    DEPORTIVO:      'Deportivo',
    OTRO:           'Otro'
  }
  return map[category] || category || 'Noticia'
}
</script>

<style scoped>
/* ── Sección contenedora ──────────────────────────────────────────── */
.section-public {
  padding: 5rem 2rem;
  background: #ffffff;
}

.section-public--alt {
  background: #f8f9fa;
}

.section-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Encabezado de sección ────────────────────────────────────────── */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-badge {
  display: inline-block;
  background: #fff8d6;
  color: #7a5c00;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  font-family: 'Poppins', 'Inter', -apple-system, sans-serif;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a3a52;
  margin-bottom: 0.75rem;
  font-family: 'Poppins', 'Inter', -apple-system, sans-serif;
}

.section-subtitle {
  font-size: 1rem;
  color: #6b7280;
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ── Grid de tarjetas ─────────────────────────────────────────────── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.75rem;
}

/* ── Tarjeta ──────────────────────────────────────────────────────── */
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

/* ── Imagen de tarjeta ────────────────────────────────────────────── */
.card-img-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f3f4f6;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f8;
}

.placeholder-icon {
  font-size: 2.5rem;
  opacity: 0.4;
}

/* ── Badge sobre la imagen ────────────────────────────────────────── */
.card-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-family: 'Poppins', 'Inter', -apple-system, sans-serif;
}

.card-badge--event {
  background: #FFD200;
  color: #1a3a52;
}

.card-badge--news {
  background: #1a3a52;
  color: #ffffff;
}

/* ── Cuerpo de tarjeta ────────────────────────────────────────────── */
.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a3a52;
  margin-bottom: 0.5rem;
  line-height: 1.4;
  font-family: 'Poppins', 'Inter', -apple-system, sans-serif;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  font-size: 0.82rem;
  color: #6b7280;
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.meta-icon {
  font-size: 0.85rem;
}

.card-desc {
  font-size: 0.88rem;
  color: #6b7280;
  line-height: 1.55;
  margin: 0.75rem 0 1.25rem;
  flex: 1;
}

/* ── Botón "Ver más" ──────────────────────────────────────────────── */
.btn-ver-mas {
  align-self: flex-start;
  background: transparent;
  border: 2px solid #FFD200;
  color: #1a3a52;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.45rem 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Poppins', 'Inter', -apple-system, sans-serif;
}

.btn-ver-mas:hover {
  background: #FFD200;
  color: #1a3a52;
  transform: translateX(3px);
}

/* ── Skeleton loader ──────────────────────────────────────────────── */
.card-skeleton {
  min-height: 340px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border: none;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Estado vacío / error ─────────────────────────────────────────── */
.empty-state {
  text-align: center;
  color: #9ca3af;
  padding: 3rem 1rem;
  font-size: 0.95rem;
}

/* ── Responsive ───────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .section-public {
    padding: 3rem 1rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>