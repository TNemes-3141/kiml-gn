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
    title="How to sign in"
  >
    <template #body>
      <div class="space-y-4 p-4">
        <ol class="text-muted list-decimal space-y-2 pl-5">
          <li>
            At the beginning of the semester, you received an email to your university
            address containing a personal sign-in link.
          </li>
          <li>
            Open that email and click the link. You will be signed in automatically and
            redirected to the home page.
          </li>
          <li>
            Your session lasts for the entire semester. As long as you use the same browser
            and do not clear your cookies, you will stay signed in.
          </li>
          <li>
            If you switch to a different browser or device, or if you clear your cookies,
            simply click the link in the original email again.
          </li>
        </ol>

        <USeparator />

        <p class="text-muted text-sm">
          If you have not received the email, cannot find it, or experience any other
          issues signing in, please contact this email address with a detailed description of your issue:<br>
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
          Sign in (dev)
        </UButton>
      </div>
    </template>
  </UModal>
</template>
