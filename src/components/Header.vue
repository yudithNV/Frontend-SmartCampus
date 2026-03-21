<template>
  <header class="header">
    <div class="container">
      <div class="logo-section">
        <div class="logo-box">🎓</div>
        <h1 class="logo-text">UCB SmartCampus</h1>
      </div>
      <nav class="nav">
        <a href="#" class="nav-link">INICIO</a>
        <a href="#" class="nav-link">ACERCA DE</a>
        <a href="#" class="nav-link">NOTICIAS</a>
        <a href="#" class="nav-link">EVENTOS</a>
        <a href="#" class="nav-link">UNIVERSIDAD</a>
        <a href="#" class="nav-link">CONTACTOS</a>
        <button @click="goToLogin" class="btn-login">Iniciar sesión</button>
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
  gap: 0.8rem;
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
