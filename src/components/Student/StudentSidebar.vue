<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- Botón Toggle -->
    <button class="toggle-btn" @click="$emit('toggle')" :title="collapsed ? 'Expandir' : 'Contraer'">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" v-if="!collapsed"/>
        <polyline points="9 18 15 12 9 6" v-else/>
      </svg>
    </button>

    <!-- Modal de confirmación -->
    <Teleport to="body">

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

    </Teleport>

    <div class="logo-admin">
      <div class="logo-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFD200" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <transition name="text-fade">
        <div v-if="!collapsed" class="logo-text">
          <span>UCB SmartCampus</span>
          <small>Estudiante</small>
        </div>
      </transition>
    </div>

    <nav class="sidebar-menu">
      <router-link to="/estudiante/eventos" class="menu-item" :class="{ active: $route.path.includes('eventos') }">
        <span class="icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </span>
        <transition name="text-fade">
          <span v-if="!collapsed">Muro de Eventos</span>
        </transition>
      </router-link>

      <router-link to="/estudiante/noticias" class="menu-item"
        :class="{ active: $route.path.includes('noticias') }">
        <span class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2">
            <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
          </svg>
        </span>
        <transition name="text-fade">
          <span v-if="!collapsed">Muro de Noticias</span>
        </transition>
      </router-link>

      <router-link to="/estudiante/perfil" class="menu-item" :class="{ active: $route.path.includes('perfil') }">
        <span class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </span>
        <transition name="text-fade">
          <span v-if="!collapsed">Mi Perfil</span>
        </transition>
      </router-link>

      <router-link to="/estudiante/sugerencias" class="menu-item" :class="{ active: $route.path.includes('sugerencias') }">
        <span class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.5-1.5 4.5-3 6H8c-1.5-1.5-3-3.5-3-6a7 7 0 017-7z"/>
          </svg>
        </span>
        <transition name="text-fade">
          <span v-if="!collapsed">Sugerencias</span>
        </transition>
      </router-link>

      <router-link to="/estudiante/reclamos" class="menu-item" :class="{ active: $route.path.includes('reclamos') }">
        <span class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </span>
        <transition name="text-fade">
          <span v-if="!collapsed">Reclamos</span>
        </transition>
      </router-link>
    </nav>

    <div class="user-profile">
      <div class="profile-avatar">{{ userInitial }}</div>
      <transition name="text-fade">
        <div v-if="!collapsed" class="profile-info">
          <span class="profile-name">{{ userName }}</span>
          <small>{{ userEmail }}</small>
          <button class="logout" @click="showLogoutModal = true">Cerrar Sesión</button>
        </div>
      </transition>
      <button v-if="collapsed" class="logout logout-collapsed" @click="showLogoutModal = true" title="Cerrar Sesión">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18.36 6.64a9 9 0 11-12.73 0"/>
          <polyline points="12 3 12 12 16 8"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '../../services/api.js'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle'])

const router = useRouter()
const userName = ref('Estudiante')
const userEmail = ref('estudiante@ucb.edu.bo')
const showLogoutModal = ref(false)
const loggingOut = ref(false)

const userInitial = computed(() => {
  return userName.value ? userName.value.charAt(0).toUpperCase() : 'E'
})

async function loadProfile() {
  try {
    const response = await userService.getMe()
    const profile = response.data || response
    if (profile) {
      userName.value = profile.fullName || 'Estudiante'
      userEmail.value = profile.email || 'estudiante@ucb.edu.bo'
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
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  transition: width 0.3s ease;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 80px;
}

.toggle-btn {
  width: 100%;
  padding: 1rem;
  background: transparent;
  border: none;
  color: #FFD200;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease;
  margin-bottom: 1rem;
}

.toggle-btn:hover {
  background: rgba(255, 210, 0, 0.1);
}

.logo-admin {
  padding: 0 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  transition: padding 0.3s ease;
}

.sidebar.collapsed .logo-admin {
  padding: 0;
}

.logo-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.logo-text span {
  font-size: 1.1rem;
  font-weight: 700;
  display: block;
}

.logo-text small {
  font-size: 0.75rem;
  opacity: 0.8;
  display: block;
  margin-top: 0.25rem;
}

.sidebar-menu {
  flex: 1;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: padding 0.3s ease;
}

.sidebar.collapsed .sidebar-menu {
  padding: 0 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  justify-content: center;
}

.sidebar:not(.collapsed) .menu-item {
  justify-content: flex-start;
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
  flex-shrink: 0;
}

.menu-item span:not(.icon) {
  white-space: nowrap;
}

.user-profile {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: padding 0.3s ease;
}

.sidebar.collapsed .user-profile {
  padding: 1rem 0.5rem;
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
  flex-shrink: 0;
}

.profile-info {
  width: 100%;
  text-align: center;
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
  display: block;
  margin-bottom: 1rem;
}

.logout {
  display: block;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  width: 100%;
}

.logout:hover {
  background: #FFD200;
  color: #1a3a52;
  border-color: #FFD200;
}

.logout-collapsed {
  width: auto;
  padding: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Transiciones */
.text-fade-enter-active,
.text-fade-leave-active {
  transition: opacity 0.2s ease;
}

.text-fade-enter-from,
.text-fade-leave-to {
  opacity: 0;
}

/* Logout Modal */
.logout-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
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
  position: relative;
  z-index: 2147483647;
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

  .sidebar.collapsed {
    width: 100%;
  }

  .toggle-btn {
    display: none;
  }

  .sidebar-menu {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .menu-item {
    justify-content: center;
  }
}
</style>