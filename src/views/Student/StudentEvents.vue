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

    <!----- FILTROS ----->
    <div class="filters-bar">
      <!-- Buscador -->
      <div class="filter-search">
        <svg class="filter-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchInput"
          @input="onSearchInput"
          type="text"
          placeholder="Buscar eventos..."
          class="filter-search__input"
        />
        <button v-if="searchInput" @click="clearSearch" class="filter-clear-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Fila de selects -->
      <div class="filter-row">
        <!-- Carrera -->
        <select v-model="selectedCareer" @change="applyFilters" class="filter-select">
          <option value="">Todas las carreras</option>
          <option v-for="c in careers" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>

        <!-- Categoría -->
        <select v-model="selectedCategory" @change="applyFilters" class="filter-select">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <!-- Ordenamiento -->
        <select v-model="sortType" @change="applyFilters" class="filter-select filter-select--sort">
          <option value="DESC">Más recientes</option>
          <option value="ASC">Más antiguas</option>
        </select>

        <!-- Botón limpiar -->
        <button v-if="hasActiveFilters" @click="clearAllFilters" class="filter-reset-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
          Limpiar
        </button>
      </div>

      <!-- Resultado count -->
      <div v-if="!loading" class="filter-result-info">
        <span v-if="totalElements > 0">
          {{ totalElements }} evento{{ totalElements !== 1 ? 's' : '' }} encontrado{{ totalElements !== 1 ? 's' : '' }}
        </span>
        <span v-else class="filter-result-info--empty">Sin resultados para los filtros aplicados</span>
      </div>
    </div>

    <!-- ── LOADING SKELETONS ──────────────────────────────────────── -->
    <div v-if="loading" class="feed-list">
      <div v-for="i in 3" :key="i" class="event-card skeleton-blink" style="height: 200px; background: #edeff2; border: none;"></div>
    </div>

    <!-- ── FEED LIST ───────────────────────────────────────────────── -->
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
            <div class="meta-row">
              <span class="event-date">{{ formatDateTime(evento.createdAt) }}</span>
              <span
                v-if="evento.category"
                class="cat-pill"
                :style="{ background: evento.category.colorHex || '#64748b' }"
              >{{ evento.category.name }}</span>
            </div>
          </div>
        </div>

        <div class="event-card__body">
          <h2 class="event-card__title">{{ evento.name }}</h2>
          <p class="event-card__text">{{ evento.description }}</p>
          <div class="event-meta-info">
            <span class="meta-tag">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
              {{ formatEventDateTime(evento.startDatetime, evento.endDatetime) }}
            </span>
            
            <span class="meta-tag">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {{ evento.location?.name || 'No especificada' }}
            </span>

            <span class="meta-tag">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 18px; height: 18px; display: inline-block; vertical-align: middle; margin-right: 4px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
              {{ evento.eventType }}</span>
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
      <h3>Sin Resultados</h3>
      <p>Intenta con otros filtros o términos de búsqueda.</p>
    </div>

    <!-- ── PAGINACIÓN ──────────────────────────────────────────────── -->
    <div v-if="!loading && totalPages > 1" class="pagination">
      <button
        class="pagination__btn"
        :disabled="currentPage === 0"
        @click="goToPage(0)"
        title="Primera página"
      >«</button>

      <button
        class="pagination__btn"
        :disabled="currentPage === 0"
        @click="goToPage(currentPage - 1)"
        title="Página anterior"
      >‹</button>

      <template v-for="p in visiblePages" :key="p">
        <span v-if="p === '...'" class="pagination__ellipsis">...</span>
        <button
          v-else
          class="pagination__btn"
          :class="{ 'pagination__btn--active': p === currentPage }"
          @click="goToPage(p)"
        >{{ p + 1 }}</button>
      </template>

      <button
        class="pagination__btn"
        :disabled="currentPage === totalPages - 1"
        @click="goToPage(currentPage + 1)"
        title="Página siguiente"
      >›</button>

      <button
        class="pagination__btn"
        :disabled="currentPage === totalPages - 1"
        @click="goToPage(totalPages - 1)"
        title="Última página"
      >»</button>

      <span class="pagination__info">
        Página {{ currentPage + 1 }} de {{ totalPages }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PasswordChangedBanner from '../../components/PasswordChangedBanner.vue'
import { formatDateTime, formatEventDateTime } from '../../utils/index.js'

const router = useRouter()
const eventos = ref([])
const careers = ref([])
const categories = ref([])
const loading = ref(true)

// ─── Mapa de colores para categorías (por id) ───
const categoryColorMap = ref({})

// ─── Filtros ───
const searchInput = ref('')
const selectedCareer = ref('')
const selectedCategory = ref('')
const sortType = ref('DESC')

// ─── Paginación ───
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)

// ─── Debounce para el buscador ───
let searchTimer = null
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 0
    fetchEventos()
  }, 450)
}

function clearSearch() {
  searchInput.value = ''
  currentPage.value = 0
  fetchEventos()
}

// ─── Filtros activos ───
const hasActiveFilters = computed(() =>
  searchInput.value.trim() !== '' ||
  selectedCareer.value !== '' ||
  selectedCategory.value !== '' ||
  sortType.value !== 'DESC'
)

function applyFilters() {
  currentPage.value = 0
  fetchEventos()
}

function clearAllFilters() {
  searchInput.value = ''
  selectedCareer.value = ''
  selectedCategory.value = ''
  sortType.value = 'DESC'
  currentPage.value = 0
  fetchEventos()
}

