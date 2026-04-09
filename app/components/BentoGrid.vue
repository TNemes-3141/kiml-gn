<script setup lang="ts">
const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="mx-auto mb-16 grid max-w-4xl grid-cols-3 items-stretch gap-6">
    <BentoLectureMaterials />
    <BentoProgrammingTasks :is-authenticated="isAuthenticated" />
    <BentoPortfolio v-if="false" :is-authenticated="isAuthenticated" />
  </div>
</template>
