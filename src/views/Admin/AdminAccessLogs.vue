<template>
  <div class="access-logs">

    <!-- ── HEADER ─────────────────────────────────────────────────────────── -->
    <div class="logs-header">
      <div class="logs-header__info">
        <p class="logs-header__desc">
          Registro completo de sesiones de usuario. Los correos resaltados en
          <span class="badge badge--danger">rojo</span> tienen 3 o más intentos fallidos.
        </p>
      </div>

      <!-- Filtro de estado -->
      <div class="logs-controls">
        <div class="filter-tabs">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            class="filter-tab"
            :class="{ active: activeFilter === tab.value }"
            @click="activeFilter = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Buscador -->
        <div class="logs-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por correo..."
            class="search-input"
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── RESUMEN DE SOSPECHOSOS ──────────────────────────────────────────── -->
    <div v-if="suspiciousEmails.length > 0" class="suspicious-banner">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div>
        <strong>{{ suspiciousEmails.length }} correo(s) sospechoso(s) detectado(s)</strong>
        <span> — {{ suspiciousEmails.join(', ') }}</span>
      </div>
    </div>

    <!-- ── ESTADO: CARGANDO ────────────────────────────────────────────────── -->
    <div v-if="loading" class="logs-state">
      <svg class="spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a3a52" stroke-width="2" stroke-linecap="round">
        <path d="M12 2a10 10 0 0110 10"/>
      </svg>
      <p>Cargando historial...</p>
    </div>

    <!-- ── ESTADO: ERROR ───────────────────────────────────────────────────── -->
    <div v-else-if="error" class="logs-state logs-state--error">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="loadLogs">Reintentar</button>
    </div>

    <!-- ── ESTADO: VACÍO ───────────────────────────────────────────────────── -->
    <div v-else-if="filteredLogs.length === 0" class="logs-state">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
      <p>{{ searchQuery ? 'No se encontraron resultados para tu búsqueda' : 'No hay registros de acceso' }}</p>
    </div>

    <!-- ── TABLA ───────────────────────────────────────────────────────────── -->
    <div v-else class="table-wrapper">
      <table class="logs-table">
        <thead>
          <tr>
            <th>Correo electrónico</th>
            <th>Fecha y hora</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in filteredLogs"
            :key="log.id"
            :class="{ 'row--suspicious': log.suspicious }"
          >
            <td class="cell-email">
              <div class="email-wrap">
                <span class="email-text">{{ log.email }}</span>
                <span v-if="log.suspicious" class="badge badge--danger">Sospechoso</span>
              </div>
            </td>
            <td class="cell-date">{{ formatDate(log.createdAt) }}</td>
            <td class="cell-status">
              <span
                class="status-pill"
                :class="log.success ? 'status-pill--success' : 'status-pill--failed'"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                {{ log.success ? 'Exitoso' : 'Fallido' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Contador -->
      <div class="table-footer">
        <span>{{ filteredLogs.length }} registro(s) {{ searchQuery || activeFilter !== 'todos' ? 'filtrados' : 'en total' }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { accessLogService } from '../../services/api.js'

// ─── Estado ───────────────────────────────────────────────────────────────────
const logs        = ref([])
const loading     = ref(true)
const error       = ref(null)
const searchQuery = ref('')
const activeFilter = ref('todos')

const statusTabs = [
  { label: 'Todos',    value: 'todos' },
  { label: 'Exitosos', value: 'exitosos' },
  { label: 'Fallidos', value: 'fallidos' },
]

// ─── Computed ─────────────────────────────────────────────────────────────────
const suspiciousEmails = computed(() => {
  const emails = logs.value
    .filter(l => l.suspicious)
    .map(l => l.email)
  return [...new Set(emails)]
})

const filteredLogs = computed(() => {
  let result = logs.value

  // Filtro por estado
  if (activeFilter.value === 'exitosos') result = result.filter(l => l.success)
  if (activeFilter.value === 'fallidos') result = result.filter(l => !l.success)

  // Filtro por búsqueda (solo correo, ya no IP)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(l => l.email?.toLowerCase().includes(q))
  }

  return result
})

// ─── Carga de datos ───────────────────────────────────────────────────────────
async function loadLogs() {
  loading.value = true
  error.value = null
  try {
    const res = await accessLogService.getAll()
    logs.value = res.data ?? res
  } catch (err) {
    error.value = 'No se pudo cargar el historial de accesos.'
    console.error('[AdminAccessLogs] loadLogs:', err)
  } finally {
    loading.value = false
  }
}

// ─── Formato de fecha ─────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  } catch {
    return dateStr
  }
}

