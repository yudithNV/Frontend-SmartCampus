<template>
  <aside class="sidebar">
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
      <router-link to="/" class="logout">Cerrar Sesión</router-link>
    </div>
  </aside>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { userService } from '../../services/api.js'

const userName = ref('Administrador')
const userEmail = ref('admin@ucb.edu.bo')

const userInitial = computed(() => {
  return userName.value ? userName.value.charAt(0).toUpperCase() : 'A'
})

async function loadProfile() {
  try {
    const response = await userService.getProfile()
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
  color: #cbd5e1;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.logout:hover {
  color: #FFD200;
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
