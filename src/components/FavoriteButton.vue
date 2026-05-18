<template>
  <button
    class="fav-btn"
    :class="{
      'fav-btn--active':   active,
      'fav-btn--loading':  loading,
      'fav-btn--heart':    variant === 'heart',
      'fav-btn--star':     variant === 'star',
    }"
    :disabled="loading"
    :title="active ? 'Quitar de favoritos' : 'Guardar en favoritos'"
    :aria-label="active ? 'Quitar de favoritos' : 'Guardar en favoritos'"
    :aria-pressed="active"
    @click.stop="handleClick"
  >
    <!-- Icono corazón -->
    <template v-if="variant === 'heart'">
      <svg
        class="fav-btn__icon"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        :fill="active ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    </template>

    <!-- Icono estrella -->
    <template v-else>
      <svg
        class="fav-btn__icon"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        :fill="active ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    </template>

    <!-- Spinner de carga -->
    <span v-if="loading" class="fav-btn__spinner" aria-hidden="true"></span>

    <!-- Label opcional (para la vista "Mis Favoritos") -->
    <span v-if="showLabel" class="fav-btn__label">
      {{ active ? 'Guardado' : 'Guardar' }}
    </span>

    <!-- Burst de partículas al activar -->
    <span class="fav-btn__burst" aria-hidden="true"></span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Si la noticia está marcada como favorita */
  active: {
    type: Boolean,
    default: false
  },
  /** Si la operación está en curso (para evitar doble-click) */
  loading: {
    type: Boolean,
    default: false
  },
  /** Variante visual: 'heart' | 'star' */
  variant: {
    type: String,
    default: 'heart',
    validator: v => ['heart', 'star'].includes(v)
  },
  /** Muestra texto al lado del icono */
  showLabel: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle'])

function handleClick() {
  if (!props.loading) {
    emit('toggle')
  }
}
</script>

<style scoped>
/* ── Base ────────────────────────────────────────────────────────────────── */
.fav-btn {
  --fav-size:    36px;
  --fav-icon:    18px;
  --fav-color:   #94a3b8;
  --fav-active:  #ef4444;
  --fav-hover:   rgba(239, 68, 68, 0.1);
  --fav-star-active: #f59e0b;
  --fav-star-hover:  rgba(245, 158, 11, 0.1);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: var(--fav-size);
  height: var(--fav-size);
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--fav-color);
  transition:
    color       0.2s ease,
    background  0.2s ease,
    transform   0.15s ease;
  outline: none;
  flex-shrink: 0;
  overflow: visible;
}

.fav-btn:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--fav-active);
}

/* ── Hover ────────────────────────────────────────────────────────────────── */
.fav-btn--heart:hover:not(:disabled) {
  background: var(--fav-hover);
  color: var(--fav-active);
}

.fav-btn--star:hover:not(:disabled) {
  background: var(--fav-star-hover);
  color: var(--fav-star-active);
}

/* ── Active (favorito marcado) ─────────────────────────────────────────────── */
.fav-btn--heart.fav-btn--active {
  color: var(--fav-active);
  animation: heartPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.fav-btn--star.fav-btn--active {
  color: var(--fav-star-active);
  animation: starPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* ── Loading ──────────────────────────────────────────────────────────────── */
.fav-btn--loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.fav-btn__icon {
  width: var(--fav-icon);
  height: var(--fav-icon);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.fav-btn:not(.fav-btn--loading):hover .fav-btn__icon {
  transform: scale(1.12);
}

/* ── Spinner ──────────────────────────────────────────────────────────────── */
.fav-btn__spinner {
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: currentColor;
  animation: spin 0.6s linear infinite;
}

/* ── Label ────────────────────────────────────────────────────────────────── */
.fav-btn__label {
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

/* ── Con label: ajustar forma del botón ─────────────────────────────────── */
.fav-btn:has(.fav-btn__label) {
  width: auto;
  border-radius: 20px;
  padding: 0.4rem 0.85rem;
  border: 1.5px solid rgba(0,0,0,0.1);
}

.fav-btn--heart.fav-btn--active:has(.fav-btn__label) {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.25);
}

.fav-btn--star.fav-btn--active:has(.fav-btn__label) {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.25);
}

/* ── Burst (partículas decorativas al activar) ──────────────────────────── */
.fav-btn__burst {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
}

.fav-btn--heart.fav-btn--active .fav-btn__burst::before,
.fav-btn--heart.fav-btn--active .fav-btn__burst::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: var(--fav-active);
  animation: burstFade 0.5s ease-out both;
}

.fav-btn--heart.fav-btn--active .fav-btn__burst::before {
  width: 6px; height: 6px;
  top: 2px; left: 50%;
  transform: translateX(-50%);
}

.fav-btn--heart.fav-btn--active .fav-btn__burst::after {
  width: 5px; height: 5px;
  bottom: 2px; right: 4px;
}

/* ── Keyframes ────────────────────────────────────────────────────────────── */
@keyframes heartPop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.35); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}

@keyframes starPop {
  0%   { transform: scale(1) rotate(0deg); }
  40%  { transform: scale(1.4) rotate(-10deg); }
  70%  { transform: scale(0.9) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes burstFade {
  from { opacity: 1; transform: scale(0) translateX(-50%); }
  to   { opacity: 0; transform: scale(2.5) translateX(-50%); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Reduced motion ──────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .fav-btn--active { animation: none; }
  .fav-btn__spinner { animation: none; }
}
</style>