<script setup lang="ts">
import type { TasksCollectionItem } from '@nuxt/content'

defineProps<{
  task: {
    slug: string
    onlineEditorLink: string
  }
  description: TasksCollectionItem | null
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Task description card -->
    <UPageCard variant="soft">
      <template #title>
        <span class="text-2xl font-bold">Task description</span>
      </template>
      <div class="prose prose-invert max-w-none">
        <ContentRenderer v-if="description" :value="description" />
      </div>
    </UPageCard>

    <!-- Task materials card -->
    <UPageCard variant="soft">
      <template #title>
        Task materials
      </template>
      <div class="flex flex-col gap-3">
        <UButton
          icon="i-lucide-file-archive"
          label="Download handout files"
          color="secondary"
          variant="soft"
          size="lg"
          block
          :to="`/handouts/${task.slug}.zip`"
          download
          external
        />
        <UButton
          icon="i-lucide-globe"
          label="Edit online in Google Colab"
          color="secondary"
          variant="soft"
          size="lg"
          block
          :to="task.onlineEditorLink"
          target="_blank"
        />
      </div>
    </UPageCard>
  </div>
</template>
