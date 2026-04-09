<template>
  <header class="header">
    <div class="container">
      <div class="logo-section">
        <div class="logo-box" style="display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 40px; height: 40px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
          </svg>
        </div>>
        <h1 class="logo-text">UCB SmartCampus</h1>
      </div>
      <nav class="nav">
        <a href="#inicio"       class="nav-link" @click.prevent="scrollTo('inicio')">INICIO</a>
        <a href="#features"     class="nav-link" @click.prevent="scrollTo('features')">ACERCA DE</a>
        <a href="#noticias"     class="nav-link" @click.prevent="scrollTo('noticias')">NOTICIAS</a>
        <a href="#eventos"      class="nav-link" @click.prevent="scrollTo('eventos')">EVENTOS</a>
        <a href="#footer"       class="nav-link" @click.prevent="scrollTo('footer')">CONTACTOS</a>
        <button @click="goToLogin" class="btn-login">INICIAR SESIÓN</button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

// Altura del header sticky para que no tape la sección destino
const HEADER_OFFSET = 72

function scrollTo(sectionId) {
  const el = document.getElementById(sectionId)
  if (!el) return

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET

  window.scrollTo({ top, behavior: 'smooth' })
}
</script>

<style scoped>
.header {
  background: #1a3a52;
  padding: 1.2rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.logo-box {
  font-size: 2rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #FFD200;
}

.btn-login {
  background: #FFD200;
  color: #1a3a52;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover {
  background: #FFC500;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 210, 0, 0.3);
}

@media (max-width: 768px) {
  .nav {
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.8rem;
  }
}
</style>