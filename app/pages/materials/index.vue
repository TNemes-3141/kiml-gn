<script setup lang="ts">
import { getLectureSlug, getLectureDisplayTitle, getValidatedLectures, type Semester } from '~/data/lectures'

const { data: semesters } = await useFetch<Semester[]>('/api/semesters')

const now = new Date()
const defaultSemesterId = computed(() => semesters.value?.[0]?.id ?? '')
const selectedSemesterId = ref(defaultSemesterId.value)

const validLectures = computed(() => getValidatedLectures(semesters.value ?? []))

const selectedSemester = computed(() =>
  semesters.value?.find(s => s.id === selectedSemesterId.value)
)

const semesterItems = computed(() =>
  (semesters.value ?? []).map(s => ({ label: s.displayName, value: s.id }))
)

const filteredLectures = computed(() =>
  validLectures.value
    .filter(l => l.semesterId === selectedSemesterId.value && now >= l.unlockDateTime)
    .sort((a, b) => a.order - b.order)
)

function lecturePath(title: string): string {
  return `/materials/${selectedSemester.value?.id ?? ''}/${getLectureSlug(title)}`
}
</script>

<template>
  <UContainer>
    <UPageHero
      title="Vorlesungsmaterialien"
      description="Animationen, Mitmachübungen und weitere Materialien nach Vorlesungseinheit."
    />

    <div class="mx-auto max-w-4xl pb-16">
      <!-- Semester selector -->
      <label class="mb-2 block text-base">Semester auswählen:</label>
      <USelectMenu
        v-model="selectedSemesterId"
        :items="semesterItems"
        value-key="value"
        class="w-full"
        :search-input="{
          placeholder: 'Semester suchen...',
        }"
      />

      <!-- Lectures heading -->
      <h1 class="mb-6 mt-10 text-4xl font-bold">
        Vorlesungen
      </h1>

      <!-- Lecture cards grid -->
      <UPageGrid>
        <UPageCard
          v-for="lecture in filteredLectures"
          :key="lecture.order"
          :title="getLectureDisplayTitle(lecture)"
          :icon="lecture.icon"
          :to="lecturePath(lecture.title)"
          variant="soft"
        />
      </UPageGrid>
    </div>
  </UContainer>
</template>
