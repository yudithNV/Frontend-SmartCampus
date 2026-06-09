<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="report-overlay" @click.self="$emit('close')">
        <div
          class="report-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-title"
        >

          <!-- Header -->
          <div class="report-modal__header">
            <div class="report-modal__icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
            </div>

            <h3 id="report-title" class="report-modal__title">
              Reportar comentario
            </h3>

            <button
              class="report-modal__close"
              @click="$emit('close')"
              aria-label="Cerrar"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Comentario citado -->
          <div class="report-modal__quote">
            <p class="report-modal__quote-text">
              {{ commentBody }}
            </p>
          </div>

          <!-- Body -->
          <div class="report-modal__body">

            <p class="report-modal__label">
              ¿Por qué reportas este comentario?
              <span class="report-required">*</span>
            </p>

            <!-- Reasons -->
            <div class="report-reasons">

              <button
                v-for="reason in REASONS"
                :key="reason.value"
                class="reason-btn"
                :class="{ 'reason-btn--selected': selectedReason === reason.value }"
                @click="selectedReason = reason.value"
              >

                <!-- ICONOS -->
                <span class="reason-btn__icon">

                  <!-- Lenguaje ofensivo -->
                  <svg
                    v-if="reason.icon === 'offensive'"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>

                  <!-- Acoso -->
                  <svg
                    v-else-if="reason.icon === 'warning'"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>

                  <!-- Spam -->
                  <svg
                    v-else-if="reason.icon === 'megaphone'"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M3 11v2"/>
                    <path d="M6 10v4"/>
                    <path d="M9 9v6"/>
                    <path d="M13 8l8-4v16l-8-4H9V9h4z"/>
                  </svg>

                  <!-- Desinformación -->
                  <svg
                    v-else-if="reason.icon === 'alert'"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>

                  <!-- Otro -->
                  <svg
                    v-else-if="reason.icon === 'edit'"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/>
                  </svg>

                </span>

                <span class="reason-btn__label">
                  {{ reason.label }}
                </span>

                <span
                  v-if="selectedReason === reason.value"
                  class="reason-btn__check"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                  >
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>

              </button>

            </div>

            <!-- Description -->
            <div class="report-desc-wrap">

              <label class="report-modal__label report-modal__label--sm">
                Descripción adicional
                <span class="report-optional">(opcional)</span>
              </label>

              <textarea
                v-model="description"
                class="report-desc"
                placeholder="Describe brevemente el problema..."
                maxlength="300"
                rows="3"
              ></textarea>

              <span
                v-if="description.length > 240"
                class="report-char-count"
              >
                {{ description.length }}/300
              </span>

            </div>

          </div>

          <!-- Footer -->
          <div class="report-modal__footer">

            <button
              class="report-cancel-btn"
              @click="$emit('close')"
            >
              Cancelar
            </button>

            <button
              class="report-submit-btn"
              :disabled="!selectedReason || submitting"
              @click="handleSubmit"
            >

              <span
                v-if="submitting"
                class="report-spinner"
              ></span>

              <svg
                v-else
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>

              {{ submitting ? 'Enviando...' : 'Enviar reporte' }}

            </button>

          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const REASONS = [
  {
    value: 'LENGUAJE_OFENSIVO',
    label: 'Lenguaje ofensivo',
    icon: 'offensive'
  },
  {
    value: 'ACOSO',
    label: 'Acoso o amenaza',
    icon: 'warning'
  },
  {
    value: 'SPAM',
    label: 'Spam o publicidad',
    icon: 'megaphone'
  },
  {
    value: 'DESINFORMACION',
    label: 'Desinformación',
    icon: 'alert'
  },
  {
    value: 'OTRO',
    label: 'Otro motivo',
    icon: 'edit'
  },
]

const props = defineProps({
  visible: { type: Boolean, default: false },
  commentBody: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])

const selectedReason = ref(null)
const description = ref('')

function handleSubmit() {
  if (!selectedReason.value) return

  emit('submit', {
    reason: selectedReason.value,
    description: description.value.trim() || null,
  })
}

function reset() {
  selectedReason.value = null
  description.value = ''
}

defineExpose({ reset })
</script>

<style scoped>
.report-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 31, 46, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.report-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.report-modal__header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.report-modal__icon {
  width: 36px;
  height: 36px;
  background: #fff7ed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
  flex-shrink: 0;
}

.report-modal__title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f1f2e;
  margin: 0;
  flex: 1;
}

.report-modal__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  padding: 0.3rem;
  border-radius: 6px;
  transition: color 0.15s;
}

.report-modal__close:hover {
  color: #0f1f2e;
}

.report-modal__quote {
  margin: 0.9rem 1.25rem 0;
  padding: 0.65rem 0.9rem;
  background: #f8fafc;
  border-left: 3px solid #e2e8f0;
  border-radius: 0 8px 8px 0;
}

.report-modal__quote-text {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.report-modal__body {
  padding: 0.9rem 1.25rem 0;
}

.report-modal__label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.65rem;
}

.report-modal__label--sm {
  margin-top: 1rem;
  margin-bottom: 0.45rem;
}

.report-required {
  color: #ef4444;
}

.report-optional {
  font-weight: 400;
  color: #94a3b8;
}

.report-reasons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.reason-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  text-align: left;
  transition: all 0.15s;
}

.reason-btn:hover {
  border-color: #d97706;
  background: #fff7ed;
}

.reason-btn--selected {
  border-color: #d97706;
  background: #fff7ed;
  color: #92400e;
}

.reason-btn__icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reason-btn__label {
  flex: 1;
}

.reason-btn__check {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #d97706;
  display: flex;
}

.report-desc-wrap {
  position: relative;
}

.report-desc {
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #1e293b;
  background: #f8fafc;
  resize: none;
  outline: none;
  transition: border-color 0.18s;
  line-height: 1.5;
  box-sizing: border-box;
}

.report-desc:focus {
  border-color: #1a3a52;
  background: #fff;
}

.report-char-count {
  position: absolute;
  bottom: 6px;
  right: 10px;
  font-size: 0.68rem;
  color: #f59e0b;
  font-weight: 600;
}

.report-modal__footer {
  display: flex;
  gap: 0.65rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  margin-top: 0.9rem;
}

.report-cancel-btn {
  flex: 1;
  padding: 0.65rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.report-submit-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem;
  border: none;
  border-radius: 10px;
  background: #d97706;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.report-submit-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.report-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.5s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .report-modal,
.modal-fade-leave-to .report-modal {
  transform: scale(0.94) translateY(10px);
}
</style>