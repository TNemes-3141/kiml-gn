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
    <ContentRendererCard :content="description" title="Aufgabenbeschreibung" />

    <!-- Task materials card -->
    <UPageCard variant="soft">
      <template #title>
        Aufgabenmaterialien
      </template>
      <div class="flex flex-col gap-3">
        <UButton
          icon="i-lucide-file-archive"
          label="Aufgabendateien herunterladen"
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
          label="Online in Google Colab bearbeiten"
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
