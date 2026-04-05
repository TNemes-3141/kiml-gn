export default defineNuxtPlugin(async () => {
  const fetch = useRequestFetch()
  try {
    const data = await fetch<{ user: { firstName: string, lastName: string, email: string } | null }>('/api/auth/me')
    if (data?.user) {
      useState('auth:user').value = data.user
    }
  }
  catch {
    // Not authenticated — state remains null
  }
})
