<script setup lang="ts">
import { CONTACT_EMAIL_USER, CONTACT_EMAIL_DOMAIN } from '~/data/contact'

const open = defineModel<boolean>('open', { default: false })
const isDev = import.meta.dev

const emailDisplay = `${CONTACT_EMAIL_USER}\u200B@\u200B${CONTACT_EMAIL_DOMAIN}`
const emailHref = computed(() => `mailto:${CONTACT_EMAIL_USER}@${CONTACT_EMAIL_DOMAIN}`)
</script>

<template>
  <UModal
    v-model:open="open"
    title="Wie melde ich mich an?"
  >
    <template #body>
      <div class="space-y-4 p-4">
        <ol class="text-muted list-decimal space-y-2 pl-5">
          <li>
            Zu Beginn des Semesters haben Sie eine E-Mail an Ihre Hochschul-Adresse
            mit einem persönlichen Anmeldelink erhalten.
          </li>
          <li>
            Öffnen Sie diese E-Mail und klicken Sie auf den Link. Sie werden automatisch
            angemeldet und auf die Startseite weitergeleitet.
          </li>
          <li>
            Ihre Sitzung gilt für das gesamte Semester. Solange Sie denselben Browser
            verwenden und Ihre Cookies nicht löschen, bleiben Sie angemeldet.
          </li>
          <li>
            Wenn Sie den Browser oder das Gerät wechseln oder Ihre Cookies löschen,
            klicken Sie einfach erneut auf den Link in der ursprünglichen E-Mail.
          </li>
        </ol>

        <USeparator />

        <p class="text-muted text-sm">
          Falls Sie die E-Mail nicht erhalten haben, sie nicht finden oder andere
          Probleme bei der Anmeldung auftreten, kontaktieren Sie bitte folgende E-Mail-Adresse mit einer detaillierten Beschreibung Ihres Problems:<br>
          <a
            :href="emailHref"
            class="text-primary hover:underline"
            v-text="emailDisplay"
          />.
        </p>
      </div>
    </template>
    <template v-if="isDev" #footer>
      <div class="flex w-full justify-center">
        <UButton
          color="primary"
          to="/login?token=dev-test-token-kiml-2026"
          @click="open = false"
        >
          Anmelden (dev)
        </UButton>
      </div>
    </template>
  </UModal>
</template>
