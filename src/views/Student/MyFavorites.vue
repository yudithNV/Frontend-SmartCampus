<template>
  
  <div class="my-favorites-page">

    <!-- ── HEADER ──────────────────────────────────────────────────────── -->
    <div class="fav-header">
      <div class="fav-header__left">
        <div class="fav-header__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </div>
        <div>
          <h1 class="fav-header__title">Mis Favoritos</h1>
          <p class="fav-header__sub">Noticias que guardaste para consultar después</p>
        </div>
      </div>
      <span v-if="!loading" class="fav-count-badge">
        {{ favorites.length }} guardada{{ favorites.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- ── LOADING ─────────────────── -->
    <div v-if="loading" class="fav-grid">
      <div v-for="n in 4" :key="n" class="fav-card fav-card--skeleton">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line" style="width:65%;height:16px;"></div>
          <div class="skeleton-line" style="width:40%;height:12px;margin-top:8px;"></div>
          <div class="skeleton-line" style="width:80%;height:12px;margin-top:6px;"></div>
        </div>
      </div>
    </div>

    <!-- ── EMPTY STATE ───────────── -->
    <div v-else-if="favorites.length === 0" class="fav-empty">
      <div class="fav-empty__visual">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </div>
      <h3>Aún no tienes favoritos</h3>
      <p>Marca el corazón en cualquier noticia del muro para guardarla aquí.</p>
      <router-link to="/estudiante/noticias" class="fav-empty__cta">
        Ir al Muro de Noticias
      </router-link>
    </div>

    <!-- ── GRID DE FAVORITOS ─────────────────────── -->
    <div v-else class="fav-grid">
      <TransitionGroup name="fav-list">
        <article
          v-for="(fav, i) in favorites"
          :key="fav.favoriteId"
          class="fav-card"
          :style="{ '--delay': i * 0.06 + 's' }"
        >
          <div class="fav-card__media" v-if="fav.newsCoverUrl">
            <img :src="fav.newsCoverUrl" :alt="fav.newsTitle" class="fav-card__img" />
          </div>
          <div class="fav-card__media fav-card__media--placeholder" v-else>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
              <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
              <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
            </svg>
          </div>

          <div class="fav-card__body">
            <span
              v-if="fav.newsCategory"
              class="fav-card__cat"
              :style="{ background: getCategoryColor(fav.newsCategory) }"
            >{{ getCategoryLabel(fav.newsCategory) }}</span>

            <h2 class="fav-card__title">{{ fav.newsTitle }}</h2>

            <div class="fav-card__meta">
              <span class="fav-card__date">
                Publicada {{ formatDate(fav.newsCreatedAt) }}
              </span>
              <span class="fav-card__saved">
                · Guardada {{ formatDate(fav.favoritedAt) }}
              </span>
            </div>

            <div class="fav-card__actions">
              <router-link
                :to="`/estudiante/noticias`"
                class="fav-card__action fav-card__action--view"
              >
                Ver noticia
              </router-link>

              <button
                class="fav-card__action fav-card__action--remove"
                :disabled="removingId === fav.newsId"
                @click="handleRemove(fav)"
              >
                <svg v-if="removingId !== fav.newsId" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                <span v-if="removingId === fav.newsId" class="fav-spinner"></span>
                {{ removingId === fav.newsId ? 'Quitando...' : 'Quitar' }}
              </button>
            </div>
          </div>
        </article>
      </TransitionGroup>
    </div>

    <!-- ── TOAST DE ERROR ──────────────── -->
    <Transition name="toast">
      <div v-if="errorMsg" class="fav-toast">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
        </svg>
        {{ errorMsg }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { favoriteService } from '../../services/api.js'

// ─── Estado 
const favorites  = ref([])
const loading    = ref(true)
const removingId = ref(null)
const errorMsg   = ref('')

// ─── Categorías  
const CATEGORIES = [
  { value: 'ACADEMICO', label: 'Académico', color: '#2563eb' },
  { value: 'EVENTOS',   label: 'Eventos',   color: '#7c3aed' },
  { value: 'AVISOS',    label: 'Avisos',    color: '#d97706' },
  { value: 'DEPORTES',  label: 'Deportes',  color: '#16a34a' },
  { value: 'CULTURA',   label: 'Cultura',   color: '#db2777' },
  { value: 'OTRO',      label: 'Otro',      color: '#64748b' },
]
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))
function getCategoryLabel(val) { return CATEGORY_MAP[val]?.label ?? val }
function getCategoryColor(val) { return CATEGORY_MAP[val]?.color ?? '#64748b' }

// ─── Carga de favoritos 
async function fetchFavorites() {
  loading.value = true
  try {
    const data = await favoriteService.getMy()
    favorites.value = Array.isArray(data) ? data : (data?.data ?? [])
  } catch (err) {
    errorMsg.value = 'No se pudieron cargar tus favoritos.'
    setTimeout(() => { errorMsg.value = '' }, 4000)
    console.error('[MyFavorites] fetchFavorites:', err)
  } finally {
    loading.value = false
  }
}

async function handleRemove(fav) {
  if (removingId.value === fav.newsId) return
  removingId.value = fav.newsId
  try {
    await favoriteService.remove(fav.newsId)
    favorites.value = favorites.value.filter(f => f.newsId !== fav.newsId)
  } catch (err) {
    errorMsg.value = 'No se pudo quitar el favorito. Intenta nuevamente.'
    setTimeout(() => { errorMsg.value = '' }, 4000)
    console.error('[MyFavorites] handleRemove:', err)
  } finally {
    removingId.value = null
  }
}

// ─── Helpers 
function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-BO', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');

