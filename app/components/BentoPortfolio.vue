<script setup lang="ts">
const props = defineProps<{ isAuthenticated: boolean }>()

const { data: tasksData } = await useFetch<{
  passedCount: number
  semester: { passingThreshold: number } | null
}>('/api/tasks')

const { data: portfolioData } = await useFetch<{
  videoLink: string | null
}>('/api/portfolio', { immediate: props.isAuthenticated })

const passingThreshold = computed(() => tasksData.value?.semester?.passingThreshold ?? 0)
const passedCount = computed(() => tasksData.value?.passedCount ?? 0)
const videoSubmitted = computed(() => portfolioData.value?.videoLink ? 1 : 0)

// Total = passingThreshold + 1 (1 for video), current = passed tasks + video submitted
const totalSteps = computed(() => passingThreshold.value + 1)
const completedSteps = computed(() => passedCount.value + videoSubmitted.value)
const overallPercent = computed(() =>
  totalSteps.value > 0 ? Math.round((completedSteps.value / totalSteps.value) * 100) : 0
)
</script>

<template>
  <div class="col-span-1 flex flex-col rounded-xl border border-secondary-500/20 bg-secondary-500/5 p-6">
    <h3 class="text-base font-semibold">
      Ihr Portfolio
    </h3>
    <p class="mt-1 text-sm text-muted">
      Der Fortschritt Ihres Portfolios für die Abgabe.
    </p>

    <template v-if="isAuthenticated">
      <div class="mt-4 flex flex-1 flex-col justify-center gap-4">
        <!-- Big percentage -->
        <p class="text-center text-5xl font-bold text-white">
          {{ overallPercent }}%
        </p>

        <!-- Programming tasks progress -->
        <div>
          <UProgress
            :model-value="passedCount"
            :max="passingThreshold || 1"
            color="secondary"
            size="md"
          />
          <p class="mt-1 text-sm text-muted">
            Programmieraufgaben bestanden
          </p>
        </div>

        <!-- Video submission progress -->
        <div>
          <UProgress
            :model-value="videoSubmitted"
            :max="1"
            color="secondary"
            size="md"
          />
          <p class="mt-1 text-sm text-muted">
            Videobericht-URL eingereicht
          </p>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <UButton
          icon="i-lucide-chevron-right"
          color="secondary"
          size="sm"
          square
          to="/portfolio"
        />
      </div>
    </template>
    <div v-else class="flex flex-1 flex-col items-center justify-center gap-4 mt-5">
      <UIcon name="i-lucide-lock" class="text-muted size-14" />
      <p class="text-center text-muted">
        Melden Sie sich an, um auf Ihr Portfolio zuzugreifen
      </p>
    </div>
  </div>
</template>
