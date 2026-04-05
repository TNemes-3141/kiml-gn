<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { TableColumn } from '@nuxt/ui'

const UCheckbox = resolveComponent('UCheckbox')

const props = defineProps<{
  task: {
    id: string
    slug: string
    baselineScore: number
  }
}>()

const toast = useToast()

interface Submission {
  id: string
  serialNum: number
  submittedAt: string
  score: number | null
}

interface TaskState {
  selectedSubmissionId: string | null
  status: string
}

const { data: submissionsData } = await useFetch<{ submissions: Submission[] }>(`/api/tasks/${props.task.slug}/submissions`)
const { data: taskState, refresh: refreshTaskState } = await useFetch<TaskState>(`/api/tasks/${props.task.slug}/task-state`)

const submissions = computed(() => submissionsData.value?.submissions ?? [])
const hasSubmitted = computed(() => taskState.value?.selectedSubmissionId !== null)

// For the "already submitted" view: show only the selected submission
const selectedSubmission = computed(() => {
  if (!hasSubmitted.value) return []
  return submissions.value.filter(s => s.id === taskState.value?.selectedSubmissionId)
})

// Table setup
const submissionTable = useTemplateRef('submissionTable')
const pagination = ref({ pageIndex: 0, pageSize: 4 })
const rowSelection = ref<Record<string, boolean>>({})

// Columns with selection checkbox (only for the form view)
const selectableColumns: TableColumn<Submission>[] = [
  {
    id: 'select',
    header: 'Lösung auswählen:',
    cell: ({ row }) => h(UCheckbox, {
      'modelValue': row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
        // Single selection: clear others first
        rowSelection.value = {}
        if (value) {
          row.toggleSelected(true)
        }
      },
      'ariaLabel': 'Select row',
      'color': 'neutral'
    })
  },
  {
    accessorKey: 'serialNum',
    header: 'Nr.'
  },
  {
    accessorKey: 'submittedAt',
    header: 'Datum und Uhrzeit',
    meta: { class: { th: 'w-full', td: 'w-full' } },
    cell: ({ row }) => {
      const val = row.getValue('submittedAt') as string
      return new Date(val).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    }
  },
  {
    accessorKey: 'score',
    header: 'Score',
    meta: { class: { th: 'text-right', td: 'text-right' } },
    cell: ({ row }) => {
      const score = row.getValue('score') as number | null
      return score !== null ? score.toFixed(3) : '-'
    }
  },
  {
    id: 'passesBaseline',
    header: 'Baseline erreicht?',
    meta: { class: { th: 'text-right', td: 'text-right' } },
    accessorKey: 'score'
  }
]

// Columns without selection (for the "already submitted" view)
const readonlyColumns: TableColumn<Submission>[] = selectableColumns.filter(c => c.id !== 'select')

// Legal checkboxes
const authorConfirmed = ref(false)
const plagiarismConfirmed = ref(false)

const submitting = ref(false)

// Get the selected submission from the table
const selectedRow = computed(() => {
  const keys = Object.keys(rowSelection.value).filter(k => rowSelection.value[k])
  if (keys.length !== 1) return null
  const index = Number(keys[0])
  return submissions.value[index] ?? null
})

const canSubmit = computed(() => {
  if (!selectedRow.value) return false
  if (selectedRow.value.score === null) return false
  if (selectedRow.value.score < props.task.baselineScore) return false
  if (!authorConfirmed.value) return false
  if (!plagiarismConfirmed.value) return false
  return true
})

