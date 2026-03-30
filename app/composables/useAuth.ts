interface User {
  firstName: string
  lastName: string
  email: string
}

export function useAuth() {
  const isAuthenticated = useState<boolean>('auth:authenticated', () => false)
  const user = useState<User | null>('auth:user', () => null)

  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user)
  }
}
