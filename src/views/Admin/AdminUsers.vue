<template>
  <div class="users-section">
    <!-- Toast Notification -->
    <Toast
      :show="toast.show"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      @close="toast.show = false"
    />

    <!-- Modal -->
    <CreateUserModal
      ref="modalRef"
      :is-open="showModal"
      @close="showModal = false"
      @submit="handleCreateUser"
    />

    <div class="section-header">
      <div class="header-info">
        <h2>Gestión de Usuarios</h2>
        <p>Administra estudiantes y publicadores del sistema</p>
      </div>
      <button class="btn-primary" @click="showModal = true">+ Nuevo Usuario</button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nombre, email o rol..."
        class="search-input"
      />
    </div>

    <!-- Users Table -->
    <div v-if="loading" class="loading">
      <p>Cargando usuarios...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadUsers" class="btn-retry">Reintentar</button>
    </div>

    <div v-else class="table-container">
      <!-- Mensaje si no hay resultados -->
      <div v-if="usuariosFiltrados.length === 0" class="empty-state">
        <p>No se encontraron usuarios que coincidan con tu búsqueda.</p>
      </div>

      <!-- Tabla de usuarios -->
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Carrera</th>
            <th>Estado</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usuariosFiltrados" :key="user.id" class="table-row">
            <td class="user-cell">
              <div class="user-avatar">{{ user.iniciales }}</div>
              <div class="user-info">
                <strong>{{ user.nombre }}</strong>
                <small>{{ user.email }}</small>
              </div>
            </td>
            <td>
              <span class="badge" :class="`badge-${user.rol.toLowerCase()}`">
                {{ user.rol }}
              </span>
            </td>
            <td>{{ user.carrera }}</td>
            <td>
              <span class="status" :class="`status-${user.estado.toLowerCase()}`">
                {{ user.estado }}
              </span>
            </td>
            <td>{{ user.fecha }}</td>
            <td class="actions-cell">
              <button class="action-btn" title="Más opciones">⋮</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="pagination-container">
      <div class="pagination-info">
        <p>Mostrando {{ usuarios.length > 0 ? currentPage * pageSize + 1 : 0 }} - {{ Math.min((currentPage + 1) * pageSize, totalElements) }} de {{ totalElements }} usuarios</p>
      </div>
      <div class="pagination-controls">
        <button
          class="btn-pagination"
          @click="currentPage--; loadUsers()"
          :disabled="currentPage === 0"
        >
          ← Anterior
        </button>
        <span class="page-indicator">Página {{ currentPage + 1 }} de {{ totalPages }}</span>
        <button
          class="btn-pagination"
          @click="currentPage++; loadUsers()"
          :disabled="currentPage >= totalPages - 1"
        >
          Siguiente →
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total Usuarios</span>
        <span class="stat-number">{{ totalElements }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Estudiantes</span>
        <span class="stat-number">{{ contarEstudiantes }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Publicadores</span>
        <span class="stat-number">{{ contarPublicadores }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Administradores</span>
        <span class="stat-number">{{ contarAdministradores }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CreateUserModal from '../../components/Admin/CreateUserModal.vue'
import Toast from '../../components/Toast.vue'
import { adminUserService } from '../../services/api'
import { getInitials } from '../../utils'

const showModal = ref(false)
const usuarios = ref([])
const loading = ref(false)
const error = ref('')
const modalRef = ref(null)
const search = ref('')

// Paginación
const currentPage = ref(0)
const pageSize = ref(10)
const totalElements = ref(0)
const totalPages = ref(0)

// Sistema de notificaciones
const toast = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
})

const showToast = (type, title, message) => {
  toast.value = {
    show: true,
    type,
    title,
    message
  }
}

// Cargar usuarios desde el backend con paginación
const loadUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await adminUserService.getAll(currentPage.value, pageSize.value)
    // Extraer datos de la respuesta paginada
    const { content, totalElements: total, totalPages: pages } = response

    totalElements.value = total
    totalPages.value = pages

    // Transformar datos del backend al formato de la tabla
    usuarios.value = content.map(user => ({
      id: user.id,
      nombre: user.fullName,
      email: user.email,
      iniciales: getInitials(user.fullName),
      rol: user.role === 'ESTUDIANTE' ? 'Estudiante' :
           user.role === 'PUBLICADOR' ? 'Publicador' : 'Administrador',
      carrera: user.career?.name || 'N/A',
      estado: user.status === 'ACTIVO' ? 'Activo' : 'Inactivo',
      fecha: new Date(user.createdAt).toLocaleDateString('es-ES')
    }))
  } catch (err) {
    console.error('Error al cargar usuarios:', err)
    error.value = 'Error al cargar usuarios del servidor'
    showToast('error', 'Error', 'No se pudieron cargar los usuarios. Verifica que el backend esté corriendo.')
  } finally {
    loading.value = false
  }
}

const contarEstudiantes = computed(() => {
  return usuarios.value.filter(u => u.rol === 'Estudiante').length
})

const contarPublicadores = computed(() => {
  return usuarios.value.filter(u => u.rol === 'Publicador').length
})

const contarAdministradores = computed(() => {
  return usuarios.value.filter(u => u.rol === 'Administrador').length
})

