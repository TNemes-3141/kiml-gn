<script setup lang="ts">
defineProps<{ isAuthenticated: boolean }>()
</script>

<template>
  <div class="col-span-1 flex min-h-80 flex-col rounded-xl border border-secondary-500/20 bg-secondary-500/5 p-6">
    <h3 class="text-base font-semibold">
      Your portfolio
    </h3>
    <p class="mt-1 text-sm text-muted">
      The progress of your portfolio for the final submission.
    </p>

    <template v-if="isAuthenticated">
      <div class="mt-4 flex-1">
        <p class="text-sm text-muted">
          Portfolio progress will appear here.
        </p>
      </div>
      <div class="flex justify-end">
        <UButton
          icon="i-lucide-chevron-right"
          color="secondary"
          size="sm"
          square
          to="/portfolio"
        />
      </div>
    </template>
    <div v-else class="flex flex-1 flex-col items-center justify-center gap-4">
      <UIcon name="i-lucide-lock" class="text-muted size-14" />
      <p class="text-center text-muted">
        Sign in to access your portfolio
      </p>
    </div>
  </div>
</template>
