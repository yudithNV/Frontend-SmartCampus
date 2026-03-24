<template>
  <div class="mis-eventos">

    <!-- Toast -->
    <Transition name="toast-slide">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        <span class="toast-icon-wrap">
          <svg v-if="toast.type==='success'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="toast.type==='error'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </span>
        <div class="toast-body">
          <strong>{{ toast.title }}</strong>
          <span>{{ toast.message }}</span>
        </div>
        <button class="toast-close" @click="toast.show = false">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </Transition>

    <!-- Confirm delete modal -->
    <Transition name="modal-fade">
      <div v-if="deleteModal.show" class="modal-overlay" @click.self="deleteModal.show = false">
        <div class="modal-box">
          <div class="modal-icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </div>
          <h3>Eliminar evento</h3>
          <p>¿Estás seguro de eliminar <strong>"{{ deleteModal.title }}"</strong>?<br>Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button class="btn-cancel-modal" @click="deleteModal.show = false">Cancelar</button>
            <button class="btn-confirm-delete" @click="confirmDelete" :disabled="deleteModal.loading">
              <span v-if="!deleteModal.loading">Eliminar definitivamente</span>
              <span v-else class="loading-row"><span class="spinner-xs"></span> Eliminando...</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a3a52" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div>
          <h1>Mis Eventos</h1>
          <p>Gestiona y administra los eventos del sistema</p>
        </div>
      </div>
      <router-link to="/publicador/crear-evento" class="btn-new">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Evento
      </router-link>
    </div>

    <!-- Stats Row -->
    <div class="stats-row" v-if="!loading && !error">
      <button class="stat-pill" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        <span class="stat-num">{{ events.length }}</span>
        <span class="stat-txt">Total</span>
      </button>
      <button class="stat-pill stat-pub" :class="{ active: activeFilter === 'published' }" @click="activeFilter = 'published'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span class="stat-num">{{ events.filter(e => e.isActive).length }}</span>
        <span class="stat-txt">Publicados</span>
      </button>
      <button class="stat-pill stat-draft" :class="{ active: activeFilter === 'draft' }" @click="activeFilter = 'draft'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <span class="stat-num">{{ events.filter(e => !e.isActive).length }}</span>
        <span class="stat-txt">Borradores</span>
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="search-wrap">
        <svg class="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" type="text" class="search-input" placeholder="Buscar evento por título..." />
        <button v-if="search" class="search-clear" @click="search = ''">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="right-filters">
        <div class="select-wrap">
          <select v-model="sortBy" class="filter-select">
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="date">Por fecha de evento</option>
          </select>
          <svg class="sel-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="Cuadrícula">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" title="Lista">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <div class="state-spinner"></div>
      <p>Cargando eventos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-box state-error">
      <div class="state-icon-wrap error-wrap">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="loadEvents">Reintentar conexión</button>
    </div>

    <!-- Empty total -->
    <div v-else-if="events.length === 0" class="state-box state-empty">
      <div class="state-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      </div>
      <h3>No has creado eventos aún</h3>
      <p>Crea tu primer evento para que aparezca aquí.</p>
      <router-link to="/publicador/crear-evento" class="btn-new-empty">
        Crear primer evento
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </router-link>
    </div>

    <!-- No search results -->
    <div v-else-if="filteredEvents.length === 0" class="state-box state-empty">
      <div class="state-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      <h3>Sin resultados</h3>
      <p>No se encontraron eventos con ese criterio.</p>
      <button class="btn-retry" @click="search = ''; activeFilter = 'all'">Limpiar filtros</button>
    </div>

    <!-- GRID VIEW -->
    <div v-else-if="viewMode === 'grid'" class="events-grid">
      <article v-for="item in filteredEvents" :key="item.id" class="event-card" :class="{ 'is-draft': !item.isActive }">

        <!-- Image -->
        <div class="card-img-wrap">
          <img v-if="item.posterUrl" :src="item.posterUrl" :alt="item.name" class="card-img" />
          <div v-else class="card-img-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div class="card-overlay-top">
            <span class="badge-status" :class="item.isActive ? 'status-pub' : 'status-draft'">
              <span class="status-dot"></span>
              {{ item.isActive ? 'Publicado' : 'Borrador' }}
            </span>
          </div>
          <div class="draft-stamp" v-if="!item.isActive">BORRADOR</div>
        </div>

        <!-- Content -->
        <div class="card-content">
          <div class="card-date-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{{ formatEventDate(item.startDatetime) }}</span>
          </div>
          <h3 class="card-title">{{ item.name }}</h3>
          <p class="card-excerpt">{{ excerpt(item.description) }}</p>
          <div class="card-location">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ item.location }}
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">
          <router-link :to="`/publicador/editar-evento/${item.id}`" class="action-btn btn-edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </router-link>
          <button class="action-btn btn-delete" @click="askDelete(item)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
            Eliminar
          </button>
        </div>
      </article>
    </div>

    <!-- LIST VIEW -->
    <div v-else class="events-list">
      <div v-for="item in filteredEvents" :key="item.id" class="list-row" :class="{ 'is-draft': !item.isActive }">
        <div class="list-img">
          <img v-if="item.posterUrl" :src="item.posterUrl" :alt="item.name" />
          <div v-else class="list-img-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
        </div>
        <div class="list-content">
          <div class="list-badges">
            <span class="badge-status small" :class="item.isActive ? 'status-pub' : 'status-draft'">
              <span class="status-dot"></span>{{ item.isActive ? 'Publicado' : 'Borrador' }}
            </span>
          </div>
          <h3 class="list-title">{{ item.name }}</h3>
          <p class="list-excerpt">{{ excerpt(item.description) }}</p>
          <div class="list-meta">
            <time>{{ formatEventDate(item.startDatetime) }}</time>
            <span> · {{ item.location }}</span>
          </div>
        </div>
        <div class="list-actions">
          <router-link :to="`/publicador/editar-evento/${item.id}`" class="icon-btn" title="Editar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </router-link>
          <button class="icon-btn ico-delete" @click="askDelete(item)" title="Eliminar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { eventService } from '../../services/api.js'

