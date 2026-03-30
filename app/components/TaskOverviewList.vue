<script setup lang="ts">
defineProps<{
  tasks: Array<{
    id: string
    serialNum: number
    title: string
    slug: string
    unlockTime: string
    submissionDeadline: string
    status: string
  }>
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <TaskCard
      v-for="task in tasks"
      :key="task.id"
      :task="task"
    />
  </div>
</template>
