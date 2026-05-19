<template>
  <div class="student-layout">
    <ChangePasswordModal @done="onPasswordChanged" />
    <PasswordChangedBanner :trigger="bannerTrigger" />
    <StudentSidebar
      :active-item="activeItem"
      @select="activeItem = $event"
      :collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <main class="main-content" :class="{ collapsed: sidebarCollapsed }">
      <div class="top-bar">
        <div class="page-header">
          <span class="breadcrumb">Estudiante</span>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>

        <!-- ── Campana de notificaciones ────── -->
        <div class="notif-wrapper" ref="notifRef">
          <button class="notif-btn" @click="toggleNotif">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
          </button>

          <div v-if="showNotif" class="notif-panel">
            <div class="notif-panel-header">
              <span>Notificaciones</span>
              <button v-if="notifications.length > 0" @click="markAllRead" class="mark-read-btn">
                Marcar todas como leídas
              </button>
            </div>
            <div class="notif-list" v-if="notifications.length > 0">
              <div
                v-for="n in notifications"
                :key="n.id"
                class="notif-item"
                :class="{ unread: !n.read }"
                @click="n.link && $router.push(n.link)"
              >
                <div class="notif-dot" v-if="!n.read"></div>
                <div class="notif-text">
                  <p class="notif-title">{{ n.title }}</p>
                  <p class="notif-body">{{ n.body }}</p>
                  <p class="notif-time">{{ formatRelative(n.createdAt) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="notif-empty">Sin notificaciones nuevas</div>
          </div>
        </div>
      </div>
      <div class="content">
        <router-view />
      </div>
    </main>

    <!-- ── ChatBot flotante ───────────────────────────────────────────── -->
    <StudentChatbot />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import StudentSidebar from '../../components/Student/StudentSidebar.vue'
import ChangePasswordModal from '../../components/ChangePasswordModal.vue'
import PasswordChangedBanner from '../../components/PasswordChangedBanner.vue'
import StudentChatbot from '../../components/Student/StudentChatbot.vue'
import { notificationService } from '../../services/api.js'

const route = useRoute()
const activeItem = ref('dashboard')
const bannerTrigger = ref(false)
const sidebarCollapsed = ref(false)

// ── Notificaciones ──────────────────────────────────────────────────────────
const showNotif      = ref(false)
const notifications  = ref([])
const unreadCount    = ref(0)
const notifRef       = ref(null)

const toggleNotif = async () => {
  showNotif.value = !showNotif.value
  if (showNotif.value) await loadNotifications()
}

const loadNotifications = async () => {
  try {
    const res = await notificationService.getAll()
    notifications.value = res.data || res
    const countRes = await notificationService.getUnreadCount()
    unreadCount.value = countRes.data ?? countRes
  } catch (e) {
    console.error('Error cargando notificaciones:', e)
  }
}

const markAllRead = async () => {
  await notificationService.markAllRead()
  notifications.value = notifications.value.map(n => ({ ...n, read: true }))
  unreadCount.value = 0
}

const formatRelative = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Ahora'
  if (m < 60) return `Hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

// Cerrar al hacer click fuera
const handleClickOutside = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) {
    showNotif.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  // Cargar conteo inicial sin abrir el panel
  try {
    const countRes = await notificationService.getUnreadCount()
    unreadCount.value = countRes.data ?? countRes
  } catch {}
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
// ────────────────────────────────────────────────────────────────────────────

function onPasswordChanged() {
  bannerTrigger.value = true
  // Resetea el trigger después para que pueda volver a activarse si hiciera falta
  setTimeout(() => { bannerTrigger.value = false }, 100)
}

const pageTitle = computed(() => {
  const path = route.path.split('/').pop()
  const titles = {
    dashboard: 'Dashboard',
    eventos: 'Muro de Eventos',
    calendario: 'Mi Calendario',
    perfil: 'Mi Perfil',
    noticias: 'Muro de Noticias',
    favoritos: 'Mis Favoritos',
    reservar: 'Reservar',
    'buscar-material': 'Buscar Material',
    historial: 'Historial',
    sugerencias: 'Sugerencias',
    reclamos: 'Reclamos'
  }
  return titles[path] || 'Estudiante'
})
</script>

<style scoped>
.student-layout { display: flex; min-height: 100vh; background: #f8fafc; }
.main-content { flex: 1; margin-left: 280px; transition: margin-left 0.3s ease; }
.main-content.collapsed { margin-left: 80px; }
.top-bar { display: flex; align-items: center; justify-content: space-between; background: #ffffff; padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; }
.page-header { display: flex; flex-direction: column; gap: 0.5rem; }
.breadcrumb { font-size: 0.85rem; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
.page-title { font-size: 1.8rem; color: #1a3a52; margin: 0; font-weight: 700; }
.content { padding: 2rem; }

/* Campana */
.notif-wrapper { position: relative; }
.notif-btn { position: relative; background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 0.5rem; cursor: pointer; color: #1a3a52; display: flex; align-items: center; transition: all 0.15s; }
.notif-btn:hover { background: #f8fafc; border-color: #1a3a52; }
.notif-badge { position: absolute; top: -6px; right: -6px; background: #ef4444; color: white; font-size: 0.65rem; font-weight: 700; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

/* Panel */
.notif-panel { position: absolute; top: calc(100% + 8px); right: 0; width: 320px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 1000; overflow: hidden; }
.notif-panel-header { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; font-weight: 700; color: #1a3a52; }
.mark-read-btn { background: none; border: none; font-size: 0.75rem; color: #64748b; cursor: pointer; font-weight: 600; }
.mark-read-btn:hover { color: #1a3a52; }
.notif-list { max-height: 360px; overflow-y: auto; }
.notif-item { display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.85rem 1rem; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #f1f5f9; }
.notif-item:hover { background: #f8fafc; }
.notif-item.unread { background: #f0f7ff; }
.notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #FFD200; flex-shrink: 0; margin-top: 5px; }
.notif-title { font-size: 0.82rem; font-weight: 700; color: #0f1f2e; margin: 0 0 0.2rem; }
.notif-body  { font-size: 0.78rem; color: #374151; margin: 0 0 0.25rem; line-height: 1.4; }
.notif-time  { font-size: 0.72rem; color: #94a3b8; margin: 0; }
.notif-empty { padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.85rem; }

@media (max-width: 768px) {
  .main-content { margin-left: 0; }
  .main-content.collapsed { margin-left: 0; }
}
</style>