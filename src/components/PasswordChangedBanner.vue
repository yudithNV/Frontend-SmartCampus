<template>
  <Teleport to="body">
    <Transition name="banner">
      <div v-if="show" class="pwd-banner" role="alert">
        <div class="pwd-banner__content">
          <div class="pwd-banner__icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="pwd-banner__text">
            <span class="pwd-banner__title">Contraseña actualizada</span>
            <span class="pwd-banner__sub">Tu cuenta ahora está protegida con tu nueva contraseña.</span>
          </div>
          <button class="pwd-banner__close" @click="dismiss" aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="pwd-banner__progress" :style="{ animationDuration: DURATION + 'ms' }"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  // Se activa desde el padre vía prop (cuando el modal emite 'done')
  trigger: {
    type: Boolean,
    default: false
  }
})

const DURATION = 5000
const show = ref(false)
let timer = null

function dismiss() {
  show.value = false
  clearTimeout(timer)
}

function activate() {
  show.value = true
  clearTimeout(timer)
  timer = setTimeout(dismiss, DURATION)
}

// Activar por localStorage (para cuando viene de login con nueva sesión)
onMounted(() => {
  if (localStorage.getItem('pwd_changed') === '1') {
    localStorage.removeItem('pwd_changed')
    activate()
  }
})

// Activar por prop (cuando el modal cierra sin recargar página)
watch(() => props.trigger, (val) => {
  if (val) activate()
})
</script>

<style scoped>
.pwd-banner {
  position: fixed;
  top: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9998;
  width: calc(100% - 2rem);
  max-width: 520px;
  background: #ecfdf5;
  border: 1.5px solid #6ee7b7;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.pwd-banner__content {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1.1rem;
}

.pwd-banner__icon {
  width: 36px;
  height: 36px;
  background: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.pwd-banner__text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.pwd-banner__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #065f46;
}

.pwd-banner__sub {
  font-size: 0.78rem;
  color: #047857;
}

.pwd-banner__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #059669;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: background 0.15s;
}
.pwd-banner__close:hover { background: rgba(5, 150, 105, 0.1); }

.pwd-banner__progress {
  height: 3px;
  background: #059669;
  border-radius: 0 0 12px 12px;
  transform-origin: left;
  animation: shrink linear forwards;
}

@keyframes shrink {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

.banner-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.5, 0.64, 1); }
.banner-leave-active { transition: all 0.25s ease; }
.banner-enter-from  { opacity: 0; transform: translateX(-50%) translateY(-16px); }
.banner-leave-to    { opacity: 0; transform: translateX(-50%) translateY(-10px); }
</style>