.my-favorites-page {
  --navy:    #1a3a52;
  --gold:    #FFD200;
  --ink:     #0f1f2e;
  --slate:   #64748b;
  --muted:   #94a3b8;
  --surface: #ffffff;
  --bg:      #f0f2f5;
  --border:  #e2e8f0;
  --red:     #ef4444;
  --radius:  12px;

  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  padding: 0 0 4rem;
}

/* ── Header  */
.fav-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1.5rem 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
}

.fav-header__left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.fav-header__icon {
  width: 44px;
  height: 44px;
  background: #fff1f2;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--red);
  flex-shrink: 0;
}

.fav-header__title {
  font-family: 'Fraunces', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 0.1rem;
  line-height: 1.2;
}

.fav-header__sub {
  font-size: 0.78rem;
  color: var(--slate);
  margin: 0;
}

.fav-count-badge {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--red);
  background: #fff1f2;
  border: 1.5px solid #fecdd3;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  white-space: nowrap;
}

/* ── Grid ──────────────────────────────────────────────────────────────────── */
.fav-grid {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

/* ── Fav Card ──────────────────────────────────────────────────────────────── */
.fav-card {
  background: var(--surface);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: cardReveal 0.4s ease both;
  animation-delay: var(--delay, 0s);
  transition: box-shadow 0.2s, transform 0.2s;
}

.fav-card:hover {
  box-shadow: 0 6px 24px rgba(26,58,82,0.1);
  transform: translateY(-2px);
}

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Media ──────────────────────────────────────────────────────────────────── */
.fav-card__media {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #e8f0f6;
  flex-shrink: 0;
}

.fav-card__media--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a0c0d8;
}

.fav-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.fav-card:hover .fav-card__img {
  transform: scale(1.04);
}

/* ── Body ───────────────────────────────────────────────────────────────────── */
.fav-card__body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.fav-card__cat {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #fff;
  padding: 0.18rem 0.55rem;
  border-radius: 50px;
  align-self: flex-start;
}

.fav-card__title {
  font-family: 'Fraunces', serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fav-card__meta {
  font-size: 0.73rem;
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem;
}

.fav-card__saved {
  color: var(--red);
  opacity: 0.8;
}

/* ── Actions ────────────────────────────────────────────────────────────────── */
.fav-card__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border);
}

.fav-card__action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
  border: none;
}

.fav-card__action--view {
  background: var(--navy);
  color: #fff;
  flex: 1;
  justify-content: center;
}

.fav-card__action--view:hover {
  background: #2e6a8a;
}

.fav-card__action--remove {
  background: #fff1f2;
  color: var(--red);
  border: 1.5px solid #fecdd3;
}

.fav-card__action--remove:hover:not(:disabled) {
  background: #ffe4e6;
  border-color: var(--red);
}

.fav-card__action--remove:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Spinner inline ─────────────────────────────────────────────────────────── */
.fav-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid transparent;
  border-top-color: var(--red);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Skeleton ────────────────────────────────────────────────────────────────── */
.fav-card--skeleton { pointer-events: none; }

.skeleton-img {
  width: 100%; height: 160px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.skeleton-line {
  border-radius: 6px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  display: block;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Empty ───────────────────────────────────────────────────────────────────── */
.fav-empty {
  margin: 4rem auto;
  text-align: center;
  max-width: 380px;
  padding: 0 1.5rem;
}

.fav-empty__visual {
  width: 88px; height: 88px;
  background: #fff1f2;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.25rem;
  color: #fca5a5;
}

.fav-empty h3 {
  font-family: 'Fraunces', serif;
  font-size: 1.1rem; font-weight: 700;
  color: var(--ink); margin: 0 0 0.5rem;
}

.fav-empty p {
  font-size: 0.875rem; color: var(--slate); margin: 0 0 1.25rem; line-height: 1.6;
}

.fav-empty__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.5rem;
  background: var(--navy);
  color: #fff;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.fav-empty__cta:hover { background: #2e6a8a; }

/* ── Toast ───────────────────────────────────────────────────────────────────── */
.fav-toast {
  position: fixed;
  bottom: 2rem; left: 50%;
  transform: translateX(-50%);
  background: #fff1f2;
  border: 1.5px solid #fecdd3;
  border-left: 4px solid #f43f5e;
  color: #9f1239;
  padding: 0.8rem 1.3rem;
  border-radius: 10px;
  font-size: 0.85rem; font-weight: 600;
  display: flex; align-items: center; gap: 0.6rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 999;
  white-space: nowrap;
}

/* ── TransitionGroup (quitar card) ───────────────────────────────────────────── */
.fav-list-leave-active {
  transition: all 0.35s ease;
  position: absolute;
}
.fav-list-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
.fav-list-move {
  transition: transform 0.35s ease;
}

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.5,0.64,1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(-50%) translateY(16px); }
.toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(12px); }

/* ── Responsive ──────────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .fav-grid { padding: 0 0.75rem; grid-template-columns: 1fr; }
}
</style>