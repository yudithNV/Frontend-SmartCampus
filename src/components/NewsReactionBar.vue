<template>
  <div class="reaction-bar">
    <!-- Botones de reacción -->
    <div class="reaction-buttons">
      <div
        v-for="reaction in REACTIONS"
        :key="reaction.type"
        class="reaction-btn-wrap"
      >
        <button
          class="reaction-btn"
          :class="{
            'reaction-btn--active': myReaction === reaction.type,
            'reaction-btn--loading': loading
          }"
          :disabled="loading"
          :title="reaction.label"
          @click="$emit('toggle', reaction.type)"
        >
          <i :class="reaction.icon" class="reaction-icon"></i>

          <span class="reaction-count" v-if="counts[reaction.type] > 0">
            {{ counts[reaction.type] }}
          </span>
        </button>
      </div>
    </div>

    <!-- Total -->
    <span v-if="total > 0" class="reaction-total">
      {{ total }} reacción{{ total !== 1 ? 'es' : '' }}
    </span>
  </div>
</template>

<script setup>
const REACTIONS = [
  { type: 'LIKE', icon: 'fa-solid fa-thumbs-up', label: 'Me gusta' },
  { type: 'LOVE', icon: 'fa-solid fa-heart', label: 'Me encanta' },
  { type: 'WOW',  icon: 'fa-solid fa-face-surprise', label: '¡Wow!' },
]

defineProps({
  counts:     { type: Object,  default: () => ({ LIKE: 0, LOVE: 0, WOW: 0 }) },
  myReaction: { type: String,  default: null },
  total:      { type: Number,  default: 0 },
  loading:    { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<style scoped>
.reaction-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.reaction-buttons {
  display: flex;
  gap: 0.35rem;
}

.reaction-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  background: #f8fafc;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.15s ease;
  line-height: 1;
}

.reaction-btn:hover:not(:disabled) {
  background: #fff;
  border-color: #1a3a52;
  color: #1a3a52;
  transform: scale(1.05);
}

.reaction-btn--active {
  background: #1a3a52;
  border-color: #1a3a52;
  color: #FFD200 !important;
}

.reaction-btn--active .reaction-count {
  color: #FFD200;
}

.reaction-btn--loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.reaction-icon {
  font-size: 0.95rem;
}

.reaction-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: inherit;
}

.reaction-total {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
  margin-left: 0.25rem;
}
</style>