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
    header: 'Select a solution:',
    cell: ({ row }) => h(UCheckbox, {
      'modelValue': row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
        // Single selection: clear others first
        rowSelection.value = {}
        if (value) {
          row.toggleSelected(true)
        }
      },
      'ariaLabel': 'Select row'
    })
  },
  {
    accessorKey: 'serialNum',
    header: 'Number'
  },
  {
    accessorKey: 'submittedAt',
    header: 'Date and time',
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
    header: 'Passes baseline?',
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

    toast.add({ title: 'Submission successful', description: 'Your final solution has been submitted.', color: 'success' })
    await refreshTaskState()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message ?? 'Submission failed. Please try again.'
    toast.add({ title: 'Submission failed', description: message, color: 'error' })
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
        It is not enough to upload the solution, you also have to hand-in the solution to pass the project! Please make sure to correctly submit the solution you intend by selecting it from the table below, agreeing to the project rules and pressing "Submit". Only correctly submitted solutions are eligible for grading (pass/fail). Please double check that your hand-in was successful by <strong>refreshing the page after pressing the "Submit" button!</strong>
      </p>
    </div>

    <!-- Status card -->
    <StatusCard
      v-if="hasSubmitted"
      state="success"
      title="Status"
      message="You have finished submitting your solution and your submission was received."
    />
    <StatusCard
      v-else
      state="error"
      title="Status"
      message="You have not finished submitting your solution yet and would currently fail the task."
    />

    <!-- Submission of final solution -->
    <UPageCard variant="soft">
      <template #title>
        Submission of final solution
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
                label="Yes"
                color="success"
                variant="subtle"
              />
              <UBadge
                v-else
                label="No"
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
                label="Yes"
                color="success"
                variant="subtle"
              />
              <UBadge
                v-else
                label="No"
                color="error"
                variant="subtle"
              />
            </template>
            <span v-else>-</span>
          </template>
        </UTable>

        <div class="flex items-center justify-between border-t border-neutral-800 pt-4">
          <p class="text-sm text-neutral-400">
            {{ Object.values(rowSelection).filter(Boolean).length }} of {{ submissions.length }} row(s) selected.
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
            label="I hereby confirm that I am the sole author of the solution I submit."
            required
          />
          <div>
            <UCheckbox
              v-model="plagiarismConfirmed"
              required
            >
              <template #label>
                <span class="font-semibold">I hereby confirm that I've read and acknowledged the rules regarding plagiarism.</span>
              </template>
            </UCheckbox>
            <p class="ml-6 mt-1 text-sm text-neutral-400">
              The solution code must be original work by the submitting person. You may not copy the work of other students (including work produced by students in previous versions of this course), or share code or provide details on how to solve the task to other students. You may not publish project solutions online. Using solutions from previous years or from other student's submissions in any capacity is considered plagiarism. Among the code, including those of previous years, we search for similar solutions in order to detect plagiarism. Although not strictly forbidden, we discourage the use of ChatGPT, Gemini or similar code/language generation tools for writing code.
            </p>
          </div>
        </div>

        <!-- Submit button -->
        <div class="mt-6 flex justify-end">
          <UButton
            label="Submit"
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