async function onSubmit() {
  if (!canSubmit.value || !selectedRow.value) return

  submitting.value = true
  try {
    await ($fetch as Function)(`/api/tasks/${props.task.slug}/final-submit`, {
      method: 'POST',
      body: { submissionId: selectedRow.value.id }
    })

    toast.add({ title: 'Abgabe erfolgreich', description: 'Ihre endgültige Lösung wurde eingereicht.', color: 'success' })
    await refreshTaskState()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message ?? 'Abgabe fehlgeschlagen. Bitte versuchen Sie es erneut.'
    toast.add({ title: 'Abgabe fehlgeschlagen', description: message, color: 'error' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Static warning card -->
    <div class="rounded-[10px] bg-warning-500/20 p-6">
      <UIcon name="i-lucide-triangle-alert" class="mb-2 size-5 text-warning-400" />
      <p class="text-[15px] leading-6 text-warning-300">
        Es reicht nicht aus, Ihre Lösung(en) hochzuladen. Sie müssen eine Lösung auch abgeben, um die Aufgabe zu bestehen! Bitte wählen Sie Ihre gewünschte Lösungsabgabe aus der Tabelle unten aus, stimmen Sie den Projektregeln zu und drücken Sie "Abgeben". Nur korrekt abgegebene Lösungen werden bewertet (bestanden/nicht bestanden). Bitte überprüfen Sie die erfolgreiche Abgabe, indem Sie <strong>die Seite nach dem Drücken von "Abgeben" aktualisieren!</strong>
      </p>
    </div>

    <!-- Status card -->
    <StatusCard
      v-if="hasSubmitted"
      state="success"
      title="Status"
      message="Sie haben Ihre Lösung erfolgreich abgegeben und Ihre Abgabe wurde empfangen."
    />
    <StatusCard
      v-else
      state="error"
      title="Status"
      message="Sie haben Ihre Lösung noch nicht abgegeben und würden die Aufgabe derzeit nicht bestehen."
    />

    <!-- Submission of final solution -->
    <UPageCard variant="soft">
      <template #title>
        Abgabe der endgültigen Lösung
      </template>

      <!-- Already submitted: show only the selected submission -->
      <template v-if="hasSubmitted">
        <UTable
          :data="selectedSubmission"
          :columns="readonlyColumns"
        >
          <template #passesBaseline-cell="{ row }">
            <template v-if="row.original.score !== null">
              <UBadge
                v-if="row.original.score >= task.baselineScore"
                label="Ja"
                color="success"
                variant="subtle"
              />
              <UBadge
                v-else
                label="Nein"
                color="error"
                variant="subtle"
              />
            </template>
            <span v-else>-</span>
          </template>
        </UTable>
      </template>

      <!-- Not yet submitted: show full form -->
      <template v-else>
        <UTable
          ref="submissionTable"
          v-model:row-selection="rowSelection"
          v-model:pagination="pagination"
          :data="submissions"
          :columns="selectableColumns"
          :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
        >
          <template #passesBaseline-cell="{ row }">
            <template v-if="row.original.score !== null">
              <UBadge
                v-if="row.original.score >= task.baselineScore"
                label="Ja"
                color="success"
                variant="subtle"
              />
              <UBadge
                v-else
                label="Nein"
                color="error"
                variant="subtle"
              />
            </template>
            <span v-else>-</span>
          </template>
        </UTable>

        <div class="flex items-center justify-between border-t border-neutral-800 pt-4">
          <p class="text-sm text-neutral-400">
            {{ Object.values(rowSelection).filter(Boolean).length }} von {{ submissions.length }} Zeile(n) ausgewählt.
          </p>
          <UPagination
            :page="(submissionTable?.tableApi?.getState().pagination.pageIndex ?? 0) + 1"
            :items-per-page="submissionTable?.tableApi?.getState().pagination.pageSize"
            :total="submissionTable?.tableApi?.getFilteredRowModel().rows.length ?? 0"
            @update:page="(p: number) => submissionTable?.tableApi?.setPageIndex(p - 1)"
            active-color="neutral"
          />
        </div>

        <!-- Legal checkboxes -->
        <div class="mt-6 flex flex-col gap-4">
          <UCheckbox
            v-model="authorConfirmed"
            label="Hiermit bestätige ich, dass ich der/die alleinige Autor/in der von mir eingereichten Lösung bin."
            color="neutral"
            required
          />
          <div>
            <UCheckbox
              v-model="plagiarismConfirmed"
              color="neutral"
              required
            >
              <template #label>
                <span class="font-semibold">Hiermit bestätige ich, dass ich die Regeln bezüglich Plagiarismus gelesen und zur Kenntnis genommen habe.</span>
              </template>
            </UCheckbox>
            <p class="ml-6 mt-1 text-sm text-neutral-400">
              Der Lösungscode muss eine eigenständige Arbeit der einreichenden Person sein. Sie dürfen weder die Arbeit anderer Studierender kopieren (einschließlich Arbeiten aus früheren Versionen dieses Kurses), noch Code weitergeben oder anderen Studierenden Details zur Lösung der Aufgabe mitteilen. Sie dürfen Projektlösungen nicht online veröffentlichen. Die Verwendung von Lösungen aus früheren Jahren oder von anderen Studierenden gilt als Plagiat. Unter den Abgaben, auch aus früheren Jahren, suchen wir nach ähnlichen Lösungen, um Plagiate zu erkennen. Obwohl nicht ausdrücklich verboten, raten wir von der Verwendung von ChatGPT, Gemini oder ähnlichen Code-/Sprachgenerierungstools zum Schreiben von Code ab.
            </p>
          </div>
        </div>

        <!-- Submit button -->
        <div class="mt-6 flex justify-end">
          <UButton
            label="Abgeben"
            color="neutral"
            variant="solid"
            :disabled="!canSubmit"
            :loading="submitting"
            @click="onSubmit"
          />
        </div>
      </template>
    </UPageCard>
  </div>
</template>
