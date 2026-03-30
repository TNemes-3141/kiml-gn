interface User {
  firstName: string
  lastName: string
  email: string
}

export function useAuth() {
  const authCookie = useCookie<User | null>('auth:user', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 180 // 6 months
  })

  const isAuthenticated = computed(() => authCookie.value !== null)
  const user = computed(() => authCookie.value)

  async function demoLogin() {
    const student = await $fetch<User>('/api/demo-login')
    authCookie.value = student
  }

  function logout() {
    authCookie.value = null
  }

  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    demoLogin,
    logout
  }
}
