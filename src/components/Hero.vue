<template>
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">
          Tu Campus <span class="highlight">Conectado</span>
        </h1>
        <p class="hero-description">
          Plataforma integral de gestión que conecta estudiantes, docentes y administrativos en un ecosistema digital completo y seguro.
        </p>
        <div class="hero-buttons">
          <button class="btn btn-primary">Explorar plataforma</button>
          <button class="btn btn-secondary">Conocer Más</button>
        </div>
      </div>
      <div class="hero-image">
        <img src="/ucb.jpg" alt="UCB Campus" class="image-placeholder" />
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.hero {
  background: #ffffff;
  padding: 5rem 0;
  min-height: 550px;
  display: flex;
  align-items: center;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-title {
  font-size: 3.2rem;
  font-weight: 800;
  color: #1a3a52;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.highlight {
  color: #FFD200;
}

.hero-description {
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 2rem;
  line-height: 1.7;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.85rem 1.8rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #FFD200;
  color: #1a3a52;
}

.btn-primary:hover {
  background: #FFD200;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3);
}

.btn-secondary {
  background: #ffffff;
  color: #1a3a52;
  border: 2px solid #1a3a52;
}

.btn-secondary:hover {
  background: #f0f4f8;
  transform: translateY(-3px);
}

.hero-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
