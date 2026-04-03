<script setup lang="ts">
defineProps<{
  task: {
    slug: string
    onlineEditorLink: string
  }
  description: unknown
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Task description card -->
    <ContentRendererCard :content="description" title="Task description" />

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
