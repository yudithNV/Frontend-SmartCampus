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

    <!-- Modal crear usuario -->
    <CreateUserModal
      ref="modalRef"
      :is-open="showModal"
      @close="showModal = false"
      @submit="handleCreateUser"
    />

    <!-- ── MODAL EDITAR USUARIO ───────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showEditModal" class="delete-overlay" @click.self="cancelEdit">
          <div class="edit-modal">
            <div class="edit-modal__header">
              <h3 class="edit-modal__title">Editar Usuario</h3>
              <button class="edit-modal__close" @click="cancelEdit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <!-- Error de correo duplicado -->
            <div v-if="editError" class="edit-error-banner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ editError }}
            </div>

            <div class="edit-modal__body">
              <!-- Nombre completo -->
              <div class="form-group">
                <label class="form-label">Nombre completo</label>
                <input
                  v-model="editForm.fullName"
                  type="text"
                  class="form-input"
                  placeholder="Nombre completo"
                />
              </div>

              <!-- Correo -->
              <div class="form-group">
                <label class="form-label">Correo electrónico</label>
                <input
                  v-model="editForm.email"
                  type="email"
                  class="form-input"
                  placeholder="correo@ucb.edu.bo"
                />
              </div>

              <!-- Rol -->
              <div class="form-group">
                <label class="form-label">Rol</label>
                <select v-model="editForm.role" class="form-input">
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="PUBLICADOR">Publicador</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>

              <!-- Estado -->
              <div class="form-group">
                <label class="form-label">Estado</label>
                <select v-model="editForm.status" class="form-input">
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>

              <!-- Carrera — solo si es estudiante -->
              <div v-if="editForm.role === 'ESTUDIANTE'" class="form-group">
                <label class="form-label">Carrera</label>
                <select v-model="editForm.careerId" class="form-input">
                  <option :value="null">Sin carrera</option>
                  <option v-for="career in careers" :key="career.id" :value="career.id">
                    {{ career.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="edit-modal__actions">
              <button class="btn-cancel" @click="cancelEdit" :disabled="saving">
                Cancelar
              </button>
              <button class="btn-save" @click="confirmEdit" :disabled="saving">
                <svg v-if="saving" class="btn-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M12 2a10 10 0 0110 10"/>
                </svg>
                {{ saving ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── MODAL ELIMINAR USUARIO ─────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showDeleteModal" class="delete-overlay" @click.self="cancelDelete">
          <div class="delete-modal">
            <div class="delete-modal__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>

            <h3 class="delete-modal__title">¿Eliminar usuario?</h3>

            <p class="delete-modal__desc">
              Estás a punto de eliminar a
              <strong>{{ userToDelete?.nombre }}</strong>.
              <br/>
              <span class="delete-modal__warning">⚠️ Esta acción no se puede deshacer.</span>
            </p>

            <div class="delete-modal__actions">
              <button class="btn-cancel" @click="cancelDelete" :disabled="deleting">
                Cancelar
              </button>
              <button class="btn-delete" @click="confirmDelete" :disabled="deleting">
                <svg v-if="deleting" class="btn-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M12 2a10 10 0 0110 10"/>
                </svg>
                {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="section-header">
      <div class="header-info">
        <h2>Gestión de Usuarios</h2>
        <p>Administra estudiantes y publicadores del sistema</p>
      </div>
      <button class="btn-primary" @click="showModal = true">+ Nuevo Usuario</button>
    </div>

    <!-- Filtros Bar -->
    <div class="filters-bar">
      <div class="filter-search">
        <svg class="filter-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="search"
          @input="handleSearch"
          type="text"
          placeholder="Buscar por nombre o email..."
          class="filter-search__input"
        />
        <button v-if="search" @click="clearSearch" class="filter-clear-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="filter-row">
        <select v-model="roleFilter" @change="handleRoleChange" class="filter-select">
          <option value="">Todos los Roles</option>
          <option value="ESTUDIANTE">Estudiante</option>
          <option value="PUBLICADOR">Publicador</option>
          <option value="ADMINISTRADOR">Administrador</option>
        </select>

        <select v-model="statusFilter" @change="handleStatusChange" class="filter-select">
          <option value="">Todos los Estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>

        <select v-model="careerFilter" @change="handleCareerChange" class="filter-select">
          <option value="">Todas las carreras</option>
          <option v-for="career in careers" :key="career.id" :value="career.id">
            {{ career.name }}
          </option>
        </select>

        <button v-if="hasActiveFilters" @click="clearAllFilters" class="filter-reset-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
          </svg>
          Limpiar
        </button>
      </div>

      <div v-if="!loading" class="filter-result-info">
        <span v-if="usuariosFiltrados && usuariosFiltrados.length > 0">
          {{ usuariosFiltrados.length }} usuario{{ usuariosFiltrados.length !== 1 ? 's' : '' }} encontrado{{ usuariosFiltrados.length !== 1 ? 's' : '' }}
        </span>
        <span v-else class="filter-result-info--empty">Sin resultados para los filtros aplicados</span>
      </div>
    </div>

    <!-- Users Table -->
    <div v-if="loading" class="loading"><p>Cargando usuarios...</p></div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadUsers" class="btn-retry">Reintentar</button>
    </div>

    <div v-else class="table-wrapper">
      <div v-if="usuariosFiltrados.length === 0" class="empty-state">
        <div class="empty-state__visual">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>
          </svg>
        </div>
        <h3>Sin Resultados</h3>
        <p>Intenta con otros filtros o términos de búsqueda.</p>
      </div>

      <div v-else class="table-container">
        <table class="users-table">
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
                <span class="badge" :class="`badge-${user.rol.toLowerCase()}`">{{ user.rol }}</span>
              </td>
              <td>{{ user.carrera }}</td>
              <td>
                <span class="status" :class="`status-${user.estado.toLowerCase()}`">{{ user.estado }}</span>
              </td>
              <td>{{ user.fecha }}</td>
              <td class="actions-cell">
                <template v-if="user.id !== currentAdminId">
                  <!-- PA 1: botón editar -->
                  <button
                    class="action-btn action-btn--edit"
                    title="Editar usuario"
                    @click="openEditModal(user)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <!-- botón eliminar -->
                  <button
                    class="action-btn action-btn--delete"
                    title="Eliminar usuario"
                    @click="openDeleteModal(user)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
                      <path d="M10,11v6"/><path d="M14,11v6"/>
                      <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6"/>
                    </svg>
                  </button>
                </template>
                <span v-else class="action-self-label">Tú</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Paginación -->
    <div class="pagination-container">
      <div class="pagination-info">
        <p>Mostrando {{ usuarios.length > 0 ? currentPage * pageSize + 1 : 0 }} - {{ Math.min((currentPage + 1) * pageSize, totalElements) }} de {{ totalElements }} usuarios</p>
      </div>
      <div class="pagination-controls">
        <button class="btn-pagination" @click="currentPage--; loadUsers()" :disabled="currentPage === 0">← Anterior</button>
        <span class="page-indicator">Página {{ currentPage + 1 }} de {{ totalPages }}</span>
        <button class="btn-pagination" @click="currentPage++; loadUsers()" :disabled="currentPage >= totalPages - 1">Siguiente →</button>
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
import { adminUserService, careerService } from '../../services/api'
import { getInitials } from '../../utils'

const showModal = ref(false)
const usuarios = ref([])
const loading = ref(false)
const error = ref('')
const modalRef = ref(null)
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const careerFilter = ref('')
const careers = ref([])
let searchTimeout

// Paginación
const currentPage = ref(0)
const pageSize = ref(10)
const totalElements = ref(0)
const totalPages = ref(0)

// ─── ID del admin en sesión — para bloquear auto-eliminación ──────────────────
const currentAdminId = computed(() => localStorage.getItem('ucb_user_id') || null)

// ─── Estado eliminación ───────────────────────────────────────────────────────
const showDeleteModal = ref(false)
const userToDelete = ref(null)
const deleting = ref(false)

// ─── Estado edición ───────────────────────────────────────────────────────────
const showEditModal = ref(false)
const userToEdit = ref(null)
const saving = ref(false)
const editError = ref('')
const editForm = ref({
  fullName: '',
  email: '',
  role: 'ESTUDIANTE',
  status: 'ACTIVO',
  careerId: null
})

// Toast
const toast = ref({ show: false, type: 'success', title: '', message: '' })
const showToast = (type, title, message) => {
  toast.value = { show: true, type, title, message }
}

// ─── Abrir modal de edición con datos precargados (PA 4) ──────────────────────
function openEditModal(user) {
  userToEdit.value = user
  editError.value = ''
  editForm.value = {
    fullName: user.nombre,
    email: user.email,
    role: user.rolRaw,        // valor backend: ESTUDIANTE / PUBLICADOR / ADMINISTRADOR
    status: user.estadoRaw,   // valor backend: ACTIVO / INACTIVO
    careerId: user.careerId ?? null
  }
  showEditModal.value = true
}

function cancelEdit() {
  showEditModal.value = false
  userToEdit.value = null
  editError.value = ''
}

// ─── Guardar edición ──────────────────────────────────────────────────────────
async function confirmEdit() {
  if (!userToEdit.value) return
  editError.value = ''

  if (!editForm.value.fullName.trim() || !editForm.value.email.trim()) {
    editError.value = 'El nombre y el correo son obligatorios.'
    return
  }

  saving.value = true
  try {
    const payload = {
      fullName: editForm.value.fullName.trim(),
      email: editForm.value.email.trim(),
      role: editForm.value.role,
      status: editForm.value.status,
      careerId: editForm.value.role === 'ESTUDIANTE' ? editForm.value.careerId : null
    }

    const res = await adminUserService.update(userToEdit.value.id, payload)
    const updated = res.data ?? res

    // Actualizar la fila en la tabla sin recargar
    const idx = usuarios.value.findIndex(u => u.id === userToEdit.value.id)
    if (idx !== -1) {
      usuarios.value[idx] = mapUser(updated)
    }

    showEditModal.value = false
    userToEdit.value = null
    // PA 3: mensaje de confirmación exacto
    showToast('success', 'Datos actualizados correctamente', `El usuario ${payload.fullName} fue actualizado.`)
  } catch (err) {
    // PA 2: error si el correo ya está en uso
    editError.value = err.message || 'No se pudo actualizar el usuario.'
  } finally {
    saving.value = false
  }
}

// ─── Mapear usuario del backend al formato de la tabla ────────────────────────
function mapUser(user) {
  return {
    id: user.id,
    nombre: user.fullName,
    email: user.email,
    iniciales: getInitials(user.fullName),
    rol: user.role === 'ESTUDIANTE' ? 'Estudiante' :
         user.role === 'PUBLICADOR' ? 'Publicador' : 'Administrador',
    rolRaw: user.role,                         // valor original para el formulario
    carrera: user.career?.name || 'N/A',
    careerId: user.career?.id ?? null,         // para precargar select de carrera
    estado: user.status === 'ACTIVO' ? 'Activo' : 'Inactivo',
    estadoRaw: user.status,                    // valor original para el formulario
    fecha: new Date(user.createdAt).toLocaleDateString('es-ES')
  }
}

// ─── Abrir modal de eliminación ───────────────────────────────────────────────
function openDeleteModal(user) {
  userToDelete.value = user
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  userToDelete.value = null
}

// ─── Confirmar eliminación ────────────────────────────────────────────────────
async function confirmDelete() {
  if (!userToDelete.value) return
  deleting.value = true
  try {
    await adminUserService.delete(userToDelete.value.id)

    usuarios.value = usuarios.value.filter(u => u.id !== userToDelete.value.id)
    totalElements.value = Math.max(0, totalElements.value - 1)

    showDeleteModal.value = false
    userToDelete.value = null

    showToast('success', 'Usuario eliminado', 'Usuario eliminado correctamente')
  } catch (err) {
    showToast('error', 'Error al eliminar', err.message || 'No se pudo eliminar el usuario.')
  } finally {
    deleting.value = false
  }
}

// ─── Cargar usuarios ──────────────────────────────────────────────────────────
const loadUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await adminUserService.getAll(
      currentPage.value,
      pageSize.value,
      search.value,
      roleFilter.value,
      statusFilter.value,
      careerFilter.value
    )
    const { content, totalElements: total, totalPages: pages } = response
    totalElements.value = total
    totalPages.value = pages
    usuarios.value = content.map(mapUser)
  } catch (err) {
    console.error('Error al cargar usuarios:', err)
    error.value = 'Error al cargar usuarios del servidor'
    showToast('error', 'Error', 'No se pudieron cargar los usuarios.')
  } finally {
    loading.value = false
  }
}

const contarEstudiantes    = computed(() => usuarios.value.filter(u => u.rol === 'Estudiante').length)
const contarPublicadores   = computed(() => usuarios.value.filter(u => u.rol === 'Publicador').length)
const contarAdministradores = computed(() => usuarios.value.filter(u => u.rol === 'Administrador').length)

const usuariosFiltrados = computed(() => {
  if (!search.value.trim()) return usuarios.value
  const query = search.value.toLowerCase()
  return usuarios.value.filter(u =>
    u.nombre?.toLowerCase().includes(query) ||
    u.email?.toLowerCase().includes(query) ||
    u.rol?.toLowerCase().includes(query)
  )
})

const handleCreateUser = async (formData) => {
  try {
    if (!formData.nombre || !formData.email || !formData.contrasena || !formData.confirmarContrasena) {
      showToast('error', 'Datos incompletos', 'Por favor completa todos los campos obligatorios.')
      return
    }
    if (formData.contrasena !== formData.confirmarContrasena) {
      showToast('error', 'Error', 'Las contraseñas no coinciden.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showToast('error', 'Email inválido', 'Por favor ingresa un email válido.')
      return
    }
    if (formData.contrasena.length < 8) {
      showToast('error', 'Contraseña muy corta', 'La contraseña debe tener al menos 8 caracteres.')
      return
    }

    const payload = {
      fullName: formData.nombre,
      email: formData.email,
      password: formData.contrasena,
      role: formData.tipo === 'Estudiante' ? 'ESTUDIANTE' :
            formData.tipo === 'Publicador' ? 'PUBLICADOR' : 'ADMINISTRADOR',
      mustChangePassword: true
    }
    if (formData.tipo === 'Estudiante' && formData.careerId) {
      payload.careerId = formData.careerId
    }

    await adminUserService.create(payload)

    if (modalRef.value && modalRef.value.resetForm) modalRef.value.resetForm()
    showModal.value = false
    showToast('success', '✅ Usuario creado exitosamente', `El usuario ${formData.nombre} ha sido registrado correctamente.`)
    loadUsers()
  } catch (err) {
    let errorMessage = 'Por favor intenta de nuevo.'
    if (err.message.includes('409') || err.message.toLowerCase().includes('ya existe')) {
      errorMessage = 'Este correo electrónico ya está registrado.'
    } else {
      errorMessage = err.message || errorMessage
    }
    showToast('error', 'Error al crear usuario', errorMessage)
  }
}

const handleSearch = () => {
  currentPage.value = 0
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { loadUsers() }, 500)
}

const clearSearch = () => {
  search.value = ''
  currentPage.value = 0
  clearTimeout(searchTimeout)
  loadUsers()
}

const handleRoleChange   = () => { currentPage.value = 0; loadUsers() }
const handleStatusChange = () => { currentPage.value = 0; loadUsers() }
const handleCareerChange = () => { currentPage.value = 0; loadUsers() }

const clearAllFilters = () => {
  search.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
  careerFilter.value = ''
  currentPage.value = 0
  clearTimeout(searchTimeout)
  loadUsers()
}

const hasActiveFilters = computed(() =>
  search.value || roleFilter.value || statusFilter.value || careerFilter.value
)

const loadCareers = async () => {
  try {
    const response = await careerService.getAll()
    careers.value = response
  } catch (err) {
    console.error('Error al cargar carreras:', err)
  }
}

onMounted(async () => {
  await loadCareers()
  await loadUsers()
})
</script>

<style scoped>
.users-section { width: 100%; padding: 2rem; box-sizing: border-box; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.header-info h2 { font-size: 2rem; color: #1a3a52; margin: 0 0 0.5rem 0; font-weight: 700; }
.header-info p  { color: #64748b; margin: 0; font-size: 0.95rem; }

.btn-primary { background: #FFD200; color: #1a3a52; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; }
.btn-primary:hover { background: #FFC500; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255,210,0,0.3); }

/* ── Filtros ─────────────────────────────────────────────────────────────── */
.filters-bar { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0.875rem 1.25rem; margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.65rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.filter-search { position: relative; display: flex; align-items: center; flex: 1; }
.filter-search__icon { position: absolute; left: 0.75rem; color: #94a3b8; pointer-events: none; }
.filter-search__input { width: 100%; padding: 0.6rem 2.5rem 0.6rem 2.4rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.875rem; font-family: inherit; color: #0f1f2e; background: #f8fafc; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.filter-search__input:focus { border-color: #1a3a52; box-shadow: 0 0 0 3px rgba(26,58,82,0.08); background: #fff; }
.filter-clear-btn { position: absolute; right: 0.65rem; background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; align-items: center; padding: 0.25rem; border-radius: 4px; }
.filter-clear-btn:hover { color: #0f1f2e; }
.filter-row { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center; }
.filter-select { padding: 0.5rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 0.8rem; font-family: inherit; color: #0f1f2e; background: #f8fafc; cursor: pointer; outline: none; flex: 1; min-width: 160px; }
.filter-select:focus { border-color: #1a3a52; }
.filter-reset-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.9rem; border: 1.5px solid #fecdd3; border-radius: 8px; background: #fff1f2; color: #be123c; font-size: 0.8rem; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap; }
.filter-reset-btn:hover { background: #ffe4e6; }
.filter-result-info { font-size: 0.78rem; color: #64748b; }
.filter-result-info--empty { color: #d97706; font-weight: 600; }

/* ── Tabla ───────────────────────────────────────────────────────────────── */
.loading, .error-message { background: #fff; border-radius: 12px; padding: 3rem; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 2rem; }
.loading p, .error-message p { color: #64748b; margin: 0 0 1rem 0; }
.btn-retry { background: #FFD200; color: #1a3a52; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
.table-wrapper { width: 100%; }
.table-container { overflow-x: auto; border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; margin-bottom: 2rem; }
.empty-state { padding: 3rem 2rem; text-align: center; color: #64748b; }
.empty-state h3 { color: #1a3a52; margin: 0.75rem 0 0.5rem; }
.users-table { width: 100%; border-collapse: collapse; }
.users-table thead { background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
.users-table th { padding: 1.2rem; text-align: left; font-weight: 600; color: #475569; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
.table-row { border-bottom: 1px solid #e2e8f0; transition: background 0.2s; }
.table-row:hover { background: #f8fafc; }
.users-table td { padding: 1.2rem; font-size: 0.95rem; vertical-align: middle; }
.user-cell { display: flex; align-items: center; gap: 1rem; }
.user-avatar { width: 40px; height: 40px; background: #1a3a52; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; font-size: 0.9rem; }
.user-info strong { display: block; color: #1a3a52; }
.user-info small { color: #64748b; font-size: 0.85rem; }

.badge { display: inline-block; padding: 0.4rem 0.85rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.badge-estudiante    { background: #dbeafe; color: #0c4a6e; }
.badge-publicador    { background: #fef3c7; color: #92400e; }
.badge-administrador { background: #f3e8ff; color: #6b21a8; }

.status { display: inline-block; padding: 0.4rem 0.85rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; }
.status-activo   { background: #dcfce7; color: #166534; }
.status-inactivo { background: #fee2e2; color: #991b1b; }

/* ── Acciones ────────────────────────────────────────────────────────────── */
.actions-cell { text-align: center; display: flex; gap: 0.4rem; align-items: center; justify-content: center; }

.action-btn {
  background: none;
  border-radius: 7px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: background 0.15s, border-color 0.15s;
}

.action-btn--edit {
  border: 1.5px solid #bfdbfe;
  color: #1d4ed8;
}
.action-btn--edit:hover { background: #eff6ff; border-color: #1d4ed8; }

.action-btn--delete {
  border: 1.5px solid #fecaca;
  color: #dc2626;
}
.action-btn--delete:hover { background: #fee2e2; border-color: #dc2626; }

.action-self-label { font-size: 0.72rem; color: #94a3b8; font-weight: 600; }

/* ── Paginación ──────────────────────────────────────────────────────────── */
.pagination-container { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-bottom: 2rem; }
.pagination-info p { margin: 0; color: #64748b; font-size: 0.95rem; }
.pagination-controls { display: flex; align-items: center; gap: 1rem; }
.btn-pagination { background: #FFD200; color: #1a3a52; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; font-size: 0.9rem; }
.btn-pagination:hover:not(:disabled) { background: #FFC500; transform: translateY(-2px); }
.btn-pagination:disabled { background: #e2e8f0; color: #94a3b8; cursor: not-allowed; opacity: 0.6; }
.page-indicator { color: #1a3a52; font-weight: 600; min-width: 150px; text-align: center; }

/* ── Stats ───────────────────────────────────────────────────────────────── */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.stat-card { background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 0.5rem; }
.stat-label  { color: #64748b; font-size: 0.9rem; }
.stat-number { font-size: 2rem; font-weight: 700; color: #1a3a52; }

/* ── Modal editar ────────────────────────────────────────────────────────── */
.delete-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}

.edit-modal {
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  animation: popIn 0.25s cubic-bezier(0.34,1.5,0.64,1) both;
  overflow: hidden;
}

.edit-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.edit-modal__title { font-size: 1.05rem; font-weight: 700; color: #1a3a52; margin: 0; }

.edit-modal__close {
  background: none; border: none; cursor: pointer;
  color: #94a3b8; padding: 0.25rem; border-radius: 6px;
  display: flex; align-items: center;
  transition: color 0.15s, background 0.15s;
}
.edit-modal__close:hover { color: #1a3a52; background: #e2e8f0; }

.edit-error-banner {
  margin: 0.75rem 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
  font-size: 0.825rem;
  color: #dc2626;
  font-weight: 500;
}

.edit-modal__body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.35rem; }

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.form-input {
  padding: 0.6rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: #0f1f2e;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.form-input:focus { border-color: #1a3a52; box-shadow: 0 0 0 3px rgba(26,58,82,0.08); background: #fff; }

.edit-modal__actions {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid #f1f5f9;
}

/* ── Modal eliminar ──────────────────────────────────────────────────────── */
.delete-modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  animation: popIn 0.25s cubic-bezier(0.34,1.5,0.64,1) both;
}

@keyframes popIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }

.delete-modal__icon {
  width: 56px; height: 56px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.delete-modal__title { font-size: 1.15rem; font-weight: 700; color: #1a3a52; margin: 0; }

.delete-modal__desc {
  font-size: 0.875rem; color: #64748b;
  line-height: 1.6; margin: 0;
}

.delete-modal__warning { color: #b45309; font-weight: 600; font-size: 0.82rem; }

.delete-modal__actions { display: flex; gap: 0.75rem; width: 100%; margin-top: 0.25rem; }

/* Botones compartidos */
.btn-cancel {
  flex: 1; padding: 0.65rem 1rem;
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: white; color: #374151;
  font-size: 0.875rem; font-weight: 500; cursor: pointer;
  font-family: inherit; transition: background 0.15s;
}
.btn-cancel:hover:not(:disabled) { background: #f8fafc; }
.btn-cancel:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-save {
  flex: 1; padding: 0.65rem 1rem;
  border: none; border-radius: 8px;
  background: #1a3a52; color: white;
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: background 0.15s;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.btn-save:hover:not(:disabled) { background: #2e5a7a; }
.btn-save:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-delete {
  flex: 1; padding: 0.65rem 1rem;
  border: none; border-radius: 8px;
  background: #dc2626; color: white;
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: background 0.15s;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.btn-delete:hover:not(:disabled) { background: #b91c1c; }
.btn-delete:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-spin { animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .section-header { flex-direction: column; gap: 1rem; }
  .btn-primary { width: 100%; }
  .users-table { min-width: 700px; }
  .filter-row { flex-direction: column; }
  .filter-select { width: 100%; min-width: 100%; }
  .pagination-container { flex-direction: column; gap: 1rem; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>