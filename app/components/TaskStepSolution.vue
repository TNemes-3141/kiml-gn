<script setup lang="ts">
import * as z from 'zod'
import { getPaginationRowModel } from '@tanstack/vue-table'
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'

const props = defineProps<{
  task: {
    id: string
    slug: string
    baselineScore: number
    submissionDeadline: string
    maxDailySubmissions: number
    maxOverallSubmissions: number
  }
}>()

const emit = defineEmits<{
  submitted: []
}>()

const toast = useToast()

const { data: stats, refresh: refreshStats } = await useFetch<{ dailyCount: number, totalCount: number }>(`/api/tasks/${props.task.slug}/stats`)
const { data: studentInfo, refresh: refreshStudentInfo } = await useFetch<{ studentId: string, publicAlias: string | null }>(`/api/tasks/${props.task.slug}/student-info`)

interface Submission {
  id: string
  serialNum: number
  submittedAt: string
  score: number | null
}

const { data: submissionsData, refresh: refreshSubmissions } = await useFetch<{ submissions: Submission[] }>(`/api/tasks/${props.task.slug}/submissions`)

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  isCurrentStudent: boolean
}

const { data: leaderboardData, refresh: refreshLeaderboard } = await useFetch<{ entries: LeaderboardEntry[] }>(`/api/tasks/${props.task.slug}/leaderboard`)

const leaderboard = computed(() => leaderboardData.value?.entries ?? [])

const submissions = computed(() => submissionsData.value?.submissions ?? [])

const submissionsTable = useTemplateRef('submissionsTable')
const pagination = ref({ pageIndex: 0, pageSize: 4 })

const submissionColumns: TableColumn<Submission>[] = [
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

const leaderboardColumns: TableColumn<LeaderboardEntry>[] = [
  {
    accessorKey: 'rank',
    header: '#',
    cell: ({ row }) => `# ${row.getValue('rank')}`
  },
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { class: { th: 'w-full', td: 'w-full' } }
  },
  {
    accessorKey: 'score',
    header: 'Score',
    meta: { class: { th: 'text-right', td: 'text-right' } },
    cell: ({ row }) => (row.getValue('score') as number).toFixed(3)
  }
]

const deadlinePassed = computed(() => new Date(props.task.submissionDeadline) < new Date())
const needsAlias = computed(() => studentInfo.value?.publicAlias === null)

const schema = computed(() => {
  const base = z.object({
    solutionFile: z
      .instanceof(File, { message: 'Please select a solution file.' })
      .refine(file => file.name.toLowerCase().endsWith('.csv'), { message: 'Solution file must be a .csv file.' }),
    sourceCodeFile: z
      .instanceof(File, { message: 'Please select a source code file.' })
      .refine(
        file => file.name.toLowerCase().endsWith('.py') || file.name.toLowerCase().endsWith('.ipynb'),
        { message: 'Source code must be a .py or .ipynb file.' }
      ),
    publicAlias: needsAlias.value
      ? z.string().min(1, 'Public alias is required.')
      : z.string().optional()
  })
  return base
})

type FormState = {
  solutionFile: File | undefined
  sourceCodeFile: File | undefined
  publicAlias: string
}

const state = reactive<FormState>({
  solutionFile: undefined,
  sourceCodeFile: undefined,
  publicAlias: ''
})

const submitting = ref(false)

