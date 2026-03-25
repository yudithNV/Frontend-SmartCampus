import { createRouter, createWebHistory } from 'vue-router'

// Landing
import Landing from '../views/Landing.vue'

// Auth
import Login from '../views/Login.vue'

// Admin
import AdminLayout from '../views/Admin/AdminLayout.vue'
import AdminDashboard from '../views/Admin/AdminDashboard.vue'
import AdminUsers from '../views/Admin/AdminUsers.vue'
import AdminSettings from '../views/Admin/AdminSettings.vue'

// Estudiante
import StudentLayout from '../views/Student/StudentLayout.vue'
import StudentDashboard from '../views/Student/StudentDashboard.vue'
import StudentProfile from '../views/Student/StudentProfile.vue'   // ← NUEVO

// Publicador
import PublisherLayout from '../views/Publisher/PublisherLayout.vue'
import PublisherDashboard from '../views/Publisher/PublisherDashboard.vue'
import PublisherCreateNews from '../views/Publisher/CreateNews.vue'
import PublisherMyNews from '../views/Publisher/MisNoticias.vue'
import PublisherEditNews from '../views/Publisher/EditNews.vue'
import PublisherCreateEvent from '../views/Publisher/CrearEvento.vue'
import PublisherMyEvents from '../views/Publisher/MisEventos.vue'
import PublisherEditEvent from '../views/Publisher/EditEvento.vue'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },

  // ── Admin Routes ────────────────────────────────────────────────────────
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'usuarios', name: 'AdminUsers', component: AdminUsers },
      { path: 'configuracion', name: 'AdminSettings', component: AdminSettings }
    ]
  },

  // ── Estudiante Routes ────────────────────────────────────────────────────
  {
    path: '/estudiante',
    component: StudentLayout,
    redirect: '/estudiante/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: StudentDashboard
      },
      {
        path: 'perfil',
        name: 'StudentProfile',
        component: StudentProfile
      },
      {
        path: 'reservar',
        name: 'StudentReserve',
        component: { template: '<div class="placeholder"><h2>Reservar</h2><p>Próximamente...</p></div>' }
      },
      {
        path: 'buscar-material',
        name: 'StudentSearchMaterial',
        component: { template: '<div class="placeholder"><h2>Buscar Material</h2><p>Próximamente...</p></div>' }
      },
      {
        path: 'historial',
        name: 'StudentHistory',
        component: { template: '<div class="placeholder"><h2>Historial</h2><p>Próximamente...</p></div>' }
      }
    ]
  },

  // ── Publicador Routes ────────────────────────────────────────────────────
  {
    path: '/publicador',
    component: PublisherLayout,
    redirect: '/publicador/dashboard',
    children: [
      { path: 'dashboard', name: 'PublisherDashboard', component: PublisherDashboard },
      { path: 'crear-noticia', name: 'PublisherCreateNews', component: PublisherCreateNews },
      { path: 'mis-noticias', name: 'PublisherMyNews', component: PublisherMyNews },
      { path: 'editar-noticia/:id', name: 'PublisherEditNews', component: PublisherEditNews, props: true },
      { path: 'crear-evento', name: 'PublisherCreateEvent', component: PublisherCreateEvent },
      { path: 'mis-eventos', name: 'PublisherMyEvents', component: PublisherMyEvents },
      { path: 'editar-evento/:id', name: 'PublisherEditEvent', component: PublisherEditEvent, props: true }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router