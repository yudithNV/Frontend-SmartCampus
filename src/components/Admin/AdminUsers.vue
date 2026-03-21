<template>
  <div class="users-section">
    <!-- Modal -->
    <CreateUserModal
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
        type="text"
        placeholder="Buscar por nombre, email o rol..."
        class="search-input"
      />
    </div>

    <!-- Users Table -->
    <div class="table-container">
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
          <tr v-for="user in usuarios" :key="user.id" class="table-row">
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

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Total Usuarios</span>
        <span class="stat-number">{{ usuarios.length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Estudiantes</span>
        <span class="stat-number">{{ contarEstudiantes }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Publicadores</span>
        <span class="stat-number">{{ contarPublicadores }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CreateUserModal from './CreateUserModal.vue'

const showModal = ref(false)

const usuarios = ref([
  {
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan.perez@ucb.edu.bo',
    iniciales: 'J',
    rol: 'Estudiante',
    carrera: 'Ingeniería de Sistemas',
    estado: 'Activo',
    fecha: '14/1/2024'
  },
  {
    id: 2,
    nombre: 'María González',
    email: 'maria.gonzalez@ucb.edu.bo',
    iniciales: 'M',
    rol: 'Publicador',
    carrera: 'N/A',
    estado: 'Activo',
    fecha: '19/1/2024'
  },
  {
    id: 3,
    nombre: 'Carlos Mamani',
    email: 'carlos.mamani@ucb.edu.bo',
    iniciales: 'C',
    rol: 'Estudiante',
    carrera: 'Derecho',
    estado: 'Activo',
    fecha: '31/1/2024'
  },
  {
    id: 4,
    nombre: 'Ana Quispe',
    email: 'ana.quispe@ucb.edu.bo',
    iniciales: 'A',
    rol: 'Estudiante',
    carrera: 'Administración de Empresas',
    estado: 'Inactivo',
    fecha: '9/2/2024'
  },
  {
    id: 5,
    nombre: 'Roberto Silva',
    email: 'roberto.silva@ucb.edu.bo',
    iniciales: 'R',
    rol: 'Publicador',
    carrera: 'N/A',
    estado: 'Activo',
    fecha: '14/2/2024'
  }
])

const contarEstudiantes = computed(() => {
  return usuarios.value.filter(u => u.rol === 'Estudiante').length
})

const contarPublicadores = computed(() => {
  return usuarios.value.filter(u => u.rol === 'Publicador').length
})

const handleCreateUser = (formData) => {
  const newUser = {
    id: usuarios.value.length + 1,
    nombre: formData.nombre,
    email: formData.email,
    iniciales: formData.nombre.charAt(0).toUpperCase(),
    rol: formData.tipo,
    carrera: formData.tipo === 'Estudiante' ? formData.carrera : 'N/A',
    estado: 'Activo',
    fecha: new Date().toLocaleDateString('es-ES')
  }

  usuarios.value.push(newUser)
  showModal.value = false
}
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
.table-container {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
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
