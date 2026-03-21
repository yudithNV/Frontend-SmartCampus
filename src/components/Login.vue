<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">🎓</div>
        <h1>UCB SmartCampus</h1>
        <p>Panel de Administrador</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@ucb.edu.bo"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="form-input"
            required
          />
        </div>

        <button type="submit" class="btn-login">
          Iniciar Sesión
        </button>

        <p class="error-message" v-if="error">{{ error }}</p>
      </form>

      <div class="login-footer">
        <p>¿Credenciales de prueba?</p>
        <div class="credentials">
          <small>Email: admin@ucb.edu.bo</small>
          <small>Contraseña: admin123</small>
        </div>
      </div>

      <div class="back-button">
        <a href="#" @click.prevent="goBack" class="link-back">← Volver al Sitio</a>
      </div>
    </div>

    <div class="login-background"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])

const email = ref('admin@ucb.edu.bo')
const password = ref('admin123')
const error = ref('')

const handleLogin = () => {
  // Validación simple
  if (email.value === 'admin@ucb.edu.bo' && password.value === 'admin123') {
    error.value = ''
    emit('login')
  } else {
    error.value = 'Email o contraseña incorrectos'
  }
}

const goBack = () => {
  emit('back')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a3a52 0%, #2c5aa0 100%);
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px),
    repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px);
  pointer-events: none;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 3rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.login-header h1 {
  font-size: 1.6rem;
  color: #1a3a52;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.login-header p {
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #FFD200;
  box-shadow: 0 0 0 3px rgba(255, 210, 0, 0.1);
}

.btn-login {
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(135deg, #FFD200 0%, #FFC500 100%);
  color: #1a3a52;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 210, 0, 0.3);
}

.btn-login:active {
  transform: translateY(0);
}

.error-message {
  color: #dc2626;
  font-size: 0.85rem;
  margin-top: 1rem;
  text-align: center;
  padding: 0.75rem;
  background: #fee2e2;
  border-radius: 6px;
}

.login-footer {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.login-footer p {
  color: #475569;
  font-size: 0.85rem;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
}

.credentials {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.credentials small {
  color: #64748b;
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
  background: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.back-button {
  text-align: center;
}

.link-back {
  color: #1a3a52;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-back:hover {
  color: #FFD200;
}

@media (max-width: 480px) {
  .login-card {
    margin: 1rem;
    padding: 2rem;
  }

  .login-header h1 {
    font-size: 1.3rem;
  }
}
</style>