<template>
  <div class="suggestions-page">

    <!-- ── FORMULARIO ────────────────────────────────────────────────────── -->
    <div class="suggestions-card">
      <div class="card-header">
        <div class="card-header__icon">💡</div>
        <div>
          <h2 class="card-header__title">Enviar sugerencia</h2>
          <p class="card-header__subtitle">Tu opinión ayuda a mejorar la universidad</p>
        </div>
      </div>

      <div class="profile-divider"></div>

      <form class="suggestions-form" @submit.prevent="handleSubmit">

        <!-- Categoría -->
        <div class="form-group">
          <label class="form-label">Categoría *</label>
          <div class="select-wrapper">
            <select v-model="form.category" class="form-select" :class="{ 'form-select--error': errors.category }">
              <option value="" disabled>Selecciona una categoría</option>
              <option v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
            <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </div>
          <span v-if="errors.category" class="form-error">{{ errors.category }}</span>
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label class="form-label">Descripción *</label>
          <textarea
            v-model="form.body"
            class="form-textarea"
            :class="{ 'form-textarea--error': errors.body }"
            placeholder="Describe tu sugerencia con el mayor detalle posible..."
            rows="6"
            maxlength="500"
          ></textarea>
          <div class="textarea-footer">
            <span v-if="errors.body" class="form-error">{{ errors.body }}</span>
            <span v-else></span>
            <span class="char-count" :class="{ 'char-count--limit': form.body.length >= 450 }">
              {{ form.body.length }} / 500
            </span>
          </div>
        </div>

        <!-- Botón enviar -->
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="sending || !form.body.trim() || !form.category">
            <svg v-if="sending" class="btn-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9"/>
            </svg>
            {{ sending ? 'Enviando...' : 'Enviar sugerencia' }}
          </button>
        </div>

      </form>
    </div>

    <!-- ── HISTORIAL DE SUGERENCIAS ───────────────────────────────────────── -->
    <div class="history-card">
      <div class="card-header">
        <div class="card-header__icon">📋</div>
        <div>
          <h2 class="card-header__title">Mis sugerencias enviadas</h2>
          <p class="card-header__subtitle">Seguimiento de tus sugerencias anteriores</p>
        </div>
      </div>

      <div class="profile-divider"></div>

      <!-- Cargando -->
      <div v-if="loadingHistory" class="history-state">
        <svg class="spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a3a52" stroke-width="2.5" stroke-linecap="round">
          <path d="M12 2a10 10 0 0110 10"/>
        </svg>
        <span>Cargando historial...</span>
      </div>

      <!-- Error -->
      <div v-else-if="historyError" class="history-state history-state--error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ historyError }}</span>
      </div>

      <!-- PA: mensaje si no hay sugerencias -->
      <div v-else-if="history.length === 0" class="history-state">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Aún no has enviado ninguna sugerencia.</span>
      </div>

      <!-- PA: lista con categoría, vista previa, fecha y botón eliminar -->
      <div v-else class="history-list">
        <div
          v-for="item in history"
          :key="item.id"
          class="history-item"
        >
          <div class="history-item__left">
            <span class="history-item__cat">{{ formatCategory(item.category) }}</span>
            <p class="history-item__body">{{ truncate(item.body, 120) }}</p>
          </div>
          <div class="history-item__right">
            <span class="history-item__date">{{ formatDate(item.createdAt) }}</span>
            <button
              class="btn-delete-item"
              title="Eliminar sugerencia"
              @click="openDeleteModal(item)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
                <path d="M10,11v6"/><path d="M14,11v6"/>
                <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL DE ÉXITO ─────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal">
            <div class="modal-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" fill="#dcfce7" stroke="#059669"/>
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <h3 class="modal-title">Sugerencia enviada</h3>
            <p class="modal-body">Tu sugerencia fue recibida correctamente. ¡Gracias por contribuir a mejorar la UCB!</p>
            <button class="btn-primary btn-primary--full" @click="closeModal">Aceptar</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── MODAL CONFIRMAR ELIMINACIÓN ───────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDelete">
          <div class="modal">
            <div class="modal-icon modal-icon--danger">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <h3 class="modal-title">¿Eliminar sugerencia?</h3>
            <p class="modal-body">Esta acción no se puede deshacer.</p>
            <div class="modal-actions">
              <button class="btn-cancel" @click="cancelDelete" :disabled="deleting">
                Cancelar
              </button>
              <button class="btn-confirm-delete" @click="confirmDelete" :disabled="deleting">
                <svg v-if="deleting" class="btn-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M12 2a10 10 0 0110 10"/>
                </svg>
                {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { suggestionService } from '../../services/api.js'

// ─── Categorías ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
  { value: 'TRAMITES',        label: 'Trámites' },
  { value: 'CLASES',          label: 'Clases' },
  { value: 'OTRO',            label: 'Otro' },
]

