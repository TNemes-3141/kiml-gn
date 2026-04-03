<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const slug = route.params.slug as string

const { data: task } = await useFetch(`/api/tasks/${slug}`)

if (!task.value) {
  throw createError({ statusCode: 404, message: 'Task not found' })
}

const heroTitle = computed(() =>
  task.value ? `Task #${task.value.serialNum}: ${task.value.title}` : ''
)

const STEP_DETAILS = 'details'
const STEP_SOLUTION = 'solution'
const STEP_SUBMISSION = 'submission'

const stepperItems = [
  { title: '1. Task details', icon: 'i-lucide-clipboard', value: STEP_DETAILS },
  { title: '2. Solution and leaderboard', icon: 'i-lucide-cloud-upload', value: STEP_SOLUTION },
  { title: '3. Submit', icon: 'i-lucide-circle-check', value: STEP_SUBMISSION }
]

const stepper = useTemplateRef('stepper')

const { data: description } = await useAsyncData(`task-desc-${slug}`, () =>
  queryCollection('tasks').path(`/tasks/${slug}`).first()
)
</script>

<template>
  <UContainer>
    <UPageHero :title="heroTitle" />

    <div class="mx-auto max-w-4xl pb-16">
      <UStepper
        ref="stepper"
        :items="stepperItems"
        :default-value="0"
        :linear="false"
        color="primary"
        class="mb-6"
      >
        <template #content="{ item }">
          <!-- Navigation buttons -->
          <div class="mb-6 flex justify-between">
            <UButton
              v-if="stepper?.hasPrev"
              label="Previous"
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="soft"
              @click="stepper?.prev()"
            />
            <div v-else />
            <UButton
              v-if="stepper?.hasNext"
              label="Next"
              icon="i-lucide-arrow-right"
              trailing
              color="neutral"
              variant="soft"
              @click="stepper?.next()"
            />
          </div>

          <TaskStepDetails
            v-if="item?.value === 'details'"
            :task="task!"
            :description="description ?? null"
          />
          <TaskStepSolution
            v-else-if="item?.value === 'solution'"
            :task="task!"
          />
          <TaskStepSubmission
            v-else-if="item?.value === 'submission'"
            :task="task!"
          />
        </template>
      </UStepper>
    </div>
  </UContainer>
</template>
