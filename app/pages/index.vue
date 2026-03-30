<script setup lang="ts">
import { lectures, semesters } from '~/data/lectures'

const { isAuthenticated } = useAuth()
const colorMode = useColorMode()

const themeOptions = [
  { label: 'Light', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-lucide-moon' },
  { label: 'System', value: 'system', icon: 'i-lucide-monitor' }
]

const themeIcon = computed(() => {
  const match = themeOptions.find(o => o.value === colorMode.preference)
  return match?.icon ?? 'i-lucide-monitor'
})

const currentSemester = semesters.find(s => s.isCurrent)
const previewLectures = lectures
  .filter(l => l.semesterId === currentSemester?.id)
  .sort((a, b) => a.order - b.order)
  .slice(0, 3)
</script>

<template>
  <UContainer>
    <!-- Hero -->
    <UPageHero
      title="Einführung in Maschinelles Lernen & Künstliche Intelligenz"
      description="Grünbauer, René; Nemes, Tamás"
      class="text-center"
    />

    <!-- Theme selector -->
    <div class="flex justify-center pb-8">
      <USelect
        v-model="colorMode.preference"
        :items="themeOptions"
        value-key="value"
        label-key="label"
        :icon="themeIcon"
        class="w-auto"
      />
    </div>

    <!-- Quick access separator -->
    <USeparator label="Quick access" class="mx-auto mb-10 max-w-lg" />

    <!-- Bento grid -->
    <div class="mx-auto mb-16 grid max-w-4xl grid-cols-3 gap-6">
      <!-- Top row: Lecture materials (full width) -->
      <div class="col-span-3 rounded-xl border border-primary-500/20 bg-primary-500/5 p-6">
        <h3 class="text-base font-semibold">
          Lecture materials
        </h3>
        <p class="mt-1 text-sm text-muted">
          Slides, referenced animations and other materials by unit.
        </p>

        <!-- Lecture preview cards -->
        <div class="mt-4 grid grid-cols-3 gap-4">
          <div
            v-for="lecture in previewLectures"
            :key="lecture.slug"
            class="rounded-lg border border-primary-500/20 p-4"
          >
            <UIcon :name="lecture.icon" class="mb-2 text-primary" />
            <p class="text-sm font-semibold">
              {{ lecture.title }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ currentSemester?.displayName }}
            </p>
          </div>
        </div>

        <!-- Navigate button -->
        <div class="mt-4 flex justify-end">
          <UButton
            icon="i-lucide-chevron-right"
            color="primary"
            size="sm"
            square
            to="/materials"
          />
        </div>
      </div>

      <!-- Bottom-left: Programming tasks -->
      <div class="col-span-2 flex min-h-80 flex-col rounded-xl border border-secondary-500/20 bg-secondary-500/5 p-6">
        <h3 class="text-base font-semibold">
          Programming tasks
        </h3>
        <p class="mt-1 text-sm text-muted">
          Overview of assigned tasks and your progress.
        </p>

        <template v-if="isAuthenticated">
          <div class="mt-4 flex-1">
            <!-- Authenticated preview placeholder -->
            <p class="text-sm text-muted">
              Task overview will appear here.
            </p>
          </div>
          <div class="flex justify-end">
            <UButton
              icon="i-lucide-chevron-right"
              color="secondary"
              size="sm"
              square
              to="/tasks"
            />
          </div>
        </template>
        <div v-else class="flex flex-1 flex-col items-center justify-center gap-4">
          <UIcon name="i-lucide-lock" class="text-muted size-14" />
          <p class="text-center text-muted">
            Sign in to access programming tasks
          </p>
        </div>
      </div>

      <!-- Bottom-right: Portfolio -->
      <div class="col-span-1 flex min-h-80 flex-col rounded-xl border border-secondary-500/20 bg-secondary-500/5 p-6">
        <h3 class="text-base font-semibold">
          Your portfolio
        </h3>
        <p class="mt-1 text-sm text-muted">
          The progress of your portfolio for the final submission.
        </p>

        <template v-if="isAuthenticated">
          <div class="mt-4 flex-1">
            <!-- Authenticated preview placeholder -->
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
              to="/final-submission"
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
    </div>
  </UContainer>
</template>
