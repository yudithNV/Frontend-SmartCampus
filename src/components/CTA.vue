<template>
  <section id="cta" class="cta">
    <div class="container">
      <div class="cta-icon">⭐</div>
      <h2>Toda la Información de la UCB en un Solo Lugar</h2>
      <p>Accede a todas las herramientas y recursos que necesitas para optimizar tu experiencia académica y administrativa.</p>

      <div class="cta-buttons">
        <button class="btn-primary">Acceder al Portal</button>
        <button class="btn-secondary">Ver Guía de Uso</button>
      </div>

      <div class="cta-benefits">
        <div class="benefit-item">
          <span class="check">✓</span>
          <p>Acceso desde cualquier dispositivo</p>
        </div>
        <div class="benefit-item">
          <span class="check">✓</span>
          <p>Información actualizada en tiempo real</p>
        </div>
        <div class="benefit-item">
          <span class="check">✓</span>
          <p>Soporte técnico disponible 24/7</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.cta {
  background: linear-gradient(135deg, #1a3a52 0%, #2c5aa0 100%);
  padding: 5rem 0;
  color: #ffffff;
  text-align: center;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
}

.cta-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 2rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.cta h2 {
  font-size: 2.8rem;
  font-weight: 800;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
}

.cta p {
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
  opacity: 0.95;
  line-height: 1.7;
}

.cta-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.95rem 2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #f59e0b;
  color: #1a3a52;
}

.btn-primary:hover {
  background: #d97706;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
}

.btn-secondary {
  background: transparent;
  color: #ffffff;
  border: 2px solid #ffffff;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.cta-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #f59e0b;
  color: #1a3a52;
  border-radius: 50%;
  font-weight: 800;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.benefit-item p {
  margin: 0;
  text-align: left;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .cta h2 {
    font-size: 2rem;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .cta-benefits {
    grid-template-columns: 1fr;
  }
}
</style>
