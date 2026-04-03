<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'auth'
})

const toast = useToast()

const { data, refresh } = await useFetch<{
  passedCount: number
  passingThreshold: number
  portfolioDeadline: string | null
  videoLink: string | null
}>('/api/portfolio')

const { data: rules } = await useAsyncData('portfolio-rules', () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryCollection('portfolio' as any).path('/portfolio/rules').first()
)

const isEligible = computed(() =>
  (data.value?.passedCount ?? 0) >= (data.value?.passingThreshold ?? Infinity)
)
const hasSubmitted = computed(() => !!data.value?.videoLink)

const portfolioDeadlineFormatted = computed(() => {
  const dl = data.value?.portfolioDeadline
  if (!dl) return '—'
  return new Date(dl).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  })
})

const schema = z.object({
  videoLink: z.url('Please enter a valid URL.').min(1, 'Video URL is required.'),
  authorConfirmed: z.literal(true, { error: 'You must confirm authorship.' }),
  accessConfirmed: z.literal(true, { error: 'You must confirm the video will be accessible.' }),
  plagiarismConfirmed: z.literal(true, { error: 'You must acknowledge the plagiarism rules.' })
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  videoLink: '',
  authorConfirmed: undefined,
  accessConfirmed: undefined,
  plagiarismConfirmed: undefined
})

const submitting = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  submitting.value = true
  try {
    await ($fetch as Function)('/api/portfolio/submit', {
      method: 'POST',
      body: { videoLink: event.data.videoLink }
    })
    toast.add({ title: 'Portfolio submitted', description: 'Your portfolio has been submitted successfully.', color: 'success' })
    await refresh()
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
  <UContainer>
    <UPageHero
      title="Your portfolio"
      description="The progress of your portfolio for the final submission."
    />

    <div class="mx-auto max-w-4xl pb-16">
      <!-- Portfolio rules card (rendered Markdown) -->
      <ContentRendererCard :content="rules" />

      <!-- Current progress -->
      <h1 class="mb-6 mt-10 text-4xl font-bold">
        Current progress
      </h1>

      <div class="flex flex-col gap-5">
        <ProgressIndicator
          label="Programming tasks passed:"
          :value="data?.passedCount ?? 0"
          :max="data?.passingThreshold ?? 1"
          color="primary"
        />

        <ProgressIndicator
          label="Video report URL submitted:"
          :value="hasSubmitted ? 1 : 0"
          :max="1"
          color="primary"
        />

        <!-- Portfolio deadline -->
        <div>
          <p class="text-base text-white">
            Portfolio submission deadline:
          </p>
          <p class="text-2xl font-bold text-white">
            {{ portfolioDeadlineFormatted }}
          </p>
        </div>
      </div>

      <!-- Status card -->
      <div class="mt-6">
        <StatusCard
          v-if="hasSubmitted"
          state="success"
          title="Status"
          message="You have handed in your portfolio successfully! Your submission was received and will be graded."
        />
        <StatusCard
          v-else
          state="error"
          title="Status"
          message="You have not finished handing in your portfolio yet and would currently fail the course."
        />
      </div>

      <!-- Portfolio submission -->
      <h1 class="mb-6 mt-10 text-4xl font-bold">
        Portfolio submission
      </h1>

      <!-- Ineligible -->
      <p
        v-if="!isEligible"
        class="text-error-400"
      >
        Portfolio submission not available. You did not pass the required amount of programming tasks.
      </p>

      <!-- Already submitted: read-only display -->
      <UPageCard v-else-if="hasSubmitted" variant="soft">
        <template #title>
          Submitted video URL
        </template>
        <a
          :href="data?.videoLink ?? ''"
          target="_blank"
          class="text-secondary-400 underline break-all"
        >{{ data?.videoLink }}</a>
      </UPageCard>

      <!-- Eligible and not yet submitted: show form -->
      <UForm
        v-else
        :schema="schema"
        :state="state"
        class="flex flex-col gap-6"
        @submit="onSubmit"
      >
        <UFormField
          name="videoLink"
          label="Video report URL:"
          help="Please provide a public link of a video explaining your solution."
          required
        >
          <UInput
            v-model="state.videoLink"
            placeholder="https://..."
            class="w-full"
          />
        </UFormField>

        <UFormField name="authorConfirmed">
          <UCheckbox
            v-model="state.authorConfirmed"
            label="I hereby confirm that I am the sole author of the video above."
            color="neutral"
            required
          />
        </UFormField>

        <UFormField name="accessConfirmed">
          <UCheckbox
            v-model="state.accessConfirmed"
            required
            label="I hereby confirm that the submitted video URL is correct, the video under the URL will be publicly accessible until four weeks after the portfolio submission deadline and the video is not longer than 3 minutes."
            color="neutral"
            />
        </UFormField>

        <div>
          <UFormField name="plagiarismConfirmed">
            <UCheckbox
              v-model="state.plagiarismConfirmed"
              color="neutral"
              required
            >
              <template #label>
                <span class="font-semibold">I hereby confirm that I've read and acknowledged the rules regarding plagiarism.</span>
              </template>
            </UCheckbox>
          </UFormField>
          <p class="ml-6 mt-1 text-sm text-neutral-400">
            The video report and all solution code must be original work by the submitting person. You may not copy the work of other students (including work produced by students in previous versions of this course), or share videos/code or provide details on how to solve the task to other students. You may not publish project solutions online. Using work from previous years or by other student's submissions in any capacity is considered plagiarism. Among the code, including those of previous years, we search for similar solutions in order to detect plagiarism. Although not strictly forbidden, we discourage the use of ChatGPT, Gemini or similar code/language generation tools for writing code.
          </p>
        </div>

        <div class="flex justify-end">
          <UButton
            type="submit"
            label="Submit portfolio"
            color="primary"
            variant="solid"
            :loading="submitting"
          />
        </div>
      </UForm>
    </div>
  </UContainer>
</template>
