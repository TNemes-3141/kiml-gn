<script setup lang="ts">
import { lectures, semesters, getLectureSlug, getLectureDisplayTitle } from '~/data/lectures'

const route = useRoute()
const toast = useToast()

const semesterSlug = route.params.semester as string
const lectureSlug = route.params.lecture as string

const semester = semesters.find(s => s.slug === semesterSlug)
const lecture = lectures.find(
  l => getLectureSlug(l.title) === lectureSlug && semester && l.semesterId === semester.id
)

if (!semester || !lecture) {
  throw createError({ statusCode: 404, statusMessage: 'Lecture not found' })
}

const breadcrumbItems = [
  { label: 'Lecture materials', to: '/materials' },
  { label: semester.displayName },
  { label: getLectureDisplayTitle(lecture) }
]

function openLink(link: string) {
  window.open(link, '_blank')
}

async function copyLink(link: string) {
  try {
    await navigator.clipboard.writeText(link)
    toast.add({
      title: 'Link copied to clipboard',
      icon: 'i-lucide-check',
      color: 'success'
    })
  }
  catch {
    toast.add({
      title: 'Failed to copy link',
      icon: 'i-lucide-x',
      color: 'error'
    })
  }
}
</script>

<template>
  <UContainer>
    <UPageHero
      title="Lecture materials"
      description="Slides, referenced animations and other materials by unit."
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
          square
          to="/materials"
        />
        <h1 class="text-4xl font-bold">
          Materials
        </h1>
      </div>

      <!-- Materials list -->
      <div class="mt-6 space-y-4">
        <div
          v-for="material in lecture.materials"
          :key="material.title"
          class="flex items-center justify-between rounded-xl bg-elevated/50 p-6"
        >
          <p class="font-semibold">
            {{ material.title }}
          </p>

          <UButtonGroup>
            <UButton
              color="secondary"
              @click="openLink(material.link)"
            >
              Open
            </UButton>
            <UButton
              variant="outline"
              icon="i-lucide-clipboard-copy"
              @click="copyLink(material.link)"
            />
          </UButtonGroup>
        </div>
      </div>
    </div>
  </UContainer>
</template>
