<template>
  <div class="admin-layout">
    <ChangePasswordModal @done="onPasswordChanged" />
    <PasswordChangedBanner :trigger="bannerTrigger" />
    <AdminSidebar 
      :collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <main class="main-content" :class="{ collapsed: sidebarCollapsed }">
      <div class="top-bar">
        <div class="page-header">
          <span class="breadcrumb">Admin</span>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
      </div>
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import ChangePasswordModal from '../../components/ChangePasswordModal.vue'
import PasswordChangedBanner from '../../components/PasswordChangedBanner.vue'

const route = useRoute()
const bannerTrigger = ref(false)
const sidebarCollapsed = ref(false)

function onPasswordChanged() {
  bannerTrigger.value = true
  setTimeout(() => { bannerTrigger.value = false }, 100)
}

const pageTitle = computed(() => {
  const path = route.path.split('/').pop()
  const titles = {
    dashboard: 'Dashboard',
    usuarios: 'Usuarios',
    accesos: 'Historial de Accesos',
    configuracion: 'Configuración'
  }
  return titles[path] || 'Admin'
})
</script>

<style scoped>
.admin-layout { 
  display: flex; 
  min-height: 100vh; 
  background: #f8fafc; 
}

.main-content { 
  flex: 1; 
  margin-left: 280px;
  transition: margin-left 0.3s ease;
}

.main-content.collapsed {
  margin-left: 80px;
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

@media (max-width: 1024px) {
  .top-bar {
    padding: 1.25rem 1.5rem;
  }

  .content {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) { 
  .main-content,
  .main-content.collapsed { 
    margin-left: 0; 
  }

  .top-bar {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .breadcrumb {
    font-size: 0.75rem;
  }

  .content {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .top-bar {
    padding: 0.75rem;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .content {
    padding: 0.75rem;
  }
}
</style>