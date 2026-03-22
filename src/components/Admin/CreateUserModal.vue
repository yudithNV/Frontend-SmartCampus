<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Crear Nuevo Usuario</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <p class="modal-subtitle">Completa los datos para crear un nuevo usuario</p>

      <form @submit.prevent="submitForm" class="form">
        <!-- Nombre Completo -->
        <div class="form-group">
          <label>Nombre Completo</label>
          <input
            v-model="formData.nombre"
            type="text"
            placeholder="Juan Pérez"
            class="form-input"
            required
          />
        </div>

        <!-- Correo Electrónico -->
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="usuario@ucb.edu.bo"
            class="form-input"
            required
          />
        </div>

        <!-- Tipo de Usuario -->
        <div class="form-group">
          <label>Tipo de Usuario</label>
          <select v-model="formData.tipo" class="form-select" required>
            <option value="">Selecciona un tipo</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Publicador">Publicador</option>
          </select>
        </div>

        <!-- Carrera (solo para Estudiantes) -->
        <div v-if="formData.tipo === 'Estudiante'" class="form-group">
          <label>Carrera</label>
          <select v-model.number="formData.careerId" class="form-select" required>
            <option value="">Selecciona una carrera</option>
            <option v-for="career in careers" :key="career.id" :value="career.id">
              {{ career.name }}
            </option>
          </select>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label>Contraseña</label>
          <input
            v-model="formData.contrasena"
            type="password"
            placeholder="••••••••"
            class="form-input"
            required
          />
        </div>

        <!-- Botones -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">
            Cancelar
          </button>
          <button type="submit" class="btn-create">
            Crear Usuario
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
  contrasena: ''
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

const closeModal = () => {
  resetForm()
  emit('close')
}

const submitForm = () => {
  emit('submit', { ...formData.value })
  resetForm()
}

const resetForm = () => {
  formData.value = {
    nombre: '',
    email: '',
    tipo: '',
    careerId: null,
    contrasena: ''
  }
}
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
  min-height: 100vh;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
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
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
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
  font-size: 0.85rem;
  margin: 0;
  padding-top: 0.75rem;
}

.form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-weight: 600;
  color: #1a3a52;
  font-size: 0.85rem;
}

.form-input,
.form-select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #f8fafc;
  color: #1a3a52;
  transition: all 0.3s ease;
  font-family: inherit;
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
  padding: 0.6rem 1rem;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #1a3a52;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  border-color: #1a3a52;
  background: #f8fafc;
}

.btn-create {
  flex: 1;
  padding: 0.6rem 1rem;
  background: #1a3a52;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-create:hover {
  background: #0f2438;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 58, 82, 0.3);
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    margin: 1rem;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .form {
    padding: 1.25rem;
  }
}
</style>
