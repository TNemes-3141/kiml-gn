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
  videoLink: z.url('Bitte geben Sie eine gültige URL ein.').min(1, 'Video-URL ist erforderlich.'),
  authorConfirmed: z.literal(true, { error: 'Sie müssen die Urheberschaft bestätigen.' }),
  accessConfirmed: z.literal(true, { error: 'Sie müssen die Zugänglichkeit des Videos bestätigen.' }),
  plagiarismConfirmed: z.literal(true, { error: 'Sie müssen die Plagiarismus-Regeln zur Kenntnis nehmen.' })
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
    toast.add({ title: 'Portfolio eingereicht', description: 'Ihr Portfolio wurde erfolgreich eingereicht.', color: 'success' })
    await refresh()
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message ?? 'Einreichung fehlgeschlagen. Bitte versuchen Sie es erneut.'
    toast.add({ title: 'Einreichung fehlgeschlagen', description: message, color: 'error' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <UContainer>
    <UPageHero
      title="Ihr Portfolio"
      description="Der Fortschritt Ihres Portfolios für die Abgabe."
    />

    <div class="mx-auto max-w-4xl pb-16">
      <!-- Portfolio rules card (rendered Markdown) -->
      <ContentRendererCard :content="rules" />

      <!-- Current progress -->
      <h1 class="mb-6 mt-10 text-4xl font-bold">
        Aktueller Fortschritt
      </h1>

      <div class="flex flex-col gap-5">
        <ProgressIndicator
          label="Programmieraufgaben bestanden:"
          :value="data?.passedCount ?? 0"
          :max="data?.passingThreshold ?? 1"
          color="primary"
        />

        <ProgressIndicator
          label="Videobericht-URL eingereicht:"
          :value="hasSubmitted ? 1 : 0"
          :max="1"
          color="primary"
        />

        <!-- Portfolio deadline -->
        <div>
          <p class="text-base text-white">
            Abgabefrist für das Portfolio:
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
          message="Sie haben Ihr Portfolio erfolgreich eingereicht! Ihre Abgabe wurde empfangen und wird bewertet."
        />
        <StatusCard
          v-else
          state="error"
          title="Status"
          message="Sie haben Ihr Portfolio noch nicht vollständig eingereicht und würden den Kurs derzeit nicht bestehen."
        />
      </div>

      <!-- Portfolio submission -->
      <h1 class="mb-6 mt-10 text-4xl font-bold">
        Portfolioabgabe
      </h1>

      <!-- Ineligible -->
      <p
        v-if="!isEligible"
        class="text-error-400"
      >
        Portfolioabgabe nicht möglich. Sie haben nicht die erforderliche Anzahl an Programmieraufgaben bestanden.
      </p>

      <!-- Already submitted: read-only display -->
      <UPageCard v-else-if="hasSubmitted" variant="soft">
        <template #title>
          Eingereichte Video-URL
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
          label="Videobericht-URL:"
          help="Bitte geben Sie einen öffentlichen Link zu einem Video an, in dem Sie Ihre Lösung erklären."
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
            label="Hiermit bestätige ich, dass ich der/die alleinige Autor/in des oben genannten Videos bin."
            color="neutral"
            required
          />
        </UFormField>

        <UFormField name="accessConfirmed">
          <UCheckbox
            v-model="state.accessConfirmed"
            required
            label="Hiermit bestätige ich, dass die eingereichte Video-URL korrekt ist, das Video unter der URL bis vier Wochen nach der Portfolio-Abgabefrist öffentlich zugänglich sein wird und das Video nicht länger als 3 Minuten ist."
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
                <span class="font-semibold">Hiermit bestätige ich, dass ich die Regeln bezüglich Plagiarismus gelesen und zur Kenntnis genommen habe.</span>
              </template>
            </UCheckbox>
          </UFormField>
          <p class="ml-6 mt-1 text-sm text-neutral-400">
            Der Videobericht und der gesamte Lösungscode müssen eine eigenständige Arbeit der einreichenden Person sein. Sie dürfen weder die Arbeit anderer Studierender kopieren (einschließlich Arbeiten aus früheren Versionen dieses Kurses), noch Videos/Code weitergeben oder anderen Studierenden Details zur Lösung der Aufgabe mitteilen. Sie dürfen Projektlösungen nicht online veröffentlichen. Die Verwendung von Arbeiten aus früheren Jahren oder von anderen Studierenden gilt als Plagiat. Unter den Abgaben, auch aus früheren Jahren, suchen wir nach ähnlichen Lösungen, um Plagiate zu erkennen. Obwohl nicht ausdrücklich verboten, raten wir von der Verwendung von ChatGPT, Gemini oder ähnlichen Code-/Sprachgenerierungstools zum Schreiben von Code ab.
          </p>
        </div>

        <div class="flex justify-end">
          <UButton
            type="submit"
            label="Portfolio einreichen"
            color="primary"
            variant="solid"
            :loading="submitting"
          />
        </div>
      </UForm>
    </div>
  </UContainer>
</template>
