<template>
  <section class="highlight">
    <div class="pattern-bg"></div>
    <div class="container">
      <div class="highlight-card">
        <div class="highlight-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#f59e0b"/>
            <circle cx="20" cy="20" r="14" fill="#fbbf24"/>
            <circle cx="20" cy="15" r="2" fill="#1a3a52"/>
            <circle cx="20" cy="25" r="2" fill="#1a3a52"/>
            <circle cx="15" cy="20" r="2" fill="#1a3a52"/>
            <circle cx="25" cy="20" r="2" fill="#1a3a52"/>
          </svg>
        </div>
        <div class="highlight-text">
          <h3>Conectado en Vivo</h3>
          <p>Actualizaciones en tiempo real</p>
        </div>
      </div>
    </div>
    <svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 70 Q 360 10 720 70 T 1440 70 L 1440 120 L 0 120 Z" fill="#ffffff"/>
    </svg>
  </section>
</template>

<script setup>
</script>

<style scoped>
.highlight {
  background: linear-gradient(135deg, #1a3a52 0%, #2c5aa0 100%);
  padding: 4rem 0 0 0;
  position: relative;
  overflow: hidden;
}

.pattern-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px),
    repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px);
  z-index: 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding-bottom: 3rem;
}

.highlight-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  max-width: 500px;
}

.highlight-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.highlight-text h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a3a52;
  margin: 0 0 0.3rem 0;
}

.highlight-text p {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  z-index: 1;
}

@media (max-width: 768px) {
  .highlight-card {
    flex-direction: column;
    text-align: center;
    max-width: 100%;
  }

  .highlight-text h3 {
    font-size: 1.1rem;
  }
}
</style>
