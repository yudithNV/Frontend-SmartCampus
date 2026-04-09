<template>
  <section id="features" class="features">
    <div class="container">
      <div class="section-header">
        <span class="badge">✨ Características</span>
        <h2>Todo lo que Necesitas en un Solo Lugar</h2>
        <p>Una plataforma completa diseñada para optimizar la gestión académica y administrativa.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="6" width="36" height="36" rx="4" stroke="#1a3a52" stroke-width="2"/>
              <path d="M12 24L18 30L24 18" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M30 14L36 14L36 20" stroke="#1a3a52" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Panel de Control</h3>
          <p>Visualiza métricas en tiempo real de toda tu institución en un dashboard intuitivo.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="14" r="6" stroke="#1a3a52" stroke-width="2"/>
              <path d="M8 24C8 24 8 32 16 32C24 32 24 24 24 24" stroke="#1a3a52" stroke-width="2" stroke-linecap="round"/>
              <circle cx="32" cy="14" r="6" stroke="#f59e0b" stroke-width="2"/>
              <path d="M24 24C24 24 24 32 32 32C40 32 40 24 40 24" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>Gestión de Usuarios</h3>
          <p>Administra roles, permisos y acceso de estudiantes, docentes y personal.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10H40V38C40 40.2091 38.2091 42 36 42H12C9.79086 42 8 40.2091 8 38V10Z" stroke="#1a3a52" stroke-width="2"/>
              <line x1="8" y1="16" x2="40" y2="16" stroke="#1a3a52" stroke-width="2"/>
              <line x1="16" y1="24" x2="32" y2="24" stroke="#f59e0b" stroke-width="2"/>
              <line x1="16" y1="32" x2="32" y2="32" stroke="#f59e0b" stroke-width="2"/>
            </svg>
          </div>
          <h3>Gestión Informativa</h3>
          <p>Mantente al día con las últimas noticias, comunicados oficiales y eventos académicos de la universidad en tiempo real.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="12" width="32" height="28" rx="2" stroke="#1a3a52" stroke-width="2"/>
              <path d="M8 18H40" stroke="#1a3a52" stroke-width="2"/>
              <circle cx="12" cy="15" r="1.5" fill="#1a3a52"/>
              <circle cx="18" cy="15" r="1.5" fill="#1a3a52"/>
              <circle cx="24" cy="15" r="1.5" fill="#1a3a52"/>
              <rect x="14" y="24" width="4" height="8" fill="#f59e0b"/>
              <rect x="22" y="20" width="4" height="12" fill="#f59e0b"/>
              <rect x="30" y="26" width="4" height="6" fill="#f59e0b"/>
            </svg>
          </div>
          <h3>Calendario Inteligente</h3>
          <p>Organiza horarios, eventos y actividades sin conflictos automáticamente.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="18" stroke="#1a3a52" stroke-width="2"/>
              <path d="M24 12V24L32 32" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="24" cy="10" r="2" fill="#f59e0b"/>
            </svg>
          </div>
          <h3>Notificaciones</h3>
          <p>Alertas automáticas y comunicación efectiva con toda la comunidad educativa.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 8L32 12V24C32 32 24 40 24 40C24 40 16 32 16 24V12L24 8Z" stroke="#1a3a52" stroke-width="2" stroke-linejoin="round"/>
              <path d="M20 24L24 28L28 20" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>Seguridad</h3>
          <p>Protección de datos con encriptación de nivel empresarial y cumplimiento normativo.</p>
        </div>
      </div>

      <div class="more-features">
        <p>Y muchas más características que descubrirás al usar la plataforma</p>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.features {
  padding: 5rem 0;
  background: #ffffff;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.badge {
  display: inline-block;
  background: #fef3c7;
  color: #92400e;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 2.8rem;
  font-weight: 800;
  color: #1a3a52;
  margin: 1.5rem 0 1rem 0;
}

.section-header p {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 2.2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  border-color: #f59e0b;
  box-shadow: 0 12px 35px rgba(245, 158, 11, 0.15);
  transform: translateY(-8px);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  width: 80px;
  height: 80px;
  margin-left: auto;
  margin-right: auto;
  background: #f0f9ff;
  border-radius: 12px;
}

.feature-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a3a52;
  margin: 1rem 0;
}

.feature-card p {
  color: #64748b;
  line-height: 1.7;
  margin: 0;
  font-size: 0.95rem;
}

.more-features {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 1rem;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .section-header h2 {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
