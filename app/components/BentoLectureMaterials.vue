<script setup lang="ts">
import { getLectureSlug, getLectureDisplayTitle, getValidatedLectures, type Semester } from '~/data/lectures'

const { data: semesters } = await useFetch<Semester[]>('/api/semesters')

const now = new Date()
const currentSemester = computed(() => semesters.value?.[0])

const previewLectures = computed(() => {
  const sem = currentSemester.value
  if (!sem) return []
  return getValidatedLectures(semesters.value ?? [])
    .filter(l => l.semesterId === sem.id && now >= l.unlockDateTime)
    .sort((a, b) => b.order - a.order)
    .slice(0, 3)
    .reverse()
})

function lecturePath(title: string): string {
  return `/materials/${currentSemester.value?.id ?? ''}/${getLectureSlug(title)}`
}
</script>

<template>
  <div class="col-span-3 rounded-xl border border-primary-500/20 bg-primary-500/5 p-6">
    <h3 class="text-base font-semibold">
      Lecture materials
    </h3>
    <p class="mt-1 text-sm text-muted">
      Slides, referenced animations and other materials by unit.
    </p>

    <div class="mt-4 grid grid-cols-3 gap-4">
      <NuxtLink
        v-for="lecture in previewLectures"
        :key="lecture.order"
        :to="lecturePath(lecture.title)"
        class="rounded-lg border border-primary-500/20 p-4 transition-colors hover:bg-primary-500/10"
      >
        <UIcon :name="lecture.icon" class="mb-2 text-primary" />
        <p class="text-sm font-semibold">
          {{ getLectureDisplayTitle(lecture) }}
        </p>
        <p class="mt-1 text-xs text-muted">
          {{ currentSemester?.displayName }}
        </p>
      </NuxtLink>
    </div>

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
</template>
