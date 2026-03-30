<script setup lang="ts">
import { lectures, semesters, getLectureSlug, getLectureDisplayTitle, type Semester } from '~/data/lectures'

const now = new Date()
const currentSemester = (semesters.find(s => s.isCurrent) ?? semesters[0]) ?? { id: 'SS2026' }
const selectedSemesterId = ref(currentSemester.id)

const semesterItems = computed(() => {
  const current = semesters
    .filter(s => s.isCurrent)
    .map(s => ({ label: s.displayName, value: s.id }))
  const previous = semesters
    .filter(s => !s.isCurrent)
    .map(s => ({ label: s.displayName, value: s.id }))
  return [...current, ...previous]
})

const selectedSemester = computed<Semester | undefined>(() =>
  semesters.find(s => s.id === selectedSemesterId.value)
)

const filteredLectures = computed(() =>
  lectures
    .filter(l => l.semesterId === selectedSemesterId.value && now >= l.unlockDateTime)
    .sort((a, b) => a.order - b.order)
)

function lecturePath(title: string): string {
  return `/materials/${selectedSemester.value?.slug ?? ''}/${getLectureSlug(title)}`
}
</script>

<template>
  <UContainer>
    <UPageHero
      title="Lecture materials"
      description="Slides, referenced animations and other materials by unit."
    />

    <div class="mx-auto max-w-4xl pb-16">
      <!-- Semester selector -->
      <label class="mb-2 block text-base">Choose a semester:</label>
      <USelectMenu
        v-model="selectedSemesterId"
        :items="semesterItems"
        value-key="value"
        class="w-full"
      />

      <!-- Lectures heading -->
      <h1 class="mb-6 mt-10 text-4xl font-bold">
        Lectures
      </h1>

      <!-- Lecture cards grid -->
      <UPageGrid>
        <UPageCard
          v-for="lecture in filteredLectures"
          :key="lecture.order"
          :title="getLectureDisplayTitle(lecture)"
          :icon="lecture.icon"
          :to="lecturePath(lecture.title)"
        />
      </UPageGrid>
    </div>
  </UContainer>
</template>
