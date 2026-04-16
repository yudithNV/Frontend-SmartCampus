<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Nuevo Reclamo</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <p class="modal-subtitle">Complete los datos para enviar su reclamo a la institución</p>

      <form @submit.prevent="submitForm" class="form">
        <!-- Título -->
        <div class="form-group">
          <label>Título <span class="required">*</span></label>
          <input
            v-model="formData.title"
            type="text"
            placeholder="Ej: Falla de WiFi en el aula 301"
            class="form-input"
            :class="{ 'input-error': errors.title }"
            required
            maxlength="120"
          />
          <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
            <small class="field-hint">{{ formData.title.length }}/120 caracteres</small>        </div>

        <!-- Categoría -->
        <div class="form-group">
          <label>Categoría <span class="required">*</span></label>
          <select v-model="formData.category" class="form-select" required>
            <option value="">Selecciona una categoría</option>
            <option value="General">General</option>
            <option value="Académico">Académico</option>
            <option value="Infraestructura">Infraestructura</option>
            <option value="Trámites">Trámites</option>
          </select>
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label>Descripción del Problema <span class="required">*</span></label>
          <textarea
            v-model="formData.description"
            placeholder="Describa detalladamente el problema o situación..."
            class="form-textarea"
            :class="{ 'input-error': errors.description }"
            required
            rows="5"
            maxlength="500"
          ></textarea>
          <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
          <div class="char-counter">
            <small>{{ formData.description.length }}/500 caracteres</small>
            <small v-if="formData.description.length < 10" class="char-warning">
              (Mínimo 10 caracteres)
            </small>
            <small v-else class="char-valid">✓ Válido</small>
          </div>
        </div>

        <!-- Evidencia (Archivo opcional) -->
        <div class="form-group">
          <label>Evidencia (Opcional)</label>
          <div class="file-upload-area">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              accept="image/*,.pdf"
              class="file-input"
              id="evidence-file"
            />
            <label for="evidence-file" class="file-label">
              <span class="file-icon">📎</span>
              <span v-if="!selectedFileName">Seleccionar archivo (imagen o PDF)</span>
              <span v-else class="selected-file">{{ selectedFileName }}</span>
            </label>
            <button
              v-if="selectedFileName"
              type="button"
              class="btn-remove-file"
              @click="removeFile"
            >
              ×
            </button>
          </div>
          <small class="field-hint">Formatos aceptados: JPG, PNG, PDF (máx. 5MB)</small>
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            Cancelar
          </button>
          <button type="submit" class="btn-submit" :disabled="!isFormValid">
            Enviar Reclamo
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  title: '',
  category: '',
  description: '',
  evidence: null
})

const errors = ref({
  title: '',
  description: ''
})

const fileInput = ref(null)
const selectedFileName = ref('')

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.value.evidence = 'El archivo no debe superar los 5MB'
      fileInput.value.value = ''
      return
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      errors.value.evidence = 'Solo se aceptan imágenes (JPG, PNG) o PDF'
      fileInput.value.value = ''
      return
    }

    formData.value.evidence = file
    selectedFileName.value = file.name
    errors.value.evidence = ''
  }
}

const removeFile = () => {
  formData.value.evidence = null
  selectedFileName.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const isFormValid = computed(() => {
  return (
    formData.value.title.trim().length > 0 &&
    formData.value.category !== '' &&
    formData.value.description.trim().length >= 10
  )
})

const closeModal = () => {
  resetForm()
  emit('close')
}

const submitForm = () => {
  // Validación final
  if (!formData.value.title.trim()) {
    errors.value.title = 'El título es requerido'
    return
  }

  if (formData.value.description.trim().length < 10) {
    errors.value.description = 'La descripción debe tener al menos 10 caracteres'
    return
  }

  if (isFormValid.value) {
    emit('submit', { ...formData.value })
  }
}

const resetForm = () => {
  formData.value = {
    title: '',
    category: '',
    description: '',
    evidence: null
  }
  errors.value = {
    title: '',
    description: ''
  }
  selectedFileName.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

defineExpose({ resetForm })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #1a3a52;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1a3a52;
}

.modal-subtitle {
  padding: 0 1.5rem;
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  padding-top: 0.75rem;
}

.form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #1a3a52;
  font-size: 0.9rem;
}

.required {
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8fafc;
  color: #1a3a52;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input.input-error,
.form-select.input-error,
.form-textarea.input-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: -0.25rem;
}

.field-hint {
  color: #94a3b8;
  font-size: 0.8rem;
  margin-top: -0.25rem;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #FFD200;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #cbd5e1;
}

/* File Upload */
.file-upload-area {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-input {
  display: none;
}

.file-label {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #64748b;
}

.file-label:hover {
  border-color: #FFD200;
  background: #fffef0;
}

.file-icon {
  font-size: 1.2rem;
}

.selected-file {
  color: #1a3a52;
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-remove-file {
  background: #ef4444;
  color: #ffffff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.btn-remove-file:hover {
  background: #dc2626;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #1a3a52;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  border-color: #1a3a52;
  background: #f8fafc;
}

.btn-submit {
  flex: 1;
  padding: 0.75rem 1rem;
  background: #1a3a52;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.btn-submit:hover:not(:disabled) {
  background: #0f2438;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 58, 82, 0.3);
}

.btn-submit:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
  }

  .form {
    padding: 1.25rem;
  }
}
</style>
