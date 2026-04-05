<script setup lang="ts">
const route = useRoute()
const toast = useToast()
const { login } = useAuth()
const loading = ref(true)

onMounted(async () => {
  const token = route.query.token as string | undefined

  if (!token) {
    toast.add({
      title: 'Login failed',
      description: 'No token provided. Refer to the instructions in How to log in at the top of the page.',
      color: 'error'
    })
    return navigateTo('/')
  }

  try {
    await login(token)
    toast.add({
      title: 'Logged in successfully!',
      color: 'success'
    })
    return navigateTo('/')
  }
  catch (err: unknown) {
    const message = (err as { data?: { message?: string } })?.data?.message
      ?? 'Login failed. Please try again.'
    toast.add({
      title: 'Login failed',
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
        Signing in...
      </p>
    </div>
  </div>
</template>
