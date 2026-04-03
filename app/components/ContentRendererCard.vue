<script setup lang="ts">
defineProps<{
  content: unknown
  title?: string
}>()
</script>

<template>
  <UPageCard variant="soft">
    <template v-if="title" #title>
      <span class="text-2xl font-bold">{{ title }}</span>
    </template>
    <div class="prose prose-invert max-w-none">
      <ContentRenderer v-if="content" :value="(content as any)" />
    </div>
  </UPageCard>
</template>
