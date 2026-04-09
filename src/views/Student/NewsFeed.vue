<template>
  <div class="news-feed-page">

    <!-- ── HEADER ───────── -->
    <div class="feed-header">
      <div class="feed-header__left">
        <div class="feed-header__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
          </svg>
        </div>
        <div>
          <h1 class="feed-header__title">Muro de Noticias</h1>
          <p class="feed-header__sub">Mantente informado con las últimas novedades del campus</p>
        </div>
      </div>
    </div>

    <!----- FILTROS----->
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
          placeholder="Buscar noticias..."
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
          <option v-for="c in CATEGORIES" :key="c.value" :value="c.value">{{ c.label }}</option>
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
          {{ totalElements }} noticia{{ totalElements !== 1 ? 's' : '' }} encontrada{{ totalElements !== 1 ? 's' : '' }}
        </span>
        <span v-else class="filter-result-info--empty">Sin resultados para los filtros aplicados</span>
      </div>
    </div>

    <!-- ── LOADING SKELETONS ──────────────────────────────────────── -->
    <div v-if="loading" class="feed-list">
      <div v-for="n in 4" :key="n" class="news-card news-card--skeleton">
        <div class="skeleton-meta-row">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-author-block">
            <div class="skeleton-line" style="width:130px;height:13px;"></div>
            <div class="skeleton-line" style="width:90px;height:11px;margin-top:4px;"></div>
          </div>
        </div>
        <div class="skeleton-body">
          <div class="skeleton-line" style="width:80%;height:20px;"></div>
          <div class="skeleton-line" style="width:96%;height:14px;margin-top:8px;"></div>
          <div class="skeleton-line" style="width:70%;height:14px;margin-top:6px;"></div>
        </div>
        <div class="skeleton-img"></div>
      </div>
    </div>

    <!-- ── EMPTY STATE ────────────────────────────────────────────── -->
    <div v-else-if="!loading && allNews.length === 0" class="empty-state">
      <div class="empty-state__visual">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
          <line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="12" y2="14"/>
        </svg>
      </div>
      <h3>{{ hasActiveFilters ? 'Sin resultados' : 'No hay noticias publicadas' }}</h3>
      <p>{{ hasActiveFilters ? 'Intenta con otros filtros o términos de búsqueda.' : 'Vuelve pronto para encontrar novedades del campus.' }}</p>
      <button v-if="hasActiveFilters" @click="clearAllFilters" class="empty-clear-btn">Limpiar filtros</button>
    </div>

    <!-- ── FEED LIST ──────────────────────────────────────────────── -->
    <div v-else class="feed-list">
      <article
          v-for="(item, i) in allNews"
          :key="item.id"
          class="news-card"
          :style="{ '--delay': i * 0.08 + 's' }"
        >

          <!--publicador -->
          <div class="news-card__header">
            <div class="author-avatar">
              {{ getInitials(item.authorName) }}
            </div>

            <div class="author-meta">
              <span class="author-name">
                {{ item.authorName }}
              </span>

              <div class="meta-row">
                <span class="news-date">
                  {{ formatDateTime(item.createdAt) }}
                </span>
                <span
                  v-if="item.category"
                  class="cat-pill"
                  :style="{ background: getCategoryColor(item.category) }"
                >{{ getCategoryLabel(item.category) }}
                </span>
              </div>
            </div>
          </div>

          <!-- titulo -->
          <div class="news-card__body">
            <h2 class="news-card__title">
              {{ item.title }}
            </h2>

            <!-- detalle-->
            <p class="news-card__text">
              {{ item.body }}
            </p>
          </div>

          <!-- imagen-->
          <div v-if="item.coverUrl" class="news-card__media">
            <img
              :src="item.coverUrl"
              :alt="item.title"
              class="news-card__img"
            />
          </div>

          <!-- archivo -->
          <div v-if="item.attachmentUrl" class="news-card__footer">
            <a :href="item.attachmentUrl" target="_blank" class="attachment-link">
               Ver archivo adjunto
            </a>
          </div>

        </article>
    </div>


    <!----- PAGINACIÓN  -->
    <div v-if="totalPages > 1 && !loading" class="pagination">
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
        <span v-if="p === '...'" class="pagination__ellipsis">…</span>
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

    <!-- ── error ─── -->
    <Transition name="toast">
      <div v-if="errorMsg" class="error-toast">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
        </svg>
        {{ errorMsg }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { newsService, careerService } from '../../services/api.js'

// ─── Constantes ───
const CATEGORIES = [
  { value: 'ACADEMICO', label: 'Académico',  color: '#2563eb' },
  { value: 'EVENTOS',   label: 'Eventos',    color: '#7c3aed' },
  { value: 'AVISOS',    label: 'Avisos',     color: '#d97706' },
  { value: 'DEPORTES',  label: 'Deportes',   color: '#16a34a' },
  { value: 'CULTURA',   label: 'Cultura',    color: '#db2777' },
  { value: 'OTRO',      label: 'Otro',       color: '#64748b' },
]
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))