const events = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const activeFilter = ref('all')
const sortBy = ref('newest')
const viewMode = ref('grid')

const toast = reactive({ show: false, type: 'success', title: '', message: '' })
const deleteModal = reactive({ show: false, id: null, title: '', loading: false })

function excerpt(text) {
  if (!text) return ''
  const plain = text.trim()
  return plain.length > 110 ? plain.substring(0, 110) + '...' : plain
}

function formatEventDate(startDatetime) {
  if (!startDatetime) return 'Fecha por definir'
  const date = new Date(startDatetime)
  const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return `${dateStr} · ${timeStr}`
}

const filteredEvents = computed(() => {
  let list = [...events.value]
  if (activeFilter.value === 'published') list = list.filter(e => e.isActive)
  if (activeFilter.value === 'draft') list = list.filter(e => !e.isActive)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(e => e.name?.toLowerCase().includes(q))
  }
  if (sortBy.value === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (sortBy.value === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  if (sortBy.value === 'date') list.sort((a, b) => new Date(a.startDatetime) - new Date(b.startDatetime))
  return list
})

function showToast(type, title, message) {
  toast.show = false
  setTimeout(() => {
    Object.assign(toast, { show: true, type, title, message })
    setTimeout(() => { toast.show = false }, 4500)
  }, 60)
}

async function loadEvents() {
  loading.value = true
  error.value = ''
  try {
    const response = await eventService.getMy()
    events.value = response || []
  } catch (err) {
    console.error('Error al cargar eventos:', err)
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    loading.value = false
  }
}

function askDelete(item) {
  Object.assign(deleteModal, { show: true, id: item.id, title: item.name, loading: false })
}

async function confirmDelete() {
  deleteModal.loading = true
  try {
    await eventService.delete(deleteModal.id)
    const title = deleteModal.title
    events.value = events.value.filter(e => e.id !== deleteModal.id)
    deleteModal.show = false
    showToast('success', 'Eliminado', `"${title}" fue eliminado correctamente.`)
  } catch (err) {
    console.error('Error al eliminar evento:', err)
    showToast('error', 'Error', 'No se pudo eliminar el evento.')
  } finally {
    deleteModal.loading = false
  }
}

onMounted(loadEvents)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.mis-eventos { font-family: 'Inter', sans-serif; color: #1e293b; padding-bottom: 3rem; }

/* Toast */
.toast {
  position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999;
  display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1.1rem;
  background: #fff; border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05);
  border-left: 3px solid; min-width: 300px; max-width: 400px;
}
.toast-success { border-left-color: #22c55e; }
.toast-error   { border-left-color: #ef4444; }
.toast-warning { border-left-color: #f59e0b; }
.toast-icon-wrap {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.toast-success .toast-icon-wrap { background: #dcfce7; color: #16a34a; }
.toast-error   .toast-icon-wrap { background: #fee2e2; color: #dc2626; }
.toast-warning .toast-icon-wrap { background: #fef3c7; color: #d97706; }
.toast-body { flex: 1; }
.toast-body strong { display: block; font-size: 0.83rem; font-weight: 600; color: #1e293b; margin-bottom: 1px; }
.toast-body span { font-size: 0.77rem; color: #64748b; }
.toast-close { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; border-radius: 4px; display: flex; align-items: center; }
.toast-close:hover { background: #f1f5f9; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.28s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateX(28px); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(15,23,42,0.5); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-box {
  background: #fff; border-radius: 16px; padding: 2.2rem 2rem;
  max-width: 420px; width: 100%; text-align: center;
  box-shadow: 0 24px 60px rgba(0,0,0,0.18);
  animation: popIn 0.22s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes popIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
.modal-icon-wrap {
  width: 56px; height: 56px; background: #fff1f2; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem;
}
.modal-box h3 { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:800; color:#1e293b; margin-bottom:0.6rem; }
.modal-box p { font-size:0.85rem; color:#64748b; line-height:1.65; margin-bottom:1.8rem; }
.modal-actions { display:flex; gap:0.75rem; justify-content:center; }
.btn-cancel-modal {
  padding:0.62rem 1.4rem; border:1.5px solid #e2e8f0; background:#fff; color:#64748b;
  border-radius:8px; font-size:0.83rem; font-weight:500; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.18s;
}
.btn-cancel-modal:hover { background:#f8fafc; }
.btn-confirm-delete {
  padding:0.62rem 1.4rem; background:#ef4444; color:#fff; border:none;
  border-radius:8px; font-size:0.83rem; font-weight:600; cursor:pointer;
  font-family:'Inter',sans-serif; transition:all 0.18s; display:flex; align-items:center; gap:0.5rem;
}
.btn-confirm-delete:hover:not(:disabled) { background:#dc2626; }
.btn-confirm-delete:disabled { opacity:0.55; cursor:not-allowed; }
.modal-fade-enter-active, .modal-fade-leave-active { transition:opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity:0; }

/* Header */
.page-header {
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:1.6rem; padding-bottom:1.4rem; border-bottom:1px solid #f1f5f9;
}
.header-left { display:flex; align-items:center; gap:0.9rem; }
.header-icon {
  width:46px; height:46px; background:#FFD200; border-radius:12px;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
  box-shadow:0 2px 8px rgba(255,210,0,0.3);
}
.page-header h1 { font-family:'Syne',sans-serif; font-size:1.55rem; font-weight:800; color:#0f172a; letter-spacing:-0.5px; margin-bottom:0.1rem; }
.page-header p { font-size:0.81rem; color:#64748b; }
.btn-new {
  display:flex; align-items:center; gap:0.5rem; padding:0.65rem 1.3rem;
  background:#1a3a52; color:#FFD200; border:none; border-radius:9px;
  font-size:0.83rem; font-weight:600; text-decoration:none; transition:all 0.18s; font-family:'Inter',sans-serif;
}
.btn-new:hover { background:#0f2438; transform:translateY(-1px); box-shadow:0 4px 14px rgba(26,58,82,0.25); }

/* Stats Row */
.stats-row { display:flex; gap:0.7rem; margin-bottom:1.4rem; flex-wrap:wrap; }
.stat-pill {
  display:flex; align-items:center; gap:0.55rem; padding:0.58rem 1.1rem;
  border:1.5px solid #e2e8f0; border-radius:50px; background:#fff;
  cursor:pointer; transition:all 0.18s; font-family:'Inter',sans-serif;
}
.stat-pill:hover { border-color:#1a3a52; }
.stat-pill.active { background:#1a3a52; border-color:#1a3a52; color:#FFD200; }
.stat-pill.active .stat-num, .stat-pill.active .stat-txt, .stat-pill.active svg { color:#FFD200; stroke:#FFD200; }
.stat-num { font-family:'Syne',sans-serif; font-size:1rem; font-weight:800; color:#1e293b; }
.stat-txt { font-size:0.77rem; color:#64748b; font-weight:500; }
.stat-pub .stat-num { color:#16a34a; }
.stat-draft .stat-num { color:#d97706; }

/* Filters */
.filters-bar { display:flex; align-items:center; justify-content:space-between; gap:0.8rem; margin-bottom:1.8rem; flex-wrap:wrap; }
.search-wrap { position:relative; display:flex; align-items:center; flex:1; min-width:200px; }
.search-ico { position:absolute; left:0.85rem; pointer-events:none; }
.search-input {
  width:100%; padding:0.62rem 2.4rem 0.62rem 2.3rem; border:1.5px solid #e2e8f0; border-radius:9px;
  font-size:0.85rem; font-family:'Inter',sans-serif; color:#1e293b; background:#fff; outline:none; transition:border-color 0.18s;
}
.search-input:focus { border-color:#FFD200; box-shadow:0 0 0 3px rgba(255,210,0,0.08); }
.search-clear { position:absolute; right:0.7rem; background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; align-items:center; padding:3px; border-radius:3px; }
.search-clear:hover { color:#ef4444; }
.right-filters { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; }
.select-wrap { position:relative; }
.filter-select {
  padding:0.58rem 2rem 0.58rem 0.85rem; border:1.5px solid #e2e8f0; border-radius:8px;
  font-size:0.82rem; font-family:'Inter',sans-serif; color:#475569; background:#fff;
  outline:none; cursor:pointer; appearance:none; transition:border-color 0.18s;
}
.filter-select:focus { border-color:#FFD200; }
.sel-arrow { position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); pointer-events:none; }
.view-toggle { display:flex; border:1.5px solid #e2e8f0; border-radius:8px; overflow:hidden; }
.view-toggle button { padding:0.52rem 0.65rem; background:#fff; border:none; cursor:pointer; color:#94a3b8; transition:all 0.18s; display:flex; align-items:center; }
.view-toggle button:hover { background:#f8fafc; }
.view-toggle button.active { background:#1a3a52; color:#FFD200; }
.view-toggle button.active svg { stroke:#FFD200; }

/* States */
.state-box { background:#fff; border-radius:14px; padding:4rem 2rem; text-align:center; border:1px solid #f1f5f9; display:flex; flex-direction:column; align-items:center; gap:0.85rem; }
.state-spinner { width:34px; height:34px; border:2.5px solid #f1f5f9; border-top-color:#FFD200; border-radius:50%; animation:spin 0.65s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.state-box p { font-size:0.86rem; color:#64748b; }
.state-box h3 { font-family:'Syne',sans-serif; font-size:1.05rem; color:#1e293b; font-weight:700; }
.state-icon-wrap { width:56px; height:56px; background:#f8fafc; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.error-wrap { background:#fff1f2; }
.state-error p { color:#dc2626; }
.btn-retry { padding:0.55rem 1.3rem; background:#1a3a52; color:#FFD200; border:none; border-radius:7px; font-size:0.82rem; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.18s; }
.btn-retry:hover { background:#0f2438; }
.btn-new-empty { display:flex; align-items:center; gap:0.5rem; padding:0.65rem 1.4rem; background:#1a3a52; color:#FFD200; border-radius:9px; text-decoration:none; font-size:0.84rem; font-weight:600; font-family:'Inter',sans-serif; transition:all 0.18s; }
.btn-new-empty:hover { background:#0f2438; transform:translateY(-1px); }

/* Grid */
.events-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1.2rem; }

.event-card { background:#fff; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; transition:transform 0.2s, box-shadow 0.2s; display:flex; flex-direction:column; }
.event-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(0,0,0,0.09); }
.event-card.is-draft { border-color:#fde68a; background:#fffef7; }

/* Image */
.card-img-wrap { position:relative; height:180px; background:#f8fafc; overflow:hidden; flex-shrink:0; }
.card-img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.35s ease; }
.event-card:hover .card-img { transform:scale(1.04); }
.card-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#f8fafc,#f1f5f9); }

.card-overlay-top { position:absolute; top:0.7rem; right:0.7rem; }
.badge-status { display:flex; align-items:center; gap:0.3rem; font-size:0.66rem; font-weight:600; padding:3px 9px; border-radius:20px; backdrop-filter:blur(4px); }
.badge-status.small { font-size:0.64rem; }
.status-pub  { background:rgba(220,252,231,0.92); color:#15803d; }
.status-draft{ background:rgba(254,243,199,0.92); color:#92400e; }
.status-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }

.draft-stamp { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:rgba(217,119,6,0.1); letter-spacing:6px; pointer-events:none; transform:rotate(-20deg); }

/* Card content */
.card-content { padding:1rem 1.1rem 0.6rem; flex:1; }
.card-date-wrap { display:flex; align-items:center; gap:0.4rem; font-size:0.72rem; color:#64748b; margin-bottom:0.5rem; }
.card-title { font-family:'Syne',sans-serif; font-size:0.93rem; font-weight:800; color:#0f172a; line-height:1.35; margin-bottom:0.4rem; letter-spacing:-0.2px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.card-excerpt { font-size:0.77rem; color:#64748b; line-height:1.6; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:0.5rem; }
.card-location { display:flex; align-items:center; gap:0.35rem; font-size:0.72rem; color:#64748b; }

/* Card actions */
.card-actions { display:flex; gap:0.4rem; padding:0.75rem 1.1rem; border-top:1px solid #f1f5f9; }
.action-btn { flex:1; padding:0.48rem 0.3rem; border-radius:7px; border:1px solid #e2e8f0; background:#fff; font-size:0.71rem; font-weight:500; cursor:pointer; text-decoration:none; text-align:center; transition:all 0.18s; color:#475569; font-family:'Inter',sans-serif; display:flex; align-items:center; justify-content:center; gap:0.3rem; }
.btn-edit:hover       { background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
.btn-delete:hover     { background:#fff1f2; border-color:#fecdd3; color:#be123c; }
.action-btn:disabled  { opacity:0.45; cursor:not-allowed; }

/* List */
.events-list { display:flex; flex-direction:column; gap:0.65rem; }
.list-row { display:flex; align-items:center; gap:1rem; background:#fff; border-radius:12px; border:1px solid #e2e8f0; padding:0.9rem 1rem; transition:box-shadow 0.18s; }
.list-row:hover { box-shadow:0 4px 16px rgba(0,0,0,0.07); }
.list-row.is-draft { border-color:#fde68a; background:#fffef7; }
.list-img { width:78px; height:58px; border-radius:8px; overflow:hidden; flex-shrink:0; background:#f1f5f9; }
.list-img img { width:100%; height:100%; object-fit:cover; display:block; }
.list-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
.list-content { flex:1; min-width:0; }
.list-badges { display:flex; gap:0.35rem; margin-bottom:0.25rem; flex-wrap:wrap; }
.list-title { font-family:'Syne',sans-serif; font-size:0.87rem; font-weight:800; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:0.18rem; }
.list-excerpt { font-size:0.75rem; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:0.22rem; }
.list-meta { font-size:0.7rem; color:#94a3b8; }
.list-actions { display:flex; gap:0.4rem; flex-shrink:0; }
.icon-btn { width:32px; height:32px; border:1px solid #e2e8f0; border-radius:7px; background:#fff; cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center; transition:all 0.18s; }
.icon-btn:hover       { background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
.ico-delete:hover     { background:#fff1f2; border-color:#fecdd3; color:#be123c; }
.icon-btn:disabled    { opacity:0.45; cursor:not-allowed; }

/* Helpers */
.loading-row { display:flex; align-items:center; gap:0.4rem; }
.spinner-xs { display:inline-block; width:11px; height:11px; border:2px solid rgba(0,0,0,0.12); border-top-color:currentColor; border-radius:50%; animation:spin 0.5s linear infinite; flex-shrink:0; }

@media (max-width:720px) {
  .page-header { flex-direction:column; gap:1rem; align-items:flex-start; }
  .btn-new { width:100%; justify-content:center; }
  .stats-row { flex-wrap:wrap; }
  .filters-bar { flex-direction:column; align-items:stretch; }
  .events-grid { grid-template-columns:1fr; }
}
</style>
