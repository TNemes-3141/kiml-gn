import type { H3Event } from 'h3'

export interface AuthStudent {
  id: string
  firstName: string
  lastName: string
  email: string
  publicAlias: string | null
  semesterId: string
  firstLoginAt: string | null
  portfolioVideoLink: string | null
}

const TOKEN_HASH_PATTERN = /^[a-f0-9]{64}$/

/**
 * Reads the auth:session cookie (SHA-256 token hash), resolves the student
 * from the DB, and checks the 6-month session validity window.
 * Returns null if unauthenticated, expired, or invalid.
 */
export async function resolveStudent(event: H3Event): Promise<AuthStudent | null> {
  const tokenHash = getCookie(event, 'auth:session')
  if (!tokenHash || !TOKEN_HASH_PATTERN.test(tokenHash)) return null

  const db = useDB()
  const result = await db.execute({
    sql: `SELECT id, first_name, last_name, email, public_alias, semester_id, first_login_at, portfolio_video_link
          FROM students WHERE token_hash = ?`,
    args: [tokenHash]
  })

  const row = result.rows[0]
  if (!row) return null

  // Check 6-month expiry from first login
  if (row.first_login_at) {
    const firstLogin = new Date(row.first_login_at as string)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    if (firstLogin < sixMonthsAgo) {
      deleteCookie(event, 'auth:session', { path: '/' })
      return null
    }
  }

  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: row.email as string,
    publicAlias: (row.public_alias as string) ?? null,
    semesterId: row.semester_id as string,
    firstLoginAt: (row.first_login_at as string) ?? null,
    portfolioVideoLink: (row.portfolio_video_link as string) ?? null
  }
}

/**
 * Like resolveStudent, but throws 401 if the user is not authenticated.
 * Use in endpoints that require authentication.
 */
export async function requireStudent(event: H3Event): Promise<AuthStudent> {
  const student = await resolveStudent(event)
  if (!student) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }
  return student
}
