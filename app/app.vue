<script setup lang="ts">
useHead({
  titleTemplate: (title) => title ? `${title} | KIML` : 'KIML'
})
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
