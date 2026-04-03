<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface TasksData {
  semester: {
    id: string
    displayName: string
    passingThreshold: number
  } | null
  totalTasks: number
  passedCount: number
  tasks: Array<{
    id: string
    serialNum: number
    title: string
    slug: string
    unlockTime: string
    submissionDeadline: string
    onlineEditorLink: string
    status: string
  }>
}

const { data } = await useFetch<TasksData>('/api/tasks')

// Info box dismissal
const infoDismissed = ref(false)
const hideInfoPermanently = useCookie<boolean>('tasks:hide-info', {
  default: () => false,
  maxAge: 60 * 60 * 24 * 365
})
const showInfo = computed(() => !infoDismissed.value && !hideInfoPermanently.value)

function dismissInfo() {
  infoDismissed.value = true
}

function dismissInfoPermanently() {
  hideInfoPermanently.value = true
  infoDismissed.value = true
}
</script>

<template>
  <UContainer>
    <UPageHero
      title="Programming tasks"
      description="Overview of assigned tasks and your progress."
    />

    <div class="mx-auto max-w-4xl pb-16">
      <!-- Info box (secondary/blue) -->
      <div
        v-if="showInfo"
        class="mb-7.5 rounded-[10px] bg-secondary-500/20 p-6"
      >
        <UIcon name="i-lucide-info" class="mb-2 size-5 text-secondary-400" />
        <p class="text-[15px] leading-6 text-secondary-300">
          Here, you can see all programming tasks that will be assigned during the semester. A blue open lock icon shows the tasks that can currently be edited. Please note the deadline dates for submission. Only the tasks that show the status "Submitted" have been submitted properly and are eligible for grading (pass/fail). Please note you need to pass at least {{ data?.semester?.passingThreshold ?? 0 }} out of {{ data?.totalTasks ?? 0 }} tasks to complete your final submission.
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <UButton label="Dismiss" color="secondary" size="sm" @click="dismissInfo" />
          <UButton label="Do not show this again" color="secondary" variant="outline" size="sm" @click="dismissInfoPermanently" />
        </div>
      </div>

      <!-- Alert box (error/red) -->
      <div class="mb-10 rounded-[10px] bg-error-500/20 p-6">
        <UIcon name="i-lucide-octagon-alert" class="mb-2 size-5 text-error-400" />
        <p class="text-[15px] leading-6 text-error-300">
          All deadlines are strict and we <strong>do not accept late submissions!</strong> Deadline extensions cannot be granted. It is your individual responsibility to start solving the tasks early enough so that you can hand in your results on time. In particular, the checking engine for scoring submissions can take a substantial amount of time to run on the server.
        </p>
      </div>

      <!-- Progress section -->
      <ProgressIndicator
        label="Tasks passed:"
        :value="data?.passedCount ?? 0"
        :max="data?.semester?.passingThreshold ?? 1"
        color="primary"
      />

      <!-- Task overview heading -->
      <h1 class="mb-6 mt-10 text-4xl font-bold">
        Task overview
      </h1>

      <TaskOverviewList :tasks="data?.tasks ?? []" />
    </div>
  </UContainer>
</template>
