<template>
  <div class="dashboard">
    <PasswordChangedBanner />
    <h2>Dashboard Publicador</h2>
    <p>Bienvenido al portal del publicador</p>
  </div>
</template>

<script setup>
import PasswordChangedBanner from '../../components/PasswordChangedBanner.vue'
</script>

<style scoped>
.dashboard {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h2 {
  color: #1a3a52;
  margin: 0 0 1rem 0;
}

p {
  color: #64748b;
  margin: 0;
}
</style>