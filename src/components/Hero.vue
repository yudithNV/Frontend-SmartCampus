<template>
  <section class="hero" id="inicio" :style="{ backgroundImage: 'url(/ucb.jpg)' }">
    <div class="hero-overlay"></div>
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">
          TU CAMPUS <span class="highlight">CONECTADO</span>
        </h1>
        <p class="hero-description">
          Plataforma integral de gestión que conecta estudiantes, docentes y administrativos en un ecosistema digital completo y seguro.
        </p>
        <div class="hero-buttons">
          <button class="btn btn-primary" @click="goToLogin">Explorar plataforma</button>
          <button class="btn btn-secondary" @click="scrollToFeatures">Conocer Más</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}

const scrollToFeatures = () => {
  const el = document.getElementById('features')
  if (!el) return
  const HEADER_OFFSET = 72
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
  window.scrollTo({ top, behavior: 'smooth' })
}
</script>

<style scoped>
.hero {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 8rem 0;
  min-height: 650px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 58, 82, 0.5);
  z-index: 1;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero-content {
  width: 100%;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  letter-spacing: -1px;
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.highlight {
  color: #FFD200;
  display: block;
}

.hero-description {
  font-size: 1.3rem;
  color: #ffffff;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  font-weight: 400;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-buttons {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  padding: 0.95rem 2.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
  font-family: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.btn-primary {
  background: #FFD200;
  color: #1a3a52;
}

.btn-primary:hover {
  background: #ffc400;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 210, 0, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.95);
  color: #1a3a52;
  border: 2px solid #ffffff;
}

.btn-secondary:hover {
  background: #ffffff;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .hero {
    padding: 5rem 0;
    min-height: 500px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1.1rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