// ─── Paginación ───
function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  fetchEventos()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)

  const pages = []
  if (current <= 3) {
    pages.push(0, 1, 2, 3, 4, '...', total - 1)
  } else if (current >= total - 4) {
    pages.push(0, '...', total - 5, total - 4, total - 3, total - 2, total - 1)
  } else {
    pages.push(0, '...', current - 1, current, current + 1, '...', total - 1)
  }
  return pages
})

// ─── Carga de eventos con filtros del backend ───
const fetchEventos = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value,
      size: pageSize.value,
    })

    // Agregar parámetros opcionales
    if (searchInput.value.trim()) params.append('search', searchInput.value.trim())
    if (selectedCareer.value) params.append('careerId', selectedCareer.value)
    if (selectedCategory.value) params.append('categoryId', selectedCategory.value)
    
    // Agregar parámetros de ordenamiento
    params.append('sortBy', 'createdAt')
    params.append('sortType', sortType.value)

    const response = await fetch(`http://localhost:8081/api/events/recent?${params.toString()}`)
    const result = await response.json()

    // Spring Page response: { content, totalPages, totalElements, ... }
    eventos.value = result.content || []
    totalPages.value = result.totalPages || 0
    totalElements.value = result.totalElements || 0

  } catch (error) {
    console.error("Error al cargar eventos:", error)
    eventos.value = []
  } finally {
    loading.value = false
  }
}

// Cargar carreras para el filtro
const fetchCareers = async () => {
  try {
    const response = await fetch('http://localhost:8081/api/careers')
    const result = await response.json()
    careers.value = Array.isArray(result) ? result : (result.data || [])
  } catch (error) {
    console.warn("Error al cargar carreras:", error)
  }
}

// Cargar categorías para el filtro
const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:8081/api/categories')
    const result = await response.json()
    const cats = Array.isArray(result) ? result : (result.data || [])
    categories.value = cats
    
    // Construir mapa de colores por ID de categoría
    const colorMap = {}
    cats.forEach(cat => {
      //colorMap[cat.id] = cat.color_hex || '#64748b'
      colorMap[cat.id] = cat.colorHex || cat.color_hex || '#64748b'
    })
    categoryColorMap.value = colorMap
  } catch (error) {
    console.warn("Error al cargar categorías:", error)
  }
}

// PA: Redirigir a la vista detallada del evento
const goToDetail = (id) => {
  router.push(`/estudiante/eventos/${id}`)
}

// formatDateTime importado de utils

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

const getCategoryColor = (categoryId) => {
  if (!categoryId) return '#64748b'
  return categoryColorMap.value[categoryId] || '#64748b'
}

const getCategoryName = (categoryId) => {
  if (!categoryId) return ''
  // Forzamos la comparación a Number o String dependiendo de tu BD
  const category = categories.value.find(c => String(c.id) === String(categoryId))
  //const category = categories.value.find(c => c.id === categoryId)
  return category?.name || ''
}

onMounted(() => {
  fetchCareers()
  fetchCategories()
  fetchEventos()
})
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

/* ── Filtros ──── */
.filters-bar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0.875rem 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  position: sticky;
  top: 77px;
  z-index: 9;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.filter-search {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-search__icon {
  position: absolute;
  left: 0.75rem;
  color: var(--muted);
  pointer-events: none;
}

.filter-search__input {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 2.4rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--ink);
  background: #f8fafc;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

.filter-search__input:focus {
  border-color: var(--navy);
  box-shadow: 0 0 0 3px rgba(26,58,82,0.08);
  background: #fff;
}

.filter-clear-btn {
  position: absolute;
  right: 0.65rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.15s;
}

.filter-clear-btn:hover { color: var(--ink); }

.filter-row {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: inherit;
  color: var(--ink);
  background: #f8fafc;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
  flex: 1;
  min-width: 130px;
}

.filter-select:focus { border-color: var(--navy); }
.filter-select--sort { max-width: 150px; }

.filter-reset-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border: 1.5px solid #fecdd3;
  border-radius: 8px;
  background: #fff1f2;
  color: #be123c;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.filter-reset-btn:hover { background: #ffe4e6; }

.filter-result-info {
  font-size: 0.78rem;
  color: var(--slate);
  padding: 0 0.1rem;
}

.filter-result-info--empty { color: #d97706; font-weight: 600; }

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

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.cat-pill {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #fff;
  padding: 0.2rem 0.6rem;
  border-radius: 50px;
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

/* ── Paginación ────────────────────────────────────────────────── */
.pagination {
  max-width: 680px;
  margin: 2rem auto 0;
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.pagination__btn {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink);
  font-size: 0.85rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination__btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: var(--navy);
  color: var(--navy);
}

.pagination__btn--active {
  background: var(--navy);
  color: var(--gold);
  border-color: var(--navy);
  font-weight: 700;
}

.pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination__ellipsis {
  padding: 0 0.25rem;
  color: var(--muted);
  font-size: 0.85rem;
}

.pagination__info {
  margin-left: 0.75rem;
  font-size: 0.8rem;
  color: var(--slate);
  white-space: nowrap;
}

/* ── Responsive ──────────── */
@media (max-width: 720px) {
  .feed-list { padding: 0; }
  .event-card { border-radius: 0; border-left: none; border-right: none; }
  
  .filters-bar {
    top: 0;
    padding: 0.75rem 1rem;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
  }
  
  .filter-reset-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>