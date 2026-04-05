<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

defineProps<{ isAuthenticated: boolean }>()

interface Task {
  id: string
  serialNum: number
  title: string
  slug: string
  unlockTime: string
  submissionDeadline: string
  status: string
}

const { data } = await useFetch<{ tasks: Task[], semester: { passingThreshold: number } | null, passedCount: number }>('/api/tasks')

const UBadge = resolveComponent('UBadge')
const UIcon = resolveComponent('UIcon')

const now = new Date()

function getStatusDisplay(task: Task) {
  const unlocked = new Date(task.unlockTime) <= now
  if (!unlocked) return { label: 'Gesperrt', color: 'neutral' as const }
  switch (task.status) {
    case 'PASSED': return { label: 'Bestanden', color: 'success' as const }
    case 'FAILED': return { label: 'Nicht bestanden', color: 'error' as const }
    case 'COMPLETED': return { label: 'Abgegeben', color: 'info' as const }
    default: return { label: 'Nicht abgegeben', color: 'warning' as const }
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Berlin'
  })
}

const columns: TableColumn<Task>[] = [
  {
    id: 'lock',
    header: '',
    cell: ({ row }) => {
      const unlocked = new Date(row.original.unlockTime) <= now
      return h(UIcon, {
        name: unlocked ? 'i-lucide-lock-open' : 'i-lucide-lock',
        class: unlocked ? 'text-secondary-400 size-4' : 'text-neutral-500 size-4'
      })
    }
  },
  {
    accessorKey: 'serialNum',
    header: 'Aufg. Nr.',
    cell: ({ row }) => `Aufgabe ${row.getValue('serialNum')}`
  },
  {
    accessorKey: 'title',
    header: 'Titel',
    meta: { class: { th: 'w-full', td: 'w-full' } }
  },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => {
      const s = getStatusDisplay(row.original)
      return h(UBadge, { label: s.label, color: s.color, variant: 'subtle' })
    }
  },
  {
    id: 'deadline',
    header: 'Deadline',
    accessorKey: 'submissionDeadline',
    cell: ({ row }) => formatDate(row.original.submissionDeadline)
  }
]
</script>

<template>
  <div class="col-span-2 flex flex-col rounded-xl border border-secondary-500/20 bg-secondary-500/5 p-6">
    <h3 class="text-base font-semibold">
      Programmieraufgaben
    </h3>
    <p class="mt-1 text-sm text-muted">
      Übersicht über die gestellten Aufgaben und Ihren Fortschritt.
    </p>

    <template v-if="isAuthenticated">
      <div class="mt-4 flex-1">
        <UTable
          :data="data?.tasks ?? []"
          :columns="columns"
        />
      </div>
      <div class="mt-4 flex justify-end">
        <UButton
          icon="i-lucide-chevron-right"
          color="secondary"
          size="sm"
          square
          to="/tasks"
        />
      </div>
    </template>
    <div v-else class="flex flex-1 flex-col items-center justify-center gap-4 mt-5">
      <UIcon name="i-lucide-lock" class="text-muted size-14" />
      <p class="text-center text-muted">
        Melden Sie sich an, um auf die Programmieraufgaben zuzugreifen
      </p>
    </div>
  </div>
</template>