// ─── Estado ─────────
const allNews  = ref([])
const careers  = ref([])
const loading  = ref(true)
const errorMsg = ref('')

// ─── Filtros 
const searchInput      = ref('')
const selectedCareer   = ref('')
const selectedCategory = ref('')
const sortType         = ref('DESC')
const sortBy           = ref('created_at')

// ─── Paginación ──
const currentPage   = ref(0)
const pageSize      = ref(10)
const totalPages    = ref(0)
const totalElements = ref(0)

// ─── Debounce para el buscador ───────────────────────────────────────────────
let searchTimer = null
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 0
    fetchNews()
  }, 450)
}

function clearSearch() {
  searchInput.value = ''
  currentPage.value = 0
  fetchNews()
}

// ─── Filtros activos ─────────────────────────────────────────────────────────
const hasActiveFilters = computed(() =>
  searchInput.value.trim() !== '' ||
  selectedCareer.value !== '' ||
  selectedCategory.value !== '' ||
  sortType.value !== 'DESC'
)

function applyFilters() {
  currentPage.value = 0
  fetchNews()
}

function clearAllFilters() {
  searchInput.value    = ''
  selectedCareer.value = ''
  selectedCategory.value = ''
  sortType.value       = 'DESC'
  currentPage.value    = 0
  fetchNews()
}

