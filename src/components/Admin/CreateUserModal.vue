<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Crear Nuevo Usuario</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <p class="modal-subtitle">Complete los datos para crear un nuevo usuario. La contraseña será temporal.</p>

      <form @submit.prevent="submitForm" class="form">
        <!-- Nombre Completo -->
        <div class="form-group">
          <label>Nombre Completo <span class="required">*</span></label>
          <input
            v-model="formData.nombre"
            type="text"
            placeholder="Juan Pérez García"
            class="form-input"
            :class="{ 'input-error': errors.nombre }"
            required
            @input="validateName"
          />
          <span v-if="errors.nombre" class="error-message">{{ errors.nombre }}</span>
        </div>

        <!-- Correo Electrónico -->
        <div class="form-group">
          <label>Correo Electrónico <span class="required">*</span></label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="usuario@ucb.edu.bo"
            class="form-input"
            :class="{ 'input-error': errors.email }"
            required
            @blur="validateEmail"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <!-- Tipo de Usuario -->
        <div class="form-group">
          <label>Tipo de Usuario <span class="required">*</span></label>
          <select v-model="formData.tipo" class="form-select" required>
            <option value="">Selecciona un tipo</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Publicador">Publicador</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>

        <!-- Carrera (solo para Estudiantes) -->
        <div v-if="formData.tipo === 'Estudiante'" class="form-group">
          <label>Carrera <span class="required">*</span></label>
          <select v-model.number="formData.careerId" class="form-select" required>
            <option value="">Selecciona una carrera</option>
            <option v-for="career in careers" :key="career.id" :value="career.id">
              {{ career.name }}
            </option>
          </select>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label>Contraseña Temporal <span class="required">*</span></label>
          <input
            v-model="formData.contrasena"
            type="password"
            placeholder="••••••••"
            class="form-input"
            :class="{ 'input-error': errors.contrasena }"
            required
            @input="validatePassword"
          />
          <span v-if="errors.contrasena" class="error-message">{{ errors.contrasena }}</span>
          <small class="field-hint">Mínimo 8 caracteres. El usuario deberá cambiarla en el primer acceso.</small>
        </div>

        <!-- Confirmar Contraseña -->
        <div class="form-group">
          <label>Confirmar Contraseña <span class="required">*</span></label>
          <input
            v-model="formData.confirmarContrasena"
            type="password"
            placeholder="••••••••"
            class="form-input"
            :class="{ 'input-error': errors.confirmarContrasena }"
            required
            @input="validateConfirmPassword"
          />
          <span v-if="errors.confirmarContrasena" class="error-message">{{ errors.confirmarContrasena }}</span>
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            Cancelar
          </button>
          <button type="submit" class="btn-create" :disabled="!isFormValid">
            Crear Usuario
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { careerService } from '../../services/api.js'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  nombre: '',
  email: '',
  tipo: '',
  careerId: null,
  contrasena: '',
  confirmarContrasena: ''
})

const errors = ref({
  nombre: '',
  email: '',
  contrasena: '',
  confirmarContrasena: ''
})

const careers = ref([])

const fetchCareers = async () => {
  try {
    careers.value = await careerService.getAll()
  } catch (error) {
    console.error('Error al cargar carreras:', error)
  }
}

onMounted(() => {
  fetchCareers()
})

// Validación simple de nombre (solo letras y espacios)
const validateName = () => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  if (formData.value.nombre && !nameRegex.test(formData.value.nombre)) {
    errors.value.nombre = 'El nombre solo puede contener letras y espacios'
  } else {
    errors.value.nombre = ''
  }
}

// Validación de email
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (formData.value.email && !emailRegex.test(formData.value.email)) {
    errors.value.email = 'Por favor ingresa un email válido'
  } else {
    errors.value.email = ''
  }
}

// Validación SIMPLE de contraseña (solo mínimo de caracteres)
const validatePassword = () => {
  const password = formData.value.contrasena

  if (password && password.length < 8) {
    errors.value.contrasena = 'Debe tener mínimo 8 caracteres'
  } else {
    errors.value.contrasena = ''
  }

  // Revalidar confirmación si ya hay algo escrito
  if (formData.value.confirmarContrasena) {
    validateConfirmPassword()
  }
}

// Validación de confirmar contraseña
const validateConfirmPassword = () => {
  if (formData.value.confirmarContrasena && formData.value.contrasena !== formData.value.confirmarContrasena) {
    errors.value.confirmarContrasena = 'Las contraseñas no coinciden'
  } else {
    errors.value.confirmarContrasena = ''
  }
}

// Comprobar si el formulario es válido
const isFormValid = computed(() => {
  const hasName = formData.value.nombre && formData.value.nombre.trim().length > 0
  const hasEmail = formData.value.email && formData.value.email.trim().length > 0
  const hasType = formData.value.tipo !== ''
  const hasPassword = formData.value.contrasena && formData.value.contrasena.length >= 8
  const hasPasswordConfirm = formData.value.confirmarContrasena && formData.value.contrasena === formData.value.confirmarContrasena
  const noNameError = !errors.value.nombre
  const noEmailError = !errors.value.email
  const noPasswordError = !errors.value.contrasena
  const hasCareer = formData.value.tipo !== 'Estudiante' || formData.value.careerId

  return hasName && hasEmail && hasType && hasPassword && hasPasswordConfirm && noNameError && noEmailError && noPasswordError && hasCareer
})

const closeModal = () => {
  // Resetear el formulario cuando el usuario cancela intencionalmente
  resetForm()
  emit('close')
}

const submitForm = () => {
  // Validar todo antes de enviar
  validateName()
  validateEmail()
  validatePassword()
  validateConfirmPassword()

  if (isFormValid.value) {
    emit('submit', { ...formData.value })
    // El formulario se reseteará solo si la creación es exitosa (desde el padre)
  }
}

// Función pública para resetear desde el padre (cuando sea exitoso)
const resetForm = () => {
  formData.value = {
    nombre: '',
    email: '',
    tipo: '',
    careerId: null,
    contrasena: '',
    confirmarContrasena: ''
  }
  errors.value = {
    nombre: '',
    email: '',
    contrasena: '',
    confirmarContrasena: ''
  }
}

// Exponer resetForm para que el padre pueda llamarlo
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
  max-width: 500px;
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
.form-select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f8fafc;
  color: #1a3a52;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input.input-error,
.form-select.input-error {
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
.form-select:focus {
  outline: none;
  border-color: #FFD200;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

.form-input::placeholder {
  color: #cbd5e1;
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

.btn-create {
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

.btn-create:hover:not(:disabled) {
  background: #0f2438;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 58, 82, 0.3);
}

.btn-create:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    width: 95%;
    margin: 1rem;
    border-radius: 12px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header h2 {
    font-size: 1.3rem;
  }

  .form {
    padding: 1rem;
  }

  .form-group {
    gap: 0.4rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-create {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .modal-content {
    max-width: 100%;
    width: 100%;
    margin: 0;
    border-radius: 0;
    height: 100vh;
    max-height: 100vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-subtitle {
    padding: 0 1rem;
    font-size: 0.85rem;
  }

  .form {
    padding: 1rem;
    gap: 1rem;
  }

  .form-input,
  .form-select {
    font-size: 0.9rem;
    padding: 0.65rem;
  }
}
</style>