async function onSubmit(event: FormSubmitEvent<{ solutionFile: File, sourceCodeFile: File, publicAlias?: string }>) {
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('solutionFile', event.data.solutionFile)
    formData.append('sourceCodeFile', event.data.sourceCodeFile)
    if (event.data.publicAlias) {
      formData.append('publicAlias', event.data.publicAlias)
    }

    await ($fetch as Function)(`/api/tasks/${props.task.slug}/submit`, {
      method: 'POST',
      body: formData
    })

    toast.add({ title: 'Submission successful', description: 'Your solution has been submitted.', color: 'success' })

    // Reset form
    state.solutionFile = undefined
    state.sourceCodeFile = undefined
    state.publicAlias = ''

    // Refresh data
    await Promise.all([refreshStats(), refreshStudentInfo(), refreshSubmissions(), refreshLeaderboard()])
    emit('submitted')
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message ?? 'Submission failed. Please try again.'
    toast.add({ title: 'Submission failed', description: message, color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

function clearForm() {
  state.solutionFile = undefined
  state.sourceCodeFile = undefined
  state.publicAlias = ''
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Stats area -->
    <div class="flex flex-col gap-5">
      <!-- Daily submissions limit -->
      <div>
        <p class="mb-1 text-base text-white">
          Limit for uploaded solutions today (resets at 23:59:59):
          <span class="font-bold">{{ stats?.dailyCount ?? 0 }} / {{ task.maxDailySubmissions }}</span>
        </p>
        <UProgress
          :model-value="stats?.dailyCount ?? 0"
          :max="task.maxDailySubmissions"
          color="secondary"
        />
      </div>

      <!-- Total submissions limit -->
      <div>
        <p class="mb-1 text-base text-white">
          Limit for uploaded solutions in total:
          <span class="font-bold">{{ stats?.totalCount ?? 0 }} / {{ task.maxOverallSubmissions }}</span>
        </p>
        <UProgress
          :model-value="stats?.totalCount ?? 0"
          :max="task.maxOverallSubmissions"
          color="secondary"
        />
      </div>

      <!-- Baseline score -->
      <div>
        <p class="text-base text-white">
          Baseline to beat:
        </p>
        <p class="text-2xl font-bold text-white">
          {{ task.baselineScore }}
        </p>
      </div>
    </div>

    <!-- Solution area: only show if deadline has NOT passed -->
    <template v-if="!deadlinePassed">
      <!-- Solution submission form -->
      <UPageCard variant="soft">
        <template #title>
          Solution submission
        </template>
        <template #description>
          Upload your solution file (generated predictions) and your source code and press "Make a submission".
        </template>

        <UForm :schema="schema" :state="state" class="flex flex-col gap-4" @submit="onSubmit">
          <UFormField name="solutionFile" label="Solution file" required>
            <UFileUpload
              v-model="state.solutionFile"
              accept=".csv"
              label="Solution file"
              description="Output predictions from your solution (.CSV)"
              color="secondary"
            />
          </UFormField>

          <UFormField name="sourceCodeFile" label="Source code" required>
            <UFileUpload
              v-model="state.sourceCodeFile"
              accept=".py,.ipynb"
              label="Source code"
              description="The code you wrote to generate your solution (.PY, .IPYNB)"
              color="secondary"
            />
          </UFormField>

          <UFormField
            v-if="needsAlias"
            name="publicAlias"
            label="Public alias for leaderboard"
            description="(Caution: You can only choose this once!)"
            required
          >
            <UInput v-model="state.publicAlias" />
          </UFormField>

          <div class="flex justify-end gap-2">
            <UButton label="Clear" color="neutral" variant="outline" @click="clearForm" />
            <UButton type="submit" label="Make a submission" color="neutral" variant="solid" :loading="submitting" />
          </div>
        </UForm>
      </UPageCard>

      <!-- Your solutions table -->
      <UPageCard variant="soft">
        <template #title>
          Your solutions
        </template>

        <UTable
          ref="submissionsTable"
          v-model:pagination="pagination"
          :data="submissions"
          :columns="submissionColumns"
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

        <div class="flex justify-end border-t border-neutral-800 pt-4">
          <UPagination
            :page="(submissionsTable?.tableApi?.getState().pagination.pageIndex ?? 0) + 1"
            :items-per-page="submissionsTable?.tableApi?.getState().pagination.pageSize"
            :total="submissionsTable?.tableApi?.getFilteredRowModel().rows.length ?? 0"
            @update:page="(p: number) => submissionsTable?.tableApi?.setPageIndex(p - 1)"
            active-color="neutral"
          />
        </div>
      </UPageCard>
    </template>

    <!-- Deadline passed message -->
    <UPageCard v-else variant="soft">
      <p class="text-neutral-400">
        Task is closed; no more solution uploads are allowed.
      </p>
    </UPageCard>

    <!-- Leaderboard -->
    <UPageCard variant="soft">
      <template #icon>
        <UIcon name="i-lucide-trophy" class="text-primary-400" />
      </template>
      <template #title>
        Leaderboard
      </template>

      <UTable
        :data="leaderboard"
        :columns="leaderboardColumns"
        :meta="{
          class: {
            tr: (row: any) => row.original.isCurrentStudent ? 'bg-secondary-500/20' : ''
          }
        }"
      />
    </UPageCard>
  </div>
</template>
