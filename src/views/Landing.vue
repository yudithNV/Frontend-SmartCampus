<template>
  <div class="landing">
    <Header @go-to-login="$router.push('/login')" />
    <Hero />
    <Features />
    <CTA />
    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Hero from '../components/Hero.vue'
import Features from '../components/Features.vue'
import CTA from '../components/CTA.vue'
import Footer from '../components/Footer.vue'
</script>

<style scoped>
.landing {
  width: 100%;
  background: #ffffff;
}
</style>
