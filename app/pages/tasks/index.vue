<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

useHead({ title: 'Programmieraufgaben' })

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
      title="Programmieraufgaben"
      description="Übersicht über die gestellten Aufgaben und Ihren Fortschritt."
    />

    <div class="mx-auto max-w-4xl pb-16">
      <!-- Info box (secondary/blue) -->
      <div
        v-if="showInfo"
        class="mb-7.5 rounded-[10px] bg-secondary-500/20 p-6"
      >
        <UIcon name="i-lucide-info" class="mb-2 size-5 text-secondary-400" />
        <p class="text-[15px] leading-6 text-secondary-300">
          Hier sehen Sie alle Programmieraufgaben, die im Laufe des Semesters gestellt werden. Ein blaues offenes Schloss-Symbol zeigt die Aufgaben an, die derzeit bearbeitet werden können. Bitte beachten Sie die Abgabefristen. Nur Aufgaben mit dem Status "Abgegeben" wurden korrekt eingereicht und werden bewertet (bestanden/nicht bestanden). Bitte beachten Sie, dass Sie mindestens {{ data?.semester?.passingThreshold ?? 0 }} von {{ data?.totalTasks ?? 0 }} Aufgaben bestehen müssen, um Ihr Portfolio abgeben zu können.
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <UButton label="Ausblenden" color="secondary" size="sm" @click="dismissInfo" />
          <UButton label="Nicht mehr anzeigen" color="secondary" variant="outline" size="sm" @click="dismissInfoPermanently" />
        </div>
      </div>

      <!-- Alert box (error/red) -->
      <div class="mb-10 rounded-[10px] bg-error-500/20 p-6">
        <UIcon name="i-lucide-octagon-alert" class="mb-2 size-5 text-error-400" />
        <p class="text-[15px] leading-6 text-error-300">
          Alle Abgabefristen sind verbindlich und wir akzeptieren <strong>keine verspäteten Abgaben!</strong> Fristverlängerungen können nicht gewährt werden. Es liegt in Ihrer individuellen Verantwortung, rechtzeitig mit der Bearbeitung der Aufgaben zu beginnen, damit Sie Ihre Ergebnisse fristgerecht einreichen können. Insbesondere kann die Bewertung Ihrer Abgaben auf dem Server eine erhebliche Zeit in Anspruch nehmen.
        </p>
      </div>

      <!-- Progress section -->
      <ProgressIndicator
        label="Aufgaben bestanden:"
        :value="data?.passedCount ?? 0"
        :max="data?.semester?.passingThreshold ?? 1"
        color="primary"
      />

      <!-- Task overview heading -->
      <h1 class="mb-6 mt-10 text-4xl font-bold">
        Aufgabenübersicht
      </h1>

      <TaskOverviewList :tasks="data?.tasks ?? []" />
    </div>
  </UContainer>
</template>
