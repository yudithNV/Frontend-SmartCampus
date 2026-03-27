<template>
  <aside class="sidebar">
    <div class="logo-admin">
      <div class="logo-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFD200" stroke-width="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <span>UCB SmartCampus</span>
      <small>Publicador</small>
    </div>

    <nav class="sidebar-menu">
      <router-link to="/publicador/dashboard" class="menu-item" :class="{ active: $route.path.includes('dashboard') }">
        <span class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </span>
        <span>Dashboard</span>
      </router-link>

      <router-link to="/publicador/crear-noticia" class="menu-item" :class="{ active: $route.path.includes('crear-noticia') }">
        <span class="icon">
          <!-- Pen / Crear Noticia -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </span>
        <span>Crear Noticia</span>
      </router-link>

      <router-link to="/publicador/mis-noticias" class="menu-item" :class="{ active: $route.path.includes('mis-noticias') || $route.path.includes('editar-noticia') }">
        <span class="icon">
          <!-- Newspaper -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a4 4 0 01-4-4V6"/>
            <path d="M8 6h8M8 10h8M8 14h4"/>
          </svg>
        </span>
        <span>Mis Noticias</span>
      </router-link>

      <router-link to="/publicador/crear-evento" class="menu-item" :class="{ active: $route.path.includes('crear-evento') }">
        <span class="icon">
          <!-- Calendar Plus -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
            <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
          </svg>
        </span>
        <span>Crear Evento</span>
      </router-link>

      <router-link to="/publicador/mis-eventos" class="menu-item" :class="{ active: $route.path.includes('mis-eventos') || $route.path.includes('editar-evento') }">
        <span class="icon">
          <!-- Calendar -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </span>
        <span>Mis Eventos</span>
      </router-link>
    </nav>

    <div class="user-profile">
      <div class="profile-avatar">P</div>
      <div class="profile-info">
        <span class="profile-name">Publicador</span>
        <small>publicador@ucb.edu.bo</small>
      </div>
      <router-link to="/" class="logout">Cerrar Sesión</router-link>
    </div>
  </aside>
</template>

<script setup>
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1rem;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 8px;
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
