<script setup lang="ts">
import { getLectureSlug, getLectureDisplayTitle, getValidatedLectures, type Semester } from '~/data/lectures'

const route = useRoute()
const toast = useToast()

const { data: semesters } = await useFetch<Semester[]>('/api/semesters')

const semesterId = route.params.semester as string
const lectureSlug = route.params.lecture as string

const semester = computed(() =>
  semesters.value?.find(s => s.id === semesterId)
)

const validLectures = computed(() => getValidatedLectures(semesters.value ?? []))

const lecture = computed(() =>
  validLectures.value.find(
    l => getLectureSlug(l.title) === lectureSlug && l.semesterId === semesterId
  )
)

if (!semester.value || !lecture.value) {
  throw createError({ statusCode: 404, statusMessage: 'Lecture not found' })
}

const breadcrumbItems = computed(() => [
  { label: 'Vorlesungsmaterialien', to: '/materials' },
  { label: semester.value!.displayName },
  { label: getLectureDisplayTitle(lecture.value!) }
])

function openLink(link: string) {
  window.open(link, '_blank')
}

async function copyLink(link: string) {
  try {
    await navigator.clipboard.writeText(link)
    toast.add({
      title: 'Link in die Zwischenablage kopiert',
      icon: 'i-lucide-check',
      color: 'success'
    })
  }
  catch {
    toast.add({
      title: 'Link konnte nicht kopiert werden',
      icon: 'i-lucide-x',
      color: 'error'
    })
  }
}
</script>

<template>
  <UContainer>
    <UPageHero
      title="Vorlesungsmaterialien"
      description="Animationen, Mitmachübungen und weitere Materialien nach Vorlesungseinheit."
    />

    <div class="mx-auto max-w-4xl pb-16">
      <!-- Breadcrumb -->
      <UBreadcrumb :items="breadcrumbItems" />

      <!-- Back button + title -->
      <div class="mt-6 flex items-center gap-3">
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          size="lg"
          color="neutral"
          square
          to="/materials"
        />
        <h1 class="text-4xl font-bold">
          Materialien
        </h1>
      </div>

      <!-- Materials list -->
      <div class="mt-6 space-y-4">
        <div
          v-for="material in lecture!.materials"
          :key="material.title"
          class="flex items-center justify-between rounded-xl bg-elevated/50 p-6"
        >
          <p class="font-semibold">
            {{ material.title }}
          </p>

          <UFieldGroup>
            <UButton
              color="secondary"
              @click="openLink(material.link)"
            >
              Öffnen
            </UButton>
            <UButton
              variant="outline"
              icon="i-lucide-clipboard-copy"
              color="neutral"
              @click="copyLink(material.link)"
            />
          </UFieldGroup>
        </div>
      </div>
    </div>
  </UContainer>
</template>
