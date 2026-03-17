<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-section logo-section">
          <div class="logo-box">🎓</div>
          <h3>UCB SmartCampus</h3>
          <p>Transformando la educación con tecnología inteligente y accesible para todos.</p>
        </div>

        <div class="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><a href="#">Inicio</a></li>
            <li><a href="#features">Características</a></li>
            <li><a href="#cta">Acceder</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Soporte</h4>
          <ul>
            <li><a href="#">Centro de Ayuda</a></li>
            <li><a href="#">Documentación</a></li>
            <li><a href="#">Reportar Problema</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Contacto</h4>
          <ul>
            <li><a href="#">info@ucb.edu.bo</a></li>
            <li><a href="#">+591 (2) 2726000</a></li>
            <li><a href="#">La Paz, Bolivia</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 Universidad Católica Boliviana. Todos los derechos reservados.</p>
        <div class="footer-legal">
          <a href="#">Privacidad</a>
          <a href="#">Términos de Uso</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: #1a3a52;
  color: #ffffff;
  padding: 4rem 0 2rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-top {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 3rem;
  margin-bottom: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-section h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #f59e0b;
  margin: 0.5rem 0 1rem 0;
}

.footer-section h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #f59e0b;
  margin: 0 0 1.2rem 0;
}

.logo-section {
  display: flex;
  flex-direction: column;
}

.logo-box {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.footer-section p {
  color: #cbd5e1;
  margin: 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 0.8rem;
}

.footer-section a {
  color: #cbd5e1;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.95rem;
}

.footer-section a:hover {
  color: #f59e0b;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  text-align: center;
}

.footer-bottom p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.9rem;
  flex: 1;
}

.footer-legal {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-legal a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 0.9rem;
}

.footer-legal a:hover {
  color: #f59e0b;
}

@media (max-width: 768px) {
  .footer-top {
    gap: 2rem;
  }

  .footer-bottom {
    flex-direction: column;
  }

  .footer-legal {
    gap: 1rem;
  }
}
</style>
