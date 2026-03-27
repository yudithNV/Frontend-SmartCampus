<template>
  <aside class="sidebar">
    <!-- Modal de confirmación -->
    <Transition name="modal-fade">
      <div v-if="showLogoutModal" class="logout-modal-overlay" @click.self="showLogoutModal = false">
        <div class="logout-modal-box">
          <h3>¿Cerrar sesión?</h3>
          <p>¿Estás seguro de que deseas cerrar tu sesión?</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showLogoutModal = false">Cancelar</button>
            <button class="btn-logout" @click="confirmLogout" :disabled="loggingOut">
              <span v-if="!loggingOut">Cerrar Sesión</span>
              <span v-else>Cerrando...</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div class="logo-admin">
      <div class="logo-icon">
        <!-- Graduation Cap -->
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFD200" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <span>UCB SmartCampus</span>
      <small>Admin Panel</small>
    </div>

    <nav class="sidebar-menu">
      <router-link to="/admin/dashboard" class="menu-item" :class="{ active: $route.path.includes('dashboard') }">
        <span class="icon">
          <!-- Dashboard -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </span>
        <span>Dashboard</span>
      </router-link>

      <router-link to="/admin/usuarios" class="menu-item" :class="{ active: $route.path.includes('usuarios') }">
        <span class="icon">
          <!-- Users -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
        </span>
        <span>Usuarios</span>
      </router-link>

      <router-link to="/admin/configuracion" class="menu-item" :class="{ active: $route.path.includes('configuracion') }">
        <span class="icon">
          <!-- Settings -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </span>
        <span>Configuración</span>
      </router-link>
    </nav>

    <div class="user-profile">
      <div class="profile-avatar">{{ userInitial }}</div>
      <div class="profile-info">
        <span class="profile-name">{{ userName }}</span>
        <small>{{ userEmail }}</small>
      </div>
      <button class="logout" @click="showLogoutModal = true">Cerrar Sesión</button>
    </div>
  </aside>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '../../services/api.js'

const router = useRouter()
const userName = ref('Administrador')
const userEmail = ref('admin@ucb.edu.bo')
const showLogoutModal = ref(false)
const loggingOut = ref(false)

const userInitial = computed(() => {
  return userName.value ? userName.value.charAt(0).toUpperCase() : 'A'
})

async function loadProfile() {
  try {
    const response = await userService.getMe()
    const profile = response.data || response
    if (profile) {
      userName.value = profile.fullName || 'Administrador'
      userEmail.value = profile.email || 'admin@ucb.edu.bo'
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error)
    // Mantener valores por defecto si falla
  }
}

async function confirmLogout() {
  loggingOut.value = true
  try {
    await userService.logout()
    // Limpiar localStorage
    localStorage.removeItem('ucb_token')
    localStorage.removeItem('ucb_user_id')
    // Navegar a home
    router.push('/')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    // Aun así navegar
    router.push('/')
  } finally {
    loggingOut.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: #1a3a52;
  color: #ffffff;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.logo-admin {
  padding: 0 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.logo-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.logo-admin span {
  font-size: 1.1rem;
  font-weight: 700;
  display: block;
}

.logo-admin small {
  font-size: 0.75rem;
  opacity: 0.8;
  display: block;
  margin-top: 0.25rem;
}

.sidebar-menu {
  flex: 1;
  padding: 0 1rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(255, 210, 0, 0.1);
  color: #FFD200;
}

.menu-item.active {
  background: #FFD200;
  color: #1a3a52;
  font-weight: 600;
}

.menu-item .icon {
  font-size: 1.3rem;
}

.user-profile {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.profile-avatar {
  width: 50px;
  height: 50px;
  background: #FFD200;
  color: #1a3a52;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.profile-info span {
  display: block;
  font-size: 0.95rem;
}

.profile-name {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.profile-info small {
  font-size: 0.8rem;
  opacity: 0.7;
}

.logout {
  display: block;
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.logout:hover {
  background: #FFD200;
  color: #1a3a52;
  border-color: #FFD200;
}

/* Logout Modal */
.logout-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-modal-box {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: modalPopIn 0.3s ease;
}

@keyframes modalPopIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.logout-modal-box h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a3a52;
  margin: 0 0 0.5rem 0;
}

.logout-modal-box p {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.btn-cancel,
.btn-logout {
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.btn-cancel {
  background: #e2e8f0;
  color: #475569;
  border: 1.5px solid #cbd5e1;
}

.btn-cancel:hover {
  background: #cbd5e1;
}

.btn-logout {
  background: #ef4444;
  color: #fff;
  flex: 1;
}

.btn-logout:hover:not(:disabled) {
  background: #dc2626;
}

.btn-logout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Transición modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }

  .sidebar-menu {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
