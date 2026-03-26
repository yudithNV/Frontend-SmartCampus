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
          <button type="submit" class="btn-primary" :disabled="sending">
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

    <!-- ── MODAL DE ÉXITO ─────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal">
            <div class="modal-icon">✅</div>
            <h3 class="modal-title">Sugerencia enviada</h3>
            <p class="modal-body">Tu sugerencia fue recibida correctamente. ¡Gracias por contribuir a mejorar la UCB!</p>
            <button class="btn-primary btn-primary--full" @click="closeModal">Aceptar</button>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { suggestionService } from '../../services/api.js'

// ─── Categorías — valores coinciden exactamente con el enum de la BD ──────────
const CATEGORIES = [
  { value: 'INFRAESTRUCTURA', label: 'Infraestructura' },
  { value: 'TRAMITES',        label: 'Trámites' },
  { value: 'CLASES',          label: 'Clases' },
  { value: 'OTRO',            label: 'Otro' },
]

// ─── Estado ───────────────────────────────────────────────────────────────────
const form = reactive({ category: '', body: '' })
const errors = reactive({ category: '', body: '' })
const sending = ref(false)
const showSuccessModal = ref(false)

// ─── Validación ───────────────────────────────────────────────────────────────
function validate() {
  errors.category = ''
  errors.body = ''
  let valid = true

  if (!form.category) {
    errors.category = 'Selecciona una categoría'
    valid = false
  }
  if (!form.body.trim()) {
    errors.body = 'La descripción es obligatoria'
    valid = false
  } else if (form.body.length > 500) {
    errors.body = 'La descripción no puede superar los 500 caracteres'
    valid = false
  }
  return valid
}

// ─── Enviar sugerencia ────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validate()) return

  sending.value = true
  try {
    await suggestionService.create({
      category: form.category,
      body: form.body.trim(),
    })
    showSuccessModal.value = true
  } catch (err) {
    errors.body = err.message || 'No se pudo enviar la sugerencia. Intenta de nuevo.'
    console.error('[StudentSuggestions] handleSubmit:', err)
  } finally {
    sending.value = false
  }
}

// ─── Cerrar modal y limpiar formulario ───────────────────────────────────────
function closeModal() {
  showSuccessModal.value = false
  // Limpia los campos automáticamente tras confirmar (PA)
  form.category = ''
  form.body = ''
  errors.category = ''
  errors.body = ''
}
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────── */
.suggestions-page {
  max-width: 620px;
}

/* ── Card ────────────────────────────────────────────────────────────────── */
.suggestions-card {
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

.card-header__icon {
  font-size: 2rem;
  line-height: 1;
}

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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
}

/* ── Select ──────────────────────────────────────────────────────────────── */
.select-wrapper {
  position: relative;
}

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

.form-select:focus {
  border-color: #1a3a52;
  box-shadow: 0 0 0 3px rgba(26, 58, 82, 0.08);
}

.form-select--error { border-color: #ef4444; }

.select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #64748b;
}

/* ── Textarea ────────────────────────────────────────────────────────────── */
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

.form-textarea:focus {
  border-color: #1a3a52;
  box-shadow: 0 0 0 3px rgba(26, 58, 82, 0.08);
}

.form-textarea--error { border-color: #ef4444; }

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 1.2rem;
}

.char-count {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-left: auto;
}

.char-count--limit { color: #f59e0b; font-weight: 600; }

.form-error {
  font-size: 0.78rem;
  color: #dc2626;
  font-weight: 500;
}

/* ── Acciones ────────────────────────────────────────────────────────────── */
.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 0.25rem;
  border-top: 1px solid #f1f5f9;
}

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

/* ── Modal de éxito ──────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-icon { font-size: 2.5rem; line-height: 1; }

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a3a52;
  margin: 0;
}

.modal-body {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}

/* ── Transición modal ────────────────────────────────────────────────────── */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.2s; }
.modal-enter-from .modal { transform: scale(0.95) translateY(8px); }
.modal-leave-to .modal   { transform: scale(0.95) translateY(8px); }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .suggestions-form { padding: 1.25rem; }
  .card-header { padding: 1.25rem; }
}
</style>