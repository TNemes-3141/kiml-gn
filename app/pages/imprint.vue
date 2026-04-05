<script setup lang="ts">
useHead({ title: 'Impressum' })

const { data: imprint } = await useAsyncData('imprint', () =>
  queryCollection('legal').path('/legal/imprint').first()
)
</script>

<template>
  <UContainer>
    <UPageHero title="Impressum" />
    <div class="mx-auto max-w-4xl pb-16">
      <div class="prose prose-invert max-w-none">
        <ContentRenderer v-if="imprint" :value="(imprint as any)" />
      </div>
    </div>
  </UContainer>
</template>
