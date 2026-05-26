<template>
  <div class="users-section">
    <!-- Toast -->
    <Toast
      :show="toast.show"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      @close="toast.show = false"
    />

    <div class="section-header">
      <div class="header-info">
        <h2>Sugerencias de Estudiantes</h2>
        <p>Visualiza las sugerencias enviadas por los estudiantes del sistema</p>
      </div>
    </div>

    <!-- Filtro por categoría -->
    <div class="filters-bar">
      <div class="filter-row">
        <select v-model="categoryFilter" @change="applyFilter" class="filter-select">
          <option value="">Todas las categorías</option>
          <option value="INFRAESTRUCTURA">Infraestructura</option>
          <option value="TRAMITES">Trámites</option>
          <option value="CLASES">Clases</option>
          <option value="OTRO">Otro</option>
        </select>

        <button v-if="categoryFilter" @click="clearFilter" class="filter-reset-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
          Limpiar
        </button>
      </div>

      <div v-if="!loading" class="filter-result-info">
        <span v-if="suggestionsFiltradas.length > 0">
          {{ suggestionsFiltradas.length }} sugerencia{{ suggestionsFiltradas.length !== 1 ? 's' : '' }} encontrada{{ suggestionsFiltradas.length !== 1 ? 's' : '' }}
        </span>
        <span v-else class="filter-result-info--empty">Sin resultados para el filtro aplicado</span>
      </div>
    </div>

    <!-- Estado carga / error -->
    <div v-if="loading" class="loading"><p>Cargando sugerencias...</p></div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadSuggestions" class="btn-retry">Reintentar</button>
    </div>

    <!-- Tabla -->
    <div v-else class="table-wrapper">
      <div v-if="suggestionsFiltradas.length === 0" class="empty-state">
        <div class="empty-state__visual">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <h3>Sin sugerencias</h3>
        <p>No hay sugerencias registradas en el sistema.</p>
      </div>

      <div v-else class="table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Estudiante</th>
              <th>Categoría</th>
              <th>Sugerencia</th>
              <th>Fecha de envío</th>
              <th>Respuesta</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in suggestionsFiltradas" :key="s.id" class="table-row">
              <td style="color:#94a3b8; font-size:0.85rem">{{ s.id }}</td>

              <!-- Estudiante con avatar inicial -->
              <td class="user-cell">
                <div class="user-avatar">{{ getInitials(s.studentName) }}</div>
                <div class="user-info">
                  <strong>{{ s.studentName }}</strong>
                </div>
              </td>

              <!-- Categoría con badge de color -->
              <td>
                <span class="badge" :class="categoryClass(s.category)">
                  {{ categoryLabel(s.category) }}
                </span>
              </td>

              <!-- Cuerpo truncado con tooltip -->
              <td class="body-cell" :title="s.body">
                {{ truncate(s.body, 80) }}
              </td>

              <!-- Fecha formateada -->
              <td>{{ formatDate(s.createdAt) }}</td>

              <!-- Estado de respuesta -->
              <td>
                <span v-if="s.adminResponse" class="status status-activo">Respondida</span>
                <span v-else class="status status-pendiente">Pendiente</span>
              </td>

              <!-- Botón responder -->
              <td>
                <button
                  class="action-btn action-btn--reply"
                  :title="s.adminResponse ? 'Ver / editar respuesta' : 'Responder'"
                  @click="openReplyModal(s)"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total</span>
        <span class="stat-number">{{ suggestions.length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Infraestructura</span>
        <span class="stat-number">{{ countBy('INFRAESTRUCTURA') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Trámites</span>
        <span class="stat-number">{{ countBy('TRAMITES') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Clases</span>
        <span class="stat-number">{{ countBy('CLASES') }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Otro</span>
        <span class="stat-number">{{ countBy('OTRO') }}</span>
      </div>
    </div>

    <!-- ── MODAL RESPONDER SUGERENCIA ─────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showReplyModal" class="delete-overlay" @click.self="cancelReply">
          <div class="edit-modal">
            <div class="edit-modal__header">
              <h3 class="edit-modal__title">Responder sugerencia</h3>
              <button class="edit-modal__close" @click="cancelReply">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="edit-modal__body">
              <!-- Datos de la sugerencia -->
              <div class="reply-suggestion-preview">
                <span class="badge" :class="categoryClass(replyTarget?.category)">
                  {{ categoryLabel(replyTarget?.category) }}
                </span>
                <p class="reply-suggestion-body">{{ replyTarget?.body }}</p>
                <small class="reply-suggestion-meta">{{ replyTarget?.studentName }} · {{ formatDate(replyTarget?.createdAt) }}</small>
              </div>

              <!-- Campo de respuesta -->
              <div class="form-group">
                <label class="form-label">Tu respuesta *</label>
                <textarea
                  v-model="replyText"
                  class="form-input reply-textarea"
                  placeholder="Escribe tu respuesta al estudiante..."
                  rows="5"
                  maxlength="1000"
                ></textarea>
                <small style="color:#94a3b8; font-size:0.75rem; text-align:right; display:block">
                  {{ replyText.length }} / 1000
                </small>
              </div>

              <div v-if="replyError" class="edit-error-banner">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {{ replyError }}
              </div>
            </div>

            <div class="edit-modal__actions">
              <button class="btn-cancel" @click="cancelReply" :disabled="replying">Cancelar</button>
              <button class="btn-save" @click="confirmReply" :disabled="replying || !replyText.trim()">
                <svg v-if="replying" class="btn-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M12 2a10 10 0 0110 10"/>
                </svg>
                {{ replying ? 'Enviando...' : 'Enviar respuesta' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Toast from '../../components/Toast.vue'
import { suggestionService } from '../../services/api'
import { getInitials } from '../../utils'

const suggestions     = ref([])
const loading         = ref(false)
const error           = ref('')
const categoryFilter  = ref('')
const toast           = ref({ show: false, type: 'success', title: '', message: '' })

// ── Estado modal respuesta ────────────────────────────────────────────────────
const showReplyModal = ref(false)
const replyTarget    = ref(null)
const replyText      = ref('')
const replyError     = ref('')
const replying       = ref(false)

const showToast = (type, title, message) => {
  toast.value = { show: true, type, title, message }
}

// ── Carga (filtro server-side) ──────────────────────────────────────────────
const loadSuggestions = async () => {
  loading.value = true
  error.value   = ''
  try {
    const res = await suggestionService.getAll(categoryFilter.value)
    suggestions.value = res.data ?? res
  } catch (err) {
    error.value = 'Error al cargar sugerencias del servidor'
    showToast('error', 'Error', err.message || 'No se pudieron cargar las sugerencias.')
  } finally {
    loading.value = false
  }
}

// ── Filtro (ahora es solo un alias de suggestions, el filtro real está en el backend) ──
const suggestionsFiltradas = computed(() => suggestions.value)

const applyFilter = () => loadSuggestions()
const clearFilter = () => { 
  categoryFilter.value = '' 
  loadSuggestions() 
}

// ── Modal respuesta ───────────────────────────────────────────────────────────
function openReplyModal(s) {
  replyTarget.value = s
  replyText.value   = s.adminResponse || ''
  replyError.value  = ''
  showReplyModal.value = true
}

function cancelReply() {
  if (replying.value) return
  showReplyModal.value = false
  replyTarget.value = null
  replyText.value = ''
  replyError.value = ''
}

async function confirmReply() {
  if (!replyText.value.trim()) return
  replying.value = true
  replyError.value = ''
  try {
    const res = await suggestionService.reply(replyTarget.value.id, {
      adminResponse: replyText.value.trim()
    })
    const updated = res.data ?? res

    // Actualizar la fila en la tabla sin recargar
    const idx = suggestions.value.findIndex(s => s.id === replyTarget.value.id)
    if (idx !== -1) {
      suggestions.value[idx] = {
        ...suggestions.value[idx],
        adminResponse:   updated.adminResponse,
        respondedByName: updated.respondedByName,
        respondedAt:     updated.respondedAt
      }
    }

    showToast('success', 'Respuesta enviada', 'La respuesta fue registrada correctamente.')
    showReplyModal.value = false
    replyTarget.value = null
    replyText.value = ''
  } catch (err) {
    replyError.value = err.message || 'No se pudo enviar la respuesta.'
  } finally {
    replying.value = false
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const countBy = (cat) => suggestions.value.filter(s => s.category === cat).length

const truncate = (text, len) =>
  text && text.length > len ? text.slice(0, len) + '...' : text

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : '—'

const categoryLabel = (cat) => ({
  INFRAESTRUCTURA: 'Infraestructura',
  TRAMITES:        'Trámites',
  CLASES:          'Clases',
  OTRO:            'Otro'
}[cat] ?? cat)

const categoryClass = (cat) => ({
  INFRAESTRUCTURA: 'badge-infra',
  TRAMITES:        'badge-tramites',
  CLASES:          'badge-clases',
  OTRO:            'badge-otro'
}[cat] ?? '')

onMounted(loadSuggestions)
</script>

<style scoped>
/* ── Reutiliza exactamente los mismos tokens que AdminUsers ──────────────── */
.users-section { width: 100%; padding: 2rem; box-sizing: border-box; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-info h2 { font-size: 2rem; color: #1a3a52; margin: 0 0 0.5rem 0; font-weight: 700; }
.header-info p  { color: #64748b; margin: 0; font-size: 0.95rem; }

/* Filtros */
.filters-bar { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.875rem 1.25rem; margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.65rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.filter-row { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center; }
.filter-select { padding: 0.5rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.8rem; font-family: inherit; color: #0f1f2e; background: #f8fafc; cursor: pointer; outline: none; flex: 1; min-width: 200px; }
.filter-select:focus { border-color: #1a3a52; }
.filter-reset-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.9rem; border: 1.5px solid #fecdd3; border-radius: 8px; background: #fff1f2; color: #be123c; font-size: 0.8rem; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap; }
.filter-reset-btn:hover { background: #ffe4e6; }
.filter-result-info { font-size: 0.78rem; color: #64748b; }
.filter-result-info--empty { color: #d97706; font-weight: 600; }

/* Tabla */
.loading, .error-message { background: #fff; border-radius: 12px; padding: 3rem; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 2rem; }
.loading p, .error-message p { color: #64748b; margin: 0 0 1rem 0; }
.btn-retry { background: #FFD200; color: #1a3a52; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
.table-wrapper { width: 100%; }
.table-container { overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; margin-bottom: 2rem; }
.empty-state { padding: 3rem 2rem; text-align: center; color: #64748b; }
.empty-state__visual { margin-bottom: 1rem; color: #cbd5e1; }
.empty-state h3 { color: #1a3a52; margin: 0 0 0.5rem; }
.users-table { width: 100%; border-collapse: collapse; }
.users-table thead { background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
.users-table th { padding: 1.2rem; text-align: left; font-weight: 600; color: #475569; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
.table-row { border-bottom: 1px solid #e2e8f0; transition: background 0.2s; }
.table-row:hover { background: #f8fafc; }
.users-table td { padding: 1.2rem; font-size: 0.95rem; vertical-align: middle; }

.user-cell { display: flex; align-items: center; gap: 1rem; }
.user-avatar { width: 40px; height: 40px; background: #1a3a52; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 0.9rem; }
.user-info strong { display: block; color: #1a3a52; }

.body-cell { max-width: 320px; color: #475569; font-size: 0.9rem; }

/* Badges de categoría */
.badge { display: inline-block; padding: 0.4rem 0.85rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.badge-infra    { background: #dbeafe; color: #0c4a6e; }
.badge-tramites { background: #fef3c7; color: #92400e; }
.badge-clases   { background: #dcfce7; color: #166534; }
.badge-otro     { background: #f3e8ff; color: #6b21a8; }

/* Status de respuesta */
.status { display: inline-block; padding: 0.25rem 0.7rem; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
.status-activo { background: #d1fae5; color: #065f46; }
.status-pendiente { background: #fef3c7; color: #92400e; }

/* Action buttons */
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
}
.action-btn--reply {
  border: 1.5px solid #bbf7d0;
  color: #059669;
}
.action-btn--reply:hover { background: #f0fdf4; border-color: #059669; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1.5rem; }
.stat-card { background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 0.5rem; }
.stat-label  { color: #64748b; font-size: 0.9rem; }
.stat-number { font-size: 2rem; font-weight: 700; color: #1a3a52; }

/* Modal styles */
.delete-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.edit-modal {
  background: #fff;
  border-radius: 20px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
.edit-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.edit-modal__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a3a52;
  margin: 0;
}
.edit-modal__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.edit-modal__close:hover { color: #ef4444; }
.edit-modal__body { padding: 1.5rem; }
.edit-modal__actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}
.form-input {
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: #FFD200;
  box-shadow: 0 0 0 2px rgba(255, 210, 0, 0.2);
}
.reply-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  line-height: 1.6;
}
.reply-suggestion-preview {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.875rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}
.reply-suggestion-body {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
  margin: 0;
}
.reply-suggestion-meta {
  font-size: 0.75rem;
  color: #94a3b8;
}
.btn-cancel {
  padding: 0.6rem 1.2rem;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover { background: #e2e8f0; }
.btn-save {
  padding: 0.6rem 1.2rem;
  background: #FFD200;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  color: #1a3a52;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-save:hover:not(:disabled) { background: #e6be00; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.edit-error-banner {
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #b91c1c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .users-section { padding: 1rem; }
  .users-table { min-width: 600px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>