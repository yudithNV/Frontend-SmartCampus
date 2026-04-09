<template>
  <footer class="footer" id="footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-section logo-section">
          <div class="logo-box" style="display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 40px; height: 40px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
          <h3>UCB SmartCampus</h3>
          <p>Transformando la educación con tecnología inteligente y accesible para todos.</p>
        </div>

        <div class="footer-section">
          <h4>Enlaces Rápidos</h4>
          <ul>
            <li><a href="https://www.ucb.edu.bo/" target="_blank">Portal UCB</a></li>
            <li><a href="https://lpz.ucb.edu.bo/" target="_blank">Sede La Paz</a></li>
            <li><a href="https://academia.ucb.edu.bo/Neo" target="_blank">Neo Académico</a></li>
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
        <p>&copy; 2026 Universidad Católica Boliviana. GRUPO H. Todos los derechos reservados.</p>
        
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
  color: #FFD200;
  gap: 10px;
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