const CATEGORY_LABELS = {
  INFRAESTRUCTURA: 'Infraestructura',
  TRAMITES: 'Trámites',
  CLASES: 'Clases',
  OTRO: 'Otro',
}

// ─── Estado formulario ────────────────────────────────────────────────────────
const form = reactive({ category: '', body: '' })
const errors = reactive({ category: '', body: '' })
const sending = ref(false)
const showSuccessModal = ref(false)

// ─── Estado historial ─────────────────────────────────────────────────────────
const history = ref([])
const loadingHistory = ref(true)
const historyError = ref(null)

// ─── Estado eliminación ───────────────────────────────────────────────────────
const showDeleteModal = ref(false)
const itemToDelete = ref(null)
const deleting = ref(false)

// ─── Helpers ──────────────────────────────────────────────────────────────────
function truncate(text, max) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '...' : text
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('es-BO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  } catch { return '—' }
}

function formatCategory(cat) {
  return CATEGORY_LABELS[cat] || cat || '—'
}

// ─── Cargar historial ─────────────────────────────────────────────────────────
async function loadHistory() {
  loadingHistory.value = true
  historyError.value = null
  try {
    const res = await suggestionService.getMy()
    const data = res.data ?? res
    history.value = Array.isArray(data) ? data : []
  } catch (err) {
    historyError.value = 'No se pudo cargar el historial.'
    console.error('[StudentSuggestions] loadHistory:', err)
  } finally {
    loadingHistory.value = false
  }
}

// ─── Eliminar sugerencia ──────────────────────────────────────────────────────
function openDeleteModal(item) {
  itemToDelete.value = item
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  itemToDelete.value = null
}

async function confirmDelete() {
  if (!itemToDelete.value) return
  deleting.value = true
  try {
    await suggestionService.delete(itemToDelete.value.id)
    // Quitar de la lista sin recargar
    history.value = history.value.filter(s => s.id !== itemToDelete.value.id)
    showDeleteModal.value = false
    itemToDelete.value = null
  } catch (err) {
    console.error('[StudentSuggestions] confirmDelete:', err)
  } finally {
    deleting.value = false
  }
}

// ─── Validación ───────────────────────────────────────────────────────────────
function validate() {
  errors.category = ''
  errors.body = ''
  let valid = true
  if (!form.category) { errors.category = 'Selecciona una categoría'; valid = false }
  if (!form.body.trim()) {
    errors.body = 'La descripción es obligatoria'; valid = false
  } else if (form.body.length > 500) {
    errors.body = 'La descripción no puede superar los 500 caracteres'; valid = false
  }
  return valid
}

// ─── Enviar sugerencia ────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validate()) return
  sending.value = true
  try {
    await suggestionService.create({ category: form.category, body: form.body.trim() })
    showSuccessModal.value = true
  } catch (err) {
    errors.body = err.message || 'No se pudo enviar la sugerencia. Intenta de nuevo.'
    console.error('[StudentSuggestions] handleSubmit:', err)
  } finally {
    sending.value = false
  }
}

// ─── Cerrar modal éxito y recargar historial ──────────────────────────────────
function closeModal() {
  showSuccessModal.value = false
  form.category = ''
  form.body = ''
  errors.category = ''
  errors.body = ''
  loadHistory()
}

onMounted(loadHistory)
</script>

<style scoped>
.suggestions-page {
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Cards base ──────────────────────────────────────────────────────────── */
.suggestions-card,
.history-card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.75rem 2rem;
}

.card-header__icon { font-size: 2rem; line-height: 1; }

.card-header__title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a3a52;
  margin: 0 0 0.2rem;
}