// Filtrar usuarios por búsqueda
const usuariosFiltrados = computed(() => {
  if (!search.value.trim()) {
    return usuarios.value
  }
  const query = search.value.toLowerCase()
  return usuarios.value.filter(u =>
    u.nombre?.toLowerCase().includes(query) ||
    u.email?.toLowerCase().includes(query) ||
    u.rol?.toLowerCase().includes(query)
  )
})

const handleCreateUser = async (formData) => {
  try {
    // Validación básica
    if (!formData.nombre || !formData.email || !formData.contrasena || !formData.confirmarContrasena) {
      showToast('error', 'Datos incompletos', 'Por favor completa todos los campos obligatorios.')
      return
    }

    // Validar que las contraseñas coincidan
    if (formData.contrasena !== formData.confirmarContrasena) {
      showToast('error', 'Error', 'Las contraseñas no coinciden.')
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showToast('error', 'Email inválido', 'Por favor ingresa un email válido.')
      return
    }

    // Validar nombre (solo letras)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
    if (!nameRegex.test(formData.nombre)) {
      showToast('error', 'Nombre inválido', 'El nombre solo puede contener letras y espacios.')
      return
    }

    // Validar contraseña temporal (solo longitud mínima)
    if (formData.contrasena.length < 8) {
      showToast('error', 'Contraseña muy corta', 'La contraseña debe tener al menos 8 caracteres.')
      return
    }

    // Preparar datos en el formato del backend
    const payload = {
      fullName: formData.nombre,
      email: formData.email,
      password: formData.contrasena,
      role: formData.tipo === 'Estudiante' ? 'ESTUDIANTE' :
            formData.tipo === 'Publicador' ? 'PUBLICADOR' : 'ADMINISTRADOR',
      mustChangePassword: true
    }

    // Solo agregar careerId si es estudiante
    if (formData.tipo === 'Estudiante' && formData.careerId) {
      payload.careerId = formData.careerId
    }

    const response = await adminUserService.create(payload)

    // ✅ SOLO resetear el formulario cuando es exitoso
    if (modalRef.value && modalRef.value.resetForm) {
      modalRef.value.resetForm()
    }

    // Cerrar modal
    showModal.value = false

    // Mostrar mensaje de éxito
    showToast('success', '✅ Usuario creado exitosamente', `El usuario ${formData.nombre} ha sido registrado correctamente.`)

    // Recargar la lista de usuarios en segundo plano
    loadUsers()
  } catch (err) {
    console.error('Error al crear usuario:', err)

    // ❌ NO resetear el formulario cuando hay error - mantener los datos
    // Manejar diferentes tipos de error
    let errorMessage = 'Por favor intenta de nuevo.'

    if (err.message.includes('409') || err.message.toLowerCase().includes('duplicate') || err.message.toLowerCase().includes('ya existe')) {
      errorMessage = 'Este correo electrónico ya está registrado. Por favor usa otro email.'
    } else if (err.message.includes('400')) {
      errorMessage = 'Datos inválidos. Verifica que todos los campos estén correctos.'
    } else if (err.message.includes('500')) {
      errorMessage = 'Error en el servidor. Por favor contacta al administrador.'
    } else {
      errorMessage = err.message || errorMessage
    }

    showToast('error', 'Error al crear usuario', errorMessage)
  }
}

// Cargar usuarios al montar el componente
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-info h2 {
  font-size: 2rem;
  color: #1a3a52;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.header-info p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.btn-primary {
  background: #FFD200;
  color: #1a3a52;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #FFC500;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 210, 0, 0.3);
}

/* Search Bar */
.search-bar {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #ffffff;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #FFD200;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

/* Table */
.loading,
.error-message {
  background: #ffffff;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.loading p,
.error-message p {
  color: #64748b;
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.btn-retry {
  background: #FFD200;
  color: #1a3a52;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #FFC500;
  transform: translateY(-2px);
}

.table-container {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.users-table th {
  padding: 1.2rem;
  text-align: left;
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.3s ease;
}

.table-row:hover {
  background: #f8fafc;
}

.users-table td {
  padding: 1.2rem;
  font-size: 0.95rem;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #1a3a52;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  font-size: 0.9rem;
}

.user-info strong {
  display: block;
  color: #1a3a52;
}

.user-info small {
  color: #64748b;
  font-size: 0.85rem;
}

/* Badges */
.badge {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-estudiante {
  background: #dbeafe;
  color: #0c4a6e;
}

.badge-publicador {
  background: #fef3c7;
  color: #92400e;
}

.badge-administrador {
  background: #f3e8ff;
  color: #6b21a8;
}

/* Status */
.status {
  display: inline-block;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-activo {
  background: #dcfce7;
  color: #166534;
}

.status-inactivo {
  background: #fee2e2;
  color: #991b1b;
}

.actions-cell {
  text-align: center;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  transition: color 0.3s ease;
}

.action-btn:hover {
  color: #1a3a52;
}

/* Paginación */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  margin-top: 2rem;
}

.pagination-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-pagination {
  background: #FFD200;
  color: #1a3a52;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-pagination:hover:not(:disabled) {
  background: #FFC500;
  transform: translateY(-2px);
}

.btn-pagination:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-indicator {
  color: #1a3a52;
  font-weight: 600;
  min-width: 150px;
  text-align: center;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1a3a52;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-primary {
    width: 100%;
  }

  .users-table {
    font-size: 0.85rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.75rem;
  }

  .user-avatar {
    width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
