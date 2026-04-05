<script setup lang="ts">
const route = useRoute()
const toast = useToast()
const { login } = useAuth()
const loading = ref(true)

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    toast.add({
      title: 'Anmeldung fehlgeschlagen',
      description: 'Kein Token angegeben. Beachten Sie die Anleitung unter "Wie melde ich mich an?" oben auf der Seite.',
      color: 'error'
    })
    return navigateTo('/')
  }

  try {
    await login(token)
    toast.add({
      title: 'Erfolgreich angemeldet!',
      color: 'success'
    })
    return navigateTo('/')
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
      ?? 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'
    toast.add({
      title: 'Anmeldung fehlgeschlagen',
      description: message,
      color: 'error'
    })
    return navigateTo('/')
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div v-if="loading" class="text-center">
      <UIcon name="i-lucide-loader-circle" class="text-primary mb-4 size-10 animate-spin" />
      <p class="text-muted text-sm">
        Anmeldung läuft...
      </p>
    </div>
  </div>
</template>
