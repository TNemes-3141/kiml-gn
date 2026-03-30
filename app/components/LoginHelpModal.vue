<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <UModal
    v-model:open="open"
    title="How to sign in"
  >
    <template #body>
      <div class="space-y-4 p-4">
        <p class="text-muted">
          To sign in, use the unique link that was sent to your university email address
          at the beginning of the semester. Clicking this link will authenticate you
          automatically.
        </p>
        <p class="text-muted">
          If you have not received the email or need a new link, please contact your
          course instructor.
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full justify-center">
        <UButton color="primary">
          Sign in (demo)
        </UButton>
      </div>
    </template>
  </UModal>
</template>
