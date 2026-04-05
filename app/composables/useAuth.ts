interface User {
  firstName: string
  lastName: string
  email: string
}

export function useAuth() {
  const user = useState<User | null>('auth:user', () => null)
  const isAuthenticated = computed(() => user.value !== null)

  async function login(token: string) {
    const data = await $fetch<User>('/api/auth/login', {
      method: 'POST',
      body: { token }
    })
    user.value = data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    login,
    logout
  }
}
