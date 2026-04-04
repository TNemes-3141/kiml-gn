interface PollSubmission {
  id: string
  score: number | null
}

export function useSubmissionPoller(slug: Ref<string>) {
  const pollingSubmissionId = ref<string | null>(null)
  let timer: ReturnType<typeof setInterval> | null = null

  function stopPolling() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    pollingSubmissionId.value = null
  }

  function startPolling(submissionId: string, onScored: (score: number) => void) {
    // Stop any existing poll
    stopPolling()
    pollingSubmissionId.value = submissionId

    const startedAt = Date.now()

    timer = setInterval(async () => {
      if (Date.now() - startedAt > 30_000) {
        stopPolling()
        return
      }

      try {
        const data = await $fetch<{ submissions: PollSubmission[] }>(
          `/api/tasks/${slug.value}/submissions`
        )
        const sub = data.submissions.find(s => s.id === submissionId)
        if (sub && sub.score !== null) {
          onScored(sub.score)
          stopPolling()
        }
      }
      catch {
        // Polling errors are transient — keep retrying until timeout
      }
    }, 2000)
  }

  onUnmounted(stopPolling)

  return { pollingSubmissionId, startPolling }
}
