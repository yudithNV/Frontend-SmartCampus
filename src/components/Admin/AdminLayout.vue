<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar :active-item="activeItem" @select="activeItem = $event" />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="page-header">
          <span class="breadcrumb">Admin</span>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content">
        <!-- Usuarios View -->
        <AdminUsers v-if="activeItem === 'usuarios'" />

        <!-- Dashboard View -->
        <div v-else-if="activeItem === 'dashboard'" class="placeholder">
          <h2>Dashboard</h2>
          <p>Próximamente...</p>
        </div>

        <!-- Configuración View -->
        <div v-else-if="activeItem === 'configuracion'" class="placeholder">
          <h2>Configuración</h2>
          <p>Próximamente...</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AdminSidebar from './AdminSidebar.vue'
import AdminUsers from './AdminUsers.vue'

const activeItem = ref('usuarios')

const pageTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard',
    usuarios: 'Usuarios',
    configuracion: 'Configuración'
  }
  return titles[activeItem.value] || 'Admin'
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
}

.top-bar {
  background: #ffffff;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breadcrumb {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.page-title {
  font-size: 1.8rem;
  color: #1a3a52;
  margin: 0;
  font-weight: 700;
}

.content {
  padding: 2rem;
}

.placeholder {
  background: #ffffff;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.placeholder h2 {
  color: #1a3a52;
  margin-bottom: 1rem;
}

.placeholder p {
  color: #64748b;
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 240px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
