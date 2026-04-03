<script setup lang="ts">
defineProps<{
  label: string
  value: number
  max: number
  color?: 'primary' | 'secondary'
}>()
</script>

<template>
  <div>
    <p class="mb-1 text-base text-white">
      {{ label }}
    </p>
    <div class="flex items-center gap-4">
      <UProgress
        :model-value="value"
        :max="max"
        :color="color ?? 'primary'"
        size="lg"
        class="flex-1"
      />
      <span class="text-2xl font-bold text-white">
        {{ value }} / {{ max }}
      </span>
    </div>
  </div>
</template>
