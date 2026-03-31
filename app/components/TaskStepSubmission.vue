<script setup lang="ts">
defineProps<{
  task: {
    slug: string
  }
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <UPageCard variant="soft">
      <template #title>
        Submit
      </template>
      <p class="text-neutral-400">
        This section is not yet implemented.
      </p>
    </UPageCard>
  </div>
</template>
