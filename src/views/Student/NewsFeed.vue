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
      <h3>No hay noticias publicadas</h3>
      <p>Vuelve pronto para encontrar novedades del campus.</p>
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

              <!-- time -->
              <span class="news-date">
                {{ formatDateTime(item.createdAt) }}
              </span>
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
              📎 Ver archivo adjunto
            </a>
          </div>

        </article>
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
import { ref, onMounted } from 'vue'
import { newsService } from '../../services/api.js'

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
const loading  = ref(true)
const errorMsg = ref('')

// ─── Carga de datos ──
async function fetchNews() {
  loading.value = true
  errorMsg.value = ''
  try {
    const data = await newsService.getAll()
    allNews.value = Array.isArray(data) ? data : (data.data ?? [])
  } catch (err) {
    errorMsg.value = 'No se pudieron cargar las noticias. Verifica la conexión.'
    console.error('[NewsFeed] fetchNews:', err)
    setTimeout(() => { errorMsg.value = '' }, 4000)
  } finally {
    loading.value = false
  }
}
// ─── Formateo de fecha ──
function formatDateTime(date) {
  if (!date) return ''

  const d = new Date(date)

  return d.toLocaleString('es-BO', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
// ─── Helpers ───────────────────
function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60)     return 'Hace un momento'
  if (diff < 3600)   return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400)  return `Hace ${Math.floor(diff / 3600)} h`
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getCategoryLabel(val) { return CATEGORY_MAP[val]?.label ?? val }
function getCategoryColor(val) { return CATEGORY_MAP[val]?.color ?? '#64748b' }

onMounted(fetchNews)
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
}
</style>