onMounted(loadLogs)
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────── */
.access-logs {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.logs-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.logs-header__desc {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* ── Controles (filtro + buscador) ───────────────────────────────────────── */
.logs-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Tabs de filtro */
.filter-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.filter-tab {
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.filter-tab:hover { color: #1a3a52; }

.filter-tab.active {
  background: #ffffff;
  color: #1a3a52;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* ── Buscador ────────────────────────────────────────────────────────────── */
.logs-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
  min-width: 220px;
  color: #94a3b8;
  transition: border-color 0.15s;
}
.logs-search:focus-within {
  border-color: #1a3a52;
  color: #1a3a52;
}

.search-input {
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #1e293b;
  flex: 1;
  background: transparent;
  font-family: inherit;
}
.search-input::placeholder { color: #94a3b8; }

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  padding: 2px;
  transition: color 0.15s;
}
.search-clear:hover { color: #ef4444; }

/* ── Banner sospechosos ──────────────────────────────────────────────────── */
.suspicious-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-left: 4px solid #ef4444;
  border-radius: 10px;
  padding: 0.85rem 1.1rem;
  font-size: 0.85rem;
  color: #991b1b;
}
.suspicious-banner svg { flex-shrink: 0; margin-top: 1px; }

/* ── Estados vacío / cargando / error ───────────────────────────────────── */
.logs-state {
  background: white;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #94a3b8;
  font-size: 0.9rem;
}
.logs-state p { margin: 0; }
.logs-state--error { color: #dc2626; }

.btn-retry {
  margin-top: 0.25rem;
  padding: 0.45rem 1rem;
  background: #1a3a52;
  color: white;
  border: none;
  border-radius: 7px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-retry:hover { background: #2e7d9f; }

.spin { animation: spinAnim 0.8s linear infinite; }
@keyframes spinAnim { to { transform: rotate(360deg); } }

/* ── Tabla ───────────────────────────────────────────────────────────────── */
.table-wrapper {
  background: white;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.logs-table thead tr {
  background: #1a3a52;
}

.logs-table th {
  padding: 0.85rem 1.1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255,255,255,0.85);
}

.logs-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.1s;
}
.logs-table tbody tr:last-child { border-bottom: none; }
.logs-table tbody tr:hover { background: #f8fafc; }

/* Fila sospechosa */
.logs-table tbody tr.row--suspicious { background: #fff5f5; }
.logs-table tbody tr.row--suspicious:hover { background: #fee2e2; }

.logs-table td {
  padding: 0.85rem 1.1rem;
  color: #374151;
  vertical-align: middle;
}

/* Email */
.email-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.email-text { font-weight: 500; }

/* Fecha */
.cell-date { color: #64748b; font-size: 0.82rem; }

/* Badges */
.badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  padding: 2px 7px;
  border-radius: 20px;
  white-space: nowrap;
}
.badge--danger { background: #fee2e2; color: #b91c1c; }

/* Status pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
}
.status-pill--failed  { background: #fef2f2; color: #dc2626; }
.status-pill--success { background: #f0fdf4; color: #16a34a; }

/* Footer de tabla */
.table-footer {
  padding: 0.7rem 1.1rem;
  border-top: 1px solid #f1f5f9;
  font-size: 0.78rem;
  color: #94a3b8;
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .logs-header  { flex-direction: column; }
  .logs-controls { width: 100%; }
  .logs-search  { min-width: 100%; }
}

@media (max-width: 480px) {
  .filter-tabs { width: 100%; }
  .filter-tab  { flex: 1; text-align: center; }
}
</style>