.card-header__subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.profile-divider { height: 1px; background: #f1f5f9; }

/* ── Formulario ──────────────────────────────────────────────────────────── */
.suggestions-form {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }

.form-label { font-size: 0.82rem; font-weight: 600; color: #374151; }

.select-wrapper { position: relative; }

.form-select {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 0.875rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  background: white;
  outline: none;
  appearance: none;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.form-select:focus { border-color: #1a3a52; box-shadow: 0 0 0 3px rgba(26,58,82,0.08); }
.form-select--error { border-color: #ef4444; }

.select-arrow {
  position: absolute; right: 0.75rem; top: 50%;
  transform: translateY(-50%); pointer-events: none; color: #64748b;
}

.form-textarea {
  padding: 0.7rem 0.875rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #1e293b;
  outline: none;
  resize: vertical;
  min-height: 140px;
  font-family: inherit;
  line-height: 1.6;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: white;
  width: 100%;
  box-sizing: border-box;
}
.form-textarea:focus { border-color: #1a3a52; box-shadow: 0 0 0 3px rgba(26,58,82,0.08); }
.form-textarea--error { border-color: #ef4444; }

.textarea-footer { display: flex; justify-content: space-between; align-items: center; min-height: 1.2rem; }

.char-count { font-size: 0.75rem; color: #94a3b8; margin-left: auto; }
.char-count--limit { color: #f59e0b; font-weight: 600; }

.form-error { font-size: 0.78rem; color: #dc2626; font-weight: 500; }

.form-actions { display: flex; justify-content: flex-end; padding-top: 0.25rem; border-top: 1px solid #f1f5f9; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.5rem;
  background: #1a3a52;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}
.btn-primary:hover:not(:disabled) { background: #2e7d9f; }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-primary--full { width: 100%; justify-content: center; }

.btn-spinner { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Historial ───────────────────────────────────────────────────────────── */
.history-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #94a3b8;
  font-size: 0.875rem;
}
.history-state--error { color: #dc2626; }

.spin { animation: spin 0.8s linear infinite; }

.history-list {
  display: flex;
  flex-direction: column;
}

.history-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.1s;
}
.history-item:last-child { border-bottom: none; }
.history-item:hover { background: #f8fafc; }

.history-item__left { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; }

.history-item__cat {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #2e7d9f;
  background: #e0f2fe;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
}

.history-item__body {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
  margin: 0;
}

/* Lado derecho: fecha + botón eliminar */
.history-item__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.history-item__date {
  font-size: 0.75rem;
  color: #94a3b8;
  white-space: nowrap;
}

.btn-delete-item {
  background: none;
  border: 1.5px solid #fecaca;
  border-radius: 6px;
  padding: 0.3rem 0.45rem;
  cursor: pointer;
  color: #dc2626;
  display: inline-flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s, border-color 0.15s;
}
.history-item:hover .btn-delete-item { opacity: 1; }
.btn-delete-item:hover { background: #fee2e2; border-color: #dc2626; }

/* ── Modales ─────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 14px;
  padding: 2rem;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  width: 56px; height: 56px;
  background: #dcfce7;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.modal-icon--danger { background: #fef2f2; }

.modal-title { font-size: 1.1rem; font-weight: 700; color: #1a3a52; margin: 0; }
.modal-body  { font-size: 0.875rem; color: #64748b; margin: 0; line-height: 1.6; }

.modal-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.25rem;
}

.btn-cancel {
  flex: 1;
  padding: 0.65rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-cancel:hover:not(:disabled) { background: #f8fafc; }
.btn-cancel:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-confirm-delete {
  flex: 1;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 8px;
  background: #dc2626;
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.btn-confirm-delete:hover:not(:disabled) { background: #b91c1c; }
.btn-confirm-delete:disabled { opacity: 0.55; cursor: not-allowed; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s; }
.modal-enter-from .modal { transform: scale(0.95) translateY(8px); }
.modal-leave-to .modal   { transform: scale(0.95) translateY(8px); }

@media (max-width: 640px) {
  .suggestions-form, .card-header { padding: 1.25rem; }
  .history-item { padding: 1rem 1.25rem; }
  .btn-delete-item { opacity: 1; }
}
</style>