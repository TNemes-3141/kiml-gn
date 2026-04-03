<script setup lang="ts">
const props = defineProps<{
  task: {
    id: string
    serialNum: number
    title: string
    slug: string
    unlockTime: string
    submissionDeadline: string
    onlineEditorLink: string
    status: string
  }
}>()

const now = new Date()
const unlocked = computed(() => new Date(props.task.unlockTime) <= now)

const statusDisplay = computed(() => {
  if (!unlocked.value) {
    return { label: 'Locked', color: 'neutral' as const, variant: 'subtle' as const }
  }
  switch (props.task.status) {
    case 'PASSED':
      return { label: 'Passed', color: 'success' as const, variant: 'subtle' as const }
    case 'FAILED':
      return { label: 'Failed', color: 'error' as const, variant: 'subtle' as const }
    case 'COMPLETED':
      return { label: 'Completed', color: 'info' as const, variant: 'subtle' as const }
    default:
      return { label: 'Not completed', color: 'warning' as const, variant: 'subtle' as const }
  }
})

const detailsPath = computed(() => `/tasks/${props.task.slug}`)

function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  const day = String(date.toLocaleString('de-DE', { day: '2-digit', timeZone: 'Europe/Berlin' }))
  const month = String(date.toLocaleString('de-DE', { month: '2-digit', timeZone: 'Europe/Berlin' }))
  const year = String(date.toLocaleString('de-DE', { year: 'numeric', timeZone: 'Europe/Berlin' }))
  const time = date.toLocaleString('de-DE', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Berlin',
    hour12: false
  })
  const tz = date.toLocaleString('de-DE', { timeZoneName: 'short', timeZone: 'Europe/Berlin' }).split(' ').pop()
  return `${day}.${month}.${year} ${time} ${tz}`
}
</script>

<template>
  <UPageCard variant="soft">
    <UIcon
      :name="unlocked ? 'i-lucide-lock-open' : 'i-lucide-lock'"
      :class="unlocked ? 'text-secondary-400' : 'text-neutral-500'"
      class="size-5"
    />
    <p class="mt-2 text-2xl font-bold">
      Task #{{ task.serialNum }}: {{ task.title }}
    </p>
    <div class="mt-4 flex items-center justify-between">
      <div class="flex gap-10">
        <div>
          <p class="text-base">
            Status
          </p>
          <UBadge
            :label="statusDisplay.label"
            :color="statusDisplay.color"
            :variant="statusDisplay.variant"
            class="mt-2"
          />
        </div>
        <div>
          <p class="text-base">
            Opens at
          </p>
          <p class="mt-2 text-base text-neutral-400">
            {{ formatDateTime(task.unlockTime) }}
          </p>
        </div>
        <div>
          <p class="text-base">
            Deadline
          </p>
          <p class="mt-2 text-base text-neutral-400">
            {{ formatDateTime(task.submissionDeadline) }}
          </p>
        </div>
      </div>
      <UButton
        label="Open"
        icon="i-lucide-arrow-right"
        trailing
        color="neutral"
        variant="solid"
        :to="unlocked ? detailsPath : undefined"
        :disabled="!unlocked"
      />
    </div>
  </UPageCard>
</template>
