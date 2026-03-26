<template>
  <aside class="sidebar">
    <div class="logo-admin">
      <div class="logo-icon">🎓</div>
      <span>UCB SmartCampus</span>
      <small>Estudiante</small>
    </div>

    <nav class="sidebar-menu">
      <router-link
        to="/estudiante/dashboard"
        class="menu-item"
        :class="{ active: $route.path.includes('dashboard') }"
      >
        <span class="icon">📚</span>
        <span>Dashboard</span>
      </router-link>

      <!-- Mi Perfil -->
      <router-link
        to="/estudiante/perfil"
        class="menu-item"
        :class="{ active: $route.path.includes('perfil') }"
      >
        <span class="icon">👤</span>
        <span>Mi Perfil</span>
      </router-link>

      <!-- ← NUEVO: Calendario -->
      <router-link
        to="/estudiante/calendario"
        class="menu-item"
        :class="{ active: $route.path.includes('calendario') }"
      >
        <span class="icon">📆</span>
        <span>Mi Calendario</span>
      </router-link>

      <router-link
        to="/estudiante/reclamos"
        class="menu-item"
        :class="{ active: $route.path.includes('reclamos') }"
      >
        <span class="icon">📩</span>
        <span>Reclamos</span>
      </router-link>
      
      <router-link
        to="/estudiante/Sugerencias"
        class="menu-item"
        :class="{ active: $route.path.includes('sugerencias') }"
      >
        <span class="icon">📩</span>
        <span>Sugerencias</span>
      </router-link>
    </nav>

    <div class="user-profile">
      <div class="profile-avatar">E</div>
      <div class="profile-info">
        <span class="profile-name">Estudiante</span>
        <small>estudiante@ucb.edu.bo</small>
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