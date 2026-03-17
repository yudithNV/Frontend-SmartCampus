<script setup>
import Header from './components/Header.vue'
import Hero from './components/Hero.vue'
import Features from './components/Features.vue'
import CTA from './components/CTA.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="app">
    <Header />
    <Hero />
    <Features />
    <CTA />
    <Footer />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #ffffff;
}
</style>
