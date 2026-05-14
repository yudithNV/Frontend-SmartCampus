<template>
  <div class="complaints-section">
    <!-- ── HEADER ─────────────────────────────────────────────────────────── -->
    <div class="complaints-header">
      <div class="complaints-header__info">
        <p class="complaints-header__desc">
          Administra y resuelve reclamos de estudiantes. Marca como en revisión, responde y cierra.
        </p>
      </div>

      <!-- Controles: Filtros y Búsqueda -->
      <div class="complaints-controls">
        <div class="filter-tabs">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            class="filter-tab"
            :class="{ active: activeFilter === tab.value }"
            @click="activeFilter = tab.value; applyFilters()"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Buscador -->
        <div class="complaints-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por título o categoría..."
            class="search-input"
            @input="applyFilters"
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''; applyFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── ESTADO: CARGANDO ────────────────────────────────────────────────── -->
    <div v-if="loading" class="complaints-state">
      <svg class="spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a3a52" stroke-width="2" stroke-linecap="round">
        <path d="M12 2a10 10 0 0110 10"/>
      </svg>
      <p>Cargando reclamos...</p>
    </div>

    <!-- ── ESTADO: VACÍO ───────────────────────────────────────────────────── -->
    <div v-else-if="filteredComplaints.length === 0" class="complaints-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
      <p>{{ searchQuery ? 'No se encontraron reclamos' : 'Sin reclamos en este estado' }}</p>
    </div>

    <!-- ── LISTA DE RECLAMOS ───────────────────────────────────────────────── -->
    <div v-else class="complaints-list">
      <div v-for="complaint in filteredComplaints" :key="complaint.id" class="complaint-card">
        <div class="complaint-card__header">
          <div class="complaint-card__content">
            <h3 class="complaint-card__title">{{ complaint.title }}</h3>
            <p class="complaint-card__category">{{ complaint.category }}</p>
          </div>
          <div class="complaint-card__status" :class="getStatusClass(complaint.status)">
            {{ formatStatus(complaint.status) }}
          </div>
        </div>

        <p class="complaint-card__body">{{ complaint.body.substring(0, 120) }}...</p>

        <div class="complaint-card__footer">
          <small class="complaint-card__date">{{ formatDate(complaint.createdAt) }}</small>
          <router-link :to="`/admin/reclamos/${complaint.id}`" class="complaint-card__link">
            Ver detalle →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminComplaintService } from '../../services/api'

const complaints = ref([])
const loading = ref(false)
const searchQuery = ref('')
const activeFilter = ref('TODOS')

const statusTabs = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'En Revisión', value: 'EN_REVISION' },
  { label: 'Resueltos', value: 'RESUELTO' }
]

const filteredComplaints = computed(() => {
  return complaints.value.filter(complaint => {
    const matchesStatus = activeFilter.value === 'TODOS' || complaint.status === activeFilter.value
    const matchesSearch = searchQuery.value === '' || 
      complaint.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

async function loadComplaints() {
  loading.value = true
  try {
    const data = await adminComplaintService.getAll()
    complaints.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error cargando reclamos:', error)
    complaints.value = []
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  // La reactividad de Vue se encarga del computed
}

function getStatusClass(status) {
  const classes = {
    PENDIENTE: 'status-open',
    EN_REVISION: 'status-review',
    RESUELTO: 'status-resolved',
    CERRADO: 'status-closed'
  }
  return classes[status] || 'status-open'
}

function formatStatus(status) {
  const labels = {
    PENDIENTE: 'Pendiente',
    EN_REVISION: 'En Revisión',
    RESUELTO: 'Resuelto',
    CERRADO: 'Cerrado'
  }
  return labels[status] || status
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  loadComplaints()
})
</script>

<style scoped>
.complaints-section {
  width: 100%;
}

/* ── HEADER ─────────────────────────────────────────────────────────────── */
.complaints-header {
  margin-bottom: 2rem;
}

.complaints-header__info {
  margin-bottom: 1.5rem;
}

.complaints-header__desc {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
}

.complaints-controls {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.6rem 1rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: #e2e8f0;
  color: #1a3a52;
}

.filter-tab.active {
  background: #1a3a52;
  color: #ffffff;
  border-color: #1a3a52;
}

.complaints-search {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  flex: 1;
  min-width: 250px;
}

.complaints-search svg {
  color: #94a3b8;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.9rem;
  color: #1a3a52;
}

.search-input::placeholder {
  color: #cbd5e1;
}

.search-clear {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
}

.search-clear:hover {
  color: #1a3a52;
}

/* ── ESTADOS ────────────────────────────────────────────────────────────── */
.complaints-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.complaints-state svg {
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.complaints-state p {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
}

.spin {
  animation: spin 1s linear infinite;
  color: #1a3a52;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── LISTA DE RECLAMOS ───────────────────────────────────────────────────── */
.complaints-list {
  display: grid;
  gap: 1rem;
}

.complaint-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.complaint-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.complaint-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.complaint-card__content {
  flex: 1;
  min-width: 0;
}

.complaint-card__title {
  margin: 0 0 0.25rem 0;
  color: #1a3a52;
  font-size: 1.1rem;
  font-weight: 600;
  word-break: break-word;
}

.complaint-card__category {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}

.complaint-card__status {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  text-transform: capitalize;
}

.status-open {
  background: #fef3c7;
  color: #92400e;
}

.status-review {
  background: #dbeafe;
  color: #1e40af;
}

.status-resolved {
  background: #dcfce7;
  color: #15803d;
}

.status-closed {
  background: #f3f4f6;
  color: #374151;
}

.complaint-card__body {
  margin: 0 0 1rem 0;
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
}

.complaint-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.complaint-card__date {
  color: #94a3b8;
  font-size: 0.85rem;
}

.complaint-card__link {
  color: #1a3a52;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.complaint-card__link:hover {
  color: #FFD200;
}

/* ── RESPONSIVE ─────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .complaints-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .complaints-search {
    min-width: auto;
  }

  .filter-tabs {
    width: 100%;
  }

  .complaint-card__header {
    flex-direction: column;
  }

  .complaint-card__status {
    align-self: flex-start;
  }

  .complaint-card__footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .complaint-card__link {
    width: 100%;
    text-align: center;
  }
}
</style>