// ─── Paginación ──────────────────────────────────────────────────────────────
function goToPage(page) {
  if (page < 0 || page >= totalPages.value) return
  currentPage.value = page
  fetchNews()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Páginas visibles con elipsis
const visiblePages = computed(() => {
  const total  = totalPages.value
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

// ─── Carga de datos ──
async function fetchNews() {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = new URLSearchParams({
      page:     currentPage.value,
      size:     pageSize.value,
      sortBy:   sortBy.value,
      sortType: sortType.value,
    })

    if (searchInput.value.trim())  params.append('search',   searchInput.value.trim())
    if (selectedCareer.value)      params.append('careerId',  selectedCareer.value)
    if (selectedCategory.value)    params.append('category',  selectedCategory.value)

    const data = await newsService.getRecent(params.toString())

    // Spring Page response: { content, totalPages, totalElements, ... }
    allNews.value      = data.content      ?? []
    totalPages.value   = data.totalPages   ?? 0
    totalElements.value = data.totalElements ?? 0

  } catch (err) {
    errorMsg.value = 'No se pudieron cargar las noticias. Verifica la conexión.'
    console.error('[NewsFeed] fetchNews:', err)
    setTimeout(() => { errorMsg.value = '' }, 4000)
  } finally {
    loading.value = false
  }
}

// ─── Carga de carreras para el filtro ──────
async function fetchCareers() {
  try {
    const data = await careerService.getAll()
    careers.value = Array.isArray(data) ? data : (data.data ?? [])
  } catch (err) {
    console.warn('[NewsFeed] No se pudieron cargar carreras:', err)
  }
}

// ─── Helpers ───────────────────
function formatDateTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleString('es-BO', {
    weekday: 'short', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getCategoryLabel(val) { return CATEGORY_MAP[val]?.label ?? val }
function getCategoryColor(val) { return CATEGORY_MAP[val]?.color ?? '#64748b' }


onMounted(() => {
  fetchCareers()
  fetchNews()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');

.news-feed-page {
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
.news-card {
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
  animation: cardReveal 0.45s ease both;
  animation-delay: var(--delay, 0s);
  transition: box-shadow 0.2s;
}

.news-card:hover {
  box-shadow: 0 4px 20px rgba(26,58,82,0.1);
}

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Card Header (autor) ────── */
.news-card__header {
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

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.news-date {
  font-size: 0.75rem;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 0.3rem;
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
.news-card__body {
  padding: 0.5rem 1.1rem 0.9rem;
}

.news-card__title {
  font-family: 'Fraunces', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 0.55rem;
  line-height: 1.35;
}

.news-card__text {
  font-size: 0.9rem;
  color: #374151;
  margin: 0;
  line-height: 1.7;
  white-space: pre-line;
}

/* ── Card Media ──────────────── */
.news-card__media {
  width: 100%;
  overflow: hidden;
  background: #e8f0f6;
  margin-top: 0.5rem;
}

.news-card__img {
  width: 100%;
  display: block;
  object-fit: cover;
  max-height: 440px;
  transition: transform 0.4s ease;
}

.news-card:hover .news-card__img {
  transform: scale(1.02);
}

/* ── Card Footer ──────── */
.news-card__footer {
  padding: 0.65rem 1.1rem 0.8rem;
  border-top: 1px solid var(--border);
  margin-top: 0.5rem;
}

.attachment-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--navy);
  text-decoration: none;
  padding: 0.35rem 0.8rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  transition: background 0.15s, border-color 0.15s;
}

.attachment-link:hover {
  background: #f0f6ff;
  border-color: var(--navy);
}

/* ── Skeleton ────────── */
.news-card--skeleton { pointer-events: none; }

.skeleton-meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.1rem 0.5rem;
}

.skeleton-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  flex-shrink: 0;
}

.skeleton-author-block { flex: 1; }

.skeleton-line {
  border-radius: 6px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  display: block;
}

.skeleton-body {
  padding: 0.5rem 1.1rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.skeleton-img {
  height: 220px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
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


.empty-clear-btn {
  padding: 0.6rem 1.4rem;
  background: var(--navy);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
}

.empty-clear-btn:hover { background: #2e6a8a; }


/* ── Paginación ─────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin: 2rem auto 0;
  flex-wrap: wrap;
  padding: 0 1rem;
}

.pagination__btn {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination__btn:hover:not(:disabled):not(.pagination__btn--active) {
  background: #f0f6ff;
  border-color: var(--navy);
  color: var(--navy);
}

.pagination__btn--active {
  background: var(--navy);
  border-color: var(--navy);
  color: #fff;
}

.pagination__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.pagination__ellipsis {
  font-size: 1rem;
  color: var(--muted);
  padding: 0 0.2rem;
}

.pagination__info {
  font-size: 0.78rem;
  color: var(--slate);
  margin-left: 0.5rem;
  white-space: nowrap;
}


/* ── Toast ────────── */
.error-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #fff1f2;
  border: 1.5px solid #fecdd3;
  border-left: 4px solid #f43f5e;
  color: #9f1239;
  padding: 0.8rem 1.3rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 999;
  white-space: nowrap;
}

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.5,0.64,1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(-50%) translateY(16px); }
.toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(12px); }

/* ── Responsive ──────────── */
@media (max-width: 720px) {
  .feed-list { padding: 0 0; }
  .news-card { border-radius: 0; border-left: none; border-right: none; }
  .filter-select--sort { max-width: 100%; }
  .filters-bar { top: 65px; }
}
</style>