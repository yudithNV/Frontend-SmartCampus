<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
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

          <div
            class="drop-zone"
            :class="{ dragging: isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.docx"
              style="display:none"
              @change="handleFileChange"
            />

            <div class="upload-content">
              <p><strong>Haz clic o arrastra archivos aquí</strong></p>
              <small>Máximo 5 archivos</small>
            </div>
          </div>

          <small class="field-hint">
            Formatos aceptados: JPG, PNG, WEBP, GIF, PDF, DOCX (máx. 10MB)
          </small>

          <!-- lista -->
          <ul v-if="attachments.length > 0">
            <li v-for="(file, index) in attachments" :key="index">
              {{ file.name }}
              <button type="button" @click="attachments.splice(index, 1)">✕</button>
            </li>
          </ul>

          <!-- error -->
          <span v-if="fileError" class="error-message">
            {{ fileError }}
          </span>
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
})

const errors = ref({
  title: '',
  description: ''
})

const fileInput = ref(null)
const attachments = ref([])
const isDragging = ref(false)
const fileError = ref('')
const MAX_FILES = 5
const MAX_SIZE = 10 * 1024 * 1024

const validateAndAddFiles = (files) => {
  fileError.value = ''
  const incoming = Array.from(files)

  if (attachments.value.length + incoming.length > MAX_FILES) {
    fileError.value = `Máximo ${MAX_FILES} archivos`
    return
  }

  for (const file of incoming) {

    if (file.size > MAX_SIZE) {
      fileError.value = `${file.name} supera 10MB`
      return
    }

    attachments.value.push(file)
  }
}

const handleFileChange = (e) => {
  validateAndAddFiles(e.target.files)
  e.target.value = ''
}

const handleDrop = (e) => {
  isDragging.value = false
  validateAndAddFiles(e.dataTransfer.files)
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

  if (!formData.value.title.trim()) {
    errors.value.title = 'El título es requerido'
    return
  }

  if (formData.value.description.trim().length < 10) {
    errors.value.description = 'La descripción debe tener al menos 10 caracteres'
    return
  }

  if (isFormValid.value) {

    const form = new FormData()

    form.append('title', formData.value.title)
    form.append('category', formData.value.category)
    form.append('description', formData.value.description)

    attachments.value.forEach(file => {
      form.append('files', file)
    })

    emit('submit', form)
  }
}

const resetForm = () => {
  formData.value = {
    title: '',
    category: '',
    description: ''
  }

attachments.value = []
fileError.value = ''
isDragging.value = false

  errors.value = {
    title: '',
    description: ''
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
  width: 100%;
  height: 100%;
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
.drop-zone {
  border: 2px dashed #cbd5e1;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  background: #f8fafc;
  transition: all 0.3s ease;
  color: #64748b;
  font-size: 0.9rem;
}

.drop-zone:hover {
  border-color: #FFD200;
  background: #fffef0;
}

.drop-zone.dragging {
  border-color: #1a3a52;
  background: #eef6ff;
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
