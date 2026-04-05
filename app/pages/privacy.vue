<script setup lang="ts">
useHead({ title: 'Datenschutz' })

const { data: privacy } = await useAsyncData('privacy-notice', () =>
  queryCollection('legal').path('/legal/privacy').first()
)
</script>

<template>
  <UContainer>
    <UPageHero title="Datenschutzhinweis" />
    <div class="mx-auto max-w-4xl pb-16">
      <div class="prose prose-invert max-w-none">
        <ContentRenderer v-if="privacy" :value="(privacy as any)" />
      </div>
    </div>
  </UContainer>
</template>
